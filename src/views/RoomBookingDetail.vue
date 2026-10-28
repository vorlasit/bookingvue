
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
  class="btn btn-outline-primary"
  :disabled="actionLoading"
  @click="handleEdit"
>
  <i class="bi bi-pencil-square me-1"></i>
  Edit Booking
</button>
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
    v-if="booking.room_state === 'confirmed'"
    class="btn btn-success"
    :disabled="actionLoading"
    @click="handleUsing"
  >
    <i class="bi bi-check-circle me-1"></i>
    Use Booking
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
    v-if="!['draft', 'confirmed','cancelled'].includes(booking.room_state)"
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
    v-if="groups_ids.includes('booking.group_kc_book_user')"
    @click="handleDelete"
  >
    <i class="bi bi-trash me-1"></i>
    Delete Booking
  </button>
</div>

        <span
          class="badge"
          :class="statusClass(booking.room_state)"
        >
          {{ formatStatus(booking.room_state) }}
        </span>
      </div>


      <div class="card-body p-4">
        <h6 class="fw-bold mb-3">Booking Information</h6>

        <div class="row g-4">
          <div class="col-12 col-md-6 mb-3">
            <div class="detail-label">Booking Number</div>
            <div class="detail-value">{{ booking.booking_number || '-' }}</div>
          </div> 
        </div> 

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
// ========================================
// User Group Permissions
// ========================================
const groups_ids = ref([])

const loadUserGroups = () => {
  const rawGroups = localStorage.getItem('groups_id')

  if (!rawGroups) {
    groups_ids.value = []
    console.warn('No groups_id found in localStorage')
    return
  }

  try {
    const parsed = JSON.parse(rawGroups)

    if (Array.isArray(parsed)) {
      groups_ids.value = parsed
        .map(group => {
          if (typeof group === 'string') {
            return group
          }

          if (group && typeof group === 'object') {
            return group.xml_id || group.external_id || group.name || ''
          }

          return ''
        })
        .filter(Boolean)
    } else {
      groups_ids.value = []
    }
  } catch (error) {
    // Support comma-separated group IDs if the value isn't JSON.
    groups_ids.value = rawGroups
      .split(',')
      .map(group => group.trim())
      .filter(Boolean)
  }

  console.log('Current user groups:', groups_ids.value)
}


// Check whether the user belongs to a group.
const hasGroup = (groupXmlId) => {
  return groups_ids.value.includes(groupXmlId)
}

console.log('User groups loaded:', hasGroup)
loadUserGroups()

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

const handleConfirm = async () => {
  const answer = await Swal.fire({
    icon: 'question',
    title: 'Confirm this booking?',
    text: `This booking will be approved.${booking.value.id}`,
    showCancelButton: true,
    confirmButtonText: 'Yes, confirm',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#198754',
    reverseButtons: true,
  })

  if (!answer.isConfirmed || !booking.value?.id) return

  actionLoading.value = true

  try {
    const response = await confirmRoomBooking(booking.value.id) 

    if (response.status == true) { 

    await Swal.fire({
      icon: 'success',
      title: 'Confirmed',
      text:'Booking confirmed successfully.',
      confirmButtonText: 'OK',
      timer: 2000,
    }) 
    await loadBookingDetail()
  }

  } catch (error) {
    console.error('Confirm room booking error:', error)

    await showActionResult(
      false,
      error.response?.data?.message ||
        error.response?.data?.error?.data?.message ||
        error.message ||
        'Unable to confirm booking.'
    )
  } finally {
    actionLoading.value = false
  }
}


const handleCancel = async () => {
  const answer = await Swal.fire({
    icon: 'warning',
    title: 'Cancel this booking?',
    text: `This booking will be cancelled.${booking.value.id}`,
    showCancelButton: true,
    confirmButtonText: 'Yes, cancel booking',
    cancelButtonText: 'Keep booking',
    confirmButtonColor: '#dc3545',
    reverseButtons: true,
  })

  if (!answer.isConfirmed || !booking.value?.id) return

  actionLoading.value = true

  try {
    const response = await cancelRoomBooking(booking.value.id)
    const result = response.data

    if (result?.status !== true) {
      await showActionResult(
        false,
        result?.message || 'Unable to cancel booking.'
      )
      return
    }

    await Swal.fire({
      icon: 'success',
      title: 'Cancelled',
      text: result.message || 'Booking cancelled successfully.',
      confirmButtonText: 'OK',
    })

    await loadBookingDetail()
  } catch (error) {
    console.error('Cancel room booking error:', error)

    await showActionResult(
      false,
      error.response?.data?.message ||
        error.response?.data?.error?.data?.message ||
        error.message ||
        'Unable to cancel booking.'
    )
  } finally {
    actionLoading.value = false
  }
}


const handleDone = async () => {
  const answer = await Swal.fire({
    icon: 'question',
    title: 'Mark booking as done?',
    text: 'This booking will be marked as completed. ',
    showCancelButton: true,
    confirmButtonText: 'Yes, mark as done',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#0d6efd',
    reverseButtons: true,
  })

  if (!answer.isConfirmed || !booking.value?.id) return

  actionLoading.value = true

  try {
    const response = await doneRoomBooking(booking.value.id)
    const result = response.data

    if (result?.status !== true) {
      await showActionResult(
        false,
        result?.message || 'Unable to complete booking.'
      )
      return
    }

    await Swal.fire({
      icon: 'success',
      title: 'Completed',
      text: result.message || 'Booking marked as done.',
      confirmButtonText: 'OK',
    })

    await loadBookingDetail()
  } catch (error) {
    console.error('Complete room booking error:', error)

    await showActionResult(
      false,
      error.response?.data?.message ||
        error.response?.data?.error?.data?.message ||
        error.message ||
        'Unable to complete booking.'
    )
  } finally {
    actionLoading.value = false
  }
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
const escapeHtml = (value) => {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  })[char])
}

