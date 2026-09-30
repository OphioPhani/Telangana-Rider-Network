# TELANGANA RIDER NETWORK — 150 Weekend Motorcycle Routes × Bike Cost Engine

Premium motorcycle travel platform for weekend rides from Hyderabad across
Telangana. **Frontend-only static app — no backend, no database, no login,
no tracking.** All calculations run in the browser; preferences stay in
`localStorage`.

## Run locally

```bash
# any static server, e.g:
python3 -m http.server 8080
# open http://127.0.0.1:8080/index.html
```

## Deploy (Vercel only)

```
GitHub → Vercel → Build (none — static) → CDN → public website
```

1. Push this folder to a GitHub repo.
2. Vercel → Add New Project → import the repo.
3. Framework Preset: **Other**. Build Command: *(empty)*. Output Directory: *(repo root)*.
4. Deploy. `vercel.json` handles clean URLs + route rewrites; no server required.

Before going live, replace `https://telangana-rider-network.pages.dev/` in
`index.html`, `bikes.html`, `trip.html` (dynamic canonical), `sitemap.xml`
and `robots.txt` with your domain.

No environment variables are required (maps use keyless MapLibre GL + OpenFreeMap;
`.env.example` holds placeholders only). No Supabase / Firebase / MongoDB /
SQL / Express / Redis / auth server — by design.

## Project layout

| File | Purpose |
|---|---|
| `index.html` | Home: hero, My Bike, map, explorer, long-haul, planner, about |
| `bikes.html` | Bike database page (search + brand/CC/segment filters + sorts) |
| `trip.html` | Single-route page (`?slug=` or `/trips/<slug>` or `/routes/<slug>` via `vercel.json`) |
| `trips1.js` `trips2.js` `trips3.js` | **Route database** — 50 structured records (edit here to add/update routes) |
| `bikes.js` | **Motorcycle database** — 117 petrol bikes sold in India (tank, claimed vs planning mileage) |
| `bike-store.js` | Shared `localStorage` store (bike, petrol, mileage mode, compare, garage) + `BikeCalc` formulas |
| `route-geo.js` | Static gazetteer + per-route geo builder (50 unique map configs: start, waypoints, destination, return, GeoJSON, bounds) |
| `route-map.js` | Reusable MapLibre component (lines, geometric markers, popups, zoom/fullscreen, fitBounds) |
| `app.js` | Home presentation (cards, MapLibre overview map, filters, planner, compare, garage, export) |
| `styles.css` | Premium light/dark theme + `@media print` travel-guide stylesheet |
| `manifest.json` `sw.js` `icon.svg` | PWA shell (offline: visited pages + data; live maps/navigation NEVER offline) |
| `sitemap.xml` `robots.txt` | SEO (home + bikes + route URLs) |
| `vercel.json` `netlify.toml` `.env.example` | Deployment (no secrets — static) |

Static-data equivalents of the `src/data/*.ts` pattern: `trips*.js`
(routes), `bikes.js` (motorcycles); fuel/food/mechanic/support data lives
inside each route record. `bike-store.js` is the `utils/fuelCalculator`
equivalent. Scales 150 → 250+ routes by appending records (slugs auto-derive).

## Updating data

- **Routes:** edit the `TRIPS` arrays in `trips1/2/3.js` (shape documented
  below), push to GitHub — Vercel rebuilds automatically. Regenerate
  `sitemap.xml` with: `node -e` script (see commit history) or add URLs manually.
- **Bikes:** edit `window.BIKES` in `bikes.js`. Fields: `id, brand, model,
  variant, cc, tank, claimed, planning, seg, wt, yr, st (current|discontinued), src`.
  Tank = manufacturer capacity; `planning` = conservative trip estimate.

Route record shape:

```js
{
  n: 51, name: "...", dest: "..., Telangana",
  lat: 17.0, lon: 78.0, zoom: 10,          // overview map centre
  oneWay: 100, total: 210,                  // road-route km (not straight-line)
  ride: "~4 hrs riding + stops",
  dur: "Full day", durKey: "full",          // half | full | 1n | 2n
  roads: "...", terrain: "Paved road", diff: "Moderate", // Easy | Moderate | Challenging
  cat: ["scenic","adventure"],              // easy scenic food adventure long heritage
  depart: "05:00", back: "18:00",
  season: "Oct–Mar", warn: "...", tolls: "None",
  desc: "...", attract: "...",
  foodB: "...", foodL: "...",               // verifiable places only
  fuel: [["Stop name","position"], ...],
  support: "...",                            // towns/corridors; flag gaps explicitly
  route: [["Place","why","dist","time","halt"], ...],
  back:  [["Place","why","dist","time","halt"], ...],
  budget: {food: 700, toll: 0, park: 100, entry: 0},
  safety: "...",
  src: ["Source 1", "Source 2"]
}
```

Rules: no invented businesses, phone numbers, distances or hours. Unverifiable
stretch → write `No verified roadside mechanic found at this section — plan
accordingly.` Slugs/URLs derive from `name` automatically.

## Notes

- `prefers-reduced-motion` disables animations; ☀/🌙 theme switcher in header.
- Print: Ctrl/Cmd+P → A4 → Save as PDF (dedicated print layout, `window.print()` only).
- Markdown export (`.MD` button) → DOCX via `pandoc guide.md -o guide.docx --toc`.
- Map tiles/style via OpenFreeMap (no API key), MapLibre GL via CDN; navigation
  links are client-side Google Maps URLs, never proxied.
