import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import Database from 'better-sqlite3'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')
const dbPath = path.join(projectRoot, 'data', 'tile_sales.db')

const db = new Database(dbPath, { readonly: true })
const app = express()
const port = process.env.PORT || 8787

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.get('/api/orders', (_req, res) => {
  const rows = db
    .prepare(
      `
      SELECT
        order_date,
        customer_type,
        project_type,
        tile_category,
        order_quantity,
        revenue,
        region,
        order_size_classification,
        lead_time_days
      FROM orders
      ORDER BY order_date
    `,
    )
    .all()

  res.json(rows)
})

app.listen(port, () => {
  console.log(`SQLite API listening on http://localhost:${port}`)
})
