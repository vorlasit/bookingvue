
<template>
  <div class="container-fluid py-4 wizard-page">
    <div class="card border-0 shadow-sm">
      <div class="card-body p-3 p-md-4">

        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 class="mb-1">Room Booking</h4>
            <p class="text-muted small mb-0">
              Complete each step to submit your booking.
            </p>
          </div>

          <button
            class="btn btn-outline-secondary"
            type="button"
            @click="router.back()"
          >
            <i class="bi bi-arrow-left me-1"></i>
            Back
          </button>
        </div>

        <!-- Progress -->
        <div class="wizard-progress mb-4">
          <div
            class="wizard-progress-bar"
            :style="{ width: progress + '%' }"
          ></div>
        </div>

        <div class="d-flex justify-content-between mb-4">
          <span class="small text-muted">
            Step {{ step }} of 7
          </span>
          <span class="small fw-semibold">
            {{ progress }}%
          </span>
        </div>

        <!-- Step 1: Select Room -->
        <div v-if="step === 1">
          <h5 class="fw-semibold mb-2">1. Select a Room</h5>

          <p class="text-muted small mb-4">
            Select a room to see its existing bookings.
          </p>

          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary"></div>
            <p class="text-muted mt-2">Loading rooms...</p>
          </div>

          <div v-else-if="rooms.length" class="row g-3">
            <div
              v-for="room in rooms"
              :key="room.id"
              class="col-12 col-md-6 col-lg-4"
            >
              <div
                class="room-option"
                :class="{ selected: form.room?.id === room.id }"
                @click="selectRoom(room)"
              >
                <div class="d-flex justify-content-between">
                  <i class="bi bi-door-closed fs-3"></i>

                  <i
                    v-if="form.room?.id === room.id"
                    class="bi bi-check-circle-fill text-success fs-5"
                  ></i>
                </div>

                <h6 class="fw-semibold mt-3 mb-2">
                  {{ room.name }}
                </h6>

                <div class="text-muted small">
                  <i class="bi bi-people me-1"></i>
                  Capacity: {{ room.capacity || 0 }} people
                </div>

                <div class="small text-muted mt-2">
                  {{ bookings[room.id]?.length || 0 }} existing bookings
                </div>

                <button
                  class="btn btn-sm w-100 mt-3"
                  :class="
                    form.room?.id === room.id
                      ? 'btn-primary'
                      : 'btn-outline-primary'
                  "
                  type="button"
                >
                  {{
                    form.room?.id === room.id
                      ? 'Selected'
                      : 'Select Room'
                  }}
                </button>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-5 text-muted">
            No rooms available.
          </div>

          <!-- Selected Room Bookings -->
          <div v-if="form.room" class="mt-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h6 class="fw-semibold mb-0">
                Existing bookings: {{ form.room.name }}
              </h6>
 
            </div>

            <div v-if="bookingLoading" class="text-muted small">
              Loading bookings...
            </div>

            <div v-else-if="bookings[form.room.id]?.length">
              <div
                v-for="booking in bookings[form.room.id]"
                :key="booking.id"
                class="existing-booking mb-2"
                :style="{ color: booking.text_color || '#714b67', 
                          }"
              >
              <div 
                class="booking-event-inline mb-2"
                :style="{ color: booking.text_color || '#714b67', 
                          }"
              >
                        <span
                          class="booking-color-dot"
                          :style="{
                            backgroundColor: booking.text_color || '#714b67'
                          }"
                        ></span>
                <div class="d-flex justify-content-between gap-2">
                  <strong>
                    {{
                      booking.booking_number ||
                      booking.name ||
                      `#${booking.id}`
                    }}
                  </strong>

                <span
                  class="badge"
                  :class="roomStateClass(booking.room_state)"
                >
                  {{ roomStateLabel(booking.room_state) }}
                </span>
                </div>

                <div class="small text-muted mt-2">
                  <i class="bi bi-calendar3 me-1"></i>
                  {{ formatDate(booking.start) }}
                  -
                  {{ formatDate(booking.stop) }}
                </div>

                <div class="small text-muted">
                  <i class="bi bi-person me-1"></i>
                  {{ displayRelation(booking.create_for_uid) }}
                </div>
              </div>
            </div>
            </div>

            <div v-else class="text-muted small py-3">
              No existing bookings for this room.
            </div>
          </div>
        </div>

        <!-- Step 2: Start Date -->
        <div v-if="step === 2">
          <h5 class="fw-semibold mb-2">
            2. Select Start Date & Time
          </h5>

          <p class="text-muted small">
            Room: {{ form.room?.name }}
          </p>

          <label class="form-label mt-4">
            Start Date & Time
          </label>

          <div class="input-group input-group-lg">
            <input
              :value="form.start ? formatDate(form.start) : ''"
              type="text"
              class="form-control date-display-input"
              placeholder="Select start date and time"
              readonly
              @click="openDateModal('start')"
            />

            <button
              class="btn btn-outline-primary"
              type="button"
              @click="openDateModal('start')"
            >
              <i class="bi bi-calendar3"></i>
            </button>
          </div>

          <div class="text-muted small mt-2">
            Select when your meeting or booking begins.
          </div>
        </div>

        <!-- Step 3: End Date -->
        <div v-if="step === 3">
          <h5 class="fw-semibold mb-2">
            3. Select End Date & Time
          </h5>

          <p class="text-muted small">
            Start: {{ formatDate(form.start) }}
          </p>

          <label class="form-label mt-4">
            End Date & Time
          </label>

          <div class="input-group input-group-lg">
            <input
              :value="form.stop ? formatDate(form.stop) : ''"
              type="text"
              class="form-control date-display-input"
              placeholder="Select end date and time"
              readonly
              @click="openDateModal('stop')"
            />

            <button
              class="btn btn-outline-primary"
              type="button"
              @click="openDateModal('stop')"
            >
              <i class="bi bi-calendar3"></i>
            </button>
          </div>

          <div class="text-muted small mt-2">
            End time must be later than start time.
          </div>
        </div>

        <!-- Step 4: Telephone -->
        <div v-if="step === 4">
          <h5 class="fw-semibold mb-2">
            4. Telephone Number
          </h5>

          <p class="text-muted small">
            Enter your contact telephone number.
          </p>

          <label class="form-label mt-4">
            Telephone
          </label>

          <input
            v-model="form.tel"
            type="tel"
            inputmode="tel"
            class="form-control form-control-lg"
            placeholder="Enter telephone number"
          />

          <div v-if="telError" class="text-danger small mt-2">
            {{ telError }}
          </div>
        </div>

        <!-- Step 5: Participants -->
        <div v-if="step === 5">
          <h5 class="fw-semibold mb-2">
            5. Number of Participants
          </h5>

          <p class="text-muted small">
            Room capacity: {{ form.room?.capacity || 0 }} people.
          </p>

          <label class="form-label mt-4">
            ຈຳນວນຄົນເຂົ້າຮ່ວມ
          </label>

          <input
            v-model.number="form.capacity"
            type="number"
            min="1"
            step="1"
            class="form-control form-control-lg"
            placeholder="Enter number of participants"
          />

          <div
            v-if="capacityError"
            class="text-danger small mt-2"
          >
            {{ capacityError }}
          </div>
        </div>

        <!-- Step 6: Description -->
        <div v-if="step === 6">
          <h5 class="fw-semibold mb-2">
            6. Booking Description
          </h5>

          <p class="text-muted small">
            Provide meeting details or the purpose of this booking.
          </p>

          <label class="form-label mt-4">
            ລາຍລະອຽດ
          </label>

          <textarea
            v-model="form.description"
            class="form-control"
            rows="6"
            placeholder="Enter booking details..."
          ></textarea>
        </div>

        <!-- Step 7: Review -->
        <div v-if="step === 7">
          <h5 class="fw-semibold mb-2">
            7. Review Your Booking
          </h5>

          <p class="text-muted small mb-4">
            Please check all information before submitting.
          </p>

          <div class="review-card">
            <div class="review-row">
              <span>Room</span>
              <strong>{{ form.room?.name }}</strong>
            </div>

            <div class="review-row">
              <span>Room Capacity</span>
              <strong>{{ form.room?.capacity }} people</strong>
            </div>

            <div class="review-row">
              <span>Start</span>
              <strong>{{ formatDate(form.start) }}</strong>
            </div>

            <div class="review-row">
              <span>End</span>
              <strong>{{ formatDate(form.stop) }}</strong>
            </div>

            <div class="review-row">
              <span>Telephone</span>
              <strong>{{ form.tel }}</strong>
            </div>

            <div class="review-row">
              <span>Participants</span>
              <strong>{{ form.capacity }} people</strong>
            </div>

            <div class="review-row description-row">
              <span>Description</span>
              <strong>{{ form.description || '-' }}</strong>
            </div>
          </div>

          <div class="alert alert-info mt-4 small">
            <i class="bi bi-info-circle me-1"></i>
            Please confirm that the selected date and room are correct.
          </div>
        </div>

        <!-- Error -->
        <div
          v-if="errorMessage"
          class="alert alert-danger mt-4"
        >
          {{ errorMessage }}
        </div>

        <!-- Navigation -->
        <div class="d-flex justify-content-between mt-5 pt-3 border-top">
          <button
            v-if="step > 1"
            class="btn btn-outline-secondary"
            type="button"
            :disabled="submitting"
            @click="previousStep"
          >
            <i class="bi bi-arrow-left me-1"></i>
            Previous
          </button>

          <div v-else></div>

          <button
            v-if="step < 7"
            class="btn btn-primary px-4"
            type="button"
            @click="nextStep"
          >
            Next
            <i class="bi bi-arrow-right ms-1"></i>
          </button>

          <button
            v-else
            class="btn btn-success px-4"
            type="button"
            :disabled="submitting"
            @click="submitBooking"
          >
            <span
              v-if="submitting"
              class="spinner-border spinner-border-sm me-1"
            ></span>

            <i v-else class="bi bi-check-circle me-1"></i>

            {{ submitting ? 'Submitting...' : 'Submit Booking' }}
          </button>
        </div>

      </div>
    </div>

    <!-- Date & Time Picker Modal -->
    <div
      class="modal fade"
      ref="dateModal"
      tabindex="-1"
      aria-labelledby="dateModalTitle"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">

          <div class="modal-header">
            <h5 class="modal-title" id="dateModalTitle">
              <i class="bi bi-calendar-event me-2"></i>
              {{
                activeDateField === 'start'
                  ? 'Select Start Date & Time'
                  : 'Select End Date & Time'
              }}
            </h5>

            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>

          <div class="modal-body">
            <p class="text-muted small mb-3">
              Choose your date and time below.
            </p>

            <input
              ref="datePickerInput"
              type="text"
              class="form-control"
              placeholder="Select date and time"
            />

            <div class="selected-date-preview mt-3">
              <i class="bi bi-clock me-2"></i>
              {{ datePreview || 'No date selected' }}
            </div>
          </div>

          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-outline-secondary"
              data-bs-dismiss="modal"
            >
              Cancel
            </button>

            <button
              type="button"
              class="btn btn-primary px-4"
              :disabled="!datePreview"
              @click="confirmDate"
            >
              <i class="bi bi-check-circle me-1"></i>
              Confirm
            </button>
          </div>

        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import {
  ref,
  reactive,
  computed,
  onMounted,
  onBeforeUnmount
} from 'vue'

