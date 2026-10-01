// GET /api/img/<id> -> zdjęcie produktu; PUT (admin) -> wgranie zdjęcia (JPEG, max ~2 MB)
export async function onRequestGet({ params, env }) {
  const buf = await env.SHOP.get("img:" + params.id, "arrayBuffer");
  if (!buf) return new Response("Brak", { status: 404 });
  return new Response(buf, { headers: { "content-type": "image/jpeg", "cache-control": "public, max-age=300" } });
}
export async function onRequestPut({ request, params, env }) {
  const buf = await request.arrayBuffer();
  if (buf.byteLength > 2_000_000) return new Response("Za duże", { status: 413 });
  await env.SHOP.put("img:" + params.id.replace(/[^\w-]/g, ""), buf);
  return Response.json({ ok: true });
}
