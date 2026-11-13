<template>
    <!-- BOOKING DETAILS MODAL -->
    <div v-if="showDetailModal" class="detail-modal-backdrop" @click.self="closeDetailModal">
        <div class="detail-modal">

            <div class="detail-modal-header">
                <div>
                    <h5 class="mb-1">{{ detailTitle }}</h5>
                    <small class="text-muted">
                        {{ detailRecords.length }} booking records
                    </small>
                </div>

                <button type="button" class="btn-close" @click="closeDetailModal"></button>
            </div>

            <div class="detail-modal-body">

                <div v-if="detailLoading" class="text-center py-5">
                    <div class="spinner-border text-primary"></div>
                    <p class="text-muted mt-2 mb-0">Loading bookings...</p>
                </div>

                <div v-else-if="detailError" class="alert alert-danger">
                    {{ detailError }}
                </div>

                <div v-else-if="!detailRecords.length" class="text-center text-muted py-5">
                    No booking records found.
                </div>

                <div v-else class="table-responsive">
                    <table class="table table-hover align-middle">
                        <thead class="table-light">
                            <tr>
                                <th>#</th>
                                <th>Booking Number</th>
                                <th>Resource</th>
                                <th>Department</th>
                                <th>Requester</th>
                                <th>Start</th>
                                <th>End</th>
                                <th class="text-end">Hours</th>
                                <th>Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr v-for="(item, index) in detailRecords" :key="item.id">
                                <td>{{ index + 1 }}</td>
                                <td class="fw-semibold">
                                    {{ item.booking_number || '-' }}
                                </td>
                                <td>{{ item.resource }}</td>
                                <td>{{ item.department }}</td>
                                <td>{{ item.requester || '-' }}</td>
                                <td>{{ item.start || '-' }}</td>
                                <td>{{ item.stop || '-' }}</td>
                                <td class="text-end fw-semibold">
                                    {{ formatNumber(item.hours) }}
                                </td>
                                <td>
                                    <span class="badge bg-light text-dark">
                                        {{ item.state }}
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

            </div>

            <div class="detail-modal-footer">
                <button class="btn btn-secondary" @click="closeDetailModal">
                    Close
                </button>
            </div>

        </div>
    </div>
    <div class="container-fluid py-4 booking-report">

        <!-- HEADER -->
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
            <div>
                <h4 class="mb-1 fw-semibold">Booking Report</h4>
                <p class="text-muted mb-0">
                    Booking statistics, working hours and department reports.
                </p>
            </div>

            <button class="btn btn-outline-secondary" @click="loadReport" :disabled="loading">
                <i class="bi bi-arrow-clockwise me-1"></i>
                Refresh
            </button>
        </div>

        <!-- FILTERS -->
        <div class="card border-0 shadow-sm mb-4">
            <div class="card-body">
                <div class="row g-3 align-items-end">

                    <div class="col-md-3">
                        <label class="form-label">Report Period</label>
                        <select v-model="filterType" class="form-select">
                            <option value="all">All Dates</option>
                            <option value="month">Monthly</option>
                            <option value="year">Yearly</option>
                            <option value="custom">Custom Date Range</option>
                        </select>
                    </div>

                    <div class="col-md-2" v-if="filterType === 'month' || filterType === 'year'">
                        <label class="form-label">Year</label>
                        <select v-model.number="selectedYear" class="form-select">
                            <option v-for="year in years" :key="year" :value="year">
                                {{ year }}
                            </option>
                        </select>
                    </div>

                    <div class="col-md-2" v-if="filterType === 'month'">
                        <label class="form-label">Month</label>
                        <select v-model.number="selectedMonth" class="form-select">
                            <option v-for="month in months" :key="month.value" :value="month.value">
                                {{ month.label }}
                            </option>
                        </select>
                    </div>

                    <template v-if="filterType === 'custom'">
                        <div class="col-md-2">
                            <label class="form-label">Start Date</label>
                            <input v-model="dateFrom" type="date" class="form-control" />
                        </div>

                        <div class="col-md-2">
                            <label class="form-label">End Date</label>
                            <input v-model="dateTo" type="date" class="form-control" :min="dateFrom || undefined" />
                        </div>
                    </template>

                    <div class="col-md-2">
                        <button class="btn btn-primary w-100" @click="applyFilter" :disabled="loading || !validFilter">
                            <i class="bi bi-funnel me-1"></i>
                            Apply Filter
                        </button>
                    </div>

                </div>

                <div class="small text-muted mt-3" v-if="periodLabel">
                    <i class="bi bi-calendar3 me-1"></i>
                    {{ periodLabel }}
                </div>
            </div>
        </div>

        <!-- ERROR -->
        <div v-if="error" class="alert alert-danger">
            <i class="bi bi-exclamation-circle me-2"></i>
            {{ error }}
        </div>

        <!-- SUMMARY CARDS -->
        <div class="row g-3 mb-4">

            <div class="col-6 col-xl-3">
                <div class="summary-card">
                    <div class="summary-icon purple">
                        <i class="bi bi-calendar-check"></i>
                    </div>
                    <div>
                        <div class="summary-label">Total Bookings</div>
                        <div class="summary-value">
                            {{ formatNumber(summary.total_bookings) }}
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-6 col-xl-3">
                <div class="summary-card">
                    <div class="summary-icon blue">
                        <i class="bi bi-clock-history"></i>
                    </div>
                    <div>
                        <div class="summary-label">Total Hours</div>
                        <div class="summary-value">
                            {{ formatNumber(summary.total_hours) }}
                            <small>hrs</small>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-6 col-xl-3">
                <div class="summary-card">
                    <div class="summary-icon green">
                        <i class="bi bi-building"></i>
                    </div>
                    <div>
                        <div class="summary-label">Departments</div>
                        <div class="summary-value">
                            {{ formatNumber(summary.total_departments) }}
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-6 col-xl-3">
                <div class="summary-card">
                    <div class="summary-icon orange">
                        <i class="bi bi-check-circle"></i>
                    </div>
                    <div>
                        <div class="summary-label">Approved Bookings</div>
                        <div class="summary-value">
                            {{ formatNumber(summary.approved) }}
                        </div>
                    </div>
                </div>
            </div>

        </div>

        <!-- CHARTS -->
        <div class="row g-4 mb-4">

            <!-- BOOKING RESOURCE CHART -->
            <div class="col-xl-6">
                <div class="card report-card h-100">
                    <div class="card-header bg-white border-0 pt-4 px-4">
                        <div>
                            <h6 class="fw-semibold mb-1">Booking Hours by Booking</h6>
                            <p class="text-muted small mb-0">
                                Total working hours for each booked resource
                            </p>
                        </div>
                    </div>

                    <div class="card-body px-4">
                        <div v-if="loading" class="chart-loading">
                            <div class="spinner-border text-primary"></div>
                        </div>

                        <div v-else-if="!bookingChartData.labels.length" class="empty-chart">
                            No booking data available
                        </div>

                        <div v-else class="chart-container">
                            <Bar :data="bookingChartData" :options="bookingChartOptions" data-report-type="booking" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- DEPARTMENT CHART -->
            <div class="col-xl-6">
                <div class="card report-card h-100">
                    <div class="card-header bg-white border-0 pt-4 px-4">
                        <div>
                            <h6 class="fw-semibold mb-1">Booking Hours by Department</h6>
                            <p class="text-muted small mb-0">
                                Total working hours grouped by department
                            </p>
                        </div>
                    </div>

                    <div class="card-body px-4">
                        <div v-if="loading" class="chart-loading">
                            <div class="spinner-border text-primary"></div>
                        </div>

                        <div v-else-if="!departmentChartData.labels.length" class="empty-chart">
                            No department data available
                        </div>

                        <div v-else class="chart-container">
                            <Bar :data="departmentChartData" :options="departmentChartOptions"
                                data-report-type="department" />
                        </div>
                    </div>
                </div>
            </div>

        </div>

        <!-- SUMMARY TABLE -->

        <div class="row g-4">
            <!-- BOOKING RESOURCE SUMMARY TABLE -->
             <div class="col-12 col-xl-6"> 
            <div class="card report-card border-0 shadow-sm h-100">

                <div class="card-header bg-white border-0 p-4">
                    <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <div>
                            <h6 class="fw-semibold mb-1">Booking Resource Summary Report</h6>
                            <p class="text-muted small mb-0">
                                Booking count and working hours by booking resource
                            </p>
                        </div>

                        <button class="btn btn-sm btn-outline-success" @click="exportCSV"
                            :disabled="!bookingReport.length">
                            <i class="bi bi-file-earmark-excel me-1"></i>
                            Export CSV
                        </button>
                    </div>
                </div>

                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">

                        <thead class="table-light">
                            <tr>
                                <th width="70">#</th>
                                <th>Booking Resource</th>
                                <th class="text-center">Total Bookings</th>
                                <th class="text-end">Total Hours</th>
                                <th class="text-end">Percentage</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr v-for="(item, index) in bookingReport" :key="item.id || item.name" class="clickable-row"
                                @click="openBookingDetails('booking', item.id, item.name)">
                                <td>{{ index + 1 }}</td>

                                <td>
                                    <div class="fw-medium">
                                        {{ item.name }}
                                    </div>
                                </td>

                                <td class="text-center">
                                    {{ formatNumber(item.booking_count) }}
                                </td>

                                <td class="text-end fw-semibold">
                                    {{ formatNumber(item.hours) }} hrs
                                </td>

                                <td class="text-end">
                                    <div class="d-flex align-items-center justify-content-end gap-2">
                                        <div class="progress percentage-progress">
                                            <div class="progress-bar" :style="{ width: percentage(item.hours) + '%' }">
                                            </div>
                                        </div>

                                        <span class="small text-muted">
                                            {{ percentage(item.hours) }}%
                                        </span>
                                    </div>
                                </td>
                            </tr>

                            <tr v-if="!loading && !bookingReport.length">
                                <td colspan="5" class="text-center py-5 text-muted">
                                    No booking resource data found
                                </td>
                            </tr>
                        </tbody>

                        <tfoot v-if="bookingReport.length" class="table-light">
                            <tr class="fw-semibold">
                                <td colspan="2">Total</td>

                                <td class="text-center">
                                    {{ formatNumber(summary.total_bookings) }}
                                </td>

                                <td class="text-end">
                                    {{ formatNumber(summary.total_hours) }} hrs
                                </td>

                                <td class="text-end">100%</td>
                            </tr>
                        </tfoot>

                    </table>
                </div>

                <div class="card-footer bg-white border-0 px-4 py-3">
                    <span class="small text-muted">
                        Showing {{ bookingReport.length }} booking resources
                    </span>
                </div>

            </div>
            </div>

            <!-- DEPARTMENT SUMMARY TABLE -->
             
             <div class="col-12 col-xl-6"> 
            <div class="card report-card border-0 shadow-sm h-100">

                <div class="card-header bg-white border-0 p-4">
                    <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <div>
                            <h6 class="fw-semibold mb-1">Department Summary Report</h6>
                            <p class="text-muted small mb-0">
                                Booking count and working hours by department
                            </p>
                        </div>

                        <button class="btn btn-sm btn-outline-success" @click="exportDepartmentCSV"
                            :disabled="!summaryTable.length">
                            <i class="bi bi-file-earmark-excel me-1"></i>
                            Export CSV
                        </button>
                    </div>
                </div>

                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">

                        <thead class="table-light">
                            <tr>
                                <th width="70">#</th>
                                <th>Department</th>
                                <th class="text-center">Total Bookings</th>
                                <th class="text-end">Total Hours</th>
                                <th class="text-end">Percentage</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr v-for="(item, index) in summaryTable" :key="item.department" class="clickable-row"
                                @click="openBookingDetails('department', item.department)">
                                <td>{{ index + 1 }}</td>

                                <td>
                                    <div class="fw-medium">
                                        {{ item.department }}
                                    </div>
                                </td>

                                <td class="text-center">
                                    {{ formatNumber(item.booking_count) }}
                                </td>

                                <td class="text-end fw-semibold">
                                    {{ formatNumber(item.hours) }} hrs
                                </td>

                                <td class="text-end">
                                    <div class="d-flex align-items-center justify-content-end gap-2">
                                        <div class="progress percentage-progress">
                                            <div class="progress-bar" :style="{ width: percentage(item.hours) + '%' }">
                                            </div>
                                        </div>

                                        <span class="small text-muted">
                                            {{ percentage(item.hours) }}%
                                        </span>
                                    </div>
                                </td>
                            </tr>

                            <tr v-if="!loading && !summaryTable.length">
                                <td colspan="5" class="text-center py-5 text-muted">
                                    No department data found
                                </td>
                            </tr>
                        </tbody>

                        <tfoot v-if="summaryTable.length" class="table-light">
                            <tr class="fw-semibold">
                                <td colspan="2">Total</td>

                                <td class="text-center">
                                    {{ formatNumber(summary.total_bookings) }}
                                </td>

                                <td class="text-end">
                                    {{ formatNumber(summary.total_hours) }} hrs
                                </td>

                                <td class="text-end">100%</td>
                            </tr>
                        </tfoot>

                    </table>
                </div>

                <div class="card-footer bg-white border-0 px-4 py-3">
                    <span class="small text-muted">
                        Showing {{ summaryTable.length }} departments
                    </span>
                </div>

            </div>
            </div>
        </div>

    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Bar } from 'vue-chartjs'

