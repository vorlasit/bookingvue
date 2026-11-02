<template>
    <div class="container-fluid py-4 asset-page">

        <!-- HEADER -->
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
            <div>
                <h4 class="mb-1">Asset Request</h4>
                <p class="text-muted mb-0">Request and manage company assets</p>
            </div>

            <button class="btn btn-outline-secondary" @click="goBack">
                <i class="bi bi-arrow-left me-1"></i> Back
            </button>
        </div>

        <!-- TABS -->
        <div class="d-flex gap-2 mb-4 flex-wrap">
            <button class="btn" :class="activeTab === 'employee' ? 'btn-primary' : 'btn-outline-primary'"
                @click="activeTab = 'employee'">
                <i class="bi bi-person me-1"></i> My Asset Requests
            </button>

            <button v-if="isManager" class="btn"
                :class="activeTab === 'manager' ? 'btn-primary' : 'btn-outline-primary'"
                @click="activeTab = 'manager'; loadManagerRequests()">
                <i class="bi bi-clipboard-check me-1"></i> Manage Requests
            </button>
        </div>

        <!-- ================================================= -->
        <!-- EMPLOYEE WIZARD -->
        <!-- ================================================= -->

        <template v-if="activeTab === 'employee'">

            <div class="card border-0 shadow-sm mb-4">
                <div class="card-body p-3 p-md-4">

                    <h5 class="mb-4">
                        <i class="bi bi-plus-circle text-primary me-2"></i>
                        New Asset Request
                    </h5>

                    <!-- STEP PROGRESS -->
                    <div class="wizard-progress mb-4">
                        <div v-for="step in steps" :key="step.number" class="wizard-step" :class="{
                            active: currentStep === step.number,
                            completed: currentStep > step.number
                        }">
                            <div class="step-circle">
                                <i v-if="currentStep > step.number" class="bi bi-check-lg"></i>
                                <span v-else>{{ step.number }}</span>
                            </div>
                            <small>{{ step.label }}</small>
                        </div>
                    </div>

                    <!-- STEP 1: DEPARTMENT -->
                    <section v-if="currentStep === 1">

                        <h5 class="mb-2">1. Select Department</h5>
                        <p class="text-muted mb-3">
                            Choose the department for the assets you want to request.
                        </p>

                        <div v-if="departmentLoading" class="text-center py-5">
                            <div class="spinner-border text-primary"></div>
                            <p class="text-muted mt-2">Loading departments...</p>
                        </div>

                        <div v-else class="row g-3">

                            <div v-for="department in departments" :key="department.id"
                                class="col-12 col-md-6 col-lg-4">
                                <button type="button" class="department-card w-100 text-start"
                                    :class="{ selected: selectedDepartment?.id === department.id }"
                                    @click="selectDepartment(department)">
                                    <div class="d-flex align-items-center gap-3">
                                        <div class="department-icon">
                                            <i class="bi bi-building"></i>
                                        </div>

                                        <div class="flex-grow-1">
                                            <div class="fw-semibold">{{ department.name }}</div>
                                            <small class="text-muted">Select department</small>
                                        </div>

                                        <i v-if="selectedDepartment?.id === department.id"
                                            class="bi bi-check-circle-fill text-primary"></i>
                                    </div>
                                </button>
                            </div>

                            <div v-if="!departments.length" class="col-12 text-center text-muted py-5">
                                No departments with available assets found.
                            </div>

                        </div>
                    </section>

                    <!-- STEP 2: PRODUCTS -->
                    <section v-if="currentStep === 2">

                        <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                            <div>
                                <h5 class="mb-1">2. Select Products</h5>
                                <small class="text-muted">
                                    Department: <strong>{{ selectedDepartment?.name }}</strong>
                                </small>
                            </div>

                            <button class="btn btn-sm btn-outline-secondary" @click="currentStep = 1">
                                Change Department
                            </button>
                        </div>

                        <div class="row g-2 mb-3">
                            <div class="col-md-8">
                                <input v-model="search" class="form-control" placeholder="Search products..."
                                    @keyup.enter="loadProducts" />
                            </div>

                            <div class="col-md-4">
                                <button class="btn btn-outline-primary w-100" @click="loadProducts"
                                    :disabled="productLoading">
                                    <i class="bi bi-search me-1"></i> Search
                                </button>
                            </div>
                        </div>