const toDateTimeLocal = (value) => {
  if (!value) return ''

  // Odoo datetime: YYYY-MM-DD HH:mm:ss
  // Display the same date/time in the edit form.
  return String(value).replace(' ', 'T').slice(0, 16)
}

const handleEdit = async () => {
  // Only draft bookings can be edited.
  if (!booking.value || booking.value.room_state !== 'draft') {
    await Swal.fire({
      icon: 'warning',
      title: 'Cannot edit booking',
      text: 'Only draft room bookings can be updated.',
    })
    return
  }

  const current = booking.value

  const { value: formValues, isConfirmed } = await Swal.fire({
    title: 'Edit Room Booking',
    width: 650,
    html: `
      <div class="text-start">
        <label for="edit-booking-name" class="form-label d-none">Booking Name</label>
        <input
          id="edit-booking-name"
          class="form-control mb-3 d-none"
          value="${escapeHtml(current.name || '')}"
          maxlength="200"
          required
        >

        <label for="edit-room-id" class="form-label d-none">Room ID</label>
        <input
          id="edit-room-id"
          type="number"
          min="1"
          class="form-control mb-3 d-none" readonly
          value="${escapeHtml(
            Array.isArray(current.booking_id)
              ? current.booking_id[0]
              : current.booking_id || ''
          )}"
          required
        >

        <label for="edit-booking-start" class="form-label">Start Date &amp; Time</label>
        <input
          id="edit-booking-start"
          type="datetime-local"
          class="form-control mb-3"
          value="${escapeHtml(toDateTimeLocal(current.start))}"
          required
        >

        <label for="edit-booking-stop" class="form-label">End Date &amp; Time</label>
        <input
          id="edit-booking-stop"
          type="datetime-local"
          class="form-control mb-3"
          value="${escapeHtml(toDateTimeLocal(current.stop))}"
          required
        >

        <label for="edit-booking-participants" class="form-label">Number of Participants</label>
        <input
          id="edit-booking-participants"
          type="number"
          min="1"
          class="form-control mb-3"
          value="${escapeHtml(
            current.number_of_participant ??
            current.number_of_participants ??
            current.capacity ??
            1
          )}"
          required
        >
        <label for="edit-booking-tel" class="form-label">Contact Number</label>
        <input
          id="edit-booking-tel"
          type="tel"
          class="form-control mb-3"
          value="${escapeHtml(
            current.tel 
          )}"
          required
        >

        <label for="edit-booking-description" class="form-label">Description</label>
        <textarea
          id="edit-booking-description"
          class="form-control"
          rows="3"
        >${escapeHtml(current.description || '')}</textarea>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Save Changes',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#0d6efd',
    reverseButtons: true,
    focusConfirm: false,

    preConfirm: () => {  

      const start = document
        .getElementById('edit-booking-start').value

      const stop = document
        .getElementById('edit-booking-stop').value

      const participants = Number(
        document.getElementById('edit-booking-participants').value
      )

      const description = document
        .getElementById('edit-booking-description').value.trim()

      if (!start || !stop) {
        Swal.showValidationMessage(
          'Please complete the booking name, room, start and end times.'
        )
        return false
      }
 
      if (new Date(stop) <= new Date(start)) {
        Swal.showValidationMessage(
          'The end time must be later than the start time.'
        )
        return false
      }

      if (!Number.isInteger(participants) || participants < 1) {
        Swal.showValidationMessage(
          'Participants must be at least 1.'
        )
        return false
      }

      const toOdooDateTime = (value) => value.replace('T', ' ') + ':00'

      return { 
        booking_id: current.booking_id,
        start: toOdooDateTime(start),
        stop: toOdooDateTime(stop),
        number_of_participant: document.getElementById('edit-booking-participants').value,
        description,
        tel: document.getElementById('edit-booking-tel').value.trim(),
      }
    },
  })

  if (!isConfirmed || !formValues) return

  // Prevent duplicate submissions and recheck state.
  if (
    actionLoading.value ||
    !booking.value ||
    booking.value.room_state !== 'draft'
  ) {
    return
  }

  actionLoading.value = true
  console.log('Submitting updated booking values:', booking.value.id, formValues)
const payload = {
  id: Number(booking.value.id),
  booking_id: Number(current.booking_id), 
  start: formValues.start,
  stop: formValues.stop,
  description: formValues.description,
  number_of_participants: Number(formValues.number_of_participant),
  tel: formValues.tel || '',
}
console.log('Payload for updateRoomBooking:', payload)
  try {
    const response = await updateRoomBooking(payload)  
if (response.status === true) {
  await Swal.fire({
    icon: 'success',
    title: 'Updated!',
    text: response.message || 'Booking updated successfully.',
    confirmButtonText: 'OK',
    timer: 2000,
  })

  await loadBookingDetail()
} else {
  await Swal.fire({
    icon: 'error',
    title: 'Update failed',
    text: response.message || 'Unable to update booking.',
  })
}
  } catch (error) { 
    await Swal.fire({
      icon: 'error',
      title: 'Update Failed',
      text:
        error?.response?.data?.message ||
        error?.response?.data?.error?.data?.message ||
        error.message ||
        'Unable to update room booking.',
      confirmButtonText: 'OK',
    })
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