import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale
} from 'chart.js'

// Change this import to the location of your existing Odoo Axios instance.
import {
    getBookingReport,
    getBookingReportDetails
} from '../api/bookingReport'

ChartJS.register(
    Title,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale
)

// =====================================================
// FILTERS
// =====================================================

const currentDate = new Date()

const filterType = ref('month')
const selectedYear = ref(currentDate.getFullYear())
const selectedMonth = ref(currentDate.getMonth() + 1)

const dateFrom = ref('')
const dateTo = ref('')

const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
]

const years = computed(() => {
    const result = []
    const currentYear = currentDate.getFullYear()

    for (let year = currentYear; year >= currentYear - 10; year--) {
        result.push(year)
    }

    return result
})

const handleChartClick = (groupBy) => (event, elements) => {
    if (!elements.length) return

    const index = elements[0].index

    if (groupBy === 'booking') {
        const item = bookingReport.value[index]
        if (!item) return

        openBookingDetails('booking', item.id, item.name)
    } else {
        const item = departmentReport.value[index]
        if (!item) return

        openBookingDetails('department', item.name)
    }
}
const validFilter = computed(() => {
    if (filterType.value !== 'custom') return true

    return (
        dateFrom.value &&
        dateTo.value &&
        dateFrom.value <= dateTo.value
    )
})

