
<template>
  <div class="container-fluid py-4">
    <div class="card border-0 shadow-sm">
      <div class="card-body p-3 p-md-4">

        <!-- Loading -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="text-muted mt-3 mb-0">Loading room types...</p>
        </div>

        <!-- Error -->
        <div v-else-if="errorMessage" class="text-center py-5">
          <i class="bi bi-exclamation-circle text-danger fs-1"></i>
          <p class="text-danger mt-3">{{ errorMessage }}</p>
          <button class="btn btn-outline-primary" @click="fetchRoomTypes">
            <i class="bi bi-arrow-clockwise me-2"></i>Try Again
          </button>
        </div>

        <!-- Room Cards -->
        <div v-else-if="filteredRooms.length" class="row g-3">
          <div
            v-for="(room, index) in filteredRooms"
            :key="room.id"
            class="col-12 col-sm-6 col-xl-4 col-xxl-3"
          >
            <div class="card room-card h-100">
              <div class="card-body d-flex flex-column p-3 p-md-4">

                <div class="d-flex justify-content-between align-items-start gap-2 mb-3">
                  <div class="room-icon">
                    <i class="bi bi-door-closed"></i>
                  </div>
                  <span class="room-number">#{{ index + 1 }}</span>
                </div>

                <h6 class="fw-bold mb-3 room-name">
                  {{ room.name || 'Unnamed Room' }}
                </h6>

                <!-- Capacity -->
                <div class="capacity-panel">
                  <div class="d-flex justify-content-between align-items-center gap-2">
                    <div>
                      <div class="text-muted small mb-1">
                        <i class="bi bi-people me-1"></i>Room Capacity
                      </div>
                      <div class="capacity-value">
                        {{ room.capacity ?? 0 }}
                        <span class="capacity-unit">people</span>
                      </div>
                    </div>
                    <div class="capacity-icon-box">
                      <i class="bi bi-people-fill"></i>
                    </div>
                  </div>
                </div>

                <!-- Booking Events Header -->
                <div class="d-flex justify-content-between align-items-center mt-3 mb-2"> 

                  <div class="d-flex gap-1">
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-secondary"
                      title="Refresh bookings"
                      @click="fetchRoomBookings(room.id)"
                    >
                      <i class="bi bi-arrow-clockwise"></i>
                    </button>

                    <button
                      type="button"
                      class="btn btn-sm btn-primary"
                      @click="openCreatePopup(room)"
                    >
                      <i class="bi bi-plus-lg me-1"></i>Create
                    </button>
                    <button
                      type="button"
                      class="btn btn-sm btn-primary"
                      @click="openListPopup(room)" >
                      <i class="bi bi-list me-1"></i>List
                    </button>
                  </div>
                </div>

                <!-- Booking Events -->
                <div class="related-bookings">
                  <div v-if="bookingLoading[room.id]" class="text-center py-3">
                    <div class="spinner-border spinner-border-sm text-primary"></div>
                  </div>

                  <div v-else-if="bookingErrors[room.id]" class="small text-danger">
                    {{ bookingErrors[room.id] }}
                    <button
                      type="button"
                      class="btn btn-sm btn-link"
                      @click="fetchRoomBookings(room.id)"
                    >
                      Retry
                    </button>
                  </div>

                  <div
                        v-for="booking in roomBookings[room.id]"
                        :key="booking.id"
                        v-else-if="roomBookings[room.id]?.length"
                        class="d-flex flex-wrap align-items-center" style="font-size: small;font-size: small; cursor: pointer;"
                        @click="openListPopupId(room,booking)"
                        >
                        <div
                            class="booking-event-inline"
                            :style="{ color: booking.text_color || 'red' }"
                            :title="booking.description || booking.name"
                        >
                            <span
                            class="booking-color-dot"
                            :style="{ backgroundColor: booking.text_color || 'red' }"
                            ></span>

                            <span class="fw-semibold">
                            {{ booking.booking_number || booking.name || `#${booking.id}` }}
                            </span>

                            <span class="small">
                            {{ booking.start || '-' }}
                            </span>

                            <span class="small">
                            · {{ booking.create_for_uid || 'No' }}
                            </span>
                        </div>
                    </div> 

                  <div v-else class="text-muted small text-center py-3">
                    No bookings for this room.
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state text-center h-100">
          <div class="empty-icon mb-3">
            <i class="bi bi-inbox"></i>
          </div>
          <h6 class="fw-bold mb-2">
            {{ searchText ? 'No rooms found' : 'No room types yet' }}
          </h6>
          <p class="text-muted small mb-3">
            {{ searchText ? 'Try another room name.' : 'There are currently no rooms to display.' }}
          </p>
          <button
            v-if="searchText"
            class="btn btn-sm btn-outline-primary"
            @click="searchText = ''"
          >
            Clear Search
          </button>
          <button
            v-else
            class="btn btn-sm btn-outline-primary"
            @click="fetchRoomTypes"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>

    <!-- Create Booking Popup: outside the room loop -->
    <div
      v-if="showCreatePopup"
      class="booking-modal-overlay"
      @click.self="closeCreatePopup"
    >
      <div class="booking-modal">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 class="fw-bold mb-1">Create Booking</h5>
            <p class="text-muted small mb-0">
              Room: {{ selectedRoom?.name }}
            </p>
          </div>
          <button
            type="button"
            class="btn-close"
            aria-label="Close"
            @click="closeCreatePopup"
          ></button>
        </div>

        <form @submit.prevent="submitCreateBooking">
          <div class="mb-3 d-none">
            <label class="form-label">Booking ID</label>
            <input
              :value="createForm.booking_id"
              type="number"
              class="form-control"
              readonly
            />
          </div>

          <div class="mb-3 d-none" >
            <label class="form-label">Booking Title</label>
            <input
              v-model="createForm.name"
              type="text"
              class="form-control"
              placeholder="Enter booking title"
               
            />
          </div>

          <div class="row">
          <div class="mb-3 col-lg-6 col-sm-12">
            <label class="form-label">Start Date & Time</label>
            <input
              id="booking-start"
              type="text"
              class="form-control"
              placeholder="DD/MM/YYYY HH:mm"
              required
            />
          </div>

          <div class="mb-3 col-lg-6 col-sm-12">
            <label class="form-label">Stop Date & Time</label>
            <input
              id="booking-stop"
              type="text"
              class="form-control"
              placeholder="DD/MM/YYYY HH:mm"
              required
            />
          </div>
          </div>

          <div class="mb-3" >
            <label class="form-label">Tel</label>
            <input
              v-model="createForm.tel"
              type="number"
              class="form-control"
              placeholder="Enter booking tel"
              required
              @input="validateTel"
            />
          </div> 
          <div v-if="telError" class="text-danger small mt-1">
            {{ telError }}
          </div>
          <div class="mb-3" >
            <label class="form-label">Capacity</label>
            <input
              v-model="createForm.capacity"
              type="number"
              class="form-control"
              placeholder="Enter booking capacity"
              required
            />
          </div>
          <div class="mb-3">
            <label class="form-label">Description</label>
            <textarea
              v-model="createForm.description"
              class="form-control"
              rows="3"
              placeholder="Optional description"
            ></textarea>
          </div>

          <div v-if="createError" class="alert alert-danger py-2">
            {{ createError }}
          </div>

          <div class="d-flex justify-content-end gap-2 mt-4">
            <button
              type="button"
              class="btn btn-light"
              @click="closeCreatePopup"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="creating"
            >
              {{ creating ? 'Creating...' : 'Create Booking' }}
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
  