import { useRouter } from 'vue-router'

import {
  getRoomTypes,
  getRoomBookings,
  CreateBookroom
} from '../api/axios'

import Swal from 'sweetalert2'

import flatpickr from 'flatpickr'
import 'flatpickr/dist/flatpickr.min.css'

import { Modal } from 'bootstrap'

const router = useRouter()

// =====================================================
// Main State
// =====================================================

const step = ref(1)

const loading = ref(false)
const submitting = ref(false)
const bookingLoading = ref(false)

const rooms = ref([])
const bookings = ref({})

const errorMessage = ref('')
const telError = ref('')
const capacityError = ref('')

const form = reactive({
  room: null,
  start: '',
  stop: '',
  tel: '',
  capacity: '',
  description: ''
})

// =====================================================
// Progress
// =====================================================

const progress = computed(() => {
  return Math.round((step.value / 7) * 100)
})

// =====================================================
// Date Helpers
// =====================================================

const pad = value => String(value).padStart(2, '0')

const toLocalInput = date => {
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  )
}

const minDateTime = computed(() => {
  const now = new Date()
  now.setSeconds(0, 0)

  return toLocalInput(now)
})

const toOdooDateTime = value => {
  if (!value) return ''

  // Keep the selected local wall-clock time.
  // API format: YYYY-MM-DD HH:mm:ss
  return value.replace('T', ' ') + ':00'
}

