
<template>
  <div class="container py-5 qr-scan-page">
    <div class="card border-0 shadow-sm">
      <div class="card-body p-4 text-center">
        <i class="bi bi-qr-code-scan display-3 text-primary"></i>

        <h4 class="mt-3">Room Booking</h4>
        <p class="text-muted">
          Scan a room QR code or open a booking link to continue.
        </p>

        <!-- Loading room -->
        <div v-if="loading" class="py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2 text-muted mb-0">Loading room...</p>
        </div>

        <!-- Room found -->
        <div
          v-else-if="room"
          class="border rounded p-3 mt-3 text-start"
        >
          <div class="d-flex align-items-center gap-3">
            <div class="room-icon">
              <i class="bi bi-door-open"></i>
            </div>

            <div class="flex-grow-1">
              <h5 class="mb-1">{{ room.name || 'Meeting Room' }}</h5>
              <p class="text-muted small mb-0">
                Room ID: {{ room.id }}
              </p>
              <p
                v-if="room.capacity"
                class="text-muted small mb-0"
              >
                Capacity: {{ room.capacity }}
              </p>
            </div>
          </div>

          <button
            type="button"
            class="btn btn-primary w-100 mt-3"
            @click="continueBooking"
            :disabled="loading"
          >
            <i class="bi bi-calendar-plus me-2"></i>
            Continue to Booking Form
          </button>

          <button
            type="button"
            class="btn btn-outline-secondary w-100 mt-2"
            @click="resetRoom"
          >
            <i class="bi bi-qr-code-scan me-2"></i>
            Scan Another Room
          </button>
        </div>

        <!-- Scan button -->
        <button
          v-if="!room && !loading"
          type="button"
          class="btn btn-outline-primary w-100 mt-3"
          @click="startScanner"
          :disabled="scanning"
        >
          <span
            v-if="scanning"
            class="spinner-border spinner-border-sm me-2"
            role="status"
          ></span>
          <i v-else class="bi bi-camera me-2"></i>
          {{ scanning ? 'Starting camera...' : 'Scan with Camera' }}
        </button>

        <!-- Camera preview -->
        <div
          v-show="scannerVisible"
          class="scanner-container mt-3"
        >
          <div id="qr-reader"></div>
        </div>

        <button
          v-if="scannerVisible"
          type="button"
          class="btn btn-outline-secondary w-100 mt-2"
          @click="stopScanner"
        >
          <i class="bi bi-x-circle me-2"></i>
          Close Camera
        </button>

        <!-- Error -->
        <div
          v-if="error"
          class="alert alert-danger text-start mt-3 mb-0"
          role="alert"
        >
          {{ error }}
        </div>

        <p class="small text-muted mt-3 mb-0">
          You can open this page from a QR link. Camera access requires
          HTTPS or localhost and permission from your browser.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getRoomTypes } from '../api/axios'

const route = useRoute()
const router = useRouter()

const room = ref(null)
const loading = ref(false)
const error = ref('')
const scanning = ref(false)
const scannerVisible = ref(false)

let scanner = null
let scannerStarting = false

/**
 * Get the room list from the API response.
 * Supports common Axios and API response structures.
 */
const extractRooms = (result) => {
  const candidates = [
    result,
    result?.data,
    result?.data?.data,
    result?.data?.rooms,
    result?.rooms,
    result?.data?.result,
  ]

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate
    }

    if (Array.isArray(candidate?.rooms)) {
      return candidate.rooms
    }

    if (Array.isArray(candidate?.data)) {
      return candidate.data
    }
  }

  return []
}

/**
 * Extract the room ID from:
 *  - A plain numeric ID
 *  - JSON, e.g. {"room_id": 3}
 *  - A URL containing ?booking_id=3 or ?room_id=3
 *  - A URL ending in /room/3
 */
const extractRoomId = (rawValue) => {
  const value = String(rawValue ?? '').trim()

  if (!value) return null

  // JSON QR payload
  try {
    const parsed = JSON.parse(value)

    if (typeof parsed === 'number' || typeof parsed === 'string') {
      const id = Number(parsed)
      return Number.isInteger(id) && id > 0 ? id : null
    }

    if (parsed && typeof parsed === 'object') {
      const id = Number(
        parsed.room_id ??
        parsed.booking_id ??
        parsed.roomId ??
        parsed.id
      )

      return Number.isInteger(id) && id > 0 ? id : null
    }
  } catch {
    // Not JSON; continue parsing.
  }

  // URL QR payload
  try {
    const url = new URL(value, window.location.origin)

    const queryId =
      url.searchParams.get('room_id') ??
      url.searchParams.get('booking_id') ??
      url.searchParams.get('roomId')

    if (queryId !== null) {
      const id = Number(queryId)
      return Number.isInteger(id) && id > 0 ? id : null
    }

    const match = url.pathname.match(/\/room\/(\d+)\/?$/i)

    if (match) {
      const id = Number(match[1])
      return Number.isInteger(id) && id > 0 ? id : null
    }

    // A plain numeric string may be parsed as a URL path.
    if (/^\d+$/.test(value)) {
      const id = Number(value)
      return Number.isInteger(id) && id > 0 ? id : null
    }
  } catch {
    // Invalid URL.
  }

  // Accept plain room IDs only; don't guess IDs from arbitrary text.
  if (/^\d+$/.test(value)) {
    const id = Number(value)
    return Number.isInteger(id) && id > 0 ? id : null
  }

  return null
}