<div class="row g-3 mb-3">
  <div class="col-12 col-md-4" v-for="category in productCategories" :key="category.id">
    <div
      class="card h-100 category-card"
      :class="{ 'category-card-selected': String(selectedCategory) === String(category.id) }"
      @click="selectedCategory = category.id"
      role="button"
    >
      <div class="card-body d-flex align-items-center gap-2">
        <i class="bi bi-grid-fill text-primary fs-4"></i>
        <span>{{ category.name }}</span>
        <i
          v-if="String(selectedCategory) === String(category.id)"
          class="bi bi-check-circle-fill text-success ms-auto"
        ></i>
      </div>
    </div>
  </div>

  <div class="col-12 col-md-4">
    <div
      class="card h-100 category-card"
      :class="{ 'category-card-selected': !selectedCategory }"
      @click="selectedCategory = ''"
      role="button"
    >
      <div class="card-body d-flex align-items-center gap-2">
        <i class="bi bi-collection-fill text-primary fs-4"></i>
        <span>All Categories</span>
        <i v-if="!selectedCategory" class="bi bi-check-circle-fill text-success ms-auto"></i>
      </div>
    </div>
  </div>
</div>
                        <div v-if="productLoading" class="text-center py-5">
                            <div class="spinner-border text-primary"></div>
                            <p class="text-muted mt-2">Loading products...</p>
                        </div>


                        <div class="row g-3">
  <div
    v-for="product in filteredProducts"
    :key="product.id"
    class="col-12 col-sm-6 col-lg-3"
  >
    <div
      class="product-card h-100"
      :class="{ 'product-card-selected': isProductSelected(product.id) }"
      @click="toggleProduct(product)"
    >
      <div class="d-flex justify-content-between align-items-start mb-2">
        <div class="product-icon">
          <i class="bi bi-box-seam"></i>
        </div>

        <span
          v-if="isProductSelected(product.id)"
          class="badge bg-primary"
        >
          <i class="bi bi-check-lg me-1"></i>Selected
        </span>
      </div>

      <h6 class="product-name">{{ product.name }}</h6>

      <small class="text-muted d-block mb-2">
        {{ product.default_code || 'No product code' }}
      </small>

      <div class="product-category mb-2">
        <i class="bi bi-tag me-1"></i>
        {{ product.category_name || 'Uncategorized' }}
      </div>

      <div class="d-flex justify-content-between align-items-center">
        <small class="text-muted">Available</small>
        <strong>{{ product.quantity_free }} {{ product.uom }}</strong>
      </div>

      <div class="mt-3">
        <button
          type="button"
          class="btn w-100"
          :class="isProductSelected(product.id)
            ? 'btn-primary'
            : 'btn-outline-primary'"
          @click.stop="toggleProduct(product)"
        >
          <i
            :class="isProductSelected(product.id)
              ? 'bi bi-check-circle me-1'
              : 'bi bi-plus-circle me-1'"
          ></i>
          {{ isProductSelected(product.id) ? 'Selected' : 'Select Product' }}
        </button>
      </div>
    </div>
  </div>
