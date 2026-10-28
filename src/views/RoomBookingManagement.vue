<template>
  <div class="container-fluid py-4">
    <!-- Header -->
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div>
        <h4 class="fw-bold mb-1">Room Booking Management</h4>
        <p class="text-muted mb-0">
          Manage and view room booking records
        </p>
      </div>

      <button class="btn btn-primary" :disabled="loading" @click="loadBookings">
        <i class="bi bi-arrow-clockwise me-1"></i>
        {{ loading ? 'Loading...' : 'Refresh' }}
      </button>
    </div>

    <!-- Summary cards -->
    <div class="row g-3 mb-4">
      <!-- <div class="col-12 col-sm-12 col-lg-3">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <div class="text-muted small">ລວມການຈອງ</div>
            <h3 class="fw-bold mb-0">{{ bookings.length }}</h3>
          </div>
        </div>
      </div> -->

      <div class="col-12 col-sm-12 col-lg-3">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <div class="text-muted small">ລໍຖ້າການອະນຸມັດ</div>
            <h3 class="fw-bold mb-0">{{ waitingCount }}</h3>
          </div>
        </div>
      </div>

      <div class="col-12 col-sm-12 col-lg-3">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <div class="text-muted small">ອະນຸມັດແລ້ວ</div>
            <h3 class="fw-bold mb-0">{{ approvedCount }}</h3>
          </div>
        </div>
      </div>
      <div class="col-12 col-sm-12 col-lg-3">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <div class="text-muted small">ໃຊ້ງານ</div>
            <h3 class="fw-bold mb-0">{{ usingCount }}</h3>
          </div>
        </div>
      </div>

      <div class="col-12 col-sm-12 col-lg-3">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <div class="text-muted small">ສຳເລັດ</div>
            <h3 class="fw-bold mb-0">{{ doneCount }}</h3>
          </div>
        </div>
      </div>
    </div>

    <!-- Alerts -->
    <div v-if="errorMessage" class="alert alert-danger" role="alert">
      {{ errorMessage }}
    </div>

    <div v-if="successMessage" class="alert alert-success" role="alert">
      {{ successMessage }}
    </div>

    <!-- Booking table -->
    <div class="card border-0 shadow-sm">
      <div class="card-body">
        <!-- Search and filter -->
        <div class="row g-3 mb-3">
          <div class="col-12 col-md-7">
            <input v-model="searchText" type="search" class="form-control"
              placeholder="Search booking, room, requester..." />
          </div>

          <div class="col-12 col-md-5">
            <select v-model="stateFilter" class="form-select">
              <option value="all">All statuses</option>
              <option value="draft">Draft</option>
              <option value="confirmed">
                Confirmed
              </option>
              <option value="using">Using</option>
              <option value="done">Done</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="text-muted mt-2 mb-0">
            Loading room bookings...
          </p>
        </div>

        <!-- Table -->
        <div v-else class="table-responsive">
          <table class="table table-hover align-middle">
            <thead class="table-light">
              <tr>
                <th>Booking No.</th>
                <th>Booking</th>
                <th>Room</th>
                <th>Start</th>
                <th>Stop</th>
                <th>Requester</th>
                <th style="width: fit-content;">Participants</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="booking in paginatedBookings" :key="booking.id"
                class="booking-row fw-lighter fst-italic text-nowrap" style="font-size: 12px;"
                @click="viewBookingDetail(booking)">
                <td class="fw-bolder">
                  {{ booking.booking_number || `#${booking.id}` }}
                </td>

                <td>{{ booking.name || '-' }}</td>
                <td>{{ booking.booking_name || '-' }}</td>
                <td>{{ formatDate(booking.start) }}</td>
                <td>{{ formatDate(booking.stop) }}</td>

                <td>
                  {{
                    booking.create_for_uid ||
                    booking.rider_name ||
                    '-'
                  }}
                </td>

                <td>
                  {{ booking.number_of_participants ?? '-' }}
                </td>

                <td>
                  <span class="badge" :class="statusClass(booking.room_state)">
                    {{ formatStatus(booking.room_state) }}
                  </span>
                </td>
              </tr>

              <tr v-if="filteredBookings.length === 0">
                <td colspan="8" class="text-center text-muted py-5">
                  {{
                    searchText || stateFilter !== 'all'
                      ? 'No matching bookings found.'
                      : 'No room bookings found.'
                  }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="!loading && filteredBookings.length > 0"
          class="d-flex flex-column flex-lg-row justify-content-between align-items-center gap-3 mt-3">
          <!-- Record information -->
          <div class="text-muted small text-center text-lg-start">
            Showing
            <strong>{{ startRecord }}</strong>
            to
            <strong>{{ endRecord }}</strong>
            of
            <strong>{{ filteredBookings.length }}</strong>
            bookings
          </div>

          <!-- Page size -->
          <div class="d-flex align-items-center gap-2">
            <label for="pageSize" class="text-nowrap small">
              Rows per page:
            </label>

            <select id="pageSize" v-model.number="pageSize" class="form-select form-select-sm" style="width: 85px">
              <option :value="10">10</option>
              <option :value="25">25</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
            </select>
          </div>

          <!-- Page navigator -->
          <nav aria-label="Room booking pagination">
            <ul class="pagination pagination-sm flex-wrap justify-content-center mb-0">
              <!-- First -->
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button type="button" class="page-link" :disabled="currentPage === 1" aria-label="First page"
                  @click="goToPage(1)">
                  <i class="bi bi-chevron-double-left"></i>
                </button>
              </li>

              <!-- Previous -->
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button type="button" class="page-link" :disabled="currentPage === 1" aria-label="Previous page"
                  @click="goToPage(currentPage - 1)">
                  <i class="bi bi-chevron-left"></i>
                </button>
              </li>

              <!-- Page numbers -->
              <li v-for="page in visiblePages" :key="page" class="page-item" :class="{ active: currentPage === page }">
                <button type="button" class="page-link" :aria-current="currentPage === page ? 'page' : undefined
                  " @click="goToPage(page)">
                  {{ page }}
                </button>
              </li>

              <!-- Next -->
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <button type="button" class="page-link" :disabled="currentPage === totalPages" aria-label="Next page"
                  @click="goToPage(currentPage + 1)">
                  <i class="bi bi-chevron-right"></i>
                </button>
              </li>

              <!-- Last -->
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <button type="button" class="page-link" :disabled="currentPage === totalPages" aria-label="Last page"
                  @click="goToPage(totalPages)">
                  <i class="bi bi-chevron-double-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>

        <!-- Empty result count -->
        <div v-if="!loading && filteredBookings.length === 0" class="text-muted small mt-2">
          Showing 0 of {{ bookings.length }} bookings
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { getRoomBookingManagement } from '../api/axios'
import { useRouter } from 'vue-router'
const router = useRouter()

const viewBookingDetail = (booking) => {
  router.push({
    name: 'RoomBookingDetail',
    params: {
      id: booking.id,
    },
  })
}

const formatDate = (value) => {
  if (!value) return '-'

  const date = new Date(
    String(value).replace(' ', 'T')
  )

  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}

const statusLabel = (state) => {
    const labels = {
        draft: 'ລໍຖ້າອະນຸມັດ',
        confirmed: 'ອະນຸມັດແລ້ວ',
        using: 'ກຳລັງໃຊ້ງານ',
        done: 'ສຳເລັດແລ້ວ',
        cancelled: 'ຍົກເລີກແລ້ວ',
    }

    return labels[state] || state || 'ບໍ່ຮູ້ສະຖານະ'
}

// const statusClass = (state) => {
//     const classes = {
//         draft: 'bg-warning-subtle text-warning-emphasis',
//         confirmed: 'bg-success-subtle text-success',
//         using: 'bg-primary-subtle text-primary',
//         done: 'bg-info-subtle text-info-emphasis',
//         cancelled: 'bg-danger-subtle text-danger',
//     }

//     return classes[state] || 'bg-secondary-subtle text-secondary'
// }

const bookings = ref([])
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const searchText = ref('')
const stateFilter = ref('all')

// Pagination settings
const currentPage = ref(1)
const pageSize = ref(10)

// Summary counts
const waitingCount = computed(() =>
  bookings.value.filter(
    (booking) => booking.room_state === 'draft',
  ).length,
)

const approvedCount = computed(() =>
  bookings.value.filter(
    (booking) => booking.room_state === 'confirmed',
  ).length,
)
const usingCount = computed(() =>
  bookings.value.filter(
    (booking) => booking.room_state === 'using',
  ).length,
)

const doneCount = computed(() =>
  bookings.value.filter(
    (booking) => booking.room_state === 'done',
  ).length,
)

// Search and status filtering
const filteredBookings = computed(() => {
  const query = searchText.value.toLowerCase().trim()

  return bookings.value.filter((booking) => {
    const matchesSearch =
      !query ||
      [
        booking.name,
        booking.booking_number,
        booking.booking_name,
        booking.create_for_uid,
        booking.rider_name,
      ].some((value) =>
        String(value || '').toLowerCase().includes(query),
      )

    const matchesState =
      stateFilter.value === 'all' ||
      booking.room_state === stateFilter.value

    return matchesSearch && matchesState
  })
})

// Total number of pages
const totalPages = computed(() =>
  Math.max(
    1,
    Math.ceil(filteredBookings.value.length / pageSize.value),
  ),
)

// Bookings on the current page
const paginatedBookings = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value

  return filteredBookings.value.slice(
    start,
    start + pageSize.value,
  )
})

