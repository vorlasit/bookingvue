
<template>
  <div class="container-fluid py-4">
    <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
      <div>
        <h4 class="mb-1">My Asset Request History</h4>
        <p class="text-muted mb-0">View and track your asset requests.</p>
      </div>

      <button class="btn btn-outline-secondary" @click="goBack">
        <i class="bi bi-arrow-left me-1"></i>
        Back
      </button>
    </div>

    <div class="card border-0 shadow-sm">
      <div class="card-body p-3 p-md-4">

        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="mb-0">
            <i class="bi bi-clock-history me-2"></i>
            My Request History
          </h5>

          <button class="btn btn-sm btn-outline-primary" @click="loadMyRequests" :disabled="loading">
            <i class="bi bi-arrow-clockwise"></i>
            Refresh
          </button>
        </div>

        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary"></div>
          <p class="text-muted mt-2">Loading requests...</p>
        </div>

        <div v-else-if="myRequests.length" class="row g-3">

          <div
            v-for="item in myRequests"
            :key="item.id"
            class="col-12 col-md-6 col-xl-4"
          >
            <div class="request-card h-100">

              <div class="d-flex justify-content-between align-items-start gap-2 mb-3">
                <div>
                  <div class="fw-semibold fs-6">
                    <i class="bi bi-box-seam text-primary me-2"></i>
                    {{ item.name }}
                  </div>

                  <small class="text-muted">
                    {{ formatDate(item.scheduled_date) }}
                  </small>
                </div>

                <span class="badge" :class="stateClass(item.state)">
                  {{ item.state_label }}
                </span>
              </div>

              <hr class="my-2">

              <div class="request-info">
                <div class="info-item">
                  <i class="bi bi-boxes text-primary"></i>
                  <div>
                    <small>Assets</small>
                    <strong>{{ (item.products || []).length }} items</strong>
                  </div>
                </div>

                <div class="info-item">
                  <i class="bi bi-geo-alt text-primary"></i>
                  <div>
                    <small>Destination</small>
                    <strong>{{ item.destination_location || '-' }}</strong>
                  </div>
                </div>
              </div>

              <button
                class="btn btn-outline-primary w-100 mt-3"
                @click="showDetail(item.id)"
              >
                <i class="bi bi-eye me-1"></i>
                View Details
              </button>
              <button
                class="btn btn-outline-primary w-100 mt-3"
                @click="openAssetDetail(item.id)"
              >
                <i class="bi bi-eye me-1"></i>
                View
              </button>

            </div>
          </div>

        </div>

        <div v-else class="text-center text-muted py-5">
          <i class="bi bi-inbox display-5"></i>
          <p class="mt-3 mb-0">No asset requests found.</p>
        </div>

      </div>
    </div>

    <!-- DETAIL MODAL -->
    <div class="modal fade" id="assetHistoryDetailModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">

          <div class="modal-header">
            <h5 class="modal-title">Asset Request Details</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>

          <div class="modal-body">

            <div v-if="detailLoading" class="text-center py-4">
              <div class="spinner-border text-primary"></div>
            </div>

            <template v-else-if="selectedRequest">

              <div class="row g-3 mb-3">

                <div class="col-md-6">
                  <small class="text-muted">Transfer Number</small>
                  <div class="fw-semibold">{{ selectedRequest.name }}</div>
                </div>

                <div class="col-md-6">
                  <small class="text-muted">Employee</small>
                  <div class="fw-semibold">
                    {{ selectedRequest.transfer_employee || selectedRequest.requester || '-' }}
                  </div>
                </div>

                <div class="col-md-6">
                  <small class="text-muted">Source Location</small>
                  <div>{{ selectedRequest.source_location || '-' }}</div>
                </div>

                <div class="col-md-6">
                  <small class="text-muted">Destination Location</small>
                  <div>{{ selectedRequest.destination_location || '-' }}</div>
                </div>

                <div class="col-md-6">
                  <small class="text-muted">Status</small>
                  <div>
                    <span class="badge" :class="stateClass(selectedRequest.state)">
                      {{ selectedRequest.state_label }}
                    </span>
                  </div>
                </div>

                <div class="col-md-6">
                  <small class="text-muted">Date</small>
                  <div>{{ formatDate(selectedRequest.scheduled_date) }}</div>
                </div>

              </div>

              <hr>

              <h6>Requested Assets</h6>

              <div class="table-responsive">
                <table class="table table-bordered align-middle">
                  <thead class="table-light">
                    <tr>
                      <th>Product</th>
                      <th>Requested</th>
                      <th>Done</th>
                      <th>Unit</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr
                      v-for="product in selectedRequest.products || []"
                      :key="product.move_id"
                    >
                      <td>{{ product.product_name }}</td>
                      <td>{{ product.quantity }}</td>
                      <td>{{ product.done_quantity }}</td>
                      <td>{{ product.uom }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="mt-3">
                <label class="form-label text-muted">Request Reason</label>
                <div class="p-3 bg-light rounded">
                  {{ selectedRequest.reason || 'No reason provided' }}
                </div>
              </div>

            </template>

          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" data-bs-dismiss="modal">
              Close
            </button>
          </div>

        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { Modal } from 'bootstrap'
import Swal from 'sweetalert2'

import {
  getMyAssetRequests,
  getAssetRequestDetail
} from '../api/asset'

const router = useRouter()

const myRequests = ref([])
const loading = ref(false)

const selectedRequest = ref(null)
const detailLoading = ref(false)
const openAssetDetail = (id) => {
  router.push(`/app/asset-request/${id}`)
}
let detailModal = null

const responseData = response => {
  let data = response?.data ?? response

  if (typeof data === 'string') {
    try {
      data = JSON.parse(data)
    } catch {
      return {}
    }
  }

  return data || {}
}

const checkResponse = response => {
  const data = responseData(response)

  if (data.status === false) {
    throw new Error(data.message || 'Request failed')
  }

  return data
}

const loadMyRequests = async () => {
  loading.value = true

  try {
    const response = await getMyAssetRequests()
    const data = checkResponse(response)

    myRequests.value = data.requests || []

  } catch (error) {
    console.error('My asset requests:', error)

    Swal.fire(
      'Error',
      error.message || 'Unable to load asset requests.',
      'error'
    )
  } finally {
    loading.value = false
  }
}

const showDetail = async id => {
  selectedRequest.value = null
  detailLoading.value = true

  if (!detailModal) {
    const element = document.getElementById('assetHistoryDetailModal')

    if (element) {
      detailModal = new Modal(element)
    }
  }

  detailModal?.show()

  try {
    const response = await getAssetRequestDetail(id)
    const data = checkResponse(response)

    selectedRequest.value = data.request || null

  } catch (error) {
    console.error('Asset request detail:', error)

    detailModal?.hide()

    Swal.fire(
      'Error',
      error.message || 'Unable to load request details.',
      'error'
    )
  } finally {
    detailLoading.value = false
  }
}

const stateClass = state => {
  const classes = {
    draft: 'bg-secondary',
    waiting: 'bg-warning text-dark',
    confirmed: 'bg-info text-dark',
    assigned: 'bg-primary',
    done: 'bg-success',
    cancel: 'bg-danger'
  }

  return classes[state] || 'bg-secondary'
}

const formatDate = value => {
  if (!value) return '-'

  const normalized = value.includes('T')
    ? value
    : value.replace(' ', 'T')

  const date = new Date(
    normalized.endsWith('Z') ? normalized : `${normalized}Z`
  )

  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleString('en-GB', {
    timeZone: 'Asia/Vientiane',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const goBack = () => {
  router.back()
}

onMounted(async () => {
  const element = document.getElementById('assetHistoryDetailModal')

  if (element) {
    detailModal = new Modal(element)
  }

  await loadMyRequests()
})

onBeforeUnmount(() => {
  detailModal?.dispose()
  detailModal = null
})
</script>

<style scoped>
.request-card {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 18px;
  height: 100%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
}

.request-card:hover {
  border-color: #86b7fe;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
}

.request-info {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.info-item > i {
  font-size: 18px;
  margin-top: 2px;
}

.info-item div {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.info-item small {
  color: #6c757d;
  font-size: 12px;
}

.info-item strong {
  font-size: 14px;
  font-weight: 500;
  overflow-wrap: anywhere;
}
</style>