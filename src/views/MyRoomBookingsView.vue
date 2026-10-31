<template>
    <div class="container-fluid py-4 my-room-bookings">
        <!-- Page Header -->
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <div>
                <h4 class="fw-bold mb-1">
                    <i class="bi bi-calendar-check me-2"></i>
                    ການຈອງຫ້ອງຂອງຂ້ອຍ
                </h4>

                <p class="text-muted mb-0">
                    ກວດເບິ່ງລາຍການຈອງຫ້ອງ ແລະ ສະຖານະການອະນຸມັດຂອງທ່ານ
                </p>
            </div>

            <button class="btn btn-outline-primary" :disabled="loading" @click="loadMyBookings">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>

                <i v-else class="bi bi-arrow-clockwise me-2"></i>

                ໂຫຼດຂໍ້ມູນໃໝ່
            </button>
        </div>

        <!-- Summary Cards -->
        <div class="row g-3 mb-4">
            <div class="col-12 col-sm-6 col-lg-3">
                <div class="summary-card">
                    <div class="summary-icon bg-warning-subtle text-warning-emphasis">
                        <i class="bi bi-hourglass-split"></i>
                    </div>

                    <div>
                        <div class="summary-label">ລໍຖ້າອະນຸມັດ</div>
                        <div class="summary-number">{{ draftCount }}</div>
                    </div>
                </div>
            </div>

            <div class="col-12 col-sm-6 col-lg-3">
                <div class="summary-card">
                    <div class="summary-icon bg-success-subtle text-success">
                        <i class="bi bi-check-circle"></i>
                    </div>

                    <div>
                        <div class="summary-label">ອະນຸມັດແລ້ວ</div>
                        <div class="summary-number">{{ confirmedCount }}</div>
                    </div>
                </div>
            </div>

            <div class="col-12 col-sm-6 col-lg-3">
                <div class="summary-card">
                    <div class="summary-icon bg-primary-subtle text-primary">
                        <i class="bi bi-calendar-week"></i>
                    </div>

                    <div>
                        <div class="summary-label">ກຳລັງໃຊ້</div>
                        <div class="summary-number">{{ usingCount }}</div>
                    </div>
                </div>
            </div>
            <div class="col-12 col-sm-6 col-lg-3">
                <div class="summary-card">
                    <div class="summary-icon bg-primary-subtle text-primary">
                        <i class="bi bi-calendar-week"></i>
                    </div>

                    <div>
                        <div class="summary-label">ຍົກເລີກ</div>
                        <div class="summary-number">{{ cancelledCount }}</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Search and Filters -->
        <div class="card border-0 shadow-sm mb-4">
            <div class="card-body p-3">
                <div class="row g-3 align-items-center">
                    <div class="col-12 col-lg-6">
                        <div class="input-group">
                            <span class="input-group-text bg-white">
                                <i class="bi bi-search"></i>
                            </span>

                            <input v-model="searchText" type="search" class="form-control"
                                placeholder="ຄົ້ນຫາຊື່ການຈອງ, ເລກທີຈອງ ຫຼື ຊື່ຫ້ອງ..." />
                        </div>
                    </div>

                    <div class="col-12 col-lg-6">
                        <div class="d-flex flex-wrap gap-2 justify-content-lg-end">
                            <button type="button" class="btn" :class="activeFilter === 'all'
                                ? 'btn-primary'
                                : 'btn-outline-secondary'" @click="setFilter('all')">
                                ທັງໝົດ
                                <span class="ms-1">{{ bookings.length }}</span>
                            </button>

                            <button type="button" class="btn" :class="activeFilter === 'draft'
                                ? 'btn-warning'
                                : 'btn-outline-warning'" @click="setFilter('draft')">
                                ລໍຖ້າອະນຸມັດ
                                <span class="ms-1">{{ draftCount }}</span>
                            </button>

                            <button type="button" class="btn" :class="activeFilter === 'confirmed'
                                ? 'btn-success'
                                : 'btn-outline-success'" @click="setFilter('confirmed')">
                                ອະນຸມັດແລ້ວ
                                <span class="ms-1">{{ confirmedCount }}</span>
                            </button>
                            <button type="button" class="btn" :class="activeFilter === 'using'
                                ? 'btn-info'
                                : 'btn-outline-info'" @click="setFilter('using')">
                                ກຳລັງໃຊ້
                                <span class="ms-1">{{ usingCount }}</span>
                            </button>
                            <button type="button" class="btn" :class="activeFilter === 'cancelled'
                                ? 'btn-danger'
                                : 'btn-outline-danger'" @click="setFilter('cancelled')">
                                ຍົກເລີກ
                                <span class="ms-1">{{ cancelledCount }}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Error -->
        <div v-if="errorMessage" class="alert alert-danger d-flex align-items-start gap-2" role="alert">
            <i class="bi bi-exclamation-triangle-fill mt-1"></i>

            <div class="flex-grow-1">
                <div class="fw-semibold">ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້</div>
                <div>{{ errorMessage }}</div>

                <button class="btn btn-sm btn-outline-danger mt-2" @click="loadMyBookings">
                    ລອງອີກຄັ້ງ
                </button>
            </div>
        </div>

        <!-- Loading -->
        <div v-else-if="loading && bookings.length === 0" class="card border-0 shadow-sm">
            <div class="card-body text-center py-5">
                <div class="spinner-border text-primary" role="status"></div>

                <p class="text-muted mt-3 mb-0">
                    ກຳລັງໂຫຼດລາຍການຈອງຫ້ອງ...
                </p>
            </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredBookings.length === 0" class="card border-0 shadow-sm">
            <div class="card-body text-center py-5">
                <div class="empty-icon mb-3">
                    <i class="bi bi-calendar-x"></i>
                </div>

                <h5 class="fw-semibold">
                    {{ emptyTitle }}
                </h5>

                <p class="text-muted mb-0">
                    {{ emptyMessage }}
                </p>
            </div>
        </div>

        <!-- Booking Cards -->
        <div v-else class="row g-3">
            <div v-for="booking in filteredBookings" :key="booking.id" class="col-12 col-xl-6">
                <div class="card booking-card border-0 shadow-sm h-100" role="button" tabindex="0"
                    @click="openRoomBookingDetail(booking)" @keydown.enter="openRoomBookingDetail(booking)"
                    @keydown.space.prevent="openRoomBookingDetail(booking)">
                    <!-- Card Header -->

                    <div class="card-header bg-white border-bottom-0 pt-3 px-3 px-md-4">
                        <div class="d-flex justify-content-between align-items-start gap-3">
                            <div class="flex-grow-1 min-w-0">
                                <h5 class="booking-title mb-1">
                                    {{ booking.name || 'Room Booking' }}
                                </h5>

                                <div class="text-muted small">
                                    ເລກທີຈອງ:
                                    {{ booking.booking_number || `#${booking.id}` }}
                                </div>
                            </div>

                            <div class="d-flex align-items-center gap-2 flex-shrink-0">
                                <span class="badge" :class="statusClass(getStatus(booking))">
                                    {{ statusLabel(getStatus(booking)) }}
                                </span>

                                <i class="bi bi-chevron-right text-muted"></i>
                            </div>
                        </div>
                    </div>


                    <!-- Card Body -->
                    <div class="card-body px-3 px-md-4">
                        <div class="booking-info">
                            <div class="info-icon">
                                <i class="bi bi-door-open"></i>
                            </div>

                            <div class="info-content">
                                <div class="info-label">ຫ້ອງປະຊຸມ</div>

                                <div class="info-value">
                                    {{ booking.booking_name || booking.room_name || '-' }}
                                </div>
                            </div>
                        </div>

                        <div class="booking-info">
                            <div class="info-icon">
                                <i class="bi bi-calendar-event"></i>
                            </div>

                            <div class="info-content">
                                <div class="info-label">ເລີ່ມ</div>

                                <div class="info-value">
                                    {{ formatBookingPeriod(booking.start, booking.stop) }}
                                </div>
                            </div>
                        </div>
 
                        <div class="booking-info">
                            <div class="info-icon">
                                <i class="bi bi-people"></i>
                            </div>

                            <div class="info-content">
                                <div class="info-label">ຈຳນວນຜູ້ເຂົ້າຮ່ວມ</div>

                                <div class="info-value">
                                    {{ booking.number_of_participants
                                        ?? booking.number_of_participant
                                        ?? booking.capacity
                                        ?? '-' }}
                                    <span v-if="
                                        booking.number_of_participants != null ||
                                        booking.number_of_participant != null ||
                                        booking.capacity != null
                                    ">
                                        ຄົນ
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div v-if="booking.description" class="description-box mt-3">
                            <div class="info-label mb-1">ລາຍລະອຽດ</div>
                            <div class="description-text">
                                {{ booking.description }}
                            </div>
                        </div>
                    </div>

                    <!-- Card Footer -->
                    <div class="card-footer bg-white border-top px-3 px-md-4 py-3">
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="text-muted small">
                                <i class="bi bi-clock me-1"></i>
                                {{ durationText(booking) }}
                            </span>

                            <span class="small fw-semibold" :class="getStatus(booking) === 'confirmed'
                                ? 'text-success'
                                : 'text-warning-emphasis'">
                                {{ statusLabel(getStatus(booking)) }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Results Footer -->
        <div v-if="filteredBookings.length > 0" class="text-muted small text-end mt-3">
            ສະແດງ {{ filteredBookings.length }} ລາຍການ
        </div>
    </div>
</template>


<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getMyRoomBookings } from '../api/axios'