// =====================================================
// Date & Time Picker Modal
// =====================================================

const dateModal = ref(null)
const datePickerInput = ref(null)

const activeDateField = ref('start')
const datePreview = ref('')

let modalInstance = null
let picker = null

const getPickerMinDate = field => {
  if (field === 'stop' && form.start) {
    return form.start
  }

  return new Date()
}

const openDateModal = field => {
  activeDateField.value = field
  datePreview.value = ''

  if (!modalInstance || !picker) return

  const minDate = getPickerMinDate(field)

  picker.set('minDate', minDate)

  const currentValue = form[field]

  if (currentValue) {
    const currentDate = new Date(currentValue)

    if (
      !Number.isNaN(currentDate.getTime()) &&
      currentDate >= new Date(minDate)
    ) {
      picker.setDate(currentValue, true)
    } else {
      picker.clear()
    }
  } else {
    picker.clear()
  }

  modalInstance.show()
}

const confirmDate = () => {
  if (!picker || !picker.selectedDates.length) {
    return
  }

  const selected = picker.selectedDates[0]

  const formatted = picker.formatDate(
    selected,
    'Y-m-d\\TH:i'
  )

  if (activeDateField.value === 'start') {
    form.start = formatted

    // Reset end date if it is no longer after start.
    if (
      form.stop &&
      new Date(form.stop) <= new Date(form.start)
    ) {
      form.stop = ''
    }
  } else {
    form.stop = formatted
  }

  errorMessage.value = ''

  modalInstance.hide()
}