</div>

                        <div v-if="selectedItems.length" class="mt-3">
                            <div class="alert alert-info py-2 mb-0">
                                <i class="bi bi-check-circle me-1"></i>
                                {{ selectedItems.length }} product(s) selected.
                            </div>
                        </div>

                    </section>

                    <!-- STEP 3: QUANTITY -->
                    <section v-if="currentStep === 3">

                        <h5 class="mb-2">3. Enter Quantity</h5>
                        <p class="text-muted mb-3">
                            Enter how many units you need for each product.
                        </p>

                        <div class="alert alert-light border">
                            Department: <strong>{{ selectedDepartment?.name }}</strong>
                        </div>

                        <div class="table-responsive">
                            <table class="table table-bordered align-middle">
                                <thead class="table-light">
                                    <tr>
                                        <th>Product</th>
                                        <th style="width: 150px">Available</th>
                                        <th style="width: 180px">Request Quantity</th>
                                        <th style="width: 70px">Remove</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    <tr v-for="item in selectedItems" :key="item.product_id">
                                        <td>
                                            <div class="fw-semibold">{{ item.name }}</div>
                                            <small class="text-muted">{{ item.uom }}</small>
                                        </td>

                                        <td>{{ item.quantity_free }}</td>

                                        <td>
                                            <input v-model.number="item.quantity" type="number" min="1"
                                                :max="item.quantity_free" class="form-control" />
                                        </td>

                                        <td class="text-center">
                                            <button class="btn btn-sm btn-outline-danger"
                                                @click="removeProduct(item.product_id)">
                                                <i class="bi bi-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div v-if="!selectedItems.length" class="text-center text-muted py-4">
                            No products selected.
                            <button class="btn btn-link" @click="currentStep = 2">
                                Select products
                            </button>
                        </div>

                        <div class="mt-3">
                            <label class="form-label fw-semibold">Request Reason *</label>
                            <textarea v-model="reason" class="form-control" rows="3"
                                placeholder="Explain why you need these assets..."></textarea>
                        </div>

                    </section>

                    <!-- STEP 4: REVIEW -->
                    <section v-if="currentStep === 4">

                        <h5 class="mb-2">4. Review Your Request</h5>
                        <p class="text-muted mb-3">
                            Please check the information before submitting.
                        </p>

                        <div class="review-box mb-3">
                            <small class="text-muted">Department</small>
                            <div class="fw-semibold">
                                <i class="bi bi-building me-1"></i>
                                {{ selectedDepartment?.name }}
                            </div>
                        </div>

                        <h6 class="fw-semibold mb-2">Requested Products</h6>

                        <div class="table-responsive">
                            <table class="table table-bordered align-middle">
                                <thead class="table-light">
                                    <tr>
                                        <th>#</th>
                                        <th>Product</th>
                                        <th>Quantity</th>
                                        <th>Unit</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    <tr v-for="(item, index) in selectedItems" :key="item.product_id">
                                        <td>{{ index + 1 }}</td>
                                        <td>{{ item.name }}</td>
                                        <td>{{ item.quantity }}</td>
                                        <td>{{ item.uom }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div class="review-box mb-3">
                            <small class="text-muted">Request Reason</small>
                            <p class="mb-0 mt-1">{{ reason }}</p>
                        </div>

                        <div class="alert alert-warning">
                            <i class="bi bi-info-circle me-1"></i>
                            Please confirm that the department, products, and quantities are correct.
                        </div>

                    </section>

                    <!-- WIZARD BUTTONS -->
                    <hr class="my-4" />

                    <div class="d-flex justify-content-between flex-wrap gap-2">

                        <button v-if="currentStep > 1" class="btn btn-outline-secondary" @click="previousStep"
                            :disabled="submitting">
                            <i class="bi bi-arrow-left me-1"></i> Previous
                        </button>

                        <div v-else></div>

                        <button v-if="currentStep < 4" class="btn btn-primary px-4" @click="nextStep">
                            Next <i class="bi bi-arrow-right ms-1"></i>
                        </button>

                        <button v-else class="btn btn-success px-4" @click="submitRequest" :disabled="submitting">
                            <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                            <i v-else class="bi bi-send me-1"></i>
                            Submit Request
                        </button>

                    </div>

                </div>
            </div>

            <!-- MY REQUEST HISTORY -->
            <div class="card border-0 shadow-sm">
                <div class="card-body p-3 p-md-4">

                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h5 class="mb-0">
                            <i class="bi bi-clock-history me-2"></i>
                            My Request History
                        </h5>

                        <button class="btn btn-sm btn-outline-primary" @click="loadMyRequests">
                            <i class="bi bi-arrow-clockwise"></i> Refresh
                        </button>
                    </div>

                    <div v-if="myLoading" class="text-center py-4">
                        <div class="spinner-border spinner-border-sm text-primary"></div>
                    </div>

                    <div v-else-if="myRequests.length" class="row g-3">

    <div v-for="item in myRequests" :key="item.id" class="col-12 col-md-6 col-xl-4">

        <div class="request-card h-100">

            <!-- Card header -->
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

            <!-- Card information -->
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

            <!-- Action -->
            <button class="btn btn-outline-primary w-100 mt-3"
                @click="showDetail(item.id)">
                <i class="bi bi-eye me-1"></i>
                View Details
            </button>

        </div>

    </div>

</div>

                    <div v-else class="text-center text-muted py-4">
                        No asset requests found.
                    </div>

                </div>
            </div>

        </template>

        <!-- ================================================= -->
        <!-- MANAGER VIEW -->
        <!-- ================================================= -->

        <template v-if="activeTab === 'manager' && isManager">

            <div class="row g-3 mb-4">
                <div class="col-6 col-lg-3" v-for="stat in managerStats" :key="stat.label">
                    <div class="card border-0 shadow-sm stat-card">
                        <div class="card-body">
                            <small class="text-muted">{{ stat.label }}</small>
                            <h3 class="mb-0 mt-2">{{ stateCounts[stat.state] || 0 }}</h3>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card border-0 shadow-sm">
                <div class="card-body p-3 p-md-4">

                    <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
                        <h5 class="mb-0">
                            <i class="bi bi-clipboard-check me-2"></i>
                            Manage Asset Requests
                        </h5>

                        <button class="btn btn-sm btn-outline-primary" @click="refreshManager">
                            <i class="bi bi-arrow-clockwise"></i> Refresh
                        </button>
                    </div>

                    <div class="d-flex flex-wrap gap-2 mb-3">
                        <button v-for="filter in stateFilters" :key="filter.value" class="btn btn-sm"
                            :class="selectedState === filter.value ? 'btn-primary' : 'btn-outline-secondary'"
                            @click="changeState(filter.value)">
                            {{ filter.label }} ({{ stateCounts[filter.value] || 0 }})
                        </button>
                    </div>

                    <div v-if="managerLoading" class="text-center py-5">
                        <div class="spinner-border text-primary"></div>
                    </div>

                    <div v-else-if="managerRequests.length" class="table-responsive">
                        <table class="table table-hover align-middle">
                            <thead class="table-light">
                                <tr>
                                    <th>Transfer</th>
                                    <th>Employee</th>
                                    <th>Assets</th>
                                    <th>Destination</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                <tr v-for="item in managerRequests" :key="item.id">
                                    <td class="fw-semibold">{{ item.name }}</td>
                                    <td>{{ item.transfer_employee || item.requester }}</td>
                                    <td>{{ (item.products || []).length }} items</td>
                                    <td>{{ item.destination_location }}</td>
                                    <td>{{ formatDate(item.scheduled_date) }}</td>
                                    <td>
                                        <span class="badge" :class="stateClass(item.state)">
                                            {{ item.state_label }}
                                        </span>
                                    </td>
                                    <td>
                                        <div class="d-flex gap-1">
                                            <button class="btn btn-sm btn-outline-primary" @click="showDetail(item.id)">
                                                <i class="bi bi-eye"></i>
                                            </button>

                                            <button v-if="['confirmed', 'assigned'].includes(item.state)"
                                                class="btn btn-sm btn-success" @click="validateRequest(item)">
                                                <i class="bi bi-check-lg"></i>
                                            </button>

                                            <button v-if="!['done', 'cancel'].includes(item.state)"
                                                class="btn btn-sm btn-outline-danger" @click="cancelRequest(item)">
                                                <i class="bi bi-x-lg"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div v-else class="text-center text-muted py-5">
                        No requests found for this state.
                    </div>

                </div>
            </div>

        </template>

        <!-- DETAIL MODAL -->
        <div class="modal fade" id="assetDetailModal" tabindex="-1" aria-hidden="true">
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
                                        {{ selectedRequest.transfer_employee || selectedRequest.requester }}
                                    </div>
                                </div>

                                <div class="col-md-6">
                                    <small class="text-muted">Source Location</small>
                                    <div>{{ selectedRequest.source_location }}</div>
                                </div>

                                <div class="col-md-6">
                                    <small class="text-muted">Destination Location</small>
                                    <div>{{ selectedRequest.destination_location }}</div>
                                </div>

                                <div class="col-md-6">
                                    <small class="text-muted">Status</small>
                                    <span class="badge" :class="stateClass(selectedRequest.state)">
                                        {{ selectedRequest.state_label }}
                                    </span>
                                </div>

                                <div class="col-md-6">
                                    <small class="text-muted">Date</small>
                                    <div>{{ formatDate(selectedRequest.scheduled_date) }}</div>
                                </div>
                            </div>

                            <hr />

                            <h6>Requested Assets</h6>

                            <div class="table-responsive">
                                <table class="table table-bordered">
                                    <thead class="table-light">
                                        <tr>
                                            <th>Product</th>
                                            <th>Requested</th>
                                            <th>Done</th>
                                            <th>Unit</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="product in selectedRequest.products || []" :key="product.move_id">
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
                        <button class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>

                </div>
            </div>
        </div>

    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { Modal } from 'bootstrap'
import Swal from 'sweetalert2'

import {
    getAssetDepartments,
    getAssetProducts,
    createAssetRequest,
    getMyAssetRequests,
    getAssetRequests,
    getAssetRequestDetail,
    validateAssetRequest,
    cancelAssetRequest,
    getAssetRequestStates
} from '../api/asset'

const router = useRouter()

// =====================================================
// WIZARD
// =====================================================

const currentStep = ref(1)

const steps = [
    { number: 1, label: 'Department' },
    { number: 2, label: 'Products' },
    { number: 3, label: 'Quantity' },
    { number: 4, label: 'Review' }
]

const departments = ref([])
const departmentLoading = ref(false)
const selectedDepartment = ref(null)

const selectedCategory = ref('')
const productSearch = ref('')

const productCategories = computed(() => {
    const categories = new Map()

    products.value.forEach(product => {
        if (product.category_id) {
            categories.set(product.category_id, {
                id: product.category_id,
                name: product.category_name
            })
        }
    })

    return Array.from(categories.values())
})

const filteredProducts = computed(() => {
    return products.value.filter(product => {
        const matchCategory =
            !selectedCategory.value ||
            String(product.category_id) === String(selectedCategory.value)

        const search = productSearch.value.trim().toLowerCase()

        const matchSearch =
            !search ||
            (product.name || '').toLowerCase().includes(search) ||
            (product.default_code || '').toLowerCase().includes(search)

        return matchCategory && matchSearch
    })
})

const search = ref('')
const products = ref([])
const selectedItems = ref([])
const reason = ref('')

const productLoading = ref(false)
const submitting = ref(false)

const activeTab = ref('employee')

const myRequests = ref([])
const myLoading = ref(false)

const managerRequests = ref([])
const managerLoading = ref(false)

const selectedState = ref('all')
const stateCounts = ref({})

const selectedRequest = ref(null)
const detailLoading = ref(false)

let detailModal = null

// =====================================================
// PERMISSION
// =====================================================

const isManager = computed(() => {
    try {
        const raw = JSON.parse(localStorage.getItem('groups_id') || '[]')
        const groups = Array.isArray(raw) ? raw : Object.values(raw || {})

        return groups.some(group => {
            const value = typeof group === 'string'
                ? group
                : group?.xml_id || group?.name || group?.id

            return value === 'stock.group_stock_manager'
        })
    } catch {
        return false
    }
})

// =====================================================
// MANAGER FILTERS
// =====================================================

const stateFilters = [
    { label: 'All', value: 'all' },
    { label: 'Draft', value: 'draft' },
    { label: 'Waiting', value: 'waiting' },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'Ready', value: 'assigned' },
    { label: 'Done', value: 'done' },
    { label: 'Cancelled', value: 'cancel' }
]

