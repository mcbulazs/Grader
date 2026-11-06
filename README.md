# Osztályozó

Grade calculator for teachers (Hungarian UI), live at **https://grader.varizsombor.com**.

- **Számoló**: max points + achieved points → percentage and grade, with the point range of every grade. `Enter` selects the score field for the next student.
- **Dolgozat**: grade a whole test. Type scores in class-register order (or paste a column from Excel) to get each grade, the average, median, pass rate and grade distribution. Copy the grades column (e.g. into Kréta) or print it.
- **Ponttáblázat**: printable point table for one or more max scores, optionally listing every possible score.
- **Sávok**: saved grade cutoffs (presets), shareable with colleagues by link (`/savok?sav=…`).

There are no accounts and no server-side data. Presets and the current test's scores (numbers only, no names) live in the browser's localStorage. The app works offline once loaded and can be installed as a PWA.

Grading rule (same as the original app): the percentage is rounded to one decimal, and each cutoff is the highest percentage that still gets that grade. With 34/54/74/89, 34.0% is a 1 and 34.1% is a 2. See `src/lib/grading.ts`.

## Development

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # grading logic tests
npm run typecheck
npm run lint
npm run build      # static export to out/
```

Next.js 16 with `output: "export"`: plain static files, no Node server in production.

## Deployment

On every push to `master`, GitHub Actions builds `ghcr.io/mcbulazs/grader:latest` (nginx serving `out/`, see `deploy/`).

On the server, copy `compose.yaml` into its own folder (e.g. `/mnt/data/apps/grader`) and run:

```bash
docker compose pull && docker compose up -d
```

The container joins the external `traefik` network and is routed by `Host(grader.varizsombor.com)`. The Cloudflare Tunnel must also have a public hostname for `grader.varizsombor.com` pointing at Traefik. The site is public, so **don't** put it behind Cloudflare Access.

The first time the GHCR package is published it's private. Either make it public (Package settings → Change visibility) or `docker login ghcr.io` on the server.
