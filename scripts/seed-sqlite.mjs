import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Database from 'better-sqlite3'
import { faker } from '@faker-js/faker'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')

const dataDir = path.join(projectRoot, 'data')
const dbPath = path.join(dataDir, 'tile_sales.db')

faker.seed(302)

const regions = ['West', 'Midwest', 'Northeast', 'Southeast', 'Southwest']
const residentialProjects = [
  'Kitchen Remodel',
  'Bathroom Renovation',
  'Whole-Home Flooring',
  'Backsplash Upgrade',
  'Outdoor Patio',
]
const commercialProjects = [
  'Condo Development',
  'Office Buildout',
  'Hospitality Renovation',
  'Retail Build',
  'Healthcare Expansion',
]
const tileCategories = [
  'Ceramic',
  'Porcelain',
  'Stone',
  'Mosaic',
  'Large Format',
  'Industrial Grade',
]

const residentialCategoryWeights = [28, 26, 12, 16, 14, 4]
const commercialCategoryWeights = [8, 23, 15, 4, 20, 30]

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

if (fs.existsSync(dbPath)) {
  fs.rmSync(dbPath)
}

const db = new Database(dbPath)

db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_date TEXT NOT NULL,
    customer_type TEXT NOT NULL CHECK(customer_type IN ('residential', 'commercial')),
    project_type TEXT NOT NULL,
    tile_category TEXT NOT NULL,
    order_quantity INTEGER NOT NULL,
    revenue REAL NOT NULL,
    region TEXT NOT NULL,
    order_size_classification TEXT NOT NULL,
    lead_time_days INTEGER NOT NULL
  );

  CREATE INDEX idx_orders_date ON orders(order_date);
  CREATE INDEX idx_orders_customer ON orders(customer_type);
  CREATE INDEX idx_orders_category ON orders(tile_category);
`)

const insert = db.prepare(`
  INSERT INTO orders (
    order_date,
    customer_type,
    project_type,
    tile_category,
    order_quantity,
    revenue,
    region,
    order_size_classification,
    lead_time_days
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`)

const weightedPick = (values, weights) => {
  const total = weights.reduce((sum, w) => sum + w, 0)
  let roll = faker.number.int({ min: 1, max: total })
  for (let i = 0; i < values.length; i += 1) {
    roll -= weights[i]
    if (roll <= 0) return values[i]
  }
  return values[values.length - 1]
}

const seasonalResidentialMultiplier = (month) => {
  if (month >= 3 && month <= 6) return 1.35
  if (month === 2 || month === 7) return 1.15
  if (month === 11 || month === 12) return 0.8
  return 1
}

const commercialBurstMultiplier = (month) => {
  if (month === 5 || month === 10) return 1.7
  if (month === 4 || month === 9) return 1.25
  return 0.95
}

const classifyOrderSize = (customerType, quantity) => {
  if (customerType === 'residential') {
    if (quantity < 80) return 'small'
    if (quantity < 160) return 'medium'
    return 'large'
  }

  if (quantity < 1000) return 'small'
  if (quantity < 2200) return 'medium'
  return 'large'
}

const tx = db.transaction(() => {
  for (let month = 1; month <= 12; month += 1) {
    const residentialOrders = Math.round(
      faker.number.int({ min: 52, max: 72 }) * seasonalResidentialMultiplier(month),
    )
    const commercialOrders = Math.round(
      faker.number.int({ min: 7, max: 13 }) * commercialBurstMultiplier(month),
    )

    for (let i = 0; i < residentialOrders; i += 1) {
      const quantity = faker.number.int({ min: 35, max: 190 })
      const unitPrice = faker.number.float({ min: 16, max: 34, fractionDigits: 2 })
      const revenue = Number((quantity * unitPrice).toFixed(2))
      const day = faker.number.int({ min: 1, max: 28 })

      insert.run(
        `2025-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        'residential',
        faker.helpers.arrayElement(residentialProjects),
        weightedPick(tileCategories, residentialCategoryWeights),
        quantity,
        revenue,
        faker.helpers.arrayElement(regions),
        classifyOrderSize('residential', quantity),
        faker.number.int({ min: 3, max: 12 }),
      )
    }

    for (let i = 0; i < commercialOrders; i += 1) {
      const quantity = faker.number.int({ min: 700, max: 3200 })
      const unitPrice = faker.number.float({ min: 28, max: 56, fractionDigits: 2 })
      const revenue = Number((quantity * unitPrice).toFixed(2))
      const day = faker.number.int({ min: 1, max: 28 })

      insert.run(
        `2025-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        'commercial',
        faker.helpers.arrayElement(commercialProjects),
        weightedPick(tileCategories, commercialCategoryWeights),
        quantity,
        revenue,
        faker.helpers.arrayElement(regions),
        classifyOrderSize('commercial', quantity),
        faker.number.int({ min: 9, max: 30 }),
      )
    }
  }
})

tx()

const totals = db
  .prepare(
    `
    SELECT
      COUNT(*) AS order_count,
      ROUND(SUM(revenue), 2) AS total_revenue,
      ROUND(AVG(revenue), 2) AS avg_order_value
    FROM orders
  `,
  )
  .get()

const byType = db
  .prepare(
    `
    SELECT
      customer_type,
      COUNT(*) AS orders,
      ROUND(SUM(revenue), 2) AS revenue
    FROM orders
    GROUP BY customer_type
    ORDER BY customer_type
  `,
  )
  .all()

console.log(`Seeded SQLite database: ${dbPath}`)
console.log(totals)
console.table(byType)

db.close()