const managerStats = [
    { label: 'All Requests', state: 'all' },
    { label: 'Waiting', state: 'waiting' },
    { label: 'Ready', state: 'assigned' },
    { label: 'Completed', state: 'done' }
]

// =====================================================
// RESPONSE HELPERS
// =====================================================

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

// =====================================================
// STEP 1: DEPARTMENTS
// =====================================================

const loadDepartments = async () => {
    departmentLoading.value = true

    try {
        const response = await getAssetDepartments()
        const data = checkResponse(response)

        departments.value = data.departments || []
    } catch (error) {
        console.error('Load departments:', error)
        Swal.fire('Error', error.message || 'Unable to load departments', 'error')
    } finally {
        departmentLoading.value = false
    }
}

const selectDepartment = department => {
    selectedDepartment.value = department

    products.value = []
    selectedItems.value = []
    search.value = ''
    selectedCategory.value = ''
    productSearch.value = ''

    loadProducts()
    currentStep.value = 2
}

// =====================================================
// STEP 2: PRODUCTS
// =====================================================

const loadProducts = async () => {
    if (!selectedDepartment.value) return

    productLoading.value = true

    try {
        const response = await getAssetProducts(
            search.value,
            selectedDepartment.value.id
        )

        const data = checkResponse(response)
        products.value = data.products || []
    } catch (error) {
        console.error('Load products:', error)
        Swal.fire('Error', error.message || 'Unable to load products', 'error')
    } finally {
        productLoading.value = false
    }
}

