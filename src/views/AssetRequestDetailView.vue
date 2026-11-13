<template>
  <div class="container-fluid py-4 asset-detail">
    <!-- Header -->
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div>
        <button class="btn btn-outline-secondary btn-sm mb-3" @click="goBack">
          <i class="bi bi-arrow-left me-1"></i>
          Back
        </button>

        <h4 class="mb-1">Asset Request Detail</h4>
        <div class="text-muted small">
          {{ request.name || 'Loading...' }}
        </div>
      </div>

      <span v-if="request.state" class="badge rounded-pill px-3 py-2" :class="stateClass(request.state)">
        {{ request.state_label || request.state }}
      </span>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
      <p class="text-muted mt-2">Loading asset request...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="alert alert-danger">
      <i class="bi bi-exclamation-circle me-2"></i>
      {{ error }}
      <button class="btn btn-sm btn-outline-danger ms-3" @click="loadDetail">
        Retry
      </button>
    </div>

    <template v-else-if="request.id">
      <!-- Request Information -->
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-header bg-white py-3">
          <h6 class="mb-0">Request Information</h6>
        </div>

        <div class="card-body">
          <div class="row g-4">
            <div class="col-12 col-md-6">
              <label>Request Reference</label>
              <div class="detail-value">{{ request.name || '-' }}</div>
            </div>

            <div class="col-12 col-md-6">
              <label>Origin</label>
              <div class="detail-value">{{ request.origin || '-' }}</div>
            </div>

            <div class="col-12 col-md-6">
              <label>Transfer Employee</label>
              <div class="detail-value">
                {{ request.transfer_employee || '-' }}
              </div>
            </div>

            <div class="col-12 col-md-6">
              <label>From </label>
              <div class="detail-value">{{ request.source_location || '-' }}</div>
            </div>

            <div class="col-12 col-md-6">
              <label>Scheduled Date</label>
              <div class="detail-value">
                {{ formatDate(request.scheduled_date) }}
              </div>
            </div>

            <div class="col-12 col-md-6">
              <label>Completed Date</label>
              <div class="detail-value">
                {{ formatDate(request.date_done) }}
              </div>
            </div>

            <div class="col-12">
              <label>Reason</label>
              <div class="detail-value">
                {{ request.reason || '-' }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Location Information -->
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-header bg-white py-3">
          <h6 class="mb-0">Location Information</h6>
        </div>

        <div class="card-body">
          <div class="row g-3">
            <div class="col-12 col-md-6">
              <div class="location-box">
                <div class="location-icon source">
                  <i class="bi bi-box-arrow-up"></i>
                </div>
                <div>
                  <label>Source Location</label>
                  <div class="detail-value">
                    {{ request.source_location || '-' }}
                  </div>
                </div>
              </div>
            </div>

            <div class="col-12 col-md-6">
              <div class="location-box">
                <div class="location-icon destination">
                  <i class="bi bi-box-arrow-in-down"></i>
                </div>
                <div>
                  <label>Destination Location</label>
                  <div class="detail-value">
                    {{ request.destination_location || '-' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Products -->
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-header bg-white py-3 d-flex justify-content-between">
          <h6 class="mb-0">Products</h6>
          <span class="badge bg-light text-dark">
            {{ products.length }} Items
          </span>
        </div>

        <div class="card-body p-0">
          <div v-if="products.length" class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th style="width: 60px">#</th>
                  <th>Product</th>
                  <th>Internal Reference</th>
                  <th class="text-end">Quantity</th>
                  <th class="text-end">Done</th>
                  <th>Unit</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="(item, index) in products" :key="item.move_id || index">
                  <td>{{ index + 1 }}</td>
                  <td>
                    <div class="product-name">
                      {{ item.product_name || '-' }}
                    </div>
                  </td>
                  <td>{{ item.default_code || '-' }}</td>
                  <td class="text-end">
                    {{ item.quantity ?? 0 }}
                  </td>
                  <td class="text-end">
                    <span class="text-success">
                      {{ item.done_quantity ?? 0 }}
                    </span>
                  </td>
                  <td>{{ item.uom || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="text-center text-muted py-5">
            <i class="bi bi-box-seam fs-2 d-block mb-2"></i>
            No products found
          </div>
        </div>
      </div> 

      <!-- Footer -->
      <!-- Footer Actions -->
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">

        <button class="btn btn-outline-secondary" @click="goBack">
          <i class="bi bi-arrow-left me-1"></i>
          Back to Requests
        </button>

        <div class="d-flex gap-2 flex-wrap">

          <!-- Validate -->
          <button v-if="['assigned', 'confirmed'].includes(request.state)" class="btn btn-success"
            @click="validateRequest" :disabled="actionLoading">
            <span v-if="actionLoading === 'validate'" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="bi bi-check-circle me-1"></i>
            Validate
          </button>

          <!-- Return -->
          <button v-if="request.state === 'done'" class="btn btn-warning" @click="returnRequest"
            :disabled="actionLoading">
            <span v-if="actionLoading === 'return'" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="bi bi-arrow-return-left me-1"></i>
            Return
          </button>

          <!-- Transfer to another employee -->
          <button v-if="request.state === 'done'" class="btn btn-primary" @click="openTransferModal"
            :disabled="actionLoading || transferLoading">
            <i class="bi bi-arrow-left-right me-1"></i>
            Transfer to Employee
          </button>

        </div>
      </div>
    </template>
  </div>

  <!-- TRANSFER TO EMPLOYEE MODAL -->
  <div class="modal fade" id="transferEmployeeModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">

        <div class="modal-header">
          <div>
            <h5 class="modal-title">Transfer to Employee</h5>
            <small class="text-muted">
              {{ request.name }}
            </small>
          </div>

          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>

        <div class="modal-body">

          <!-- EMPLOYEE -->
          <div class="mb-4">
            <label class="form-label">Receiving Employee</label>

            <select v-model="selectedEmployeeId" class="form-select" :disabled="employeeLoading || transferLoading">
              <option value="">Select Employee</option>

              <option v-for="employee in employees" :key="employee.id" :value="employee.id">
                {{ employee.name }}
                {{ employee.department ? ` - ${employee.department}` : '' }}
              </option>
            </select>

            <div v-if="employeeLoading" class="small text-muted mt-2">
              Loading employees...
            </div>
          </div>

          <!-- TRANSFER INFORMATION -->
          <div class="transfer-route mb-4">
            <div>
              <small class="text-muted">From</small>
              <div class="detail-value">
                {{ request.destination_location || '-' }}
              </div>
            </div>

            <i class="bi bi-arrow-right text-primary fs-4"></i>

            <div>
              <small class="text-muted">To</small>
              <div class="detail-value">
                {{ selectedEmployee?.location_name || selectedEmployee?.name || 'Select Employee' }}
              </div>
            </div>
          </div>

          <!-- PRODUCTS -->
          <h6 class="mb-3">Products to Transfer</h6>

          <div class="table-responsive">
            <table class="table table-bordered align-middle">
              <thead class="table-light">
                <tr>
                  <th>Product</th>
                  <th>Code</th>
                  <th class="text-end">Quantity</th>
                  <th>Unit</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="(item, index) in transferProducts" :key="item.product_id || index">
                  <td>{{ item.product_name }}</td>
                  <td>{{ item.default_code || '-' }}</td>
                  <td class="text-end">{{ item.quantity }}</td>
                  <td>{{ item.uom || '-' }}</td>
                </tr>

                <tr v-if="!transferProducts.length">
                  <td colspan="4" class="text-center text-muted">
                    No products found.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="alert alert-info small mb-0">
            <i class="bi bi-info-circle me-1"></i>
            A new internal stock picking will be created for the selected employee.
          </div>

        </div>

        <div class="modal-footer">
          <button class="btn btn-outline-secondary" data-bs-dismiss="modal" :disabled="transferLoading">
            Cancel
          </button>

          <button class="btn btn-primary" @click="submitTransfer"
            :disabled="transferLoading || employeeLoading || !selectedEmployeeId">
            <span v-if="transferLoading" class="spinner-border spinner-border-sm me-2"></span>

            <i v-else class="bi bi-arrow-left-right me-1"></i>
            Create Transfer
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount
} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  getAssetRequestDetail,
  getAssetEmployees,
  createAssetInternalTransfer,
  validateAssetRequest,
  returnAssetRequest
} from '../api/asset'
import { Modal } from 'bootstrap'
import Swal from 'sweetalert2'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const error = ref('')
const request = ref({})
const products = computed(() => request.value.products || [])
// =====================================================
// TRANSFER TO EMPLOYEE
// =====================================================

const employees = ref([])
const selectedEmployeeId = ref('')
const employeeLoading = ref(false)
const transferLoading = ref(false)

const transferProducts = ref([])

let transferModal = null
const actionLoading = ref(false)

// =====================================================
// VALIDATE ASSET REQUEST
// =====================================================
const validateRequest = async () => {
  const result = await Swal.fire({
    title: 'Validate Asset Request?',
    text: 'Are you sure you want to validate this stock transfer?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Yes, Validate',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#198754'
  })

  if (!result.isConfirmed) return

  actionLoading.value = 'validate'

  try {
    const response = await validateAssetRequest(request.value.id)
    const data = response.data

    if (data.status === false) {
      throw new Error(data.message || 'Validation failed')
    }

    await Swal.fire(
      'Success',
      data.message || 'Asset request validated successfully.',
      'success'
    )

    await loadDetail()

  } catch (err) {
    console.error('Validate asset request:', err)

    Swal.fire(
      'Validation Failed',
      err.response?.data?.message ||
      err.message ||
      'Unable to validate asset request.',
      'error'
    )
  } finally {
    actionLoading.value = false
  }
}


// =====================================================
// RETURN ASSET REQUEST
// =====================================================
const returnRequest = async () => {
  const result = await Swal.fire({
    title: 'Return Assets?',
    html: `
      This will create a new internal transfer
      from <strong>${request.value.destination_location || 'Employee Location'}</strong>
      back to <strong>${request.value.source_location || 'Original Warehouse'}</strong>.
    `,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, Return Assets',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#f0ad4e'
  })

  if (!result.isConfirmed) return

  actionLoading.value = 'return'

  try {
    const response = await returnAssetRequest(request.value.id)
    const data = response.data

    if (data.status === false) {
      throw new Error(data.message || 'Return failed')
    }

    await Swal.fire({
      title: 'Return Created',
      text: data.message || 'Return transfer created successfully.',
      icon: 'success'
    })

    // Reload the original request details
    await loadDetail()

  } catch (err) {
    console.error('Return asset request:', err)

    Swal.fire(
      'Return Failed',
      err.response?.data?.message ||
      err.message ||
      'Unable to create return transfer.',
      'error'
    )
  } finally {
    actionLoading.value = false
  }
}
const selectedEmployee = computed(() => {
  return employees.value.find(
    employee => Number(employee.id) === Number(selectedEmployeeId.value)
  )
})

const openTransferModal = async () => {
  selectedEmployeeId.value = ''

  // Prepare products from the asset request
  transferProducts.value = products.value.map(item => ({
    product_id: Array.isArray(item.product_id)
      ? item.product_id[0]
      : typeof item.product_id === 'object'
        ? item.product_id?.id
        : item.product_id,

    product_name: item.product_name,
    default_code: item.default_code,
    quantity: Number(
      item.done_quantity > 0
        ? item.done_quantity
        : item.quantity || 0
    ),
    uom: item.uom
  }))

  transferModal?.show()

  employeeLoading.value = true

  try {
    const response = await getAssetEmployees()
    const data = response.data
    console.log('Asset request:', data)
    if (data.status === false) {
      throw new Error(data.message || 'Unable to load employees')
    }

    employees.value = data.employees || []

  } catch (err) {
    console.error('Load employees:', err)

    transferModal?.hide()

    Swal.fire(
      'Error',
      err.response?.data?.message || err.message,
      'error'
    )
  } finally {
    employeeLoading.value = false
  }
}

const submitTransfer = async () => {
  if (!selectedEmployeeId.value) {
    Swal.fire('Warning', 'Please select an employee.', 'warning')
    return
  }

  if (!transferProducts.value.length) {
    Swal.fire('Warning', 'No products available.', 'warning')
    return
  }

  const invalidProduct = transferProducts.value.find(item =>
    !item.product_id || !Number.isFinite(item.quantity) || item.quantity <= 0
  )

  if (invalidProduct) {
    Swal.fire(
      'Warning',
      `Invalid product or quantity: ${invalidProduct.product_name}`,
      'warning'
    )
    return
  }

  const employee = selectedEmployee.value

  const result = await Swal.fire({
    title: 'Confirm Transfer?',
    html: `Transfer assets to <strong>${employee?.name || ''}</strong>?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Yes, Create Transfer',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#0d6efd'
  })

  if (!result.isConfirmed) return

  transferLoading.value = true

  try {
    const payload = {
      id: request.value.id,
      source_location: request.value.destination_location_id,
      employee_id: Number(selectedEmployeeId.value),
      products: transferProducts.value.map(item => ({
        product_id: Number(item.product_id),
        quantity: Number(item.quantity)
      }))
    }

    const response = await createAssetInternalTransfer(payload)
    const data = response.data

    if (data.status === false) {
      throw new Error(data.message || 'Transfer failed')
    }

    transferModal?.hide()

    await Swal.fire(
      'Success',
      data.message || 'Internal transfer created successfully.',
      'success'
    )

    // Refresh request detail
    await loadDetail()

  } catch (err) {
    console.error('Create transfer:', err)

    Swal.fire(
      'Transfer Failed',
      err.response?.data?.message || err.message || 'Unable to create transfer.',
      'error'
    )
  } finally {
    transferLoading.value = false
  }
}

const loadDetail = async () => {
  loading.value = true
  error.value = ''

  try {
    const id = route.params.id

    if (!id) {
      throw new Error('Asset request ID not found')
    }

    const response = await getAssetRequestDetail(id)

    // Support Axios response and direct API response
    let data = response?.data ?? response

    if (typeof data === 'string') {
      data = JSON.parse(data)
    }

    console.log('Asset Detail API Response:', data)

    // Only reject an explicit failure
    if (data?.status === false) {
      throw new Error(data.message || 'Unable to load asset request')
    }

    // Support different response structures
    const requestData =
      data?.request ||
      data?.data?.request ||
      data?.result?.request ||
      data?.data ||
      data?.result

    if (!requestData || typeof requestData !== 'object') {
      throw new Error('Asset request data not found in API response')
    }

    request.value = {
      ...requestData,
      id: requestData.id || Number(id),
      products: requestData.products || []
    }

    console.log('Loaded Asset Request:', request.value)

  } catch (err) {
    console.error('Asset request detail error:', err)

    error.value =
      err.response?.data?.message ||
      err.message ||
      'Failed to load asset request'

  } finally {
    loading.value = false
  }
}

const formatDate = (value) => {
  if (!value) return '-'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const stateClass = (state) => {
  const classes = {
    draft: 'bg-secondary',
    waiting: 'bg-warning text-dark',
    waiting_for_approval: 'bg-warning text-dark',
    assigned: 'bg-info text-dark',
    confirmed: 'bg-primary',
    done: 'bg-success',
    cancel: 'bg-danger',
    cancelled: 'bg-danger',
  }

  return classes[state] || 'bg-secondary'
}

const goBack = () => {
  if (window.history.state?.back) {
    router.back()
  } else {
    router.push('/app/asset-request-history')
  }
}

onMounted(() => {
  const element = document.getElementById('transferEmployeeModal')

  if (element) {
    transferModal = new Modal(element)
  }

  loadDetail()
})

onBeforeUnmount(() => {
  transferModal?.dispose()
  transferModal = null
})

</script>

<style scoped>
.transfer-route {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  padding: 16px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 10px;
}

.transfer-route>div {
  min-width: 0;
  flex: 1;
}

@media (max-width: 576px) {
  .transfer-route {
    flex-wrap: wrap;
  }
}

.asset-detail {
  color: #333;
  font-size: 14px;
}

.card {
  border-radius: 12px;
}

.card-header {
  border-bottom: 1px solid #eee;
}

label {
  display: block;
  color: #777;
  font-size: 13px;
  margin-bottom: 6px;
  font-weight: 400;
}

.detail-value {
  font-size: 14px;
  color: #333;
  font-weight: 400;
  overflow-wrap: anywhere;
}

.location-box {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 10px;
  height: 100%;
}

.location-icon {
  width: 42px;
  height: 42px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  font-size: 19px;
  flex-shrink: 0;
}

.location-icon.source {
  background: #e8f1ff;
  color: #2672d8;
}

.location-icon.destination {
  background: #e7f7ed;
  color: #198754;
}

.product-name {
  font-weight: 400;
  color: #333;
}

.table {
  font-size: 13px;
}

.table th {
  font-weight: 500;
  white-space: nowrap;
  color: #555;
}

.table td {
  padding: 13px 12px;
}

@media (max-width: 576px) {
  .asset-detail {
    padding-left: 10px;
    padding-right: 10px;
  }

  .card-body {
    padding: 15px;
  }
}
</style>