const router = useRouter()

const bookings = ref([])
const loading = ref(false)
const errorMessage = ref('')
const searchText = ref('')
const activeFilter = ref('all')

/* =========================================
   Navigation
========================================= */

const openRoomBookingDetail = (booking) => {
    const id = Number(booking?.id)

    if (!Number.isInteger(id) || id <= 0) {
        console.error('Missing or invalid room booking ID:', booking)
        errorMessage.value = 'ບໍ່ພົບເລກທີການຈອງຫ້ອງ.'
        return
    }

    router.push({
        name: 'RoomBookingDetail',
        params: { id },
    }).catch((error) => {
        console.error('Unable to open room booking detail:', error)
    })
}

const formatDisplayDate = (value) => {
  if (!value) return '-'

  const str = String(value).trim()

  // Match Odoo datetime: YYYY-MM-DD HH:mm:ss
  const match = str.match(
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/
  )

  if (match) {
    const [, year, month, day, hour, minute, second = '0'] = match

    // Odoo stores datetime values in UTC.
    // Convert UTC to Laos time (UTC+7).
    const utcDate = new Date(Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second)
    ))

    utcDate.setUTCHours(utcDate.getUTCHours() + 7)

    return (
      `${String(utcDate.getUTCDate()).padStart(2, '0')}/` +
      `${String(utcDate.getUTCMonth() + 1).padStart(2, '0')}/` +
      `${utcDate.getUTCFullYear()} ` +
      `${String(utcDate.getUTCHours()).padStart(2, '0')}:` +
      `${String(utcDate.getUTCMinutes()).padStart(2, '0')}`
    )
  }

  return str
} 
const formatBookingPeriod = (start, stop) => {
  if (!start || !stop) return '-'

  const startText = formatDisplayDate(start)
  const stopText = formatDisplayDate(stop)

  // formatDisplayDate returns DD/MM/YYYY HH:mm
  const [startDate, startTime] = startText.split(' ')
  const [stopDate, stopTime] = stopText.split(' ')

  if (!startDate || !startTime || !stopDate || !stopTime) {
    return `${startText} - ${stopText}`
  }

  // Same date: show date once
  if (startDate === stopDate) {
    return `${startDate} : ${startTime} - ${stopTime}`
  }

  // Different dates: show both dates
  return `${startDate} ${startTime} - ${stopDate} ${stopTime}`
}
/* =========================================
   Response helpers
   Supports a direct booking list or room list
========================================= */