const isProductSelected = productId => {
    return selectedItems.value.some(
        item => Number(item.product_id) === Number(productId)
    )
}
const toggleProduct = product => {
    if (isProductSelected(product.id)) {
        removeProduct(product.id)
        return
    }

    selectedItems.value.push({
        product_id: product.id,
        name: product.name,
        uom: product.uom,
        quantity: 1,
        quantity_free: Number(product.quantity_free || 0)
    })
}

const removeProduct = productId => {
    selectedItems.value = selectedItems.value.filter(
        item => item.product_id !== productId
    )
}

// =====================================================
// WIZARD NAVIGATION
// =====================================================

const nextStep = () => {
    if (currentStep.value === 1 && !selectedDepartment.value) {
        return Swal.fire('Notice', 'Please select a department.', 'warning')
    }

    if (currentStep.value === 2 && !selectedItems.value.length) {
        return Swal.fire('Notice', 'Please select at least one product.', 'warning')
    }

    if (currentStep.value === 3) {
        if (!selectedItems.value.length) {
            return Swal.fire('Notice', 'Please select at least one product.', 'warning')
        }

        const invalidItem = selectedItems.value.find(item =>
            !Number.isFinite(Number(item.quantity)) ||
            Number(item.quantity) <= 0 ||
            Number(item.quantity) > Number(item.quantity_free)
        )

        if (invalidItem) {
            return Swal.fire(
                'Invalid quantity',
                `Please check the quantity for ${invalidItem.name}.`,
                'warning'
            )
        }

        if (!reason.value.trim()) {
            return Swal.fire('Notice', 'Please enter the request reason.', 'warning')
        }
    }

    if (currentStep.value < 4) {
        currentStep.value++
    }
}

