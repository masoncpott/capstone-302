import { useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
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

type CustomerType = 'Residential' | 'Commercial'
type MetricMode = 'revenue' | 'orderCount' | 'avgOrderValue'

type OrderRecord = {
  orderDate: string
  customerType: CustomerType
  projectType: string
  tileCategory: string
  orderQuantity: number
  revenue: number
  region: string
  orderSize: 'Small' | 'Medium' | 'Large'
  leadTimeDays: number
}

const tileCategories = [
  'Ceramic',
  'Porcelain',
  'Stone',
  'Mosaic',
  'Large Format',
  'Industrial Grade',
]

const regions = ['West', 'Midwest', 'Northeast', 'Southeast', 'Southwest']

const residentialProjects = ['Kitchen Remodel', 'Bathroom Refresh', 'Home Flooring']
const commercialProjects = [
  'Condo Development',
  'Office Buildout',
  'Hospitality Retrofit',
]

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

const makeMockOrders = (): OrderRecord[] => {
  const rows: OrderRecord[] = []
  let seed = 40

  for (let month = 0; month < 12; month += 1) {
    const residentialBurst = month >= 2 && month <= 6 ? 1.25 : 0.9
    const commercialBurst = month === 4 || month === 9 ? 1.4 : 0.85
    const residentialOrders = Math.round(24 * residentialBurst)
    const commercialOrders = Math.round(7 * commercialBurst)

    for (let i = 0; i < residentialOrders; i += 1) {
      seed += 1
      const quantity = 35 + Math.round(seededRandom(seed) * 95)
      const category = tileCategories[Math.floor(seededRandom(seed + 1) * tileCategories.length)]
      const project =
        residentialProjects[Math.floor(seededRandom(seed + 2) * residentialProjects.length)]
      const date = new Date(2025, month, 1 + Math.floor(seededRandom(seed + 3) * 27))

      rows.push({
        orderDate: date.toISOString().slice(0, 10),
        customerType: 'Residential',
        projectType: project,
        tileCategory: category,
        orderQuantity: quantity,
        revenue: quantity * (24 + seededRandom(seed + 4) * 14),
        region: regions[Math.floor(seededRandom(seed + 5) * regions.length)],
        orderSize: quantity < 80 ? 'Small' : quantity < 120 ? 'Medium' : 'Large',
        leadTimeDays: 5 + Math.round(seededRandom(seed + 6) * 8),
      })
    }

    for (let i = 0; i < commercialOrders; i += 1) {
      seed += 2
      const quantity = 700 + Math.round(seededRandom(seed) * 1900)
      const category = tileCategories[Math.floor(seededRandom(seed + 1) * tileCategories.length)]
      const project =
        commercialProjects[Math.floor(seededRandom(seed + 2) * commercialProjects.length)]
      const date = new Date(2025, month, 1 + Math.floor(seededRandom(seed + 3) * 27))

      rows.push({
        orderDate: date.toISOString().slice(0, 10),
        customerType: 'Commercial',
        projectType: project,
        tileCategory: category,
        orderQuantity: quantity,
        revenue: quantity * (40 + seededRandom(seed + 4) * 19),
        region: regions[Math.floor(seededRandom(seed + 5) * regions.length)],
        orderSize: quantity < 1000 ? 'Medium' : 'Large',
        leadTimeDays: 11 + Math.round(seededRandom(seed + 6) * 18),
      })
    }
  }

  return rows
}

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
  const [records] = useState<OrderRecord[]>(() => makeMockOrders())
  const [customerFilter, setCustomerFilter] = useState<'All' | CustomerType>('All')
  const [tileFilter, setTileFilter] = useState<string>('All')
  const [projectFilter, setProjectFilter] = useState<string>('All')
  const [metricMode, setMetricMode] = useState<MetricMode>('revenue')

  const allMonthKeys = useMemo(
    () => Array.from(new Set(records.map((r) => toMonthKey(r.orderDate)))).sort(),
    [records],
  )

  const [startMonth, setStartMonth] = useState(allMonthKeys[0])
  const [endMonth, setEndMonth] = useState(allMonthKeys[allMonthKeys.length - 1])

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const monthKey = toMonthKey(record.orderDate)
      const monthWithinRange = monthKey >= startMonth && monthKey <= endMonth
      const customerMatches =
        customerFilter === 'All' ? true : record.customerType === customerFilter
      const tileMatches = tileFilter === 'All' ? true : record.tileCategory === tileFilter
      const projectMatches =
        projectFilter === 'All' ? true : record.projectType === projectFilter
      return monthWithinRange && customerMatches && tileMatches && projectMatches
    })
  }, [records, startMonth, endMonth, customerFilter, tileFilter, projectFilter])

  const monthLabels = useMemo(
    () =>
      Array.from(new Set(filteredRecords.map((r) => toMonthKey(r.orderDate))))
        .sort()
        .map((key) => MONTH_FORMATTER.format(parseMonth(key))),
    [filteredRecords],
  )

  const primarySeries = useMemo(() => {
    const monthKeys = Array.from(
      new Set(filteredRecords.map((r) => toMonthKey(r.orderDate))),
    ).sort()

    const aggregate = (customerType: CustomerType) =>
      monthKeys.map((monthKey) => {
        const segmentRows = filteredRecords.filter(
          (r) => r.customerType === customerType && toMonthKey(r.orderDate) === monthKey,
        )
        if (!segmentRows.length) return 0
        if (metricMode === 'orderCount') return segmentRows.length
        const revenue = segmentRows.reduce((sum, row) => sum + row.revenue, 0)
        if (metricMode === 'avgOrderValue') return revenue / segmentRows.length
        return revenue
      })

    return {
      labels: monthKeys.map((key) => MONTH_FORMATTER.format(parseMonth(key))),
      datasets: [
        {
          label: 'Residential',
          data: aggregate('Residential'),
          borderColor: '#1d4ed8',
          backgroundColor: 'rgba(29, 78, 216, 0.2)',
          fill: true,
          tension: 0.35,
        },
        {
          label: 'Commercial',
          data: aggregate('Commercial'),
          borderColor: '#ea580c',
          backgroundColor: 'rgba(234, 88, 12, 0.2)',
          fill: true,
          tension: 0.35,
        },
      ],
    }
  }, [filteredRecords, metricMode])

  const revenueByCategory = useMemo(() => {
    const labels = tileCategories
    const values = labels.map((category) =>
      filteredRecords
        .filter((r) => r.tileCategory === category)
        .reduce((sum, row) => sum + row.revenue, 0),
    )

    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: [
            '#0f766e',
            '#0369a1',
            '#1d4ed8',
            '#9333ea',
            '#be123c',
            '#c2410c',
          ],
          borderWidth: 1,
        },
      ],
    }
  }, [filteredRecords])

  const orderCountByType = useMemo(() => {
    const grouped = {
      Residential: filteredRecords.filter((r) => r.customerType === 'Residential').length,
      Commercial: filteredRecords.filter((r) => r.customerType === 'Commercial').length,
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
    const customerTypes: CustomerType[] = ['Residential', 'Commercial']
    const values = customerTypes.map((type) => {
      const rows = filteredRecords.filter((r) => r.customerType === type)
      if (!rows.length) return 0
      return rows.reduce((sum, row) => sum + row.revenue, 0) / rows.length
    })
    return {
      labels: customerTypes,
      datasets: [
        {
          label: 'Average Order Value',
          data: values,
          backgroundColor: ['rgba(37, 99, 235, 0.8)', 'rgba(194, 65, 12, 0.8)'],
        },
      ],
    }
  }, [filteredRecords])

  const topLine = useMemo(() => {
    const totalRevenue = filteredRecords.reduce((sum, row) => sum + row.revenue, 0)
    const totalOrders = filteredRecords.length
    const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0

    const commercialRevenue = filteredRecords
      .filter((r) => r.customerType === 'Commercial')
      .reduce((sum, row) => sum + row.revenue, 0)
    const commercialShare = totalRevenue ? (commercialRevenue / totalRevenue) * 100 : 0

    return {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      commercialShare,
    }
  }, [filteredRecords])

  const projectOptions = useMemo(
    () => Array.from(new Set(records.map((r) => r.projectType))).sort(),
    [records],
  )

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
              Residential demand creates steady weekly activity. Commercial demand appears in
              larger bursts that reshape monthly revenue performance.
            </Typography>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg">
        <Stack spacing={3}>
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
                    onChange={(e) => setCustomerFilter(e.target.value as 'All' | CustomerType)}
                  >
                    <MenuItem value="All">All</MenuItem>
                    <MenuItem value="Residential">Residential</MenuItem>
                    <MenuItem value="Commercial">Commercial</MenuItem>
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
                    <MenuItem value="All">All</MenuItem>
                    {tileCategories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
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
                    <MenuItem value="All">All</MenuItem>
                    {projectOptions.map((project) => (
                      <MenuItem key={project} value={project}>
                        {project}
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
                  Written Insight
                </Typography>
                <Stack spacing={1.5}>
                  <Alert severity="info">
                    Residential orders represent most transactions, but commercial orders dominate
                    revenue impact.
                  </Alert>
                  <Alert severity="warning">
                    Seasonal demand is strongest in spring and early summer for residential
                    renovation projects.
                  </Alert>
                  <Alert severity="success">
                    Volume and revenue diverge: fewer large commercial orders create outsized
                    monthly swings.
                  </Alert>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Visible months in current filter: {monthLabels.join(', ') || 'None'}
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}

export default App