const unwrapResponse = (response) => {
    let result = response?.data ?? response

    // Support Odoo JSON-RPC-style responses.
    if (result?.result) {
        result = result.result
    }

    if (result?.status === false) {
        throw new Error(
            result.message || 'ບໍ່ສາມາດໂຫຼດລາຍການຈອງໄດ້.'
        )
    }

    return result
}

const getBookingRecords = (response) => {
    const result = unwrapResponse(response)

    // Dedicated API: { status: true, data: [...] }
    if (Array.isArray(result)) {
        return result
    }

    if (Array.isArray(result?.data)) {
        return result.data
    }

    if (Array.isArray(result?.bookings)) {
        return result.bookings
    }

    // Older room-type API: { data: [{ list_booking: [...] }] }
    if (Array.isArray(result?.rooms)) {
        return result.rooms.flatMap((room) => {
            const records =
                room?.list_booking ??
                room?.bookings ??
                room?.data ??
                []

            if (!Array.isArray(records)) {
                return []
            }

            return records.map((booking) => ({
                ...booking,
                booking_name:
                    booking.booking_name ||
                    booking.room_name ||
                    room.name ||
                    '',
                booking_id:
                    booking.booking_id ||
                    room.id,
            }))
        })
    }

    return []
}

/* =========================================
   Status helpers

   confirmed_state = approval status
   room_state = room usage status
========================================= */