<!-- Booking List / Details Popup -->
<div
  v-if="showListPopup"
  class="booking-modal-overlay"
  @click.self="closeListPopup"
>
  <div class="booking-modal booking-list-modal">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h5 class="fw-bold mb-1">Booking Details</h5>
        <p class="text-muted small mb-0">
          Room: {{ selectedListRoom?.name || 'Unnamed Room' }}
        </p>
        <span class="badge bg-primary mt-2">
          {{ selectedRoomBookings.length }} bookings
        </span>
      </div>

      <button
        type="button"
        class="btn-close"
        aria-label="Close"
        @click="closeListPopup"
      ></button>
    </div>

    <!-- Loading -->
    <div
      v-if="bookingLoading[selectedListRoom?.id]"
      class="text-center py-4"
    >
      <div class="spinner-border spinner-border-sm text-primary"></div>
      <p class="text-muted small mt-2 mb-0">Loading bookings...</p>
    </div>

    <!-- Error -->
    <div
      v-else-if="bookingErrors[selectedListRoom?.id]"
      class="alert alert-danger"
    >
      {{ bookingErrors[selectedListRoom?.id] }}
      <button
        class="btn btn-sm btn-outline-danger ms-2"
        @click="fetchRoomBookings(selectedListRoom.id)"
      >
        Retry
      </button>
    </div>

    <!-- Booking Details -->
    <div
      v-else-if="selectedRoomBookings.length"
      class="booking-list-content"
    >
      <div
        v-for="(booking, index) in selectedRoomBookings"
        :key="booking.id"
        class="card mb-3 border"
      >
        <div class="card-header bg-light d-flex justify-content-between align-items-center">
          <span class="fw-bold">
            {{ booking.booking_number || booking.name || `Booking #${booking.id}` }}
          </span>
          <span class="badge bg-secondary">
            {{ booking.state || booking.row_state || 'N/A' }}
          </span>
        </div>

        <div class="card-body">
          <div class="row g-3">
            <div class="col-sm-6">
              <div class="text-muted small">No.</div>
              <div class="fw-semibold">{{ index + 1 }}</div>
            </div>

            <div class="col-sm-6">
              <div class="text-muted small">Booking ID</div>
              <div class="fw-semibold">{{ booking.id }}</div>
            </div>

            <div class="col-sm-6">
              <div class="text-muted small">Booking Title</div>
              <div>{{ booking.name || '-' }}</div>
            </div>

            <div class="col-sm-6">
              <div class="text-muted small">Booking Number</div>
              <div>{{ booking.booking_number || '-' }}</div>
            </div>

            <div class="col-sm-6">
              <div class="text-muted small">Start Date & Time</div>
              <div>{{ booking.start || '-' }}</div>
            </div>

            <div class="col-sm-6">
              <div class="text-muted small">Stop Date & Time</div>
              <div>{{ booking.stop || '-' }}</div>
            </div>

            <div class="col-sm-6">
              <div class="text-muted small">Booked For</div>
              <div>{{ booking.create_for_uid || '-' }}</div>
            </div>

            <div class="col-sm-6">
              <div class="text-muted small">Capacity</div>
              <div>{{ booking.number_of_participants ?? '-' }}</div>
            </div>

            <div class="col-sm-6">
              <div class="text-muted small">Telephone</div>
              <div>{{ booking.tel || '-' }}</div>
            </div>

            <div class="col-12">
              <div class="text-muted small">Description</div>
              <div class="text-break">
                {{ booking.description || '-' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else class="text-center text-muted py-5">
      <i class="bi bi-calendar-x fs-1"></i>
      <p class="mt-2 mb-0">No bookings for this room.</p>
    </div>

    <div class="d-flex justify-content-end gap-2 mt-3">
      <button
        type="button"
        class="btn btn-outline-secondary"
        @click="fetchRoomBookings(selectedListRoom.id)"
      >
        <i class="bi bi-arrow-clockwise me-1"></i>Refresh
      </button>

      <button
        type="button"
        class="btn btn-primary"
        @click="closeListPopup"
      >
        Close
      </button>
    </div>
  </div>
</div>
<div
  v-if="showBookingDetailPopup"
  class="booking-modal-overlay"
  @click.self="closeBookingDetailPopup"
>
  <div class="booking-modal">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="fw-bold mb-0">Booking Detail</h5>
      <button
        type="button"
        class="btn-close"
        @click="closeBookingDetailPopup"
      ></button>
    </div>

    <template v-if="selectedBooking">
      <p><strong>ID:</strong> {{ selectedBooking.id }}</p>
      <p><strong>Booking No:</strong> {{ selectedBooking.booking_number || '-' }}</p>
      <p><strong>Title:</strong> {{ selectedBooking.name || '-' }}</p>
      <p><strong>Room:</strong> {{ selectedBooking.booking_name || selectedListRoom?.name || '-' }}</p>
      <p><strong>Start:</strong> {{ selectedBooking.start || '-' }}</p>
      <p><strong>Stop:</strong> {{ selectedBooking.stop || '-' }}</p>
      <p><strong>Booked By:</strong> {{ selectedBooking.create_for_uid || '-' }}</p> 
      <p><strong>Tel:</strong> {{ selectedBooking.tel || '-' }}</p> 
       <p><strong>Description:</strong> {{ selectedBooking.description || '-' }}</p>
    </template>

    <div class="text-end">
      <button class="btn btn-secondary" @click="closeBookingDetailPopup">
        Close
      </button>
    </div>
  </div>
</div>
</template>


<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { getRoomTypes, getRoomBookings,CreateBookroom } from '../api/axios'
import flatpickr from 'flatpickr'
import 'flatpickr/dist/flatpickr.css'
import { onBeforeUnmount, nextTick } from 'vue'
import Swal from 'sweetalert2'

let startPicker = null
let stopPicker = null


const initDatePickers = async () => {
  await nextTick()

  startPicker?.destroy()
  stopPicker?.destroy()

  const options = (field) => ({
    enableTime: true,
    time_24hr: true,
    dateFormat: 'd/m/Y H:i',
    minuteIncrement: 5,
    allowInput: true,

    onChange: (dates) => {
      if (!dates.length) return

      const d = dates[0]
      const pad = (n) => String(n).padStart(2, '0')

      createForm[field] =
        `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
        `${pad(d.getHours())}:${pad(d.getMinutes())}:00`
    },

    onClose: (dates) => {
      if (!dates.length) return

      const d = dates[0]
      const pad = (n) => String(n).padStart(2, '0')

      createForm[field] =
        `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
        `${pad(d.getHours())}:${pad(d.getMinutes())}:00`
    },
  })

  startPicker = flatpickr('#booking-start', options('start'))
  stopPicker = flatpickr('#booking-stop', options('stop'))

  // Restore values from the form when initializing the pickers
  if (createForm.start) {
    startPicker.setDate(createForm.start, false, 'Y-m-d H:i:S')
  }

  if (createForm.stop) {
    stopPicker.setDate(createForm.stop, false, 'Y-m-d H:i:S')
  }
}

const telError = ref('')

const validateTel = () => {
  const digits = String(createForm.tel || '').replace(/\D/g, '')

  if (!createForm.tel) {
    telError.value = ''
  } else if (digits.length <= 7) {
    telError.value = 'Telephone number must contain at least 8 digits.'
  } else {
    telError.value = ''
  }
}
onBeforeUnmount(() => {
  startPicker?.destroy()
  stopPicker?.destroy()
})
const roomTypes = ref([])
const loading = ref(false)
const errorMessage = ref('')
const searchText = ref('')

const roomBookings = ref({})
const bookingLoading = ref({})
const bookingErrors = ref({})

const showCreatePopup = ref(false)
const selectedRoom = ref(null)
const creating = ref(false)
const createError = ref('')

const showListPopup = ref(false)
const selectedListRoom = ref(null)
 
const showBookingDetailPopup = ref(false)
const selectedBooking = ref(null)

// Open one specific booking by ID
const openListPopupId = (room, booking) => {
  selectedListRoom.value = room
  selectedBooking.value = booking
  showBookingDetailPopup.value = true
}

const closeBookingDetailPopup = () => {
  showBookingDetailPopup.value = false
  selectedBooking.value = null
}
const selectedRoomBookings = computed(() => {
  const roomId = selectedListRoom.value?.id

  if (!roomId) return []

  return roomBookings.value[roomId] || []
})

const openListPopup = async (room) => {
  selectedListRoom.value = room
  showListPopup.value = true

  // Load the latest booking records for this room
  await fetchRoomBookings(room.id)
}

const closeListPopup = () => {
  showListPopup.value = false
  selectedListRoom.value = null
}

const createForm = reactive({
  booking_id: null,
  name: '',
  start: '',
  stop: '',
  tel: '',
  capacity: '',
  description: '',
})

const filteredRooms = computed(() => {
  const keyword = searchText.value.trim().toLowerCase()

  if (!keyword) return roomTypes.value

  return roomTypes.value.filter(room =>
    String(room.name || '').toLowerCase().includes(keyword)
  )
})

const fetchRoomTypes = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const result = await getRoomTypes()

    if (result.status === true) {
      roomTypes.value = Array.isArray(result.data) ? result.data : []

      // Load related events for each room
      await Promise.all(
        roomTypes.value.map(room => fetchRoomBookings(room.id))
      )
    } else {
      roomTypes.value = []
      errorMessage.value = result.message || 'Unable to load room types.'
    }
  } catch (error) {
    console.error('Fetch room types error:', error)
    roomTypes.value = []
    errorMessage.value =
      error.response?.data?.message ||
      error.message ||
      'Failed to connect to the server.'
  } finally {
    loading.value = false
  }
}