const periodLabel = computed(() => {
    if (filterType.value === 'month') {
        const month = months.find(m => m.value === selectedMonth.value)
        return `${month?.label} ${selectedYear.value}`
    }

    if (filterType.value === 'year') {
        return `Year ${selectedYear.value}`
    }

    if (filterType.value === 'custom') {
        return `${dateFrom.value || '...'} - ${dateTo.value || '...'}`
    }

    return 'All booking dates'
})

// =====================================================
// DATA
// =====================================================

const loading = ref(false)
const error = ref('')

const summary = ref({
    total_bookings: 0,
    total_hours: 0,
    total_departments: 0,
    approved: 0
})

const bookingReport = ref([])
const departmentReport = ref([])
const summaryTable = ref([])

const showDetailModal = ref(false)
const detailLoading = ref(false)
const detailError = ref('')
const detailRecords = ref([])
const detailTitle = ref('Booking Details')

const getReportParams = () => {
    const params = {
        type_id: 2
    }

    if (filterType.value === 'month') {
        params.year = selectedYear.value
        params.month = selectedMonth.value
    } else if (filterType.value === 'year') {
        params.year = selectedYear.value
    } else if (filterType.value === 'custom') {
        params.date_from = dateFrom.value
        params.date_to = dateTo.value
    }

    return params
}
const openBookingDetails = async (
    groupBy,
    groupId,
    groupName = null
) => {
    showDetailModal.value = true
    detailLoading.value = true
    detailError.value = ''
    detailRecords.value = []

    detailTitle.value = groupBy === 'booking'
        ? `Bookings - ${groupName || 'Unassigned'}`
        : `Department - ${groupId}`

    try {
        const params = {
            ...getReportParams(),
            group_by: groupBy
        }

        if (groupBy === 'booking') {
            params.booking_id = groupId === false || groupId == null
                ? 'false'
                : groupId
        } else {
            params.group_name = groupId
        }

        const result = await getBookingReportDetails(params)

        if (!result.success) {
            throw new Error(
                result.message || 'Unable to load booking details'
            )
        }

        detailRecords.value = result.records || []

    } catch (err) {
        console.error('Booking details error:', err)

        detailError.value =
            err.response?.data?.message ||
            err.message ||
            'Failed to load booking details.'

    } finally {
        detailLoading.value = false
    }
}