const previousStep = () => {
    if (currentStep.value > 1) {
        currentStep.value--
    }
}

// =====================================================
// STEP 4: SUBMIT
// =====================================================

const submitRequest = async () => {
    if (!selectedDepartment.value || !selectedItems.value.length) {
        return Swal.fire('Notice', 'Please complete all steps.', 'warning')
    }

    const invalidItem = selectedItems.value.find(item =>
        !Number.isFinite(Number(item.quantity)) ||
        Number(item.quantity) <= 0 ||
        Number(item.quantity) > Number(item.quantity_free)
    )

    if (invalidItem) {
        return Swal.fire(
            'Invalid quantity',
            `Please check the quantity for ${invalidItem.name}.`,
            'warning'
        )
    }

    if (!reason.value.trim()) {
        return Swal.fire('Notice', 'Please enter the request reason.', 'warning')
    }

    const confirmation = await Swal.fire({
        title: 'Submit Asset Request?',
        text: `Department: ${selectedDepartment.value.name}. Products: ${selectedItems.value.length}.`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Submit Request',
        cancelButtonText: 'Cancel'
    })

    if (!confirmation.isConfirmed) return

    submitting.value = true

    try {
        const payload = {
            department_id: selectedDepartment.value.id,
            reason: reason.value.trim(),
            items: selectedItems.value.map(item => ({
                product_id: item.product_id,
                quantity: Number(item.quantity)
            }))
        }

        const response = await createAssetRequest(payload)
        const data = checkResponse(response)

        await Swal.fire(
            'Success',
            data.message || 'Asset request submitted successfully.',
            'success'
        )

        // Reset wizard
        currentStep.value = 1
        selectedDepartment.value = null
        products.value = []
        selectedItems.value = []
        reason.value = ''
        search.value = ''

        await Promise.all([
            loadDepartments(),
            loadMyRequests()
        ])

    } catch (error) {
        console.error('Submit request:', error)

        Swal.fire(
            'Error',
            error.response?.data?.message ||
            error.message ||
            'Unable to submit asset request.',
            'error'
        )
    } finally {
        submitting.value = false
    }
}