// First and last visible record numbers
const startRecord = computed(() =>
  filteredBookings.value.length === 0
    ? 0
    : (currentPage.value - 1) * pageSize.value + 1,
)

const endRecord = computed(() =>
  Math.min(
    currentPage.value * pageSize.value,
    filteredBookings.value.length,
  ),
)

// Display at most five page numbers
const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value

  let start = Math.max(1, current - 2)
  let end = Math.min(total, start + 4)

  start = Math.max(1, end - 4)

  return Array.from(
    { length: end - start + 1 },
    (_, index) => start + index,
  )
})

// Navigate to a specific page
const goToPage = (page) => {
  currentPage.value = Math.min(
    Math.max(1, page),
    totalPages.value,
  )
}

// Reset to page one when filters or page size change
watch([searchText, stateFilter, pageSize], () => {
  currentPage.value = 1
})

// Keep the current page valid if records change
watch(filteredBookings, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value
  }
})

// Load bookings from the API
const loadBookings = async () => {
  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const result = await getRoomBookingManagement()

    console.log('Room booking management API result:', result)

    bookings.value = Array.isArray(result.data)
      ? result.data
      : []
  } catch (error) {
    console.error('Failed to load room bookings:', error)

    errorMessage.value =
      error.response?.data?.message ||
      error.message ||
      'Unable to load room bookings'
  } finally {
    loading.value = false
  }
}

// Date display
// const formatDate = (value) => {
//   if (!value) return '-'
//   return String(value)
// }

// Status labels
const formatStatus = (status) => {
  const labels = {
    draft: 'ລໍຖ້າການອະນຸມັດ',
    using: 'ກຳລັງໃຊ້ງານ',
    confirmed: 'ອະນຸມັດແລ້ວ',
    done: 'ສຳເລັດ',
    cancelled: 'ຍົກເລີກ',
  }

  return labels[status] || status || 'Unknown'
}

// Status badge colors
const statusClass = (status) => {
  const classes = { 
    draft: 'text-bg-warning',
    confirmed: 'text-bg-success',
    using: 'text-bg-info',
    done: 'text-bg-primary',
    cancelled: 'text-bg-danger',
  }

  return classes[status] || 'text-bg-secondary'
}

onMounted(loadBookings)
</script>
<style scoped>
.booking-row {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.booking-row:hover {
  background-color: #f0f5ff;
}
</style>