const getStatus = (booking) => {
    const state = String(
        booking?.state ??
        booking?.room_state ??
        ''
    ).toLowerCase()

    if (['draft'].includes(state)) {
        return 'draft'
    }

    if (['approved'].includes(state)) {
        return 'confirmed'
    }

    return state
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

const statusClass = (state) => {
    const classes = {
        draft: 'bg-warning-subtle text-warning-emphasis',
        confirmed: 'bg-success-subtle text-success',
        using: 'bg-primary-subtle text-primary',
        done: 'bg-info-subtle text-info-emphasis',
        cancelled: 'bg-danger-subtle text-danger',
    }

    return classes[state] || 'bg-secondary-subtle text-secondary'
}

/* =========================================
   Load My Room Bookings
   Backend should filter records by logged-in user.
========================================= */

const loadMyBookings = async () => {
    loading.value = true
    errorMessage.value = ''

    try {
        const response = await getMyRoomBookings()

        console.log('My room bookings response:', response)

        // Handle the API response returned by getMyRoomBookings().
        if (response?.status === false) {
            throw new Error(
                response.message || 'Unable to load room bookings.'
            )
        }

        // Support { status: true, data: [...] }
        // and { bookings: [...] } response formats.
        let records = []

        if (Array.isArray(response)) {
            records = response
        } else if (Array.isArray(response?.data)) {
            records = response.data
        } else if (Array.isArray(response?.bookings)) {
            records = response.bookings
        }

        bookings.value = records
            .filter(booking => booking && booking.id)
            .map(booking => ({
                ...booking,
                booking_name:
                    booking.booking_name ||
                    booking.room_name ||
                    '',
            }))

        console.log('My room bookings loaded:', {
            displayed: bookings.value.length,
            bookings: bookings.value,
        })
    } catch (error) {

        bookings.value = []

        errorMessage.value =
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            'ບໍ່ສາມາດໂຫຼດລາຍການຈອງຫ້ອງໄດ້.'
    } finally {
        loading.value = false
    }
}

/* =========================================
   Search and Filter
========================================= */

const setFilter = (filter) => {
    activeFilter.value = filter
}

const filteredBookings = computed(() => {
    const query = searchText.value.trim().toLowerCase()

    return bookings.value.filter((booking) => {
        const state = getStatus(booking)

        const matchesFilter =
            activeFilter.value === 'all' ||
            state === activeFilter.value

        const searchableValues = [
            booking.name,
            booking.booking_number,
            booking.booking_name,
            booking.room_name,
            booking.description,
        ]

        const matchesSearch =
            !query ||
            searchableValues.some((value) =>
                String(value || '').toLowerCase().includes(query)
            )

        return matchesFilter && matchesSearch
    })
})

const draftCount = computed(() =>
    bookings.value.filter(
        (booking) => getStatus(booking) === 'draft'
    ).length
)

const confirmedCount = computed(() =>
    bookings.value.filter(
        (booking) => getStatus(booking) === 'confirmed'
    ).length
)
const usingCount = computed(() =>
    bookings.value.filter(
        (booking) => getStatus(booking) === 'using'
    ).length
)
const cancelledCount = computed(() =>
    bookings.value.filter(
        (booking) => getStatus(booking) === 'cancelled'
    ).length
)

const emptyTitle = computed(() => {
    if (searchText.value.trim()) {
        return 'ບໍ່ພົບຂໍ້ມູນ'
    }

    if (activeFilter.value === 'draft') {
        return 'ບໍ່ມີລາຍການລໍຖ້າອະນຸມັດ'
    }

    if (activeFilter.value === 'confirmed') {
        return 'ບໍ່ມີລາຍການທີ່ອະນຸມັດແລ້ວ'
    }

    return 'ທ່ານຍັງບໍ່ມີລາຍການຈອງຫ້ອງ'
})

const emptyMessage = computed(() => {
    if (searchText.value.trim()) {
        return 'ລອງປ່ຽນຄຳຄົ້ນຫາ ຫຼື ເລືອກສະຖານະອື່ນ.'
    }

    return 'ລາຍການຈອງຫ້ອງຂອງທ່ານຈະສະແດງຢູ່ບ່ອນນີ້.'
})

/* =========================================
   Date and Duration
========================================= */

const parseDate = (value) => {
    if (!value) {
        return null
    }

    // Odoo datetime strings are commonly "YYYY-MM-DD HH:mm:ss".
    // Interpret them as local time to avoid an unintended UTC shift.
    const normalized = String(value).replace(' ', 'T')
    const date = new Date(normalized)

    return Number.isNaN(date.getTime()) ? null : date
}

const formatDate = (value) => {
    const date = parseDate(value)

    if (!date) {
        return value || '-'
    }

    return new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Vientiane',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).format(date)
}

const durationText = (booking) => {
    const start = parseDate(booking.start)
    const stop = parseDate(booking.stop)

    if (!start || !stop || stop <= start) {
        return 'ບໍ່ມີຂໍ້ມູນໄລຍະເວລາ'
    }

    const totalMinutes = Math.round((stop - start) / 60000)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    if (hours && minutes) {
        return `${hours} ຊົ່ວໂມງ ${minutes} ນາທີ`
    }

    if (hours) {
        return `${hours} ຊົ່ວໂມງ`
    }

    return `${minutes} ນາທີ`
}

onMounted(() => {
    loadMyBookings()
})
</script>


<style scoped>
.my-room-bookings {
    min-height: 70vh;
    font-family: "Noto Sans Lao", sans-serif;
}

.summary-card {
    display: flex;
    align-items: center;
    gap: 16px;
    min-height: 112px;
    padding: 20px;
    background: #fff;
    border: 1px solid #edf0f4;
    border-radius: 14px;
    box-shadow: 0 2px 8px rgb(0 0 0 / 3%);
}

.summary-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 52px;
    height: 52px;
    border-radius: 13px;
    font-size: 1.45rem;
}

