<template>
  <!-- Booking Detail Page -->
  <div v-if="showBookingDetailPage" class="container-fluid py-4">
    <div class="card border-0 shadow-sm">
      <div class="card-body p-3 p-md-4">
        <div class="d-flex align-items-center gap-3 mb-4">
          <button
            type="button"
            class="btn btn-outline-secondary"
            @click="backToRoomList"
          >
            <i class="bi bi-arrow-left me-1"></i>
            Back
          </button>

          <div>
            <h5 class="fw-bold mb-1">Booking Details</h5>
            <div class="text-muted small">
              {{ selectedRoom?.name || 'Room Booking' }}
            </div>
          </div>
        </div>

        <div v-if="selectedBooking" class="row g-3">
          <div class="col-12 col-md-6">
            <div class="detail-item">
              <div class="text-muted small">Booking ID</div>
              <div class="fw-semibold">{{ selectedBooking.id }}</div>
            </div>
          </div>

          <div class="col-12 col-md-6">
            <div class="detail-item">
              <div class="text-muted small">Booking Number</div>
              <div class="fw-semibold">
                {{ selectedBooking.booking_number || '-' }}
              </div>
            </div>
          </div>

          <div class="col-12 col-md-6">
            <div class="detail-item">
              <div class="text-muted small">Title</div>
              <div>{{ selectedBooking.name || '-' }}</div>
            </div>
          </div>

          <div class="col-12 col-md-6">
            <div class="detail-item">
              <div class="text-muted small">Room</div>
              <div>
                {{ selectedRoom?.name || selectedBooking.booking_name || '-' }}
              </div>
            </div>
          </div>

          <div class="col-12 col-md-6">
            <div class="detail-item">
              <div class="text-muted small">Start Date &amp; Time</div>
              <div>{{ formatDisplayDate(selectedBooking.start) }}</div>
            </div>
          </div>

          <div class="col-12 col-md-6">
            <div class="detail-item">
              <div class="text-muted small">Stop Date &amp; Time</div>
              <div>{{ formatDisplayDate(selectedBooking.stop) }}</div>
            </div>
          </div>

          <div class="col-12 col-md-6">
            <div class="detail-item">
              <div class="text-muted small">Booked For</div>
              <div>{{ displayRelation(selectedBooking.create_for_uid) }}</div>
            </div>
          </div>
 
          <div class="col-12 col-md-6">
            <div class="detail-item">
              <div class="text-muted small">Participants</div>
              <div>
                {{
                  selectedBooking.number_of_participant
                  ?? selectedBooking.number_of_participants
                  ?? selectedBooking.capacity
                  ?? '-'
                }}
              </div>
            </div>
          </div>

          <div class="col-12 col-md-6">
            <div class="detail-item">
              <div class="text-muted small">Telephone</div>
              <div>{{ selectedBooking.tel || '-' }}</div>
            </div>
          </div>

          <div class="col-12 col-md-6">
            <div class="detail-item">
              <div class="text-muted small">ສະຖານະ</div>
              <div>
                <span
                  class="badge"
                  :class="roomStateClass(selectedBooking.room_state)"
                >
                  {{ roomStateLabel(selectedBooking.room_state) }}
                </span>
              </div>
            </div>
          </div>

          <div class="col-12">
            <div class="detail-item">
              <div class="text-muted small mb-2">Description</div>
              <div class="text-break description-content">
                {{ selectedBooking.description || '-' }}
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-muted text-center py-5">
          Booking details are unavailable.
        </div>
        <!-- Edit / Cancel: owner or admin only -->
        <div
          v-if="selectedBooking && canManageBooking"
          class="d-flex flex-wrap gap-2 justify-content-end mt-4"
        >
          <button
            type="button"
            v-if="selectedBooking?.room_state === 'draft' && isAdmin"
            class="btn btn-success"
            :disabled="!canManageBooking"
            @click="confirmBooking"
          >
            <i class="bi bi-check-circle me-1"></i>
            Confirm Booking
          </button>
          <button
            type="button"
            v-if="selectedBooking.room_state == 'draft'"
            class="btn btn-outline-primary"
            @click="editBooking"
          >
            <i class="bi bi-pencil-square me-1"></i>
            Edit
          </button>

          <button
            type="button"
            v-if="selectedBooking.room_state == 'confirmed'"
            class="btn btn-outline-primary"
            @click="useBooking"
          >
            <i class="bi bi-pencil-square me-1"></i>
            ນຳໃຊ້
          </button>

          <button
            type="button"
            v-if="selectedBooking.room_state !== 'done' &&
            selectedBooking.room_state !== 'cancelled' &&
            selectedBooking.room_state !== 'using'
            "
            class="btn btn-outline-danger"
            @click="cancelBooking"
          >
            <i class="bi bi-x-circle me-1"></i>
            Cancel Booking
          </button>
        </div>

        <div class="d-flex justify-content-end mt-4">
          <button
            type="button"
            class="btn btn-primary"
            @click="backToRoomList"
          >
            <i class="bi bi-arrow-left me-1"></i>
            Back to Rooms
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Room List Page -->
  <div v-else class="container-fluid py-4">
    <div class="card border-0 shadow-sm">
      <div class="card-body p-3 p-md-4">
        <!-- Loading -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="text-muted mt-3">Loading room types...</p>
        </div>

        <!-- Error -->
        <div v-else-if="errorMessage" class="text-center py-5">
          <i class="bi bi-exclamation-circle text-danger fs-1"></i>
          <p class="text-danger mt-3">{{ errorMessage }}</p>
          <button
            class="btn btn-outline-primary"
            @click="fetchRoomTypes"
          >
            Try Again
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
                <div class="d-flex justify-content-between mb-3">
                  <div class="room-icon">
                    <i class="bi bi-door-closed"></i>
                  </div>
                  <span class="room-number">#{{ index + 1 }}</span>
                </div>

                <h6 class="fw-bold mb-3">
                  {{ room.name || 'Unnamed Room' }}
                </h6>

                <div class="capacity-panel">
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <div class="text-muted small mb-1">
                        <i class="bi bi-people me-1"></i>
                        Room Capacity
                      </div>
                      <div class="capacity-value">
                        {{ room.capacity ?? 0 }}
                        <span class="capacity-unit">people</span>
                      </div>
                    </div>
                    <i class="bi bi-people-fill fs-3"></i>
                  </div>
                </div>

                <div class="d-flex gap-1 mt-3 mb-2">
                  <button
                    class="btn btn-sm btn-outline-secondary"
                    title="Refresh bookings"
                    :disabled="bookingLoading[room.id]"
                    @click="fetchRoomBookings(room.id)"
                  >
                    <i class="bi bi-arrow-clockwise"></i>
                  </button>

                  <button
                    class="btn btn-sm btn-primary"
                    @click="openCreatePopup(room)"
                  >
                    <i class="bi bi-plus-lg me-1"></i>
                    Create
                  </button>

                  <button
                    class="btn btn-sm btn-primary"
                    @click="openListPopup(room)"
                  >
                    <i class="bi bi-list me-1"></i>
                    List
                  </button>
                </div>

                <!-- Related Bookings -->
                <div class="related-bookings">
                  <div
                    v-if="bookingLoading[room.id]"
                    class="text-center py-3"
                  >
                    <div class="spinner-border spinner-border-sm text-primary"></div>
                  </div>

                  <div
                    v-else-if="bookingErrors[room.id]"
                    class="small text-danger"
                  >
                    {{ bookingErrors[room.id] }}
                    <button
                      class="btn btn-sm btn-link"
                      @click="fetchRoomBookings(room.id)"
                    >
                      Retry
                    </button>
                  </div>

                  <template v-else-if="roomBookings[room.id]?.length">
                    <div
                      v-for="booking in roomBookings[room.id]"
                      :key="booking.id"
                      class="mb-2"
                    >
                      <button
                        type="button"
                        class="booking-event-inline text-start w-100"
                        :style="{ color: booking.text_color || '#714b67' }"
                        :title="booking.description || booking.name"
                        @click="openBookingDetail(room, booking)"
                      >
                        <span
                          class="booking-color-dot"
                          :style="{
                            backgroundColor: booking.text_color || '#714b67'
                          }"
                        ></span>

                        <span class="fw-semibold">
                          {{
                            booking.booking_number
                            || booking.name
                            || `#${booking.id}`
                          }}
                        </span>

                        <span>{{ formatBookingPeriod(booking.start, booking.stop) }}</span>

                        <span class="booking-owner">
                          {{ displayRelation(booking.create_for_uid) }}
                        </span>
                      </button>
                    </div>
                  </template>

                  <div v-else class="text-muted small text-center py-3">
                    No bookings for this room.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- No Rooms -->
        <div v-else class="text-center py-5">
          <i class="bi bi-inbox fs-1"></i>
          <h6 class="fw-bold mt-3">
            {{ searchText ? 'No rooms found' : 'No room types yet' }}
          </h6>
          <p class="text-muted small">
            {{
              searchText
              ? 'Try another room name.'
              : 'There are currently no rooms to display.'
            }}
          </p>

          <button
            v-if="searchText"
            class="btn btn-outline-primary btn-sm"
            @click="searchText = ''"
          >
            Clear Search
          </button>

          <button
            v-else
            class="btn btn-outline-primary btn-sm"
            @click="fetchRoomTypes"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Create Booking Modal -->
  <div
    v-if="showCreatePopup"
    class="booking-modal-overlay"
    @click.self="closeCreatePopup" >
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
          :disabled="creating"
          @click="closeCreatePopup"
        ></button>
      </div>

      <form @submit.prevent="submitCreateBooking">
        <div class="row">
          <div class="mb-3 col-12 col-md-6">
            <label for="booking-start" class="form-label">
              Start Date &amp; Time
            </label>
            <input
              id="booking-start"
              type="text"
              class="form-control"
              placeholder="DD/MM/YYYY HH:mm"
              autocomplete="off"
              required
            />
          </div>

          <div class="mb-3 col-12 col-md-6">
            <label for="booking-stop" class="form-label">
              Stop Date &amp; Time
            </label>
            <input
              id="booking-stop"
              type="text"
              class="form-control"
              placeholder="DD/MM/YYYY HH:mm"
              autocomplete="off"
              required
            />
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Telephone</label>
          <input
            v-model="createForm.tel"
            type="tel"
            inputmode="tel"
            class="form-control"
            placeholder="Enter telephone number"
            autocomplete="tel"
            required
            @input="validateTel"
          />
          <div v-if="telError" class="text-danger small mt-1">
            {{ telError }}
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Capacity</label>
          <input
            v-model.number="createForm.capacity"
            type="number"
            min="1"
            step="1"
            class="form-control"
            placeholder="Enter number of participants"
            required
          />

          <div
            v-if="
              selectedRoom?.capacity
              && Number(createForm.capacity) > Number(selectedRoom.capacity)
            "
            class="text-danger small mt-1"
          >
            The number of participants exceeds this room's capacity.
          </div>
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
            :disabled="creating"
            @click="closeCreatePopup"
          >
            Cancel
          </button>

          <button
            type="submit"
            class="btn btn-primary"
            :disabled="creating"
          >
            <span
              v-if="creating"
              class="spinner-border spinner-border-sm me-1"
            ></span>
            {{ creating ? 'Creating...' : 'Create Booking' }}
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- Booking List Modal -->
  <div
    v-if="showListPopup"
    class="booking-modal-overlay"
    @click.self="closeListPopup">
    <div class="booking-modal booking-list-modal">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 class="fw-bold mb-1">Booking List</h5>
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
          @click="closeListPopup"
        ></button>
      </div>

      <div
        v-if="selectedListRoom && bookingLoading[selectedListRoom.id]"
        class="text-center py-4"
      >
        <div class="spinner-border spinner-border-sm text-primary"></div>
        <p class="text-muted small mt-2">Loading bookings...</p>
      </div>

      <div
        v-else-if="selectedListRoom && bookingErrors[selectedListRoom.id]"
        class="alert alert-danger"
      >
        {{ bookingErrors[selectedListRoom.id] }}
        <button
          class="btn btn-sm btn-outline-danger ms-2"
          @click="fetchRoomBookings(selectedListRoom.id)"
        >
          Retry
        </button>
      </div>

      <div
        v-else-if="selectedRoomBookings.length"
        class="booking-list-content"
      >
        <div
          v-for="(booking, index) in selectedRoomBookings"
          :key="booking.id"
          class="card mb-3"
        >
          <div
            class="card-header bg-light d-flex justify-content-between gap-2"
          >
            <span class="fw-bold">
              {{
                booking.booking_number
                || booking.name
                || `Booking #${booking.id}`
              }}
            </span>

            <span class="badge bg-secondary">
              {{
                booking.state
                || booking.confirmed_state
                || booking.row_state
                || 'N/A'
              }}
            </span>
          </div>

          <div class="card-body">
            <div class="row g-3">
              <div class="col-sm-6">
                <div class="text-muted small">No.</div>
                {{ index + 1 }}
              </div>

              <div class="col-sm-6">
                <div class="text-muted small">Booking ID</div>
                {{ booking.id }}
              </div>

              <div class="col-sm-6">
                <div class="text-muted small">Title</div>
                {{ booking.name || '-' }}
              </div>

              <div class="col-sm-6">
                <div class="text-muted small">Booking Number</div>
                {{ booking.booking_number || '-' }}
              </div>

              <div class="col-sm-6">
                <div class="text-muted small">Start</div>
                {{ formatDisplayDate(booking.start) }}
              </div>

              <div class="col-sm-6">
                <div class="text-muted small">Stop</div>
                {{ formatDisplayDate(booking.stop) }}
              </div>

              <div class="col-sm-6">
                <div class="text-muted small">Booked For</div>
                {{ displayRelation(booking.create_for_uid) }}
              </div>

              <div class="col-sm-6">
                <div class="text-muted small">Participants</div>
                {{
                  booking.number_of_participant
                  ?? booking.number_of_participants
                  ?? booking.capacity
                  ?? '-'
                }}
              </div>

              <div class="col-sm-6">
                <div class="text-muted small">Telephone</div>
                {{ booking.tel || '-' }}
              </div>

              <div class="col-12">
                <div class="text-muted small">Description</div>
                <div class="text-break">
                  {{ booking.description || '-' }}
                </div>
              </div>

              <div class="col-12 text-end">
                <button
                  type="button"
                  class="btn btn-sm btn-outline-primary"
                  @click="openBookingDetail(selectedListRoom, booking)"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center text-muted py-5">
        <i class="bi bi-calendar-x fs-1"></i>
        <p class="mt-2">No bookings for this room.</p>
      </div>

      <div class="d-flex justify-content-end gap-2 mt-3">
        <button
          v-if="selectedListRoom"
          class="btn btn-outline-secondary"
          :disabled="bookingLoading[selectedListRoom.id]"
          @click="fetchRoomBookings(selectedListRoom.id)"
        >
          <i class="bi bi-arrow-clockwise me-1"></i>
          Refresh
        </button>

        <button class="btn btn-primary" @click="closeListPopup">
          Close
        </button>
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
  onBeforeUnmount,
  nextTick,
} from 'vue'

