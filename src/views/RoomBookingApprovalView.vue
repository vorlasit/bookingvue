
<template>
  <div class="container-fluid py-4">
    <!-- Header -->
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div>
        <h4 class="mb-1">ອະນຸມັດການຈອງຫ້ອງ</h4>
        <p class="text-muted mb-0">
          ລາຍການຈອງຫ້ອງທີ່ລໍຖ້າອະນຸມັດ
        </p>
      </div>

      <button
        class="btn btn-outline-primary"
        :disabled="loading"
        @click="loadDraftBookings"
      >
        <span
          v-if="loading"
          class="spinner-border spinner-border-sm me-2"
        ></span>
        <i v-else class="bi bi-arrow-clockwise me-2"></i>
        ໂຫຼດຂໍ້ມູນໃໝ່
      </button>
    </div>

    <!-- Summary -->
    <div class="row g-3 mb-4">
      <div class="col-12 col-sm-6 col-lg-4">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body d-flex align-items-center gap-3">
            <div class="rounded-circle bg-warning-subtle text-warning p-3">
              <i class="bi bi-hourglass-split fs-4"></i>
            </div>
            <div>
              <div class="text-muted small">ລໍຖ້າອະນຸມັດ</div>
              <div class="fs-4">{{ draftBookings.length }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-if="errorMessage" class="alert alert-danger">
      {{ errorMessage }}
      <button
        class="btn btn-sm btn-outline-danger ms-2"
        @click="loadDraftBookings"
      >
        ລອງອີກຄັ້ງ
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading && bookings.length === 0" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
      <p class="text-muted mt-3">ກຳລັງໂຫຼດຂໍ້ມູນ...</p>
    </div>

    <!-- Empty -->
    <div
      v-else-if="!loading && !errorMessage && draftBookings.length === 0"
      class="card border-0 shadow-sm"
    >
      <div class="card-body text-center py-5">
        <i class="bi bi-check-circle text-success fs-1"></i>
        <h5 class="mt-3">ບໍ່ມີລາຍການລໍຖ້າອະນຸມັດ</h5>
        <p class="text-muted mb-0">
          ລາຍການຈອງຫ້ອງສະຖານະ Draft ຈະສະແດງຢູ່ບ່ອນນີ້.
        </p>
      </div>
    </div>

    <!-- Draft bookings -->
    <div v-else class="row g-3">
      <div
        v-for="booking in draftBookings"
        :key="booking.id"
        class="col-12 col-xl-6"
      >
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body p-3 p-md-4">
            <div class="d-flex justify-content-between align-items-start gap-3 mb-3">
              <div class="min-w-0">
                <h5 class="mb-1">
                  {{ booking.name || booking.booking_name || 'Room Booking' }}
                </h5>
                <div class="text-muted small">
                  ເລກທີຈອງ:
                  {{ booking.booking_number || `#${booking.id}` }}
                </div>
              </div>

              <span class="badge bg-warning-subtle text-warning-emphasis">
                ລໍຖ້າອະນຸມັດ
              </span>
            </div>

            <div class="booking-info">
              <div class="mb-2">
                <i class="bi bi-door-open me-2 text-muted"></i>
                <strong>ຫ້ອງ:</strong>
                {{ booking.booking_name || booking.room_name || '-' }}
              </div>

              <div class="mb-2">
                <i class="bi bi-person me-2 text-muted"></i>
                <strong>ຜູ້ຈອງ:</strong>
                {{ booking.create_uid }}
              </div> 

              <div class="mb-2">
                <i class="bi bi-calendar-event me-2 text-muted"></i>
                <strong>ເລີ່ມ:</strong>
                {{ formatBookingPeriod(booking.start, booking.stop) }}
              </div>
 

              <div v-if="booking.number_of_participant || booking.capacity" class="mb-2">
                <i class="bi bi-people me-2 text-muted"></i>
                <strong>ຈຳນວນຜູ້ເຂົ້າຮ່ວມ:</strong>
                {{ booking.number_of_participant || booking.capacity }}
              </div>

              <div v-if="booking.description" class="mt-3 p-3 bg-light rounded">
                <div class="small text-muted mb-1">ລາຍລະອຽດ</div>
                <div class="text-break">{{ booking.description }}</div>
              </div>
            </div>

            <div class="d-flex justify-content-end mt-4">
              <button
                class="btn btn-success"
                :disabled="approvingId === booking.id"
                @click="approveBooking(booking)"
              >
                <span
                  v-if="approvingId === booking.id"
                  class="spinner-border spinner-border-sm me-2"
                ></span>
                <i v-else class="bi bi-check-circle me-2"></i>
                {{ approvingId === booking.id ? 'ກຳລັງອະນຸມັດ...' : 'ອະນຸມັດ' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  getRoomBookingManagement,
  confirmRoomBooking,
  getGroups,
} from '../api/axios'
import Swal from 'sweetalert2'

const bookings = ref([])
const loading = ref(false)
const approvingId = ref(null)
const errorMessage = ref('')
const groupsIds = ref([])
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
    return `${startDate} : ${startTime} ຫາ ${stopTime}`
  }

  // Different dates: show both dates
  return `${startDate} ${startTime} - ${stopDate} ${stopTime}`
}
const isManager = computed(() => {
  const allowedGroups = [
    'base.group_system',
    'base.group_erp_manager',
    'booking.group_kc_book_manager',
  ]

  return groupsIds.value.some((group) => allowedGroups.includes(group))
})

