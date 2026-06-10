export type CustomerType = 'residential' | 'commercial'
export type CustomerFilter = 'all' | CustomerType
export type MetricMode = 'revenue' | 'orderCount' | 'avgOrderValue'

export type OrderRecord = {
  order_date: string
  customer_type: CustomerType
  project_type: string
  tile_category: string
  order_quantity: number
  revenue: number
  region: string
  order_size_classification: string
  lead_time_days: number
}
