# Fiestas Centenera 2026

Single-page website for the annual festivities of **Centenera**, my town ❤️. Displays the 8-day event schedule (August 2–9, 2026) with an interactive carousel, lists 33 sponsors in a responsive grid, and features custom typography and a dark red theme.

Built with [Astro](https://astro.build) v6 and deployed to **Cloudflare Pages**.

## Tech Stack

| Tool                  | Purpose                     |
| --------------------- | --------------------------- |
| **Astro 6**           | Static site generator       |
| **Tailwind CSS v4**   | CSS framework (Vite plugin) |
| **TypeScript**        | Type safety                 |
| **ESLint** + Prettier | Linting and formatting      |
| **Cloudflare Pages**  | Hosting and deployment      |
| **pnpm**              | Package manager             |

## Project Structure

```text
/
├── public/
│   ├── favicon.ico
│   ├── favicon.svg
│   └── fonts/               # Bridge, Pocheon (WOFF2/OTF)
├── src/
│   ├── assets/
│   │   ├── background.svg
│   │   ├── imagen-centenera.jpeg
│   │   └── sponsors/        # 33 sponsor logos
│   ├── components/
│   │   ├── Hero.astro       # Header with photo and title
│   │   ├── Schedule.astro   # Day-by-day carousel (drag/swipe)
│   │   ├── Sponsors.astro   # Sponsor grid
│   │   └── Footer.astro     # Nav, social links, credits
│   ├── data/
│   │   ├── schedule.json    # 8-day event data
│   │   └── sponsors.json    # 33 sponsors
│   ├── layouts/
│   │   └── Layout.astro     # Root HTML layout
│   ├── pages/
│   │   └── index.astro      # Single page
│   └── styles/
│       └── global.css       # Tailwind v4 + custom theme
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
├── eslint.config.js
└── package.json
```

## Commands

| Command         | Action                               |
| --------------- | ------------------------------------ |
| `pnpm install`  | Install dependencies                 |
| `pnpm dev`      | Dev server at `localhost:4321`       |
| `pnpm dev:host` | Dev server, network-accessible       |
| `pnpm build`    | Build to `./dist/`                   |
| `pnpm preview`  | Preview the production build locally |
| `pnpm lint`     | ESLint check                         |
| `pnpm lint:fix` | ESLint auto-fix                      |
| `pnpm format`   | Prettier format                      |
| `pnpm deploy`   | Build + deploy to Cloudflare Pages   |

## Deployment

The site is deployed to **Cloudflare Pages** directly from the GitHub repository.

1. Connect the repo to Cloudflare Pages dashboard
2. Set build command: `pnpm run build`
3. Set build output directory: `dist`
4. Cloudflare Pages automatically deploys on every push

---

Developed by [Alex Algarate](https://github.com/AlexAlgarate).
