import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import './App.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
)

type CustomerType = 'residential' | 'commercial'
type CustomerFilter = 'all' | CustomerType
type MetricMode = 'revenue' | 'orderCount' | 'avgOrderValue'

type OrderRecord = {
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

const formatLabel = (value: string) =>
  value
    .split(' ')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ')

const MONTH_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  year: '2-digit',
})

const toMonthKey = (dateString: string) => dateString.slice(0, 7)
const parseMonth = (monthKey: string) => new Date(`${monthKey}-01T00:00:00`)

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)

function App() {
  const [records, setRecords] = useState<OrderRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [customerFilter, setCustomerFilter] = useState<CustomerFilter>('all')
  const [tileFilter, setTileFilter] = useState('all')
  const [projectFilter, setProjectFilter] = useState('all')
  const [metricMode, setMetricMode] = useState<MetricMode>('revenue')

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true)
        let res = await fetch('/api/orders')

        // Deployment fallback for static hosts that do not proxy /api.
        if (!res.ok) {
          res = await fetch('/orders.json')
        }

        if (!res.ok) {
          throw new Error(`Failed to load orders (${res.status})`)
        }

        const rows = (await res.json()) as OrderRecord[]
        setRecords(rows)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [])

  const allMonthKeys = useMemo(
    () => Array.from(new Set(records.map((r) => toMonthKey(r.order_date)))).sort(),
    [records],
  )

  const [startMonth, setStartMonth] = useState('')
  const [endMonth, setEndMonth] = useState('')

  useEffect(() => {
    if (!allMonthKeys.length) return
    if (!startMonth) setStartMonth(allMonthKeys[0])
    if (!endMonth) setEndMonth(allMonthKeys[allMonthKeys.length - 1])
  }, [allMonthKeys, startMonth, endMonth])

  const tileCategories = useMemo(
    () => ['all', ...Array.from(new Set(records.map((r) => r.tile_category))).sort()],
    [records],
  )

  const projectTypes = useMemo(
    () => ['all', ...Array.from(new Set(records.map((r) => r.project_type))).sort()],
    [records],
  )

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const monthKey = toMonthKey(record.order_date)
      const monthWithinRange =
        (!startMonth || monthKey >= startMonth) && (!endMonth || monthKey <= endMonth)
      const customerMatches = customerFilter === 'all' ? true : record.customer_type === customerFilter
      const tileMatches = tileFilter === 'all' ? true : record.tile_category === tileFilter
      const projectMatches = projectFilter === 'all' ? true : record.project_type === projectFilter
      return monthWithinRange && customerMatches && tileMatches && projectMatches
    })
  }, [records, startMonth, endMonth, customerFilter, tileFilter, projectFilter])

  const monthKeysInView = useMemo(
    () => Array.from(new Set(filteredRecords.map((r) => toMonthKey(r.order_date)))).sort(),
    [filteredRecords],
  )

  const primarySeries = useMemo(() => {
    const aggregate = (customerType: CustomerType) =>
      monthKeysInView.map((monthKey) => {
        const segmentRows = filteredRecords.filter(
          (r) => r.customer_type === customerType && toMonthKey(r.order_date) === monthKey,
        )
        if (!segmentRows.length) return 0
        if (metricMode === 'orderCount') return segmentRows.length
        const revenue = segmentRows.reduce((sum, row) => sum + row.revenue, 0)
        if (metricMode === 'avgOrderValue') return revenue / segmentRows.length
        return revenue
      })

    return {
      labels: monthKeysInView.map((key) => MONTH_FORMATTER.format(parseMonth(key))),
      datasets: [
        {
          label: 'Residential',
          data: aggregate('residential'),
          borderColor: '#1d4ed8',
          backgroundColor: 'rgba(29, 78, 216, 0.2)',
          fill: true,
          tension: 0.35,
        },
        {
          label: 'Commercial',
          data: aggregate('commercial'),
          borderColor: '#ea580c',
          backgroundColor: 'rgba(234, 88, 12, 0.2)',
          fill: true,
          tension: 0.35,
        },
      ],
    }
  }, [filteredRecords, metricMode, monthKeysInView])

  const orderCountByType = useMemo(() => {
    const grouped = {
      Residential: filteredRecords.filter((r) => r.customer_type === 'residential').length,
      Commercial: filteredRecords.filter((r) => r.customer_type === 'commercial').length,
    }
    return {
      labels: Object.keys(grouped),
      datasets: [
        {
          label: 'Order Count',
          data: Object.values(grouped),
          backgroundColor: ['rgba(29, 78, 216, 0.8)', 'rgba(234, 88, 12, 0.85)'],
        },
      ],
    }
  }, [filteredRecords])

  const avgOrderValueByType = useMemo(() => {
    const customerTypes: CustomerType[] = ['residential', 'commercial']
    const values = customerTypes.map((type) => {
      const rows = filteredRecords.filter((r) => r.customer_type === type)
      if (!rows.length) return 0
      return rows.reduce((sum, row) => sum + row.revenue, 0) / rows.length
    })

    return {
      labels: customerTypes.map(formatLabel),
      datasets: [
        {
          label: 'Average Order Value',
          data: values,
          backgroundColor: ['rgba(37, 99, 235, 0.8)', 'rgba(194, 65, 12, 0.8)'],
        },
      ],
    }
  }, [filteredRecords])

  const revenueByCategory = useMemo(() => {
    const labels = tileCategories.filter((c) => c !== 'all')
    const values = labels.map((category) =>
      filteredRecords
        .filter((r) => r.tile_category === category)
        .reduce((sum, row) => sum + row.revenue, 0),
    )

    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: ['#0f766e', '#0369a1', '#1d4ed8', '#9333ea', '#be123c', '#c2410c'],
          borderWidth: 1,
        },
      ],
    }
  }, [filteredRecords, tileCategories])

  const projectDistribution = useMemo(() => {
    const labels = projectTypes.filter((p) => p !== 'all')

    const residential = labels.map(
      (project) =>
        filteredRecords.filter(
          (r) => r.project_type === project && r.customer_type === 'residential',
        ).length,
    )

    const commercial = labels.map(
      (project) =>
        filteredRecords.filter(
          (r) => r.project_type === project && r.customer_type === 'commercial',
        ).length,
    )

    return {
      labels,
      datasets: [
        {
          label: 'Residential',
          data: residential,
          backgroundColor: 'rgba(29, 78, 216, 0.8)',
        },
        {
          label: 'Commercial',
          data: commercial,
          backgroundColor: 'rgba(234, 88, 12, 0.85)',
        },
      ],
    }
  }, [filteredRecords, projectTypes])

  const topLine = useMemo(() => {
    const totalRevenue = filteredRecords.reduce((sum, row) => sum + row.revenue, 0)
    const totalOrders = filteredRecords.length
    const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0

    const commercialRevenue = filteredRecords
      .filter((r) => r.customer_type === 'commercial')
      .reduce((sum, row) => sum + row.revenue, 0)
    const commercialShare = totalRevenue ? (commercialRevenue / totalRevenue) * 100 : 0

    return {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      commercialShare,
    }
  }, [filteredRecords])

  return (
    <Box sx={{ pb: 6 }}>
      <Box className="heroPanel" sx={{ py: 7, mb: 4 }}>
        <Container maxWidth="lg">
          <Stack spacing={2.5}>
            <Chip
              label="Tile Sales Narrative Prototype"
              sx={{ width: 'fit-content', bgcolor: 'rgba(255,255,255,0.7)' }}
            />
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
              Commercial projects drive fewer orders but much higher revenue.
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 860 }}>
              Residential demand creates steady weekly activity while large commercial project orders
              create outsized revenue swings.
            </Typography>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg">
        <Stack spacing={3}>
          {loading && (
            <Card>
              <CardContent>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <CircularProgress size={18} />
                  <Typography>Loading SQLite order data...</Typography>
                </Stack>
              </CardContent>
            </Card>
          )}

          {error && <Alert severity="error">{error}. Check API or static data export.</Alert>}

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Total Revenue
                </Typography>
                <Typography variant="h4">{formatCurrency(topLine.totalRevenue)}</Typography>
              </CardContent>
            </Card>
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Total Orders
                </Typography>
                <Typography variant="h4">{topLine.totalOrders}</Typography>
              </CardContent>
            </Card>
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Average Order Value
                </Typography>
                <Typography variant="h4">{formatCurrency(topLine.avgOrderValue)}</Typography>
              </CardContent>
            </Card>
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Commercial Revenue Share
                </Typography>
                <Typography variant="h4">{topLine.commercialShare.toFixed(1)}%</Typography>
              </CardContent>
            </Card>
          </Stack>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Filters
              </Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <FormControl fullWidth>
                  <InputLabel id="customer-filter-label">Customer Type</InputLabel>
                  <Select
                    labelId="customer-filter-label"
                    value={customerFilter}
                    label="Customer Type"
                    onChange={(e) => setCustomerFilter(e.target.value as CustomerFilter)}
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="residential">Residential</MenuItem>
                    <MenuItem value="commercial">Commercial</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel id="tile-filter-label">Tile Category</InputLabel>
                  <Select
                    labelId="tile-filter-label"
                    value={tileFilter}
                    label="Tile Category"
                    onChange={(e) => setTileFilter(e.target.value)}
                  >
                    {tileCategories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category === 'all' ? 'All' : category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel id="project-filter-label">Project Type</InputLabel>
                  <Select
                    labelId="project-filter-label"
                    value={projectFilter}
                    label="Project Type"
                    onChange={(e) => setProjectFilter(e.target.value)}
                  >
                    {projectTypes.map((project) => (
                      <MenuItem key={project} value={project}>
                        {project === 'all' ? 'All' : project}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mt: 2 }}>
                <FormControl fullWidth>
                  <InputLabel id="start-month-label">Start Month</InputLabel>
                  <Select
                    labelId="start-month-label"
                    value={startMonth}
                    label="Start Month"
                    onChange={(e) => setStartMonth(e.target.value)}
                  >
                    {allMonthKeys.map((monthKey) => (
                      <MenuItem key={monthKey} value={monthKey}>
                        {MONTH_FORMATTER.format(parseMonth(monthKey))}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel id="end-month-label">End Month</InputLabel>
                  <Select
                    labelId="end-month-label"
                    value={endMonth}
                    label="End Month"
                    onChange={(e) => setEndMonth(e.target.value)}
                  >
                    {allMonthKeys.map((monthKey) => (
                      <MenuItem key={monthKey} value={monthKey}>
                        {MONTH_FORMATTER.format(parseMonth(monthKey))}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Box sx={{ width: '100%' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Primary Metric
                  </Typography>
                  <ToggleButtonGroup
                    value={metricMode}
                    exclusive
                    fullWidth
                    onChange={(_event, next: MetricMode | null) => {
                      if (next) setMetricMode(next)
                    }}
                    size="small"
                  >
                    <ToggleButton value="revenue">Revenue</ToggleButton>
                    <ToggleButton value="orderCount">Order Count</ToggleButton>
                    <ToggleButton value="avgOrderValue">AOV</ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Primary Chart:{' '}
                {metricMode === 'revenue'
                  ? 'Revenue'
                  : metricMode === 'orderCount'
                    ? 'Order Count'
                    : 'Average Order Value'}{' '}
                over Time
              </Typography>
              <Line
                data={primarySeries}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  interaction: { mode: 'index', intersect: false },
                  plugins: {
                    tooltip: {
                      callbacks: {
                        label: (ctx) => {
                          const label = `${ctx.dataset.label}: `
                          return metricMode === 'revenue' || metricMode === 'avgOrderValue'
                            ? label + formatCurrency(Number(ctx.parsed.y))
                            : label + Number(ctx.parsed.y).toLocaleString()
                        },
                      },
                    },
                  },
                }}
                height={120}
              />
            </CardContent>
          </Card>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Supporting Chart: Order Count by Segment
                </Typography>
                <Bar
                  data={orderCountByType}
                  options={{ responsive: true, maintainAspectRatio: false }}
                  height={175}
                />
              </CardContent>
            </Card>
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Supporting Chart: Average Order Value by Segment
                </Typography>
                <Bar
                  data={avgOrderValueByType}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      tooltip: {
                        callbacks: {
                          label: (ctx) =>
                            `${ctx.dataset.label}: ${formatCurrency(Number(ctx.parsed.y))}`,
                        },
                      },
                    },
                  }}
                  height={175}
                />
              </CardContent>
            </Card>
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Supporting Chart: Revenue by Tile Category
                </Typography>
                <Doughnut
                  data={revenueByCategory}
                  options={{ responsive: true, maintainAspectRatio: false }}
                  height={190}
                />
              </CardContent>
            </Card>

            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Supporting Chart: Project Type Distribution
                </Typography>
                <Bar
                  data={projectDistribution}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } },
                  }}
                  height={190}
                />
              </CardContent>
            </Card>
          </Stack>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Written Insight
              </Typography>
              <Stack spacing={1.5}>
                <Alert severity="info">
                  Commercial volume is lower by count but dominates revenue due to high-value project
                  orders.
                </Alert>
                <Alert severity="warning">
                  Residential order activity remains more frequent across months, reinforcing baseline
                  operational demand.
                </Alert>
                <Alert severity="success">
                  Customer mix and project profile together explain why order count and revenue trends
                  can diverge.
                </Alert>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  )
}

export default App