import {
  getRoomTypes,
  getRoomBookings,
  CreateBookroom,
  cancelRoomBooking,
  updateRoomBooking,
  confirmRoomBooking,
  useRoomBooking
} from '../api/axios'

import flatpickr from 'flatpickr'
import 'flatpickr/dist/flatpickr.css'
import Swal from 'sweetalert2'

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
const telError = ref('')

const showListPopup = ref(false)
const selectedListRoom = ref(null)

const showBookingDetailPage = ref(false)
const selectedBooking = ref(null)

let startPicker = null
let stopPicker = null

const createForm = reactive({
  booking_id: null,
  name: '',
  start: '',
  stop: '',
  tel: '',
  capacity: '',
  description: '',
})

const selectedRoomBookings = computed(() => {
  const id = selectedListRoom.value?.id
  return id ? roomBookings.value[id] || [] : []
})

const filteredRooms = computed(() => {
  const keyword = searchText.value.trim().toLowerCase()

  return keyword
    ? roomTypes.value.filter(room =>
        String(room.name || '').toLowerCase().includes(keyword)
      )
    : roomTypes.value
})

const displayRelation = (value) => {
  if (
    value === null
    || value === undefined
    || value === false
    || value === ''
  ) {
    return '-'
  }

  if (Array.isArray(value)) {
    return value[1] ?? value[0] ?? '-'
  }

  if (typeof value === 'object') {
    return value.name || value.display_name || value.id || '-'
  }

  return value
}