// =====================================================
// EMPLOYEE HISTORY
// =====================================================

const loadMyRequests = async () => {
    myLoading.value = true

    try {
        const response = await getMyAssetRequests()
        const data = checkResponse(response)

        myRequests.value = data.requests || []
    } catch (error) {
        console.error('My requests:', error)
        Swal.fire('Error', error.message || 'Unable to load requests', 'error')
    } finally {
        myLoading.value = false
    }
}

// =====================================================
// MANAGER REQUESTS
// =====================================================

const loadManagerRequests = async () => {
    if (!isManager.value) return

    managerLoading.value = true

    try {
        const response = await getAssetRequests(selectedState.value)
        const data = checkResponse(response)

        managerRequests.value = data.requests || []

        await loadStateCounts()
    } catch (error) {
        console.error('Manager requests:', error)
        Swal.fire('Error', error.message || 'Unable to load requests', 'error')
    } finally {
        managerLoading.value = false
    }
}

const loadStateCounts = async () => {
    try {
        const response = await getAssetRequestStates()
        const data = checkResponse(response)

        stateCounts.value = data.counts || {}
    } catch (error) {
        console.error('State counts:', error)
    }
}

const changeState = async state => {
    selectedState.value = state
    await loadManagerRequests()
}

const refreshManager = async () => {
    await loadManagerRequests()
}

// =====================================================
// DETAIL MODAL
// =====================================================

const showDetail = async id => {
    selectedRequest.value = null
    detailLoading.value = true

    if (!detailModal) {
        const element = document.getElementById('assetDetailModal')
        if (element) detailModal = new Modal(element)
    }

    detailModal?.show()

    try {
        const response = await getAssetRequestDetail(id)
        const data = checkResponse(response)

        selectedRequest.value = data.request || null
    } catch (error) {
        console.error('Request detail:', error)
        detailModal?.hide()
        Swal.fire('Error', error.message || 'Unable to load details', 'error')
    } finally {
        detailLoading.value = false
    }
}

// =====================================================
// VALIDATE
// =====================================================

const validateRequest = async item => {
    const result = await Swal.fire({
        title: 'Issue Assets?',
        text: `Validate transfer ${item.name}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Validate Transfer',
        cancelButtonText: 'Cancel'
    })

    if (!result.isConfirmed) return

    try {
        const response = await validateAssetRequest(item.id)
        const data = checkResponse(response)

        await Swal.fire(
            'Success',
            data.message || 'Assets transferred successfully.',
            'success'
        )

        await refreshManager()
    } catch (error) {
        console.error('Validate:', error)

        Swal.fire(
            'Unable to validate',
            error.response?.data?.message ||
            error.message ||
            'Check stock reservation in Odoo Inventory.',
            'error'
        )
    }
}

// =====================================================
// CANCEL
// =====================================================

const cancelRequest = async item => {
    const result = await Swal.fire({
        title: 'Cancel Request?',
        text: `Cancel transfer ${item.name}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Cancel',
        cancelButtonText: 'No'
    })

    if (!result.isConfirmed) return

    try {
        const response = await cancelAssetRequest(item.id)
        const data = checkResponse(response)

        await Swal.fire(
            'Cancelled',
            data.message || 'Asset request cancelled.',
            'success'
        )

        await refreshManager()
    } catch (error) {
        console.error('Cancel:', error)
        Swal.fire('Error', error.message || 'Unable to cancel request', 'error')
    }
}

