<template>
  <div class="container-fluid wizard-page">
    <div class="card border-0 shadow-sm">
      <div class="card-body p-1 p-md-4">

        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 class="mb-1">ເລືອກຫ້ອງປະຊຸມ</h4>
          </div>

          <!-- <button class="btn btn-outline-secondary" type="button" @click="goBack" :disabled="submitting">
            <i class="bi bi-arrow-left me-1"></i>
            ກັບ
          </button> -->
        </div>

        <!-- Single-page booking form -->
        <div class="row g-4">

          <!-- Room selection -->
          <div class="col-12">

            <div v-if="loading" class="text-center py-5">
              <div class="spinner-border text-primary"></div>
              <p class="text-muted mt-2">Loading rooms...</p>
            </div>

            <div v-else-if="rooms.length" class="row g-3">
              <div v-for="room in visibleRooms" :key="room.id" class="col-6 col-md-3 col-lg-3">
                <div class="room-option" :class="{ selected: form.room?.id === room.id }" role="button" tabindex="0"
                  @click="selectRoom(room)" @keydown.enter.prevent="selectRoom(room)"
                  @keydown.space.prevent="selectRoom(room)">
                  <div class="d-flex justify-content-between align-items-center">
                    <i class="bi bi-door-closed fs-3"></i>

                    <i v-if="form.room?.id === room.id" class="bi bi-check-circle-fill text-success fs-5"></i>
                  </div>

                  <h6 class="fw-semibold mt-3 mb-2">
                    {{ room.name }}
                  </h6>

                  <div class="text-muted small">
                    <i class="bi bi-people me-1"></i>
                    ຮອງຮັບໄດ້: {{ room.capacity || 0 }} ຄົນ
                  </div>

                  <button class="btn btn-sm w-100 mt-3" :class="form.room?.id === room.id
                    ? 'btn-primary'
                    : 'btn-outline-primary'
                    " type="button" @click.stop="selectRoom(room)">
                    {{
                      form.room?.id === room.id
                        ? 'ຍົກເລີກການເລືອກ'
                        : 'ເລືອກຫ້ອງ'
                    }}
                  </button>
                </div>
                
              </div>
              
            </div>


            <!-- Existing bookings for selected room -->
            <div v-if="form.room" class="mt-4">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="fw-semibold mb-0">
                  ລາຍການຈອງຂອງ: {{ form.room.name }}
                </h6>
              </div>

              <div v-if="bookingLoading" class="text-muted small">
                Loading bookings...
              </div>

              <div v-else-if="bookings[form.room.id]?.length">
                <div v-for="booking in bookings[form.room.id]" :key="booking.id" class="existing-booking mb-2" :style="{
                  borderLeftColor: booking.text_color || '#714b67'
                }">
                  <div class="booking-event-inline">
                    <div class="d-flex justify-content-between align-items-center gap-2">
                      <div class="d-flex align-items-center gap-2">
                        <span class="booking-color-dot" :style="{
                          backgroundColor: booking.text_color || '#714b67'
                        }"></span>
                        <strong>
                          {{
                            booking.booking_number ||
                            booking.name ||
                            `#${booking.id}`
                          }}
                        </strong>
                      </div>

                      <span class="badge" :class="roomStateClass(booking.room_state)">
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
                ບໍ່ມີການຈອງຫ້ອງນີ້ເທື່ອ
              </div>
            </div>
          </div>

          <!-- Start date/time -->
          <template v-if="form.room">
            <div class="col-12 col-md-6">

              <label class="form-label">ວັນ ແລະ ເວລາເລີ່ມ</label>

              <div class="input-group">
                <input :value="form.start ? formatDate(form.start) : ''" type="text"
                  class="form-control date-display-input" placeholder="ເລືອກວັນ ແລະ ເວລາເລີ່ມ" readonly
                  @click="openDateModal('start')" />

                <button class="btn btn-outline-primary" type="button" aria-label="Select start date"
                  @click="openDateModal('start')">
                  <i class="bi bi-calendar3"></i>
                </button>
              </div>
            </div>

            <!-- End date/time -->
            <div class="col-12 col-md-6">

              <label class="form-label">ວັນ ແລະ ເວລາສິ້ນສຸດ</label>

              <div class="input-group">
                <input :value="form.stop ? formatDate(form.stop) : ''" type="text"
                  class="form-control date-display-input" placeholder="ເລືອກວັນ ແລະ ເວລາສິ້ນສຸດ" readonly
                  @click="openDateModal('stop')" />

                <button class="btn btn-outline-primary" type="button" aria-label="Select end date"
                  @click="openDateModal('stop')">
                  <i class="bi bi-calendar3"></i>
                </button>
              </div>

              <div class="text-muted small mt-2">
                ເວລາສິ້ນສຸດຕ້ອງຫຼາຍກວ່າເວລາເລີ່ມ
              </div>
            </div>

            <!-- Telephone -->
            <div class="col-12 col-md-6">

              <label class="form-label">ເບີໂທ</label>
              <input v-model.trim="form.tel" type="tel" inputmode="tel" class="form-control" placeholder="ປ້ອນເບີໂທ"
                @input="telError = ''" />

              <div v-if="telError" class="text-danger small mt-2">
                {{ telError }}
              </div>
            </div>

            <!-- Participants -->
            <div class="col-12 col-md-6">

              <label class="form-label">ຈຳນວນຄົນເຂົ້າຮ່ວມ</label> &nbsp; <span class="text-warning">ຫ້ອງນີ້ຮອງຮັບ: {{ form.room?.capacity || 0 }} ຄົນ</span>
              <input v-model.number="form.capacity" type="number" min="1" step="1" class="form-control"
                placeholder="ປ້ອນຈຳນວນຄົນ" @input="capacityError = ''" />

              <div v-if="capacityError" class="text-danger small mt-2">
                {{ capacityError }}
              </div>
            </div>

            <!-- Description -->
            <div class="col-12">

              <label class="form-label">ລາຍລະອຽດ</label>
              <textarea v-model.trim="form.description" class="form-control" rows="4"
                placeholder="ປ້ອນລາຍລະອຽດການຈອງ..."></textarea>
            </div>

          </template>
          <!-- Review -->
          <!-- <div class="col-12">
            <h5 class="fw-semibold mb-3">ກວດຄືນຄວາມຖືກຕ້ອງ</h5>

            <div class="review-card">
              <div class="review-row">
                <span>ຫ້ອງ</span>
                <strong>{{ form.room?.name || '-' }}</strong>
              </div>

              <div class="review-row">
                <span>ຈຳນວນທີ່ຮອງຮັບໄດ້</span>
                <strong>
                  {{ form.room?.capacity || 0 }} ຄົນ
                </strong>
              </div>

              <div class="review-row">
                <span>ຈະເລີ່ມໃຊ້</span>
                <strong>{{ formatDate(form.start) }}</strong>
              </div>

              <div class="review-row">
                <span>ຈະໃຊ້ຮອດ</span>
                <strong>{{ formatDate(form.stop) }}</strong>
              </div>

              <div class="review-row">
                <span>ເບີໂທ</span>
                <strong>{{ form.tel || '-' }}</strong>
              </div>

              <div class="review-row">
                <span>ຈຳນວນເຂົ້າຮ່ວມ</span>
                <strong>{{ form.capacity || 0 }} ຄົນ</strong>
              </div>

              <div class="review-row description-row">
                <span>ລາຍລະອຽດ</span>
                <strong>{{ form.description || '-' }}</strong>
              </div>
            </div>
          </div> -->
        </div>

        <!-- Error -->
        <div v-if="errorMessage" class="alert alert-danger mt-4">
          {{ errorMessage }}
        </div>

        <!-- Actions -->
        <div class="d-flex justify-content-between mt-4 pt-3 border-top">
          <button class="btn btn-outline-secondary" type="button" :disabled="submitting" @click="goBack">
            <i class="bi bi-arrow-left me-1"></i>
            ກັບ
          </button>

          <button class="btn btn-success px-4" type="button" :disabled="submitting || loading" @click="submitBooking">
            <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
            <i v-else class="bi bi-check-circle me-1"></i>
            {{ submitting ? 'Submitting...' : 'ຢືນຢັນການຈອງ' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Date & Time Picker Modal -->
    <div class="modal fade" ref="dateModal" tabindex="-1" aria-labelledby="dateModalTitle" aria-hidden="true">
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

            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>

          <div class="modal-body">
            <p class="text-muted small mb-3">
              Choose your date and time below.
            </p>

            <input ref="datePickerInput" type="text" class="form-control" placeholder="Select date and time" />

            <div class="selected-date-preview mt-3">
              <i class="bi bi-clock me-2"></i>
              {{ datePreview || 'No date selected' }}
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
              Cancel
            </button>

            <button type="button" class="btn btn-primary px-4" :disabled="!datePreview" @click="confirmDate">
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

const loading = ref(false)
const submitting = ref(false)
const bookingLoading = ref(false)

const rooms = ref([])
const bookings = ref({})

const visibleRooms = computed(() => {
  if (form.room) {
    return [form.room]
  }

  return rooms.value
})
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
// Date Helpers
// =====================================================

const pad = value => String(value).padStart(2, '0')

const toLocalInput = date => {
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  )
}

const toOdooDateTime = value => {
  if (!value) return ''
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
  if (!picker || !picker.selectedDates.length) return

  const selected = picker.selectedDates[0]

  const formatted = picker.formatDate(
    selected,
    'Y-m-d\\TH:i'
  )

  if (activeDateField.value === 'start') {
    form.start = formatted

    // Clear end date if it is no longer later than start.
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
  modalInstance?.hide()
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
      error.response?.data?.message ||
      error.message ||
      'Unable to load rooms.'
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
      error.response?.data?.message ||
      error.message ||
      'Unable to load bookings.'
  } finally {
    bookingLoading.value = false
  }
}

// =====================================================
// Select Room
// =====================================================

const selectRoom = async room => {
  if (!room?.id) return

  // Click the same room again to deselect it.
  if (form.room?.id === room.id) {
    form.room = null

    form.start = ''
    form.stop = ''
    form.capacity = ''

    errorMessage.value = ''
    telError.value = ''
    capacityError.value = ''

    return
  }

  // Select another room.
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

  // Local datetime input: YYYY-MM-DDTHH:mm
  if (str.includes('T')) {
    const [date, time] = str.split('T')
    const [year, month, day] = date.split('-')

    return `${day}/${month}/${year} ${time?.slice(0, 5) || ''}`
  }

  // Odoo datetime is stored as UTC; display in Laos time (+07:00).
  const match = str.match(
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/
  )

  if (match) {
    const [, year, month, day, hour, minute] = match

    const date = new Date(Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour) + 7,
      Number(minute)
    ))

    return (
      `${pad(date.getUTCDate())}/${pad(date.getUTCMonth() + 1)}/` +
      `${date.getUTCFullYear()} ${pad(date.getUTCHours())}:` +
      `${pad(date.getUTCMinutes())}`
    )
  }

  return str
}