const unwrapApiResponse = (result) => {
  let value = result?.data ?? result

  // Keep normal API responses containing status and data together.
  if (value && typeof value === 'object' && 'status' in value) {
    return value
  }

  for (let i = 0; i < 3; i++) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      break
    }

    if (value.user && typeof value.user === 'object') {
      value = value.user
      continue
    }

    if (value.profile && typeof value.profile === 'object') {
      value = value.profile
      continue
    }

    if (value.data && typeof value.data === 'object') {
      value = value.data
      continue
    }

    if (Array.isArray(value.results)) {
      return value.results
    }

    if (Array.isArray(value.bookings)) {
      return value.bookings
    }

    if (Array.isArray(value.list_booking)) {
      return value.list_booking
    }

    break
  }

  return value || {}
}

const extractList = (result) => {
  const response = unwrapApiResponse(result)

  if (Array.isArray(response)) return response
  if (Array.isArray(response?.data)) return response.data
  if (Array.isArray(response?.results)) return response.results
  if (Array.isArray(response?.bookings)) return response.bookings
  if (Array.isArray(response?.list_booking)) return response.list_booking

  return []
}

const fetchRoomTypes = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const raw = await getRoomTypes()
    const result = unwrapApiResponse(raw)

    if (result?.status === false) {
      throw new Error(result.message || 'Unable to load room types.')
    }

    const rooms = extractList(raw)
    roomTypes.value = rooms.filter(room => room && room.id)

    await Promise.allSettled(
      roomTypes.value.map(room => fetchRoomBookings(room.id))
    )
  } catch (error) {
    console.error('Fetch room types error:', error)

    roomTypes.value = []

    errorMessage.value =
      error.response?.data?.message
      || error.message
      || 'Failed to connect to the server.'
  } finally {
    loading.value = false
  }
}

