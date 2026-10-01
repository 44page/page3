# Sklep na Cloudflare Pages + Stripe (tryb testowy)

## Adresy
- `/`        – sklep z koszykiem
- `/admin.html` – panel: dodawanie/edycja/usuwanie produktów, zdjęcia, ceny, nazwa sklepu (z telefonu też)

## Uruchomienie (jednorazowo)
1. Wrzuć ten folder na GitHub → Cloudflare: Workers & Pages → Create → Pages → Connect to Git.
   Build command: puste, output directory: `/`. (Folder `functions/` jest wykryty automatycznie.)
2. Storage & Databases → KV → Create namespace (np. `sklep`).
3. Projekt Pages → Settings → Bindings → Add → KV namespace: nazwa zmiennej **SHOP**, wybierz utworzony namespace.
4. Settings → Variables and Secrets (Production) dodaj (panel nie ma hasła):
   - `STRIPE_SECRET_KEY` – klucz testowy `sk_test_...` (Stripe → Developers → API keys, tryb Test)
5. Zrób redeploy (Deployments → Retry), żeby zmienne zadziałały.

## Test płatności
Karta testowa Stripe: `4242 4242 4242 4242`, dowolna przyszła data, dowolny CVC.

## Przejście na prawdziwe płatności
Podmień `STRIPE_SECRET_KEY` na `sk_live_...` i zrób redeploy.

## Uwagi
- Ceny są zawsze liczone na serwerze z bazy produktów, nie z przeglądarki.
- Adres dostawy (PL, DE, CZ, SK, LT) i telefon zbiera strona Stripe. Listę krajów zmienisz w `functions/api/checkout.js`.
- Zamówienia widzisz w Stripe Dashboard → Payments.
