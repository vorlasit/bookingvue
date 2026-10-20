
<template>
  <div class="container-fluid py-4">
    <!-- Header -->
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div>
        <h4 class="fw-bold mb-1">Room Booking Details</h4>
        <p class="text-muted mb-0">
          View booking information
        </p>
      </div>
      

      <button
        class="btn btn-outline-secondary"
        @click="goBack"
      >
        <i class="bi bi-arrow-left me-1"></i>
        Back to bookings
      </button>
    </div>
    

<div v-if="actionLoading" class="text-muted small mt-3">
  <span class="spinner-border spinner-border-sm me-2"></span>
  Processing booking...
</div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
      <p class="text-muted mt-2">Loading booking details...</p>
    </div>

    <!-- Error -->
    <div v-else-if="errorMessage" class="alert alert-danger">
      {{ errorMessage }}
    </div>

    <!-- Booking detail -->
    <div v-else-if="booking" class="card border-0 shadow-sm">
      <div class="card-header bg-white py-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div>
          <h5 class="fw-bold mb-1">
            {{ booking.name || 'Room Booking' }}
          </h5>
          <span class="text-muted small">
            Booking No. {{ booking.booking_number || `#${booking.id}` }}
          </span>
        </div>
        <div class="d-flex flex-wrap gap-2 mt-4 pt-3 border-top">
  <button
    v-if="booking.room_state === 'draft'"
    class="btn btn-success"
    :disabled="actionLoading"
    @click="handleConfirm"
  >
    <i class="bi bi-check-circle me-1"></i>
    Confirm Booking
  </button>

  <button
    v-if="booking.room_state === 'using'"
    class="btn btn-primary"
    :disabled="actionLoading"
    @click="handleDone"
  >
    <i class="bi bi-check2-all me-1"></i>
    Mark as Done
  </button>

  <button
    v-if="!['draft', 'confirmed'].includes(booking.room_state)"
    class="btn btn-outline-danger"
    :disabled="actionLoading"
    @click="handleCancel"
  >
    <i class="bi bi-x-circle me-1"></i>
    Cancel Booking
  </button>

  <button
    class="btn btn-danger ms-md-auto"
    :disabled="actionLoading"
    @click="handleDelete"
  >
    <i class="bi bi-trash me-1"></i>
    Delete Booking
  </button>
</div>

        <span
          class="badge"
          :class="statusClass(booking.confirmed_state)"
        >
          {{ formatStatus(booking.room_state) }}
        </span>
      </div>

      <div class="card-body p-4">
        <h6 class="fw-bold mb-3">Booking Information</h6>

        <div class="row g-4">
          <div class="col-12 col-md-6">
            <div class="detail-label">Booking Name</div>
            <div class="detail-value">{{ booking.name || '-' }}</div>
          </div>

          <div class="col-12 col-md-6">
            <div class="detail-label">Room</div>
            <div class="detail-value">{{ booking.booking_name || '-' }}</div>
          </div>

          <div class="col-12 col-md-6">
            <div class="detail-label">Start Date & Time</div>
            <div class="detail-value">{{ formatDate(booking.start) }}</div>
          </div>

          <div class="col-12 col-md-6">
            <div class="detail-label">End Date & Time</div>
            <div class="detail-value">{{ formatDate(booking.stop) }}</div>
          </div>

          <div class="col-12 col-md-6">
            <div class="detail-label">Requester</div>
            <div class="detail-value">
              {{ booking.rider_name || booking.create_for_uid || '-' }}
            </div>
          </div>

          <div class="col-12 col-md-6">
            <div class="detail-label">Number of Participants</div>
            <div class="detail-value">
              {{ booking.number_of_participants ?? '-' }}
            </div>
          </div>

          <div class="col-12">
            <div class="detail-label">Description</div>
            <div class="detail-value description">
              {{ booking.description || '-' }}
            </div>
          </div>

          <div class="col-12 col-md-6">
            <div class="detail-label">Booking ID</div>
            <div class="detail-value">{{ booking.id }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="alert alert-warning">
      Booking not found.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import { getRoomBookingManagement,
  updateRoomBooking,
  confirmRoomBooking,
  cancelRoomBooking,
  doneRoomBooking,
  deleteRoomBooking, } from '../api/axios'

const route = useRoute()
const router = useRouter()

const booking = ref(null)
const loading = ref(false)
const errorMessage = ref('')

const goBack = () => {
  router.push('/room-booking-management')
}

const loadBookingDetail = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const result = await getRoomBookingManagement()
    const records = Array.isArray(result.data) ? result.data : []

    booking.value = records.find(
      item => String(item.id) === String(route.params.id)
    ) || null

    if (!booking.value) {
      errorMessage.value = 'Booking not found.'
    }
  } catch (error) {
    console.error('Failed to load booking detail:', error)

    errorMessage.value =
      error.response?.data?.message ||
      error.message ||
      'Unable to load booking details.'
  } finally {
    loading.value = false
  }
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

