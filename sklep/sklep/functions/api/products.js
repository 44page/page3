// GET  /api/products  -> publiczna lista (nazwa sklepu, hasło, produkty)
// PUT  /api/products  -> zapis (wymaga nagłówka x-admin-password)
const EMPTY = { name: "Moja Pracownia", tagline: "Rzeczy robione ręcznie, wysyłka w 3 dni.", products: [] };

export async function onRequestGet({ env }) {
  const data = JSON.parse((await env.SHOP.get("data")) || "null") || EMPTY;
  return Response.json(data, { headers: { "cache-control": "no-store" } });
}

export async function onRequestPut({ request, env }) {
  const d = await request.json();
  const clean = {
    name: String(d.name || "").slice(0, 80),
    tagline: String(d.tagline || "").slice(0, 200),
    products: (d.products || []).slice(0, 200).map(p => ({
      id: String(p.id).replace(/[^\w-]/g, ""),
      name: String(p.name || "").slice(0, 120),
      description: String(p.description || "").slice(0, 600),
      price: Math.max(0, Number(p.price) || 0),
      image: String(p.image || ""),
      soldOut: !!p.soldOut,
    })),
  };
  await env.SHOP.put("data", JSON.stringify(clean));
  return Response.json({ ok: true });
}