const fetchRoomBookings = async (roomId) => {
  if (!roomId) return

  bookingLoading.value[roomId] = true
  bookingErrors.value[roomId] = ''

  try {
    const raw = await getRoomBookings(roomId)
    const result = unwrapApiResponse(raw)

    if (result?.status === false) {
      throw new Error(result.message || 'Unable to load bookings.')
    }

    roomBookings.value[roomId] = extractList(raw)
  } catch (error) {
    console.error(`Fetch bookings for room ${roomId} error:`, error)

    bookingErrors.value[roomId] =
      error.response?.data?.message
      || error.message
      || 'Failed to load bookings.'
  } finally {
    bookingLoading.value[roomId] = false
  }
}

const pad = (value) => String(value).padStart(2, '0')

const formatLocalDateTime = (date) => {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:00`
}

const parseLocalDateTime = (value) => {
  if (!value) return null

  const match = String(value).match(
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/
  )

  if (!match) return null

  const [, year, month, day, hour, minute, second = '0'] = match

  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
    0
  )

  if (
    date.getFullYear() !== Number(year)
    || date.getMonth() !== Number(month) - 1
    || date.getDate() !== Number(day)
    || date.getHours() !== Number(hour)
    || date.getMinutes() !== Number(minute)
  ) {
    return null
  }

  return date
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
const parseOdooDateTime = (value) => {
  if (!value) return null

  const match = String(value).trim().match(
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/
  )

  if (!match) return null

  const [, year, month, day, hour, minute, second = '0'] = match

  // Treat the Odoo datetime as UTC, then display it in the browser's local time.
  const utcDate = new Date(Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second)
  ))

  return new Date(utcDate.getTime() + 7)
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

const initDatePickers = async () => {
  await nextTick()

  startPicker?.destroy()
  stopPicker?.destroy()

  const startElement = document.querySelector('#booking-start')
  const stopElement = document.querySelector('#booking-stop')

  if (!startElement || !stopElement) return
  const now = new Date()
  now.setSeconds(0, 0)

  // Start picker
  startPicker = flatpickr(startElement, {
    enableTime: true,
    time_24hr: true,
    dateFormat: 'd/m/Y H:i',
    minuteIncrement: 5,
    allowInput: false,
    disableMobile: true,
    minDate: now,

    onChange: (dates) => {
      if (!dates.length || !stopPicker) return

      const startDate = dates[0]

      // Do not allow the stop date to be before the start date.
      stopPicker.set('minDate', startDate)

      const currentStop = stopPicker.selectedDates[0]

      // If stop is earlier than or equal to start,
      // automatically set stop to one hour after start.
      if (!currentStop || currentStop <= startDate) {
        const nextHour = new Date(
          startDate.getTime() + 60 * 60 * 1000
        )

        stopPicker.setDate(nextHour, true)
      }

      createForm.start = formatLocalDateTime(startDate)
    },
  })

  // Stop picker
  stopPicker = flatpickr(stopElement, {
    enableTime: true,
    time_24hr: true,
    dateFormat: 'd/m/Y H:i',
    minuteIncrement: 5,
    allowInput: false,
    disableMobile: true,
    minDate: now,

    onChange: (dates) => {
      if (!dates.length) return

      const stopDate = dates[0]
      const startDate = startPicker?.selectedDates[0]

      if (startDate && stopDate <= startDate) {
        const nextHour = new Date(
          startDate.getTime() + 60 * 60 * 1000
        )

        stopPicker.setDate(nextHour, false)
      }

      createForm.stop = formatLocalDateTime(
        stopPicker.selectedDates[0]
      )
    },
  })

  // Restore initial dates from the form.
  const start = parseLocalDateTime(createForm.start)
  const stop = parseLocalDateTime(createForm.stop)

  if (start) {
    startPicker.setDate(start, false)
    stopPicker.set('minDate', start)
  }

  if (stop && start && stop <= start) {
    stopPicker.setDate(
      new Date(start.getTime() + 60 * 60 * 1000),
      false
    )
  } else if (stop) {
    stopPicker.setDate(stop, false)
  }

  // Ensure the form values match the displayed dates.
  if (startPicker.selectedDates[0]) {
    createForm.start = formatLocalDateTime(
      startPicker.selectedDates[0]
    )
  }

  if (stopPicker.selectedDates[0]) {
    createForm.stop = formatLocalDateTime(
      stopPicker.selectedDates[0]
    )
  }
}

const validateTel = () => {
  const digits = String(createForm.tel || '').replace(/\D/g, '')

  telError.value =
    digits.length > 0 && digits.length < 8
      ? 'Telephone number must contain at least 8 digits.'
      : ''
}

const openCreatePopup = async (room) => {
  selectedRoom.value = room
  createError.value = ''
  telError.value = ''

  const now = new Date()
  now.setSeconds(0, 0)
  now.setMinutes(Math.ceil(now.getMinutes() / 5) * 5)

  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000)

  Object.assign(createForm, {
    booking_id: Number(room.id),
    name: '',
    start: formatLocalDateTime(now),
    stop: formatLocalDateTime(oneHourLater),
    tel: '',
    capacity: '',
    description: '',
  })

  showCreatePopup.value = true
  await initDatePickers()
}

const closeCreatePopup = () => {
  showCreatePopup.value = false

  startPicker?.destroy()
  stopPicker?.destroy()

  startPicker = null
  stopPicker = null

  selectedRoom.value = null
  createError.value = ''
  telError.value = ''
}

const showError = async (title, message) => {
  await Swal.fire({
    icon: 'error',
    title,
    text: String(message || 'An unexpected error occurred.'),
    heightAuto: false,
    customClass: {
      container: 'booking-swal-container',
    },
  })
}

const submitCreateBooking = async () => {
  if (creating.value) return

  validateTel()

  if (!createForm.tel || !String(createForm.tel).trim()) {
    telError.value = 'Telephone number is required.'
    return
  }

  if (telError.value) return

  const start = parseLocalDateTime(createForm.start)
  const stop = parseLocalDateTime(createForm.stop)

  if (!start || !stop) {
    createError.value = 'Please select valid start and stop dates.'
    return
  }

  if (start.getTime() < Date.now() - 60_000) {
    createError.value = 'Start date and time cannot be in the past.'
    return
  }

  if (stop <= start) {
    createError.value =
      'Stop date and time must be later than start date and time.'
    return
  }

  const participants = Number(createForm.capacity)

  if (!Number.isInteger(participants) || participants < 1) {
    createError.value =
      'Participants must be a whole number of at least 1.'
    return
  }

  if (
    selectedRoom.value?.capacity
    && participants > Number(selectedRoom.value.capacity)
  ) {
    createError.value =
      `This room can accommodate at most ${selectedRoom.value.capacity} people.`
    return
  }

  if (!createForm.booking_id) {
    createError.value = 'Please select a room.'
    return
  }

  creating.value = true
  createError.value = ''

  const payload = {
    booking_id: Number(createForm.booking_id),
    name: String(createForm.name || '').trim(), 
    start: formatLocalDateTime(start),
    stop: formatLocalDateTime(stop),
    description: String(createForm.description || '').trim(),
    tel: String(createForm.tel).trim(),
    capacity: participants,
  }

  const roomId = payload.booking_id

  try {
    const raw = await CreateBookroom(payload)
    const result = unwrapApiResponse(raw)

    console.log('Create room booking response:', raw)

    if (result ) {  
    closeCreatePopup() 
    await Swal.fire({
      icon: 'success',
      title: 'Booking request submitted',
      text: result.message || 'Your room booking request was submitted.',
      timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false,
      heightAuto: false,
      customClass: {
        container: 'booking-swal-container',
      },
    }) 
    await fetchRoomBookings(roomId)
    }
  } catch (error) {
    console.error('Create room booking error:', error)

    createError.value =
      error.response?.data?.message
      || error.response?.data?.error?.data?.message
      || error.message
      || 'Failed to create booking.'

    await showError('Unable to create booking', createError.value)
  } finally {
    creating.value = false
  }
}

const openListPopup = async (room) => {
  selectedListRoom.value = room
  showListPopup.value = true

  await fetchRoomBookings(room.id)
}

const closeListPopup = () => {
  showListPopup.value = false
  selectedListRoom.value = null
}

const openBookingDetail = (room, booking) => {
  if (!room?.id || !booking?.id) {
    console.error('Room ID or booking ID is missing', {
      room,
      booking,
    })
    return
  }

  selectedRoom.value = room
  selectedListRoom.value = room
  selectedBooking.value = booking

  showListPopup.value = false
  showCreatePopup.value = false
  showBookingDetailPage.value = true
}

const backToRoomList = () => {
  showBookingDetailPage.value = false
  selectedBooking.value = null
  selectedRoom.value = null
  selectedListRoom.value = null
}
 
const isAdmin = ref(false)
const currentUserId = ref(0)

const getRelationId = (value) => {
  if (Array.isArray(value)) {
    return Number(value[0]) || 0
  }

  if (value && typeof value === 'object') {
    return Number(
      value.id ??
      value.uid ??
      value.user_id ??
      value.odoo_uid ??
      value.res_id ??
      0
    ) || 0
  }

  // Odoo may return false/null when the relation is empty.
  return Number(value) || 0
}

const parseStoredValue = (key, fallback = null) => {
  const raw = localStorage.getItem(key)
  if (raw === null || raw === '') return fallback

  try {
    return JSON.parse(raw)
  } catch {
    return raw
  }
}

const getStoredUserId = () => {
  const user = parseStoredValue('user', null)

  // Support common response shapes from the SmartBooking login/profile API.
  const candidates = [
    user?.id,
    user?.user_id,
    user?.uid,
    user?.odoo_uid,
    user?.data?.id,
    user?.user?.id,
    parseStoredValue('odoo_uid', null),
    parseStoredValue('user_id', null),
  ]

  for (const candidate of candidates) {
    const id = getRelationId(candidate)
    if (id > 0) return id
  }

  return 0
}

const getGroupName = (group) => {
  if (typeof group === 'string') return group
  if (typeof group === 'number') return ''
  if (group && typeof group === 'object') {
    return String(
      group.xml_id ??
      group.xmlid ??
      group.external_id ??
      group.name ??
      ''
    )
  }
  return ''
}

const loadBookingPermissions = () => {
  const user = parseStoredValue('user', null)
  const storedGroups = parseStoredValue('groups_id', [])
  const userGroups = user?.groups_id ?? user?.groups ?? []

  const groups = [
    ...(Array.isArray(storedGroups) ? storedGroups : [storedGroups]),
    ...(Array.isArray(userGroups) ? userGroups : [userGroups]),
  ]

  currentUserId.value = getStoredUserId()

  const adminGroupNames = new Set([
    'base.group_system',
    'base.group_erp_manager',
    'booking.group_kc_book_manager',
    'booking.group_kc_vehicle_manager',
  ])

  isAdmin.value = groups.some((group) => {
    const groupName = getGroupName(group).trim()
    return adminGroupNames.has(groupName)
  })

  console.log('Booking permissions loaded:', {
    currentUserId: currentUserId.value,
    isAdmin: isAdmin.value,
    groupNames: groups.map(group => getGroupName(group)),
  })

  return isAdmin.value
}

const canManageBooking = computed(() => {
  const booking = selectedBooking.value
  if (!booking) return false

  const currentId = Number(currentUserId.value) || 0
  const bookedForId = getRelationId(booking.create_for_uid)
  const createdById = getRelationId(booking.create_uid)

  // Admins can manage any booking. Otherwise, allow the booked-for user
  // or the user who created the booking to manage it.
  return isAdmin.value || (
    currentId > 0 &&
    (bookedForId === currentId || createdById === currentId)
  )
})


// Use VITE_API_BASE_URL in .env if your Odoo API is hosted on another domain.
const ROOM_API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'https://api.khouanchay.com'
).replace(/\/+$/, '')

const getBookingApiToken = () => {
  const token = localStorage.getItem('user-token')
  return token ? String(token).replace(/^Bearer\s+/i, '').trim() : ''
}

const requestRoomBookingApi = async (path, method, payload) => {
  const token = getBookingApiToken()
  if (!token) {
    throw new Error('Your login token is missing. Please sign in again.')
  }

  const response = await fetch(`${ROOM_API_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: payload === undefined ? undefined : JSON.stringify(payload),
  })

  let result = {}
  const responseText = await response.text()
  try {
    result = responseText ? JSON.parse(responseText) : {}
  } catch {
    result = { message: responseText }
  }

  if (!response.ok || result?.status === false) {
    throw new Error(
      result?.message ||
      result?.error?.message ||
      `Request failed (${response.status})`
    )
  }

  return result
}

