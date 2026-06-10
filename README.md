# Tile Sales Story App

Interactive React + TypeScript prototype for telling the tile sales story across residential and commercial customer segments.

## Tech Stack

- Vite + React + TypeScript
- Material UI
- Chart.js + react-chartjs-2
- SQLite (better-sqlite3)
- Faker.js for seeded fake data generation

## Commands

- `npm install`
- `npm run db:seed` to generate and seed `data/tile_sales.db`
- `npm run dev` to run the frontend
- `npm run build` to type-check and build production assets

## Notes

- The seed script is in `scripts/seed-sqlite.mjs`.
- The generated SQLite database file is `data/tile_sales.db`.