// =====================================================
// API Response Helpers
// =====================================================

const parseResponse = raw => {
  let result = raw?.data ?? raw

  for (let i = 0; i < 3; i++) {
    if (!result || typeof result !== 'object') break

    if (result.status !== undefined) return result

    if (Array.isArray(result)) return result

    if (result.user) {
      result = result.user
      continue
    }

    if (result.data) {
      result = result.data
      continue
    }

    if (Array.isArray(result.results)) return result.results
    if (Array.isArray(result.bookings)) return result.bookings
    if (Array.isArray(result.list_booking)) return result.list_booking

    break
  }

  return result
}

const extractList = raw => {
  const result = parseResponse(raw)

  if (Array.isArray(result)) return result

  return (
    result?.rooms ||
    result?.results ||
    result?.bookings ||
    result?.list_booking ||
    result?.data ||
    []
  )
}

// =====================================================
// Load Rooms
// =====================================================

const loadRooms = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const raw = await getRoomTypes()
    const result = parseResponse(raw)

    if (result?.status === false) {
      throw new Error(result.message || 'Unable to load rooms.')
    }

    rooms.value = extractList(raw).filter(
      room => room && room.id
    )

  } catch (error) {
    console.error('Load rooms:', error)

    errorMessage.value =
      error.message || 'Unable to load rooms.'

  } finally {
    loading.value = false
  }
}

// =====================================================
// Fetch Existing Room Bookings
// =====================================================

const fetchBookings = async roomId => {
  if (!roomId) return

  bookingLoading.value = true

  try {
    const raw = await getRoomBookings(roomId)
    const result = parseResponse(raw)

    if (result?.status === false) {
      throw new Error(result.message || 'Unable to load bookings.')
    }

    bookings.value[roomId] = extractList(raw)

  } catch (error) {
    console.error('Fetch room bookings:', error)

    errorMessage.value =
      error.message || 'Unable to load bookings.'

  } finally {
    bookingLoading.value = false
  }
}

// =====================================================
// Select Room
// =====================================================

const selectRoom = async room => {
  form.room = room
  errorMessage.value = ''

  await fetchBookings(room.id)
}

// =====================================================
// Display Helpers
// =====================================================

const displayRelation = value => {
  if (!value) return '-'

  if (Array.isArray(value)) {
    return value[1] || '-'
  }

  if (typeof value === 'object') {
    return value.name || value.display_name || '-'
  }

  return value
}

const formatDate = value => {
  if (!value) return '-'

  const str = String(value)

  // Native local datetime format
  if (str.includes('T')) {
    const [date, time] = str.split('T')
    const [year, month, day] = date.split('-')

    return `${day}/${month}/${year} ${time?.slice(0, 5) || ''}`
  }

  // Odoo UTC datetime displayed in Laos time (+07:00).
  const match = str.match(
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/
  )

  if (match) {
    const [, y, m, d, h, min] = match

    const date = new Date(Date.UTC(
      Number(y),
      Number(m) - 1,
      Number(d),
      Number(h) + 7,
      Number(min)
    ))

    return (
      `${pad(date.getUTCDate())}/${pad(date.getUTCMonth() + 1)}/` +
      `${date.getUTCFullYear()} ${pad(date.getUTCHours())}:` +
      `${pad(date.getUTCMinutes())}`
    )
  }

  return str
}