.summary-label {
    color: #6c757d;
    font-size: 0.9rem;
}

.summary-number {
    margin-top: 3px;
    font-size: 1.65rem;
    font-weight: 700;
    line-height: 1.3;
}

.booking-card {
    cursor: pointer;
}

.booking-card:focus-visible {
    outline: 3px solid #0d6efd;
    outline-offset: 3px;
}

.booking-card:active {
    transform: scale(0.995);
}

.booking-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgb(0 0 0 / 7%) !important;
}

.booking-title {
    overflow-wrap: anywhere;
    font-size: 1.05rem;
    font-weight: 600;
}

.booking-info {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 18px;
}

.booking-info:last-child {
    margin-bottom: 0;
}

.info-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 38px;
    height: 38px;
    color: #0d6efd;
    background: #eef5ff;
    border-radius: 10px;
    font-size: 1.05rem;
}

.info-content {
    flex: 1;
    min-width: 0;
}

.info-label {
    color: #6c757d;
    font-size: 0.8rem;
    margin-bottom: 3px;
}

.info-value {
    color: #212529;
    font-size: 0.93rem;
    font-weight: 500;
    overflow-wrap: anywhere;
}

.description-box {
    padding: 12px;
    background: #f8f9fa;
    border-radius: 10px;
}

.description-text {
    font-size: 0.9rem;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
}

.empty-icon {
    color: #adb5bd;
    font-size: 3rem;
}

.min-w-0 {
    min-width: 0;
}

@media (max-width: 575.98px) {
    .my-room-bookings {
        padding-top: 16px !important;
    }

    .summary-card {
        min-height: 92px;
        padding: 14px;
    }

    .summary-icon {
        width: 44px;
        height: 44px;
        font-size: 1.2rem;
    }

    .summary-number {
        font-size: 1.4rem;
    }

    .booking-title {
        font-size: 0.98rem;
    }
}
</style>