// =====================================================
// HELPERS
// =====================================================

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
    if (window.history.length > 1) {
        router.back()
    } else {
        router.push('/choose-booking')
    }
}

// =====================================================
// LIFECYCLE
// =====================================================

onMounted(async () => {
    const element = document.getElementById('assetDetailModal')

    if (element) {
        detailModal = new Modal(element)
    }

    await Promise.all([
        loadDepartments(),
        loadMyRequests()
    ])

    if (isManager.value) {
        await loadStateCounts()
    }
})

onBeforeUnmount(() => {
    detailModal?.dispose()
    detailModal = null
})
</script>

<style scoped>
.category-card {
  cursor: pointer;
  border: 1px solid #dee2e6;
  transition: all 0.2s ease;
}

.category-card:hover {
  border-color: #0d6efd;
  background: #f8faff;
}

.category-card-selected {
  border: 2px solid #0d6efd;
  background: #eef5ff;
}

.category-card .card-body {
  min-height: 65px;
}

.product-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.product-card:hover {
  border-color: #86b7fe;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  transform: translateY(-2px);
}

.product-card-selected {
  border: 2px solid #0d6efd;
  background: #f5f9ff;
}

.product-icon {
  width: 38px;
  height: 38px;
  border-radius: 9px;
  background: #eef4ff;
  color: #0d6efd;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.product-name {
  font-size: 14px;
  font-weight: 500;
  min-height: 36px;
  overflow-wrap: anywhere;
}

.product-category {
  font-size: 12px;
  color: #6c757d;
}

@media (max-width: 576px) {
  .product-card {
    padding: 13px;
  }
}
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

@media (max-width: 576px) {
    .request-card {
        padding: 14px;
    }
}
.asset-page {
    color: #343a40;
}

.wizard-progress {
    display: flex;
    justify-content: space-between;
    position: relative;
    gap: 8px;
}

.wizard-step {
    flex: 1;
    text-align: center;
    position: relative;
    color: #8a929a;
    z-index: 1;
}

.wizard-step:not(:last-child)::after {
    content: '';
    position: absolute;
    height: 2px;
    background: #dee2e6;
    top: 19px;
    left: 58%;
    width: 84%;
    z-index: -1;
}

.step-circle {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: #e9ecef;
    color: #6c757d;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 8px;
    font-weight: 600;
}

.wizard-step.active {
    color: #0d6efd;
}

.wizard-step.active .step-circle,
.wizard-step.completed .step-circle {
    background: #0d6efd;
    color: #fff;
}

.wizard-step.completed {
    color: #198754;
}

.wizard-step.completed .step-circle {
    background: #198754;
}

.department-card {
    border: 1px solid #dee2e6;
    border-radius: 10px;
    padding: 18px;
    background: #fff;
    transition: all 0.2s ease;
}

.department-card:hover {
    border-color: #86b7fe;
    background: #f8fbff;
}

.department-card.selected {
    border: 2px solid #0d6efd;
    background: #f0f6ff;
}

.department-icon {
    width: 42px;
    height: 42px;
    border-radius: 10px;
    background: #e7f1ff;
    color: #0d6efd;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
}

.asset-product-card {
    border: 1px solid #e9ecef;
    border-radius: 10px;
    padding: 16px;
    background: #fff;
    transition: all 0.2s ease;
}

.asset-product-card:hover {
    border-color: #86b7fe;
    box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
}

.review-box {
    padding: 15px;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    background: #f8f9fa;
}

.stat-card {
    border-radius: 10px;
}

.stat-card h3 {
    font-weight: 600;
}

.table th {
    white-space: nowrap;
    font-weight: 600;
    font-size: 13px;
}

.table td {
    font-size: 14px;
}

@media (max-width: 576px) {
    .asset-page {
        padding-left: 10px;
        padding-right: 10px;
    }

    .wizard-step small {
        font-size: 11px;
    }

    .step-circle {
        width: 32px;
        height: 32px;
    }

    .wizard-step:not(:last-child)::after {
        top: 16px;
    }

    .asset-product-card {
        padding: 12px;
    }
}
</style>