const fetchRoomBookings = async (roomId) => {
  bookingLoading.value[roomId] = true
  bookingErrors.value[roomId] = ''

  try {
    const result = await getRoomBookings(roomId)

    if (result.status === true) {
      roomBookings.value[roomId] = Array.isArray(result.data)
        ? result.data
        : []
    } else {
      roomBookings.value[roomId] = []
      bookingErrors.value[roomId] =
        result.message || 'Unable to load bookings.'
    }
  } catch (error) {
    console.error(`Fetch bookings for room ${roomId} error:`, error)
    roomBookings.value[roomId] = []
    bookingErrors.value[roomId] =
      error.response?.data?.message ||
      error.message ||
      'Failed to load bookings.'
  } finally {
    bookingLoading.value[roomId] = false
  }
}
const formatDate = (date) => {
  const pad = (n) => String(n).padStart(2, '0')

  return `${pad(date.getDate())} ${pad(date.getMonth() + 1)} ${date.getFullYear()}`
}
const openCreatePopup =async  (room) => {
  selectedRoom.value = room
  createError.value = ''

  
  const now = new Date()
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000)

  const formatOdooDateTime = (date) => {
    const pad = (n) => String(n).padStart(2, '0')

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:00`
  }

  Object.assign(createForm, {
    booking_id: room.id,
    name: '',
    start: formatOdooDateTime(now),
    stop: formatOdooDateTime(oneHourLater),
    description: '',
    tel: '',
    capacity: '',
  })

    showCreatePopup.value = true
    await initDatePickers() 
  // Display defaults in DD/MM/YYYY HH:mm format
  startPicker?.setDate(now, false)
  stopPicker?.setDate(oneHourLater, false)
}

const closeCreatePopup = () => {
  showCreatePopup.value = false
  selectedRoom.value = null
  createError.value = ''
}
const submitCreateBooking = async () => {
  validateTel()

  if (!createForm.tel || telError.value) {
    telError.value = !createForm.tel
    ? 'Telephone number is required.'
    : telError.value

    return
  }
  creating.value = true
  createError.value = '' 
  try {
    const payload = {
      booking_id: createForm.booking_id,
      name: createForm.name,
      start: createForm.start,
      stop: createForm.stop,
      description: createForm.description,
      tel: createForm.tel,
      capacity: createForm.capacity,
    }

    const result = await CreateBookroom(payload)

    if (result.status !== true) {
      createError.value =
        result.message || result.error || 'Failed to create booking.'

      // Close modal first
      showCreatePopup.value = false

      await Swal.fire({
        target: document.body,
        icon: 'error',
        title: 'ມີຂໍ້ຜິດພາດ',
        text: createError.value,
        confirmButtonText: 'OK',
        heightAuto: false,
        customClass: {
          container: 'booking-swal-container',
        },
      })

      return
    }

    // Close modal before showing success
    showCreatePopup.value = false

    await Swal.fire({
      target: document.body,
      icon: 'success',
      title: 'ສົ່ງຄຳຂໍສຳເລັດ',
      timer: 2500,
      timerProgressBar: true,
      showConfirmButton: false,
      heightAuto: false,
      customClass: {
        container: 'booking-swal-container',
      },
    })

    await fetchRoomBookings(payload.booking_id)
  } catch (error) {
    console.error('Create room booking error:', error)

    createError.value =
      error.response?.data?.message ||
      error.response?.data?.error?.data?.message ||
      error.message ||
      'Failed to create booking.'

    // Close modal first
    showCreatePopup.value = false

    await Swal.fire({
      target: document.body,
      icon: 'error',
      title: 'ມີຂໍ້ຜິດພາດ',
      text: String(createError.value),
      confirmButtonText: 'OK',
      heightAuto: false,
      customClass: {
        container: 'booking-swal-container',
      },
    })
  } finally {
    creating.value = false
  }
}

onMounted(fetchRoomTypes)
</script>

<style scoped>
.booking-event-inline {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  padding: 7px 8px;
  border: 1px solid currentColor;
  border-radius: 8px;
  background: #fff;
  font-size: 10px;
  max-width: 100%;
  overflow-wrap: anywhere;
}

.booking-color-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.booking-number,
.booking-start,
.booking-user {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.booking-number {
  flex: 1 1 auto;
}

.booking-start,
.booking-user {
  flex: 0 1 auto;
}

.related-bookings {
  border-top: 1px solid #eee8ef;
  padding-top: 12px;
  margin-top: 8px;
}

.booking-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgb(0 0 0 / 45%);
  isolation: auto;
}

.booking-modal {
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 24px;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 15px 50px rgb(0 0 0 / 20%);
}

.booking-modal .form-control:focus {
  border-color: #714b67;
  box-shadow: 0 0 0 0.2rem rgb(113 75 103 / 15%);
}

.booking-list-modal {
  max-width: 760px;
}

.booking-list-content {
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 4px;
}

.booking-list-content .card {
  border-radius: 10px;
  overflow: hidden;
}

.booking-list-content .card-header {
  font-size: 14px;
  overflow-wrap: anywhere;
}

.booking-list-content .card-body {
  font-size: 13px;
}

.booking-list-content .fw-semibold {
  overflow-wrap: anywhere;
}

@media (max-width: 576px) {
  .booking-list-modal {
    padding: 16px;
  }

  .booking-list-content {
    max-height: 55vh;
  } 
  .booking-modal {
    padding: 18px;
  }
}

.booking-swal-container {
  z-index: 99999 !important;
}
</style>