const draftBookings = computed(() => {
  return bookings.value.filter((booking) => {
    const state = String(booking.room_state || '').toLowerCase()
    return state === 'draft'
  })
})

const unwrap = (response) => {
  let result = response?.data ?? response

  if (result?.result) {
    result = result.result
  }

  if (result?.status === false) {
    throw new Error(result.message || 'ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້.')
  }

  return result
}

const extractRecords = (response) => {
  const result = unwrap(response)

  if (Array.isArray(result)) return result
  if (Array.isArray(result?.data)) return result.data
  if (Array.isArray(result?.bookings)) return result.bookings
  if (Array.isArray(result?.events)) return result.events

  return []
}

const loadGroups = async () => {
  try {
    const response = await getGroups()
    const result = unwrap(response)

    const groups = result?.groups_id ?? result?.data?.groups_id ?? []

    groupsIds.value = Array.isArray(groups)
      ? groups.map((group) =>
          typeof group === 'string' ? group : group?.xml_id || group?.name || ''
        )
      : []
  } catch (error) {
    console.error('Unable to load user groups:', error)
    groupsIds.value = []
  }
}

const loadDraftBookings = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await getRoomBookingManagement()
    const records = extractRecords(response)

    bookings.value = records.filter((booking) => {
      const state = String(booking.room_state || '').toLowerCase()
      return state === 'draft'
    })
  } catch (error) {
    console.error(
      'Load draft room bookings error:',
      error?.response?.data || error
    )
    bookings.value = []
    errorMessage.value =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error.message ||
      'ບໍ່ສາມາດໂຫຼດລາຍການຈອງຫ້ອງໄດ້.'
  } finally {
    loading.value = false
  }
}

const approveBooking = async (booking) => {
  if (!isManager.value) {
    await Swal.fire({
      icon: 'error',
      title: 'ບໍ່ມີສິດ',
      text: 'ທ່ານບໍ່ມີສິດອະນຸມັດການຈອງຫ້ອງ.',
      confirmButtonText: 'ຕົກລົງ',
    })
    return
  }

  if (!booking?.id || approvingId.value) return

  const bookingName =
    booking.name || booking.booking_name || `#${booking.id}`

  const confirmation = await Swal.fire({
    icon: 'question',
    title: 'ຢືນຢັນການອະນຸມັດ',
    html: `ທ່ານຕ້ອງການອະນຸມັດການຈອງຫ້ອງ <strong>${bookingName}</strong> ຫຼືບໍ່?`,
    showCancelButton: true,
    confirmButtonText: 'ອະນຸມັດ',
    cancelButtonText: 'ຍົກເລີກ',
    confirmButtonColor: '#198754',
    cancelButtonColor: '#6c757d',
    reverseButtons: true,
  })

  if (!confirmation.isConfirmed) return

  approvingId.value = booking.id
  errorMessage.value = ''

  try {
    const response = await confirmRoomBooking(booking.id)
    const result = unwrap(response)

    if (result?.status === false) {
      throw new Error(result.message || 'ອະນຸມັດບໍ່ສຳເລັດ.')
    }

    await Swal.fire({
      icon: 'success',
      title: 'ອະນຸມັດສຳເລັດ',
      text: 'ການຈອງຫ້ອງໄດ້ຮັບການອະນຸມັດແລ້ວ.',
      confirmButtonText: 'ຕົກລົງ',
      confirmButtonColor: '#198754',
      timer: 2000,
      timerProgressBar: true,
    })

    await loadDraftBookings()
  } catch (error) {
    console.error(
      'Approve room booking error:',
      error?.response?.data || error
    )

    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error.message ||
      'ອະນຸມັດການຈອງຫ້ອງບໍ່ສຳເລັດ.'

    errorMessage.value = message

    await Swal.fire({
      icon: 'error',
      title: 'ອະນຸມັດບໍ່ສຳເລັດ',
      text: message,
      confirmButtonText: 'ຕົກລົງ',
      confirmButtonColor: '#dc3545',
    })
  } finally {
    approvingId.value = null
  }
}

const formatDate = (value) => {
  if (!value) return '-'

  const date = new Date(String(value).replace(' ', 'T'))
  if (Number.isNaN(date.getTime())) return value

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

onMounted(async () => {
  await loadGroups()
  await loadDraftBookings()
})
</script>

<style scoped>
.booking-info {
  font-size: 0.95rem;
  line-height: 1.6;
}

.min-w-0 {
  min-width: 0;
}

.card {
  border-radius: 12px;
}

.badge {
  white-space: nowrap;
  font-weight: 400;
}
</style>
