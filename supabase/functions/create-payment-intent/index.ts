import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CartLineItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  image: string;
}

interface PaymentIntentRequestBody {
  items: CartLineItem[];
  shippingMethod: "standard" | "express";
  shippingCost: number;
  subtotal: number;
  paymentMethod: "card" | "mbway" | "paypal";
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postal: string;
  };
  nif?: string;
  couponCode?: string;
  discountAmount?: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body: PaymentIntentRequestBody = await req.json();

    if (!body.items || body.items.length === 0) {
      return new Response(
        JSON.stringify({ error: "O carrinho está vazio." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY")!;

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const totalAmount = body.subtotal + body.shippingCost;
    const totalCents = Math.round(totalAmount * 100);

    const orderNumber = `DIPA-${Math.floor(1000 + Math.random() * 9000)}`;

    // Insert the order into the database with status "pending"
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_name: body.customer.name,
        customer_email: body.customer.email,
        customer_phone: body.customer.phone,
        customer_address: body.customer.address,
        customer_city: body.customer.city,
        customer_postal_code: body.customer.postal,
        phone: body.customer.phone,
        address: body.customer.address,
        city: body.customer.city,
        postal_code: body.customer.postal,
        nif: body.nif ?? null,
        shipping_method: body.shippingMethod,
        payment_method: body.paymentMethod ?? "card",
        shipping_cost: body.shippingCost,
        total: totalAmount,
        coupon_code: body.couponCode ?? null,
        discount_amount: body.discountAmount ?? 0,
        status: "pending",
      })
      .select("id")
      .single();

    if (orderErr || !order) {
      return new Response(
        JSON.stringify({ error: "Não foi possível registar a encomenda." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Insert order items
    const lineItems = body.items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.name,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      unit_price: item.price,
    }));

    const { error: itemsErr } = await supabase.from("order_items").insert(lineItems);
    if (itemsErr) {
      return new Response(
        JSON.stringify({ error: "A encomenda foi criada mas os artigos não foram guardados." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Create a Stripe PaymentIntent with the total cart value — no pre-registered products needed
    const paymentIntentParams: Record<string, string> = {
      amount: String(totalCents),
      currency: "eur",
      "metadata[order_id]": order.id,
      "metadata[order_number]": orderNumber,
      "metadata[payment_method]": body.paymentMethod ?? "card",
      receipt_email: body.customer.email,
      description: `Encomenda ${orderNumber} — ${body.items.length} artigo(s)`,
    };

    const stripeResponse = await fetch("https://api.stripe.com/v1/payment_intents", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(paymentIntentParams),
    });

    const paymentIntent = await stripeResponse.json();

    if (!stripeResponse.ok) {
      return new Response(
        JSON.stringify({ error: paymentIntent.error?.message ?? "Erro ao criar PaymentIntent." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Save the Stripe PaymentIntent ID on the order
    await supabase
      .from("orders")
      .update({ stripe_session_id: paymentIntent.id })
      .eq("id", order.id);

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        orderId: order.id,
        orderNumber,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro interno.";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
