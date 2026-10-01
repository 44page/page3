// POST /api/checkout {items:[{id,qty}]} -> {url} do Stripe Checkout (adres, telefon i płatność zbiera Stripe)
export async function onRequestPost({ request, env }) {
  const { items = [] } = await request.json();
  const data = JSON.parse((await env.SHOP.get("data")) || "null");
  if (!data) return new Response("Sklep pusty", { status: 400 });
  const q = new URLSearchParams();
  let i = 0;
  for (const it of items) {
    const p = data.products.find(x => x.id === it.id);
    const qty = Math.min(Math.max(parseInt(it.qty) || 0, 0), 20);
    if (!p || p.soldOut || !qty || p.price <= 0) continue; // cena zawsze z serwera, nie z przeglądarki
    q.append(`line_items[${i}][quantity]`, qty);
    q.append(`line_items[${i}][price_data][currency]`, "pln");
    q.append(`line_items[${i}][price_data][unit_amount]`, Math.round(p.price * 100));
    q.append(`line_items[${i}][price_data][product_data][name]`, p.name);
    i++;
  }
  if (!i) return new Response("Pusty koszyk", { status: 400 });
  const origin = new URL(request.url).origin;
  q.append("mode", "payment");
  q.append("success_url", origin + "/?paid=1");
  q.append("cancel_url", origin + "/");
  q.append("phone_number_collection[enabled]", "true");
  ["PL", "DE", "CZ", "SK", "LT"].forEach((c, n) => q.append(`shipping_address_collection[allowed_countries][${n}]`, c));
  const r = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: { authorization: "Bearer " + env.STRIPE_SECRET_KEY, "content-type": "application/x-www-form-urlencoded" },
    body: q,
  });
  const s = await r.json();
  if (!r.ok) return new Response(s.error?.message || "Błąd Stripe", { status: 502 });
  return Response.json({ url: s.url });
}
