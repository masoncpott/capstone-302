import {
  Box,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import type { CustomerFilter, MetricMode } from '../types'
import { MONTH_FORMATTER, parseMonth } from '../utils'

type Props = {
  customerFilter: CustomerFilter
  setCustomerFilter: (v: CustomerFilter) => void
  tileFilter: string
  setTileFilter: (v: string) => void
  projectFilter: string
  setProjectFilter: (v: string) => void
  metricMode: MetricMode
  setMetricMode: (v: MetricMode) => void
  startMonth: string
  setStartMonth: (v: string) => void
  endMonth: string
  setEndMonth: (v: string) => void
  allMonthKeys: string[]
  tileCategories: string[]
  projectTypes: string[]
}

export default function FiltersPanel({
  customerFilter,
  setCustomerFilter,
  tileFilter,
  setTileFilter,
  projectFilter,
  setProjectFilter,
  metricMode,
  setMetricMode,
  startMonth,
  setStartMonth,
  endMonth,
  setEndMonth,
  allMonthKeys,
  tileCategories,
  projectTypes,
}: Props) {
  return (
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
  )
}
