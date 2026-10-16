import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface OrderRow {
  id: string;
  order_number: string | null;
  total: number;
  status: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  customer_address: string | null;
  customer_city: string | null;
  customer_postal_code: string | null;
  shipping_method: string;
  nif: string | null;
}

interface OrderItemRow {
  product_name: string;
  quantity: number;
  unit_price: number;
  size: string;
  color: string;
}

function formatEuro(value: number): string {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildEmailHtml(order: OrderRow, items: OrderItemRow[]): string {
  const orderRef = order.order_number ?? `#${order.id.slice(0, 8).toUpperCase()}`;
  const subtotal = items.reduce((sum, it) => sum + it.unit_price * it.quantity, 0);
  const shipping = order.total - subtotal;

  const itemsRows = items
    .map(
      (it) => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;">
            <div style="font-weight:600;color:#161619;font-size:14px;">${escapeHtml(it.product_name)}</div>
            <div style="color:#8c8c97;font-size:12px;margin-top:2px;">
              ${it.size !== "Único" ? `Tamanho: ${escapeHtml(it.size)}` : ""}
              ${it.size !== "Único" && it.color !== "Padrão" ? " · " : ""}
              ${it.color !== "Padrão" ? `Cor: ${escapeHtml(it.color)}` : ""}
            </div>
          </td>
          <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;text-align:center;color:#50505a;font-size:14px;">${it.quantity}</td>
          <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;text-align:right;color:#161619;font-size:14px;font-weight:600;">${formatEuro(it.unit_price)}</td>
          <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;text-align:right;color:#161619;font-size:14px;font-weight:600;">${formatEuro(it.unit_price * it.quantity)}</td>
        </tr>`,
    )
    .join("");

  const addressParts = [
    order.customer_address,
    order.customer_postal_code ? `${order.customer_postal_code} ${order.customer_city ?? ""}` : order.customer_city,
  ].filter(Boolean);

  return `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Confirmação de Encomenda ${orderRef}</title>
</head>
<body style="margin:0;padding:0;background:#fbf7f2;font-family:'Nunito',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fbf7f2;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 8px 30px -12px rgba(124,92,214,0.16);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#f3eefc,#ede7fa);padding:32px 40px;text-align:center;">
              <div style="font-size:28px;font-weight:800;color:#433078;letter-spacing:-0.02em;">Dipa</div>
              <div style="margin-top:8px;font-size:15px;color:#7c5cd6;font-weight:600;">Obrigado pela tua compra! 🎉</div>
            </td>
          </tr>
          <!-- Order number -->
          <tr>
            <td style="padding:28px 40px 8px;">
              <div style="font-size:13px;color:#8c8c97;text-transform:uppercase;letter-spacing:0.1em;font-weight:700;">Encomenda</div>
              <div style="font-size:22px;font-weight:800;color:#161619;margin-top:4px;">${orderRef}</div>
            </td>
          </tr>
          <!-- Items table -->
          <tr>
            <td style="padding:12px 40px 0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <thead>
                  <tr>
                    <th style="padding:8px 0;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#8c8c97;font-weight:700;border-bottom:2px solid #f0f0f0;">Produto</th>
                    <th style="padding:8px 0;text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#8c8c97;font-weight:700;border-bottom:2px solid #f0f0f0;">Qtd.</th>
                    <th style="padding:8px 0;text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#8c8c97;font-weight:700;border-bottom:2px solid #f0f0f0;">Preço</th>
                    <th style="padding:8px 0;text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#8c8c97;font-weight:700;border-bottom:2px solid #f0f0f0;">Total</th>
                  </tr>
                </thead>
                <tbody>${itemsRows}
                </tbody>
              </table>
            </td>
          </tr>
          <!-- Totals -->
          <tr>
            <td style="padding:16px 40px 0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:6px 0;color:#6a6a75;font-size:14px;">Subtotal</td>
                  <td style="padding:6px 0;text-align:right;color:#161619;font-size:14px;font-weight:600;">${formatEuro(subtotal)}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;color:#6a6a75;font-size:14px;">Envio (Portes)</td>
                  <td style="padding:6px 0;text-align:right;color:#161619;font-size:14px;font-weight:600;">${shipping > 0 ? formatEuro(shipping) : "Grátis"}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-top:2px solid #f0f0f0;font-size:16px;font-weight:800;color:#161619;">Total Pago</td>
                  <td style="padding:10px 0;border-top:2px solid #f0f0f0;text-align:right;font-size:18px;font-weight:800;color:#7c5cd6;">${formatEuro(order.total)}</td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Shipping info -->
          <tr>
            <td style="padding:24px 40px 0;">
              <div style="background:#fbf7f2;border-radius:16px;padding:20px;">
                <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#8c8c97;font-weight:700;margin-bottom:8px;">Dados de Envio</div>
                <div style="font-size:15px;font-weight:700;color:#161619;">${escapeHtml(order.customer_name)}</div>
                <div style="font-size:14px;color:#6a6a75;margin-top:4px;line-height:1.5;">
                  ${addressParts.map((p) => escapeHtml(p)).join("<br>")}
                </div>
                ${order.customer_phone ? `<div style="font-size:14px;color:#6a6a75;margin-top:4px;">Tel: ${escapeHtml(order.customer_phone)}</div>` : ""}
                ${order.nif ? `<div style="font-size:14px;color:#6a6a75;margin-top:4px;">NIF: ${escapeHtml(order.nif)}</div>` : ""}
              </div>
            </td>
          </tr>
          <!-- CTA -->
          <tr>
            <td style="padding:24px 40px 0;" align="center">
              <a href="${Deno.env.get("SITE_URL") ?? "https://dipa.pt"}/#/conta/encomendas" style="display:inline-block;background:#161619;color:#ffffff;padding:14px 32px;border-radius:999px;font-size:14px;font-weight:700;text-decoration:none;">Acompanhar encomenda</a>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:28px 40px 36px;border-top:1px solid #f0f0f0;margin-top:16px;">
              <div style="font-size:12px;color:#8c8c97;text-align:center;line-height:1.6;">
                Precisas de ajuda? Contacta-nos em <a href="mailto:apoio@dipa.pt" style="color:#7c5cd6;">apoio@dipa.pt</a><br>
                © ${new Date().getFullYear()} Dipa · Todos os direitos reservados
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    const body = await req.json();
    const orderId: string | undefined = body?.orderId;

    if (!orderId) {
      return new Response(
        JSON.stringify({ error: "orderId é obrigatório." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, order_number, total, status, customer_name, customer_email, customer_phone, customer_address, customer_city, customer_postal_code, shipping_method, nif")
      .eq("id", orderId)
      .maybeSingle();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: "Encomenda não encontrada." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const orderRow = order as OrderRow;

    if (!orderRow.customer_email) {
      return new Response(
        JSON.stringify({ error: "Encomenda sem e-mail de cliente." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: itemsData, error: itemsError } = await supabase
      .from("order_items")
      .select("product_name, quantity, unit_price, size, color")
      .eq("order_id", orderId);

    if (itemsError || !itemsData) {
      return new Response(
        JSON.stringify({ error: "Artigos da encomenda não encontrados." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const items = itemsData as OrderItemRow[];
    const html = buildEmailHtml(orderRow, items);
    const orderRef = orderRow.order_number ?? `#${orderRow.id.slice(0, 8).toUpperCase()}`;

    if (resendApiKey) {
      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Dipa Store <onboarding@resend.dev>",
          to: [orderRow.customer_email],
          subject: `Confirmação de Encomenda ${orderRef} · Dipa`,
          html,
        }),
      });

      if (!resendRes.ok) {
        const errText = await resendRes.text();
        return new Response(
          JSON.stringify({ error: `Erro Resend: ${errText}` }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    } else {
      console.log(`[send-order-confirmation] RESEND_API_KEY not set — skipping send for order ${orderRef}`);
    }

    return new Response(
      JSON.stringify({ ok: true, orderRef }),
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