const closeDetailModal = () => {
    showDetailModal.value = false
    detailRecords.value = []
}
// =====================================================
// CHART DATA
// =====================================================

const bookingChartData = computed(() => ({
    labels: bookingReport.value.map(item => item.name),

    datasets: [
        {
            label: 'Booking Hours',
            data: bookingReport.value.map(item => item.hours),
            backgroundColor: '#714B67',
            borderRadius: 6,
            barThickness: 28
        }
    ]
}))

const departmentChartData = computed(() => ({
    labels: departmentReport.value.map(item => item.name),

    datasets: [
        {
            label: 'Booking Hours',
            data: departmentReport.value.map(item => item.hours),
            backgroundColor: '#3B82F6',
            borderRadius: 6,
            barThickness: 28
        }
    ]
}))

const chartBaseOptions = {
    responsive: true,
    maintainAspectRatio: false,

    onHover(event, elements) {
        event.native.target.style.cursor =
            elements.length ? 'pointer' : 'default'
    },

    plugins: {
        legend: {
            display: true,
            position: 'bottom'
        },
        tooltip: {
            callbacks: {
                label(context) {
                    return `${context.dataset.label}: ${context.parsed.y} hours`
                }
            }
        }
    },

    scales: {
        y: {
            beginAtZero: true,
            title: {
                display: true,
                text: 'Hours'
            },
            ticks: {
                precision: 0
            }
        },
        x: {
            ticks: {
                autoSkip: false
            }
        }
    }
}