const roomStateLabel = state => {
  const labels = {
    draft: 'ລໍຖ້າອະນຸມັດ',
    confirmed: 'ອະນຸມັດແລ້ວ',
    using: 'ກຳລັງໃຊ້ງານ',
    done: 'ສຳເລັດແລ້ວ',
    cancelled: 'ຍົກເລີກແລ້ວ'
  }

  return labels[state] || state || 'ບໍ່ຮູ້ສະຖານະ'
}

const roomStateClass = state => {
  const classes = {
    draft: 'bg-warning text-dark',
    confirmed: 'bg-success',
    using: 'bg-primary',
    done: 'bg-info text-dark',
    cancelled: 'bg-danger'
  }

  return classes[state] || 'bg-secondary'
}

// =====================================================
// Form Validation
// =====================================================

const validateForm = () => {
  errorMessage.value = ''
  telError.value = ''
  capacityError.value = ''

  if (!form.room) {
    errorMessage.value = 'Please select a room.'
    return false
  }

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

  if (!form.stop) {
    errorMessage.value = 'Please select an end date and time.'
    return false
  }

  const stop = new Date(form.stop)

  if (Number.isNaN(stop.getTime()) || stop <= start) {
    errorMessage.value = 'End time must be later than start time.'
    return false
  }

  const digits = String(form.tel || '').replace(/\D/g, '')

  if (digits.length < 8) {
    telError.value = 'Telephone number must contain at least 8 digits.'
    errorMessage.value = telError.value
    return false
  }

  const participants = Number(form.capacity)

  if (!Number.isInteger(participants) || participants < 1) {
    capacityError.value = 'Enter a valid number of participants.'
    errorMessage.value = capacityError.value
    return false
  }

  if (
    form.room.capacity &&
    participants > Number(form.room.capacity)
  ) {
    capacityError.value =
      `Room capacity is limited to ${form.room.capacity} people.`
    errorMessage.value = capacityError.value
    return false
  }

  return true
}

// =====================================================
// Submit Booking
// =====================================================

const submitBooking = async () => {
  if (submitting.value) return
  if (!validateForm()) return

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

    goBack()
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
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/dashboard')
  }
}

// =====================================================
// Lifecycle
// =====================================================

onMounted(() => {
  if (dateModal.value) {
    modalInstance = new Modal(dateModal.value, {
      backdrop: true,
      keyboard: true
    })
  }

  if (datePickerInput.value) {
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
  }

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
.wizard-page {
  max-width: 1200px;
  margin: auto;
}

.room-option {
  height: 100%;
  padding: 18px;
  border: 1px solid #e7e1e8;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #fff;
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
  border-left: 4px solid #714b67;
  border-radius: 9px;
  background: #fafafa;
}

.booking-event-inline {
  display: block;
  overflow-wrap: anywhere;
}

.booking-color-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
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
  font-weight: 500;
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
  box-shadow: 0 0 0 0.2rem rgb(113 75 103 / 15%);
}

.date-display-input {
  cursor: pointer;
  background-color: #fff !important;
}

.date-display-input:focus {
  border-color: #714b67;
  box-shadow: 0 0 0 0.2rem rgb(113 75 103 / 15%);
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