/**
 * Load a room by its ID.
 */

const findRoom = async (rawValue) => {
  const roomId = extractRoomId(rawValue)

  if (!roomId) {
    error.value = 'Invalid QR code. A valid room ID was not found.'
    return
  }

  loading.value = true
  error.value = ''
  room.value = null

  try {
    const result = await getRoomTypes()
    const rooms = extractRooms(result)

    const selectedRoom = rooms.find(
      (item) => Number(item.id) === roomId
    )

    if (!selectedRoom) {
      error.value = `Room ID ${roomId} was not found.`
      return
    }

    room.value = selectedRoom

    // Keep the QR room ID in the URL.
    if (
      String(route.query.room_id || '') !== String(roomId)
    ) {
      await router.replace({
        path: '/qr-scan',
        query: { room_id: String(roomId) },
      })
    }
  } catch (e) {
    console.error('Load QR room error:', e)

    const status = e?.response?.status
    const token = localStorage.getItem('user-token')

    if (status === 401 || status === 403) {
      if (!token) {
        // Preserve the scanned room when sending the user to login.
        await router.replace({
          path: '/',
          query: {
            redirect: `/qr-scan?room_id=${roomId}`,
          },
        })
        return
      }

      error.value =
        'Your session may have expired or you do not have permission to access the room list. Please log in again.'
    } else {
      error.value =
        e?.response?.data?.message ||
        'Could not load room details. Please try again.'
    }
  } finally {
    loading.value = false
  }
} 
/**
 * Start the device camera and scan QR codes.
 */
const startScanner = async () => {
  if (scannerStarting || scanning.value) return

  scannerStarting = true
  scanning.value = true
  scannerVisible.value = true
  error.value = ''

  try {
    const { Html5Qrcode } = await import('html5-qrcode')

    scanner = new Html5Qrcode('qr-reader')

    await scanner.start(
      { facingMode: 'environment' },
      {
        fps: 10,
        qrbox: { width: 240, height: 240 },
        aspectRatio: 1,
      },
      async (decodedText) => {
        // Stop the camera before loading the room.
        await stopScanner()
        await findRoom(decodedText)
      },
      () => {
        // Ignore individual frames where no QR code is detected.
      }
    )
  } catch (e) {
    console.error('Camera scanner error:', e)

    scannerVisible.value = false

    error.value =
      'Cannot open the camera. Allow camera access in your browser, or open the room QR link directly.'

    if (scanner) {
      try {
        await scanner.clear()
      } catch {
        // Ignore scanner cleanup errors.
      }
      scanner = null
    }
  } finally {
    scanning.value = false
    scannerStarting = false
  }
}

/**
 * Stop and clean up the camera.
 */
const stopScanner = async () => {
  if (scanner) {
    try {
      if (scanner.isScanning) {
        await scanner.stop()
      }

      await scanner.clear()
    } catch (e) {
      console.warn('Scanner cleanup:', e)
    }

    scanner = null
  }

  scannerVisible.value = false
  scanning.value = false
  scannerStarting = false
}

/**
 * Reset the page to scan a different room.
 */
const resetRoom = async () => {
  room.value = null
  error.value = ''

  await router.replace({
    path: '/qr-scan',
    query: {},
  })
}

/**
 * Navigate to the actual room booking page.
 *
 * IMPORTANT:
 * RoomTypeView must read create_room_id from the route query
 * and open the booking form for that room.
 */

   
const continueBooking = async () => {
  if (!room.value?.id) {
    error.value = "Please scan a valid room QR code first.";
    return;
  }

  const roomId = Number(room.value.id);

  if (!Number.isInteger(roomId) || roomId <= 0) {
    error.value = "Invalid room ID.";
    return;
  }

  const token = localStorage.getItem("user-token");

  if (!token) {
    await router.push({
      path: "/",
      query: {
        redirect: `/qr-scan?room_id=${roomId}`,
      },
    });

    return;
  }

  // Logged in: navigate to the room booking page.
  await router.push({
    path: "/app/roomtype",
    query: {
      create_room_id: String(roomId),
    },
  });
}; 

/**
 * Load a room automatically when the QR link is opened directly.
 */
onMounted(async () => {
  const roomId =
    route.query.room_id ??
    route.query.booking_id

  if (roomId) {
    await findRoom(String(roomId))
  }
})

onBeforeUnmount(() => {
  void stopScanner()
})
</script>

<style scoped>
.qr-scan-page {
  max-width: 520px;
}

.room-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  flex-shrink: 0;
  border-radius: 12px;
  background: #eef4ff;
  color: #0d6efd;
  font-size: 1.8rem;
}

.scanner-container {
  overflow: hidden;
  border: 1px solid #dee2e6;
  border-radius: 10px;
  padding: 8px;
  background: #fff;
}

#qr-reader {
  width: 100%;
}

#qr-reader :deep(video) {
  border-radius: 8px;
}

@media (max-width: 576px) {
  .qr-scan-page {
    padding-left: 12px;
    padding-right: 12px;
  }

  .qr-scan-page .card-body {
    padding: 1.25rem !important;
  }
}
</style>
