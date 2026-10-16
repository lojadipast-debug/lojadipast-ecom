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

interface CheckoutRequestBody {
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
    const body: CheckoutRequestBody = await req.json();

    if (!body.items || body.items.length === 0) {
      return new Response(
        JSON.stringify({ error: "O carrinho está vazio." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY")!;

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Generate a human-readable order number
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
        total: body.subtotal + body.shippingCost,
        coupon_code: body.couponCode ?? null,
        discount_amount: body.discountAmount ?? 0,
        status: "pending",
      })
      .select("id")
      .single();

    if (orderErr || !order) {
      return new Response(
        JSON.stringify({ error: "Não foi possível registar a encomenda." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build Stripe line items dynamically from cart contents
    const stripeLineItems = body.items.map((item) => ({
      price_data: {
        currency: "eur",
        unit_amount: Math.round(item.price * 100),
        product_data: {
          name: item.name,
          description: `${item.color} · ${item.size}`,
          images: item.image ? [item.image] : [],
        },
      },
      quantity: item.quantity,
    }));

    // Add shipping as a line item if not free
    if (body.shippingCost > 0) {
      stripeLineItems.push({
        price_data: {
          currency: "eur",
          unit_amount: Math.round(body.shippingCost * 100),
          product_data: {
            name: `Portes de envio (${body.shippingMethod === "express" ? "Express" : "Standard"})`,
          },
        },
        quantity: 1,
      });
    }

    const origin = req.headers.get("origin") ?? "https://dlkbatsabybpgwrojfyh.supabase.co";

    // Build Stripe checkout session params based on payment method
    const sessionParams: Record<string, string> = {
      "mode": "payment",
      "customer_email": body.customer.email,
      "line_items": JSON.stringify(stripeLineItems),
      "success_url": `${origin}/#/checkout-success?order=${order.id}`,
      "cancel_url": `${origin}/#/checkout`,
      "client_reference_id": order.id,
      "metadata[order_id]": order.id,
      "metadata[payment_method]": body.paymentMethod ?? "card",
      "billing_address_collection": "auto",
      "shipping_address_collection": JSON.stringify({ allowed_countries: ["PT", "ES"] }),
    };

    if (body.paymentMethod === "mbway") {
      sessionParams["payment_method_types"] = JSON.stringify(["mb_way"]);
    } else if (body.paymentMethod === "paypal") {
      sessionParams["payment_method_types"] = JSON.stringify(["paypal"]);
    } else {
      sessionParams["payment_method_types"] = JSON.stringify(["card"]);
    }

    if (body.paymentMethod === "mbway" && body.mbwayPhone) {
      sessionParams["payment_method_data[phone]"] = body.mbwayPhone;
    }

    const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(sessionParams),
    });

    const session = await stripeResponse.json();

    if (!stripeResponse.ok) {
      return new Response(
        JSON.stringify({ error: session.error?.message ?? "Erro ao criar sessão de pagamento." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Save the Stripe session ID on the order
    await supabase
      .from("orders")
      .update({ stripe_session_id: session.id })
      .eq("id", order.id);

    return new Response(
      JSON.stringify({ url: session.url }),
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
