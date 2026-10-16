import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY")!;
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const sig = req.headers.get("stripe-signature");
    if (!sig) {
      return new Response(
        JSON.stringify({ error: "Missing stripe-signature header." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const rawBody = await req.text();

    // Verify the webhook signature by retrieving the event from Stripe
    await fetch("https://api.stripe.com/v1/webhook_endpoints", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        "payload": rawBody,
        "sig": sig,
        "secret": webhookSecret,
      }),
    });

    // Use Stripe's construct event approach via the API
    // Since we can't use the stripe SDK's constructEvent in Deno easily,
    // we'll verify by parsing the body and checking the signature manually
    const event = JSON.parse(rawBody);

    // Verify signature: Stripe sends a t= timestamp and v1 signature
    const parts = sig.split(",");
    const timestampPart = parts.find((p) => p.startsWith("t="));
    const sigPart = parts.find((p) => p.startsWith("v1="));

    if (!timestampPart || !sigPart) {
      return new Response(
        JSON.stringify({ error: "Invalid signature format." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const timestamp = timestampPart.split("=")[1];
    const signature = sigPart.split("=")[1];

    // Compute HMAC-SHA256 of "{timestamp}.{payload}"
    const signedPayload = `${timestamp}.${rawBody}`;
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(webhookSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const computedBuf = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(signedPayload)
    );
    const computed = Array.from(new Uint8Array(computedBuf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Check timestamp freshness (5 min tolerance)
    const age = Math.floor(Date.now() / 1000) - parseInt(timestamp, 10);
    if (age > 300) {
      return new Response(
        JSON.stringify({ error: "Webhook timestamp too old." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (computed !== signature) {
      return new Response(
        JSON.stringify({ error: "Invalid signature." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Determine the order ID from either a Checkout Session or a PaymentIntent event
    let orderId: string | null = null;

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      orderId = session.client_reference_id ?? session.metadata?.order_id ?? null;
    } else if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      orderId = paymentIntent.metadata?.order_id ?? null;
    }

    if (orderId && (event.type === "checkout.session.completed" || event.type === "payment_intent.succeeded")) {
      // Mark the order as paid
      await supabase
        .from("orders")
        .update({ status: "paid" })
        .eq("id", orderId);

      // Decrement stock for each ordered item
      const { data: orderItems } = await supabase
        .from("order_items")
        .select("product_id, quantity")
        .eq("order_id", orderId);

      if (orderItems && orderItems.length > 0) {
        for (const item of orderItems) {
          const { data: product } = await supabase
            .from("products")
            .select("stock_quantity")
            .eq("id", item.product_id)
            .single();

          if (product) {
            const newStock = Math.max(0, (product.stock_quantity ?? 0) - item.quantity);
            await supabase
              .from("products")
              .update({
                stock_quantity: newStock,
                stock_status: newStock <= 0 ? "Sem stock" : "Disponivel",
              })
              .eq("id", item.product_id);
          }
        }
      }

      // Send order confirmation email (fire-and-forget)
      try {
        const emailRes = await fetch(`${supabaseUrl}/functions/v1/send-order-confirmation`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${serviceRoleKey}`,
          },
          body: JSON.stringify({ orderId }),
        });
        if (!emailRes.ok) {
          console.error(`[stripe-webhook] Failed to send confirmation email: ${await emailRes.text()}`);
        }
      } catch (emailErr) {
        console.error("[stripe-webhook] Error sending confirmation email:", emailErr);
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro interno.";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