const bookingChartOptions = {
    ...chartBaseOptions,
    onClick: handleChartClick('booking')
}

const departmentChartOptions = {
    ...chartBaseOptions,
    onClick: handleChartClick('department')
}

// =====================================================
// LOAD REPORT
// =====================================================

const loadReport = async () => {
    loading.value = true
    error.value = ''

    try {
        const params = {
            type_id: 2
        }

        if (filterType.value === 'month') {
            params.year = selectedYear.value
            params.month = selectedMonth.value
        } else if (filterType.value === 'year') {
            params.year = selectedYear.value
        } else if (filterType.value === 'custom') {
            if (!validFilter.value) {
                throw new Error('Please select a valid start and end date.')
            }

            params.date_from = dateFrom.value
            params.date_to = dateTo.value
        }

        // Call API from separate service file
        const result = await getBookingReport(params)

        if (!result.success) {
            throw new Error(result.message || 'Unable to load booking report')
        }

        // Summary cards
        summary.value = {
            total_bookings: Number(result.summary?.total_bookings || 0),
            total_hours: Number(result.summary?.total_hours || 0),
            total_departments: Number(result.summary?.total_departments || 0),
            approved: Number(result.summary?.approved || 0)
        }

        // Charts and table
        bookingReport.value = result.booking_id || []
        departmentReport.value = result.department || []
        summaryTable.value = result.summary_table || []

    } catch (err) {
        console.error('Booking report error:', err)

        error.value =
            err.response?.data?.message ||
            err.message ||
            'Failed to load booking report.'

        bookingReport.value = []
        departmentReport.value = []
        summaryTable.value = []

        summary.value = {
            total_bookings: 0,
            total_hours: 0,
            total_departments: 0,
            approved: 0
        }

    } finally {
        loading.value = false
    }
}


const applyFilter = () => {
    if (validFilter.value) {
        loadReport()
    }
}

// =====================================================
// HELPERS
// =====================================================

const formatNumber = (value) => {
    return Number(value || 0).toLocaleString('en-US', {
        maximumFractionDigits: 2
    })
}

const percentage = (hours) => {
    const total = Number(summary.value.total_hours || 0)

    if (!total) return 0

    return Math.round((Number(hours || 0) / total) * 100)
}

// =====================================================
// EXPORT CSV
// =====================================================


const exportCSV = () => {
    if (!bookingReport.value.length) return

    const headers = [
        'No.',
        'Booking Resource',
        'Total Bookings',
        'Total Hours',
        'Percentage'
    ]

    const rows = bookingReport.value.map((item, index) => [
        index + 1,
        item.name,
        item.booking_count,
        item.hours,
        percentage(item.hours) + '%'
    ])

    rows.push([
        '',
        'TOTAL',
        summary.value.total_bookings,
        summary.value.total_hours,
        '100%'
    ])

    const escapeCSV = (value) => {
        return `"${String(value ?? '').replace(/"/g, '""')}"`
    }

    const csv = [
        headers.map(escapeCSV).join(','),
        ...rows.map(row => row.map(escapeCSV).join(','))
    ].join('\r\n')

    const blob = new Blob(
        ['\uFEFF' + csv],
        { type: 'text/csv;charset=utf-8;' }
    )

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = 'booking_resource_report.csv'
    link.click()

    URL.revokeObjectURL(url)
}

