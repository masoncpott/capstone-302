import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Database from 'better-sqlite3'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')

const dbPath = path.join(projectRoot, 'data', 'tile_sales.db')
const outputPath = path.join(projectRoot, 'public', 'orders.json')

if (!fs.existsSync(dbPath)) {
  console.error(`SQLite database not found at ${dbPath}`)
  process.exit(1)
}

const db = new Database(dbPath, { readonly: true })

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

db.close()

fs.writeFileSync(outputPath, JSON.stringify(rows, null, 2), 'utf8')
console.log(`Exported ${rows.length} orders to ${outputPath}`)