const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;')

const toDateTimeLocalValue = (value) => {
  if (!value) return ''
  const parsed = parseLocalDateTime(String(value).replace('T', ' '))
  if (parsed) {
    return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}T${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const editBooking = async () => {
  const booking = selectedBooking.value
  if (!booking?.id) {
    await showError('Cannot edit booking', 'Booking ID is missing.')
    return
  }
  if (!canManageBooking.value) {
    await showError('Permission denied', 'Only the booking owner or an administrator can edit this booking.')
    return
  }

  const currentStart = parseOdooDateTime(booking.start)
  const currentStop = parseOdooDateTime(booking.stop)
  const currentParticipants = Number(
    booking.number_of_participant ??
    booking.number_of_participants ??
    booking.capacity ??
    1
  )
  const currentTel = booking.tel || ''
  const currentDescription = booking.description || ''
  const currentName = booking.name || ''

  let editStartPicker = null
  let editStopPicker = null
  
  const result = await Swal.fire({
    title: 'Edit Room Booking',
    width: 650,
     html: `
      <div class="text-start">

        <label for="edit-booking-name" class="form-label">
          Title
        </label>
        <input
          id="edit-booking-name"
          class="form-control mb-3"
          value="${escapeHtml(currentName)}"
        />

        <label for="edit-booking-start" class="form-label">
          Start Date &amp; Time
        </label>
        <input
          id="edit-booking-start"
          type="text"
          class="form-control mb-3"
          placeholder="DD/MM/YYYY HH:mm"
          autocomplete="off"
          readonly
        />

        <label for="edit-booking-stop" class="form-label">
          Stop Date &amp; Time
        </label>
        <input
          id="edit-booking-stop"
          type="text"
          class="form-control mb-3"
          placeholder="DD/MM/YYYY HH:mm"
          autocomplete="off"
          readonly
        />

        <label for="edit-booking-tel" class="form-label">
          Telephone
        </label>
        <input
          id="edit-booking-tel"
          type="tel"
          class="form-control mb-3"
          value="${escapeHtml(currentTel)}"
        />

        <label for="edit-booking-participants" class="form-label">
          Participants
        </label>
        <input
          id="edit-booking-participants"
          type="number"
          min="1"
          step="1"
          class="form-control mb-3"
          value="${escapeHtml(currentParticipants)}"
        />

        <label for="edit-booking-description" class="form-label">
          Description
        </label>
        <textarea
          id="edit-booking-description"
          class="form-control"
          rows="3"
        >${escapeHtml(currentDescription)}</textarea>

      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Save Changes',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#714b67',
    heightAuto: false,
    customClass: { container: 'booking-swal-container' },
    didOpen: () => {
      const startElement = document.getElementById('edit-booking-start')
      const stopElement = document.getElementById('edit-booking-stop')

      // Match the Create Booking date/time picker.
      editStartPicker = flatpickr(startElement, {
        enableTime: true,
        time_24hr: true,
        dateFormat: 'd/m/Y H:i',
        minuteIncrement: 5,
        allowInput: false,
        disableMobile: true,
        minDate: 'today',
        defaultDate: currentStart ? new Date(currentStart) : null,

        onChange: (dates) => {
          if (!dates.length || !editStopPicker) return

          const startDate = dates[0]

          // Stop must be on or after the selected start date.
          editStopPicker.set('minDate', startDate)

          const currentStopDate =
            editStopPicker.selectedDates[0]

          // Automatically move stop forward if it is no longer valid.
          if (!currentStopDate || currentStopDate <= startDate) {
            const nextHour = new Date(
              startDate.getTime() + 60 * 60 * 1000
            )

            editStopPicker.setDate(nextHour, true)
          }
        }
      })
      editStopPicker = flatpickr(stopElement, {
        enableTime: true,
        time_24hr: true,
        dateFormat: 'd/m/Y H:i',
        minuteIncrement: 5,
        allowInput: false,
        disableMobile: true,
        minDate: new Date(),
        defaultDate: currentStop ? new Date(currentStop) : null,
        onChange: (dates) => {
          if (!dates.length || !editStartPicker) return

          const stopDate = dates[0]
          const startDate = editStartPicker.selectedDates[0]

          if (startDate && stopDate <= startDate) {
            Swal.showValidationMessage(
              'Stop date and time must be later than start date and time.'
            )
          } else {
            Swal.resetValidationMessage()
          }
        }
      })

      // Preserve the existing start and stop values.
      const initialStart = editStartPicker.selectedDates[0]
      const initialStop = editStopPicker.selectedDates[0]

      if (initialStart) {
        editStopPicker.set('minDate', initialStart)
      }

      // If the saved stop is invalid, adjust it to one hour after start.
      if (
        initialStart &&
        (!initialStop || initialStop <= initialStart)
      ) {
        editStopPicker.setDate(
          new Date(initialStart.getTime() + 60 * 60 * 1000),
          false
        )
      }
    },

    willClose: () => {
      editStartPicker?.destroy()
      editStopPicker?.destroy()

      editStartPicker = null
      editStopPicker = null
    },

    preConfirm: () => {
      const name =
        document.getElementById('edit-booking-name')?.value?.trim() || ''

      const tel =
        document.getElementById('edit-booking-tel')?.value?.trim() || ''

      const participants = Number(
        document.getElementById('edit-booking-participants')?.value
      )

      const description =
        document.getElementById('edit-booking-description')?.value?.trim() || ''

      const startDate = editStartPicker?.selectedDates[0]
      const stopDate = editStopPicker?.selectedDates[0]

      const digits = tel.replace(/\D/g, '')

      if (!startDate || Number.isNaN(startDate.getTime())) {
        Swal.showValidationMessage(
          'Please select a valid start date and time.'
        )
        return false
      }

      // if (startDate.getTime() < Date.now() - 60_000) {
      //   Swal.showValidationMessage(
      //     'Start date and time cannot be in the past.'
      //   )
      //   return false
      // }

      if (
        !stopDate ||
        Number.isNaN(stopDate.getTime()) ||
        stopDate <= startDate
      ) {
        Swal.showValidationMessage(
          'Stop date and time must be later than start date and time.'
        )
        return false
      }

      if (digits.length < 8) {
        Swal.showValidationMessage(
          'Telephone number must contain at least 8 digits.'
        )
        return false
      }

      if (!Number.isInteger(participants) || participants < 1) {
        Swal.showValidationMessage(
          'Participants must be a whole number of at least 1.'
        )
        return false
      }

      if (
        selectedRoom.value?.capacity &&
        participants > Number(selectedRoom.value.capacity)
      ) {
        Swal.showValidationMessage(
          `This room can accommodate at most ${selectedRoom.value.capacity} people.`
        )
        return false
      }

      return {
        name,

        // Convert local date/time to ISO format for the API.
        
        start: formatLocalDateTime(startDate),
        stop: formatLocalDateTime(stopDate),

        tel,
        capacity: participants,
        number_of_participant: participants,
        description
      }
    }
  })

  if (!result.isConfirmed || !result.value) return

  try {
    Swal.fire({
      title: 'Saving changes...',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      heightAuto: false,
      customClass: {
        container: 'booking-swal-container'
      },
      didOpen: () => Swal.showLoading()
    })

    const payload = {
      id: Number(booking.id),
      booking_id: Number(
        booking.booking_id ||
        selectedRoom.value?.id ||
        selectedListRoom.value?.id
      ),
      ...result.value
    }

    const response = await updateRoomBooking(payload)

    const roomId =
      selectedRoom.value?.id ||
      selectedListRoom.value?.id ||
      Number(payload.booking_id)

    // Refresh the room's bookings from Odoo.
    if (roomId) {
      await fetchRoomBookings(roomId)
    }

    // Close the booking detail page after the refresh.
    showBookingDetailPage.value = false
    selectedBooking.value = null
    selectedRoom.value = null
    selectedListRoom.value = null

    await Swal.fire({
      icon: 'success',
      title: 'Booking updated',
      text: response?.message || 'Your booking changes have been saved.',
      timer: 1800,
      showConfirmButton: false,
      heightAuto: false,
      customClass: {
        container: 'booking-swal-container'
      }
    })

  } catch (error) {
    console.error('Edit room booking error:', error)

    await showError(
      'Unable to update booking',
      error.message
    )
  }
} 

const cancelBooking = async () => {
  const booking = selectedBooking.value
  if (!booking?.id) {
    await showError('Cannot cancel booking', 'Booking ID is missing.')
    return
  }
  if (!canManageBooking.value) {
    await showError('Permission denied', 'Only the booking owner or an administrator can cancel this booking.')
    return
  }

  const confirmation = await Swal.fire({
    icon: 'warning',
    title: 'Cancel this booking?',
    text: `Are you sure you want to cancel ${booking.booking_number || booking.name || `booking #${booking.id}`}?`,
    showCancelButton: true,
    confirmButtonText: 'Yes, cancel booking',
    cancelButtonText: 'Keep booking',
    confirmButtonColor: '#dc3545',
    heightAuto: false,
    customClass: { container: 'booking-swal-container' },
  })

  if (!confirmation.isConfirmed) return

  try {
    Swal.fire({
      title: 'Cancelling booking...',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      heightAuto: false,
      customClass: { container: 'booking-swal-container' },
      didOpen: () => Swal.showLoading(),
    })

    const response = await cancelRoomBooking(Number(booking.id))

    const roomId = selectedRoom.value?.id || selectedListRoom.value?.id
    if (roomId) await fetchRoomBookings(roomId)

    showBookingDetailPage.value = false
    selectedBooking.value = null
    selectedRoom.value = null
    selectedListRoom.value = null

    await Swal.fire({
      icon: 'success',
      title: 'Booking cancelled',
      text: response?.message || 'The booking has been cancelled.',
      timer: 1800,
      showConfirmButton: false,
      heightAuto: false,
      customClass: { container: 'booking-swal-container' },
    })
  } catch (error) {
    console.error('Cancel room booking error:', error)
    await showError('Unable to cancel booking', error.message)
  }
}
const useBooking = async () => {
  const booking = selectedBooking.value
  if (!booking?.id) {
    await showError('Cannot use booking', 'Booking ID is missing.')
    return
  }
  if (!canManageBooking.value) {
    await showError('Permission denied', 'Only the booking owner or an administrator can use this booking.')
    return
  }

  const confirmation = await Swal.fire({
    icon: 'warning',
    title: 'Use this booking?',
    text: `Are you sure you want to use ${booking.booking_number || booking.name || `booking #${booking.id}`}?`,
    showCancelButton: true,
    confirmButtonText: 'Yes, use booking',
    cancelButtonText: 'Keep booking',
    confirmButtonColor: '#dc3545',
    heightAuto: false,
    customClass: { container: 'booking-swal-container' },
  })

  if (!confirmation.isConfirmed) return

  try {
    Swal.fire({
      title: 'Using booking...',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      heightAuto: false,
      customClass: { container: 'booking-swal-container' },
      didOpen: () => Swal.showLoading(),
    })

    const response = await useRoomBooking(Number(booking.id))

    const roomId = selectedRoom.value?.id || selectedListRoom.value?.id
    if (roomId) await fetchRoomBookings(roomId)

    showBookingDetailPage.value = false
    selectedBooking.value = null
    selectedRoom.value = null
    selectedListRoom.value = null

    await Swal.fire({
      icon: 'success',
      title: 'Booking cancelled',
      text: response?.message || 'The booking has been cancelled.',
      timer: 1800,
      showConfirmButton: false,
      heightAuto: false,
      customClass: { container: 'booking-swal-container' },
    })
  } catch (error) {
    console.error('Cancel room booking error:', error)
    await showError('Unable to cancel booking', error.message)
  }
}
 
const confirmBooking = async () => {
  const booking = selectedBooking.value

  if (!booking?.id) {
    await showError(
      'Cannot confirm booking',
      'Booking ID is missing.'
    )
    return
  }

  if (!canManageBooking.value) {
    await showError(
      'Permission denied',
      'Only the booking owner or an administrator can confirm this booking.'
    )
    return
  }

  if (booking.room_state !== 'draft') {
    await showError(
      'Cannot confirm booking',
      'Only bookings awaiting approval can be confirmed.'
    )
    return
  }

  const confirmation = await Swal.fire({
    icon: 'question',
    title: 'Confirm this booking?',
    text: `Are you sure you want to confirm ${
      booking.booking_number ||
      booking.name ||
      `booking #${booking.id}`
    }?`,
    showCancelButton: true,
    confirmButtonText: 'Yes, confirm booking',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#198754',
    heightAuto: false,
    customClass: {
      container: 'booking-swal-container'
    }
  })

  if (!confirmation.isConfirmed) return

  try {
    Swal.fire({
      title: 'Confirming booking...',
      text: 'Please wait.',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      heightAuto: false,
      customClass: {
        container: 'booking-swal-container'
      },
      didOpen: () => Swal.showLoading()
    })

    // Call the Odoo room booking confirmation endpoint.
    const response =  await confirmRoomBooking(Number(booking.id))

    // Refresh the room bookings.
    const roomId =
      selectedRoom.value?.id ||
      selectedListRoom.value?.id ||
      getRelationId(booking.booking_id)

    if (roomId) {
      await fetchRoomBookings(roomId)
    }

    // Update the selected booking with refreshed server data.
    const refreshedBooking = roomId
      ? (roomBookings.value[roomId] || []).find(
          item => Number(item.id) === Number(booking.id)
        )
      : null

    if (refreshedBooking) {
      selectedBooking.value = refreshedBooking
    } else {
      selectedBooking.value = {
        ...booking,
        room_state: 'confirmed'
      }
    }

    await Swal.fire({
      icon: 'success',
      title: 'Booking confirmed',
      text: response?.message ||
        'The room booking has been confirmed successfully.',
      confirmButtonText: 'OK',
      confirmButtonColor: '#198754',
      heightAuto: false,
      customClass: {
        container: 'booking-swal-container'
      }
    })

  } catch (error) {
    console.error('Confirm room booking error:', error)

    await showError(
      'Unable to confirm booking',
      error.message || 'Failed to confirm the room booking.'
    )
  }
}

onMounted(async () => {
  loadBookingPermissions()
  await fetchRoomTypes() 
})

onBeforeUnmount(() => {
  startPicker?.destroy()
  stopPicker?.destroy()
})
</script>

<style scoped>
.room-icon {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: #f3edf2;
  color: #714b67;
  font-size: 22px;
}

.room-number {
  color: #714b67;
  font-weight: 600;
}

.capacity-panel {
  padding: 14px;
  border-radius: 10px;
  background: #f8f6f8;
}

.capacity-value {
  font-size: 22px;
  font-weight: 700;
}

.capacity-unit {
  font-size: 12px;
  font-weight: 400;
  color: #777;
}

.related-bookings {
  border-top: 1px solid #eee8ef;
  padding-top: 12px;
  margin-top: 8px;
}

.booking-event-inline {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  padding: 7px 8px;
  border: 1px solid currentColor;
  border-radius: 8px;
  background: #fff;
  font-size: 11px;
  overflow-wrap: anywhere;
  cursor: pointer;
}

.booking-owner {
  width: 100%;
  padding-left: 14px;
  color: #666;
}

.booking-color-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.detail-item {
  height: 100%;
  padding: 14px 16px;
  border: 1px solid #eee8ef;
  border-radius: 10px;
  background: #fff;
  overflow-wrap: anywhere;
}

.description-content {
  min-height: 50px;
  white-space: pre-wrap;
  line-height: 1.6;
}

.detail-item .text-muted {
  margin-bottom: 6px;
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
}

.booking-modal {
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 24px;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 15px 50px rgb(0 0 0 / 20%);
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

.booking-modal .form-control:focus {
  border-color: #714b67;
  box-shadow: 0 0 0 0.2rem rgb(113 75 103 / 15%);
}

/* SweetAlert and Flatpickr render outside this component's scoped DOM. */
:global(.swal2-container.booking-swal-container) {
  z-index: 30000 !important;
}

/* Keep the date picker above the SweetAlert popup */
:global(.flatpickr-calendar) {
  z-index: 30010 !important;
  pointer-events: auto !important;
}

/* Make edit date fields look clickable */
:global(#edit-booking-start),
:global(#edit-booking-stop) {
  cursor: pointer !important;
  background-color: #fff !important;
}

@media (max-width: 576px) {
  .booking-modal-overlay {
    align-items: center;
    padding: 10px;
  }

  .booking-modal {
    max-height: 92dvh;
    padding: 18px;
  }

  .booking-list-content {
    max-height: 55dvh;
  }
}
</style> 