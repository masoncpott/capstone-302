import { useEffect, useMemo, useState } from 'react'
import { Alert, Box, Card, CardContent, CircularProgress, Container, Stack, Typography } from '@mui/material'
import type { ChartData } from 'chart.js'
import './App.css'
import './chartSetup'
import type { CustomerFilter, CustomerType, MetricMode, OrderRecord } from './types'
import { formatLabel, MONTH_FORMATTER, toMonthKey, parseMonth } from './utils'
import HeroPanel from './components/HeroPanel'
import KpiCards from './components/KpiCards'
import FiltersPanel from './components/FiltersPanel'
import PrimaryLineChart from './components/PrimaryLineChart'
import OrderCountChart from './components/OrderCountChart'
import AvgOrderValueChart from './components/AvgOrderValueChart'
import RevenueByCategoryChart from './components/RevenueByCategoryChart'
import ProjectDistributionChart from './components/ProjectDistributionChart'
import WrittenInsight from './components/WrittenInsight'

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
      <HeroPanel />

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

          <KpiCards topLine={topLine} />

          <FiltersPanel
            customerFilter={customerFilter}
            setCustomerFilter={setCustomerFilter}
            tileFilter={tileFilter}
            setTileFilter={setTileFilter}
            projectFilter={projectFilter}
            setProjectFilter={setProjectFilter}
            metricMode={metricMode}
            setMetricMode={setMetricMode}
            startMonth={startMonth}
            setStartMonth={setStartMonth}
            endMonth={endMonth}
            setEndMonth={setEndMonth}
            allMonthKeys={allMonthKeys}
            tileCategories={tileCategories}
            projectTypes={projectTypes}
          />

          <PrimaryLineChart
            data={primarySeries as ChartData<'line'>}
            metricMode={metricMode}
          />

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <OrderCountChart data={orderCountByType as ChartData<'bar'>} />
            <AvgOrderValueChart data={avgOrderValueByType as ChartData<'bar'>} />
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <RevenueByCategoryChart data={revenueByCategory as ChartData<'doughnut'>} />
            <ProjectDistributionChart data={projectDistribution as ChartData<'bar'>} />
          </Stack>

          <WrittenInsight />
        </Stack>
      </Container>
    </Box>
  )
}

export default App