const roomStateLabel = (state) => {
  const labels = {
    draft: 'ລໍຖ້າອະນຸມັດ', 
    confirmed: 'ອະນຸມັດແລ້ວ', 
    using: 'ກຳລັງໃຊ້ງານ',
    done: 'ສຳເລັດແລ້ວ',
    cancelled: 'ຍົກເລີກແລ້ວ', 
  }

  return labels[state] || state || 'ບໍ່ຮູ້ສະຖານະ'
}

const roomStateClass = (state) => {
  const classes = {
    draft: 'bg-warning text-dark', 
    confirmed: 'bg-success', 
    using: 'bg-primary',
    done: 'bg-info text-dark',
    cancelled: 'bg-danger', 
  }

  return classes[state] || 'bg-secondary'
}
// =====================================================
// Validation
// =====================================================

const validateStep = () => {
  errorMessage.value = ''

  if (step.value === 1) {
    if (!form.room) {
      errorMessage.value = 'Please select a room.'
      return false
    }
  }

  if (step.value === 2) {
    if (!form.start) {
      errorMessage.value = 'Please select a start date and time.'
      return false
    }

    const start = new Date(form.start)

    if (Number.isNaN(start.getTime())) {
      errorMessage.value = 'Invalid start date.'
      return false
    }

    if (start.getTime() < Date.now() - 60000) {
      errorMessage.value = 'Start date cannot be in the past.'
      return false
    }
  }

  if (step.value === 3) {
    if (!form.stop) {
      errorMessage.value = 'Please select an end date and time.'
      return false
    }

    if (new Date(form.stop) <= new Date(form.start)) {
      errorMessage.value = 'End time must be later than start time.'
      return false
    }
  }

  if (step.value === 4) {
    const digits = String(form.tel).replace(/\D/g, '')

    telError.value = digits.length < 8
      ? 'Telephone number must contain at least 8 digits.'
      : ''

    if (telError.value) {
      errorMessage.value = telError.value
      return false
    }
  }

  if (step.value === 5) {
    const participants = Number(form.capacity)

    if (!Number.isInteger(participants) || participants < 1) {
      capacityError.value = 'Enter a valid number of participants.'
      errorMessage.value = capacityError.value
      return false
    }

    if (
      form.room?.capacity &&
      participants > Number(form.room.capacity)
    ) {
      capacityError.value =
        `Room capacity is limited to ${form.room.capacity} people.`

      errorMessage.value = capacityError.value
      return false
    }

    capacityError.value = ''
  }

  return true
}

const nextStep = () => {
  if (!validateStep()) return

  if (step.value < 7) {
    step.value++
    errorMessage.value = ''
  }
}

const previousStep = () => {
  if (step.value > 1) {
    step.value--
    errorMessage.value = ''
  }
}

const validateAll = () => {
  const originalStep = step.value

  for (let current = 1; current <= 5; current++) {
    step.value = current

    const valid = validateStep()

    if (!valid) {
      step.value = current
      return false
    }
  }

  step.value = originalStep

  return true
}

// =====================================================
// Submit Booking
// =====================================================

const submitBooking = async () => {
  if (submitting.value) return

  if (!validateAll()) return

  submitting.value = true
  errorMessage.value = ''

  const payload = {
    booking_id: Number(form.room.id),
    start: toOdooDateTime(form.start),
    stop: toOdooDateTime(form.stop),
    tel: String(form.tel).trim(),
    capacity: Number(form.capacity),
    description: String(form.description || '').trim()
  }

  try {
    const raw = await CreateBookroom(payload)
    const result = parseResponse(raw)

    if (
      result?.status === false ||
      result?.success === false
    ) {
      throw new Error(result.message || 'Booking failed.')
    }

    await Swal.fire({
      icon: 'success',
      title: 'Booking Submitted!',
      text:
        result?.message ||
        'Your room booking was submitted successfully.',
      confirmButtonText: 'OK',
      confirmButtonColor: '#714b67'
    })

    router.back()

  } catch (error) {
    console.error('Submit booking error:', error)

    errorMessage.value =
      error.response?.data?.message ||
      error.message ||
      'Unable to submit booking.'

    await Swal.fire({
      icon: 'error',
      title: 'Booking Failed',
      text: errorMessage.value,
      confirmButtonColor: '#714b67'
    })

  } finally {
    submitting.value = false
  }
}

// =====================================================
// Back
// =====================================================