const exportDepartmentCSV = () => {
    if (!summaryTable.value.length) return

    const headers = [
        'No.',
        'Department',
        'Total Bookings',
        'Total Hours',
        'Percentage'
    ]

    const rows = summaryTable.value.map((item, index) => [
        index + 1,
        item.department,
        item.booking_count,
        item.hours,
        percentage(item.hours) + '%'
    ])

    rows.push([
        '',
        'TOTAL',
        summary.value.total_bookings,
        summary.value.total_hours,
        '100%'
    ])

    const escapeCSV = (value) =>
        `"${String(value ?? '').replace(/"/g, '""')}"`

    const csv = [
        headers.map(escapeCSV).join(','),
        ...rows.map(row => row.map(escapeCSV).join(','))
    ].join('\r\n')

    const blob = new Blob(
        ['\uFEFF' + csv],
        { type: 'text/csv;charset=utf-8;' }
    )

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = 'booking_department_report.csv'
    link.click()

    URL.revokeObjectURL(url)
}


// =====================================================
// INITIAL LOAD
// =====================================================

onMounted(() => {
    loadReport()
})
</script>

<style scoped>
.clickable-row {
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.clickable-row:hover {
    background-color: #f5eff5;
}

.detail-modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 1055;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.detail-modal {
    background: #fff;
    width: 100%;
    max-width: 1400px;
    max-height: 90vh;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.detail-modal-header,
.detail-modal-footer {
    padding: 18px 22px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #edf0f3;
}

.detail-modal-footer {
    justify-content: flex-end;
    border-top: 1px solid #edf0f3;
    border-bottom: 0;
}

.detail-modal-body {
    padding: 20px;
    overflow: auto;
}

.detail-modal .table {
    white-space: nowrap;
    font-size: 13px;
}

@media (max-width: 768px) {
    .detail-modal-backdrop {
        padding: 8px;
    }

    .detail-modal {
        max-height: 95vh;
    }

    .detail-modal-body {
        padding: 12px;
    }
}

.booking-report {
    color: #343a40;
}

.summary-card {
    display: flex;
    align-items: center;
    gap: 14px;
    background: #fff;
    border: 1px solid #edf0f3;
    border-radius: 12px;
    padding: 20px 16px;
    height: 100%;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.035);
}

.summary-icon {
    width: 46px;
    height: 46px;
    min-width: 46px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 12px;
    font-size: 21px;
}

.summary-icon.purple {
    background: #f2eaf2;
    color: #714B67;
}

.summary-icon.blue {
    background: #eaf2ff;
    color: #3b82f6;
}

.summary-icon.green {
    background: #e8f7ef;
    color: #198754;
}

.summary-icon.orange {
    background: #fff3e6;
    color: #fd7e14;
}

.summary-label {
    font-size: 13px;
    color: #7b8490;
    margin-bottom: 5px;
}

.summary-value {
    font-size: 23px;
    font-weight: 600;
    line-height: 1.2;
}

.summary-value small {
    font-size: 12px;
    font-weight: 400;
    color: #7b8490;
}

.report-card {
    border: 1px solid #edf0f3;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.035);
}

.chart-container {
    height: 320px;
    position: relative;
}

.chart-loading,
.empty-chart {
    height: 320px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #9299a2;
}

.percentage-progress {
    width: 80px;
    height: 7px;
    background: #edf0f3;
}

.percentage-progress .progress-bar {
    background: #714B67;
    border-radius: 10px;
}

.table th {
    font-size: 13px;
    font-weight: 600;
    color: #667085;
    white-space: nowrap;
}

.table td {
    font-size: 14px;
}

.form-label {
    font-size: 13px;
    font-weight: 500;
    color: #555d68;
}

@media (max-width: 576px) {
    .summary-card {
        padding: 14px 10px;
        gap: 9px;
    }

    .summary-icon {
        width: 38px;
        min-width: 38px;
        height: 38px;
        font-size: 18px;
    }

    .summary-value {
        font-size: 19px;
    }

    .chart-container {
        height: 280px;
    }
}
</style>
