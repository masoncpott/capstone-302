import { useState } from 'react'
import {
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
import './App.css'

type CustomerType = 'all' | 'residential' | 'commercial'
type MetricMode = 'revenue' | 'orderCount' | 'avgOrderValue'

const tileCategories = [
  'All',
  'Ceramic',
  'Porcelain',
  'Stone',
  'Mosaic',
  'Large Format',
  'Industrial Grade',
]

const projectTypes = [
  'All',
  'Kitchen Remodel',
  'Bathroom Renovation',
  'Home Flooring',
  'Condo Development',
  'Office Buildout',
  'Hospitality Retrofit',
]

const months = [
  'Jan 2025',
  'Feb 2025',
  'Mar 2025',
  'Apr 2025',
  'May 2025',
  'Jun 2025',
  'Jul 2025',
  'Aug 2025',
  'Sep 2025',
  'Oct 2025',
  'Nov 2025',
  'Dec 2025',
]

function PlaceholderPanel({ title, subtitle, height = 220 }: { title: string; subtitle: string; height?: number }) {
  return (
    <Box
      className="placeholderPanel"
      sx={{
        height,
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
      }}
    >
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', maxWidth: 340 }}>
        {subtitle}
      </Typography>
    </Box>
  )
}

function App() {
  const [customerFilter, setCustomerFilter] = useState<CustomerType>('all')
  const [tileFilter, setTileFilter] = useState('All')
  const [projectFilter, setProjectFilter] = useState('All')
  const [startMonth, setStartMonth] = useState(months[0])
  const [endMonth, setEndMonth] = useState(months[months.length - 1])
  const [metricMode, setMetricMode] = useState<MetricMode>('revenue')

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
              Layout draft only: this screen focuses on composition and hierarchy. Data wiring and chart
              rendering come in a later step.
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
                <Typography variant="h4">$--</Typography>
              </CardContent>
            </Card>
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Total Orders
                </Typography>
                <Typography variant="h4">--</Typography>
              </CardContent>
            </Card>
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Average Order Value
                </Typography>
                <Typography variant="h4">$--</Typography>
              </CardContent>
            </Card>
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Commercial Revenue Share
                </Typography>
                <Typography variant="h4">--%</Typography>
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
                    onChange={(e) => setCustomerFilter(e.target.value as CustomerType)}
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
                    {projectTypes.map((project) => (
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
                    {months.map((month) => (
                      <MenuItem key={month} value={month}>
                        {month}
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
                    {months.map((month) => (
                      <MenuItem key={month} value={month}>
                        {month}
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
                Primary Chart Area
              </Typography>
              <PlaceholderPanel
                title="Revenue Trend Placeholder"
                subtitle="This blank container reserves space for the primary time-series chart comparing residential and commercial performance."
                height={280}
              />
            </CardContent>
          </Card>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Supporting Chart Area
                </Typography>
                <PlaceholderPanel
                  title="Order Count by Segment"
                  subtitle="Placeholder for a supporting comparison chart."
                  height={210}
                />
              </CardContent>
            </Card>
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Supporting Chart Area
                </Typography>
                <PlaceholderPanel
                  title="Average Order Value by Segment"
                  subtitle="Placeholder for a second supporting chart."
                  height={210}
                />
              </CardContent>
            </Card>
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Supporting Chart Area
                </Typography>
                <PlaceholderPanel
                  title="Revenue by Tile Category"
                  subtitle="Placeholder for a category mix chart."
                  height={210}
                />
              </CardContent>
            </Card>

            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Written Insight Area
                </Typography>
                <PlaceholderPanel
                  title="Insight Cards Placeholder"
                  subtitle="Space reserved for annotations explaining key trends, spikes, and segment differences."
                  height={210}
                />
              </CardContent>
            </Card>
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}

export default App