const goBack = () => {
  router.back()
}

// =====================================================
// Lifecycle
// =====================================================

onMounted(() => {
  // Initialize Bootstrap modal.
  modalInstance = new Modal(dateModal.value, {
    backdrop: true,
    keyboard: true
  })

  // Initialize Flatpickr.
  picker = flatpickr(datePickerInput.value, {
    inline: true,
    enableTime: true,
    dateFormat: 'Y-m-d\\TH:i',
    time_24hr: true,
    minuteIncrement: 5,
    minDate: new Date(),

    onChange(selectedDates) {
      if (selectedDates.length) {
        datePreview.value = picker.formatDate(
          selectedDates[0],
          'd/m/Y H:i'
        )
      } else {
        datePreview.value = ''
      }
    }
  })

  loadRooms()
})

onBeforeUnmount(() => {
  picker?.destroy()
  modalInstance?.dispose()

  picker = null
  modalInstance = null
})
</script>

<style scoped>


.booking-color-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.booking-event-inline {  
  gap: 6px;
  padding: 7px 8px;
  border: 1px solid currentColor;
  border-radius: 8px;
  background: #fff; 
  overflow-wrap: anywhere;
  cursor: pointer;
}

.wizard-page {
  max-width: 1200px;
  margin: auto;
}

.wizard-progress {
  width: 100%;
  height: 8px;
  overflow: hidden;
  border-radius: 20px;
  background: #eee8ef;
}

.wizard-progress-bar {
  height: 100%;
  background: #714b67;
  border-radius: 20px;
  transition: width .3s ease;
}

.room-option {
  height: 100%;
  padding: 18px;
  border: 1px solid #e7e1e8;
  border-radius: 12px;
  cursor: pointer;
  transition: .2s;
}

.room-option:hover {
  border-color: #714b67;
  background: #faf7fa;
}

.room-option.selected {
  border: 2px solid #714b67;
  background: #f8f3f8;
}

.existing-booking {
  padding: 12px 14px;
  border: 1px solid #eee8ef;
  border-radius: 9px;
  background: #fafafa;
}

.review-card {
  border: 1px solid #e8e2e9;
  border-radius: 12px;
  padding: 16px;
}

.review-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 15px;
  padding: 13px 0;
  border-bottom: 1px solid #eee;
}

.review-row:last-child {
  border-bottom: 0;
}

.review-row span {
  color: #777;
  font-size: 14px;
}

.review-row strong {
  text-align: right;
  overflow-wrap: anywhere;
}

.description-row {
  flex-direction: column;
}

.description-row strong {
  text-align: left;
  white-space: pre-wrap;
}

.form-control:focus {
  border-color: #714b67;
  box-shadow: 0 0 0 .2rem rgb(113 75 103 / 15%);
}

.date-display-input {
  cursor: pointer;
  background-color: #fff !important;
}

.date-display-input:focus {
  border-color: #714b67;
  box-shadow: 0 0 0 .2rem rgb(113 75 103 / 15%);
}

.selected-date-preview {
  padding: 12px 15px;
  border-radius: 8px;
  background: #f8f3f8;
  color: #714b67;
  font-weight: 500;
  text-align: center;
}

/* Flatpickr calendar */
:deep(.flatpickr-calendar.inline) {
  width: 100%;
  max-width: 100%;
  box-shadow: none;
  border: 0;
  margin: 0 auto;
}

:deep(.flatpickr-calendar.inline .flatpickr-innerContainer),
:deep(.flatpickr-calendar.inline .flatpickr-rContainer),
:deep(.flatpickr-calendar.inline .flatpickr-days),
:deep(.flatpickr-calendar.inline .dayContainer) {
  width: 100%;
  max-width: 100%;
}

:deep(.flatpickr-calendar.inline .flatpickr-day) {
  max-width: 14.28%;
}

:deep(.flatpickr-day.selected),
:deep(.flatpickr-day.startRange),
:deep(.flatpickr-day.endRange) {
  background: #714b67;
  border-color: #714b67;
}

:deep(.flatpickr-day.today) {
  border-color: #714b67;
}

:deep(.flatpickr-time input:hover),
:deep(.flatpickr-time .flatpickr-am-pm:hover) {
  background: #f8f3f8;
}

@media (max-width: 576px) {
  .review-row {
    flex-direction: column;
    gap: 5px;
  }

  .review-row strong {
    text-align: left;
  }

  .modal-dialog {
    margin: 10px;
  }
}
</style> 