const formatStatus = (status) => {
  const labels = {
    draft: 'ສົ່ງຄຳຂໍແລ້ວ ລໍຖ້າອະນຸມັດ',
    confirmed: 'ອະນຸມັດແລ້ວ',
    using: 'ໃຊ້ງານຢູ່',
    done: 'ໃຊ້ງານສຳເລັດ',
    cancelled: 'ຍົກເລີກ',
  }

  return labels[status] || status || 'Unknown'
}

const statusClass = (status) => {
  const classes = {
    draft: 'text-bg-secondary',
    waiting_for_approval: 'text-bg-warning',
    approved: 'text-bg-success',
    done: 'text-bg-primary',
    cancelled: 'text-bg-danger',
  }

  return classes[status] || 'text-bg-secondary'
}
const actionLoading = ref(false)

const showActionResult = async (success, message) => {
  await Swal.fire({
    icon: success ? 'success' : 'error',
    title: success ? 'Success' : 'Error',
    text: message,
    confirmButtonText: 'OK',
  })
}

const runBookingAction = async (apiFunction, successMessage) => {
  if (!booking.value?.id || actionLoading.value) return false

  actionLoading.value = true

  try {
    const response = await apiFunction(booking.value.id)
 
    if (response?.status !== true) {
      await showActionResult(
        false,
        response?.message || 'Unable to process this booking.'
      )
      return false
    }

    await showActionResult(
      true,
      response.message || successMessage
    )

    await loadBookingDetail()
    return true
  } catch (error) {
    console.error('Room booking action failed:', error)

    await showActionResult(
      false,
      error.response?.data?.message ||
        error.response?.data?.error?.data?.message ||
        error.message ||
        'Unable to connect to the server.'
    )

    return false
  } finally {
    actionLoading.value = false
  }
}

const confirmAction = async (title, text, apiFunction, successMessage) => {
  const answer = await Swal.fire({
    icon: 'question',
    title,
    text,
    showCancelButton: true,
    confirmButtonText: 'Yes, continue',
    cancelButtonText: 'No',
    reverseButtons: true,
  })

  if (!answer.isConfirmed) return

  await runBookingAction(apiFunction, successMessage)
}

const handleConfirm = () => {
  confirmAction(
    'Confirm this booking?',
    'This booking will be approved.',
    confirmRoomBooking,
    'Booking confirmed successfully.'
  )
}

const handleCancel = () => {
  confirmAction(
    'Cancel this booking?',
    'This booking will be cancelled.',
    cancelRoomBooking,
    'Booking cancelled successfully.'
  )
}

const handleDone = () => {
  confirmAction(
    'Mark booking as done?',
    'This booking will be marked as completed.',
    doneRoomBooking,
    'Booking marked as done.'
  )
}

const handleDelete = async () => {
  const answer = await Swal.fire({
    icon: 'warning',
    title: 'Delete this booking?',
    text: 'This action cannot be undone.',
    showCancelButton: true,
    confirmButtonText: 'Delete',
    cancelButtonText: 'Keep booking',
    confirmButtonColor: '#dc3545',
    reverseButtons: true,
  })

  if (!answer.isConfirmed || !booking.value?.id) return

  actionLoading.value = true

  try {
    const response = await deleteRoomBooking(booking.value.id)
    const result = response.data

    if (result?.status !== true) {
      await showActionResult(
        false,
        result?.message || 'Unable to delete booking.'
      )
      return
    }

    await Swal.fire({
      icon: 'success',
      title: 'Deleted',
      text: result.message || 'Booking deleted successfully.',
      confirmButtonText: 'OK',
    })

    router.push('/room-booking-management')
  } catch (error) {
    console.error('Delete room booking error:', error)

    await showActionResult(
      false,
      error.response?.data?.message ||
        error.response?.data?.error?.data?.message ||
        error.message ||
        'Unable to delete booking.'
    )
  } finally {
    actionLoading.value = false
  }
}
onMounted(loadBookingDetail)
</script>

<style scoped>
.detail-label {
  color: #6c757d;
  font-size: 0.875rem;
  margin-bottom: 0.35rem;
}

.detail-value {
  font-weight: 500;
  overflow-wrap: anywhere;
}

.description {
  white-space: pre-wrap;
}
</style> 