<template>
  <div class="container-fluid py-4">

    <!-- HEADER -->
    <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
      <div>
        <h4 class="mb-1">Asset Request Management</h4>
        <p class="text-muted mb-0">
          Manage and track employee asset requests.
        </p>
      </div>

      <div class="d-flex gap-2">
        <button class="btn btn-outline-secondary" @click="goBack">
          <i class="bi bi-arrow-left me-1"></i>
          Back
        </button>

        <button class="btn btn-primary" @click="loadRequests" :disabled="loading">
          <i class="bi bi-arrow-clockwise me-1"></i>
          Refresh
        </button>
      </div>
    </div>

    <!-- STATISTICS -->
    <div class="row g-3 mb-4">

      <div v-for="stat in statistics" :key="stat.key" class="col-6 col-md-4 col-xl-2">
        <button type="button" class="stat-card w-100 text-start"
          :class="{ 'stat-card-active': selectedState === stat.key }" @click="selectedState = stat.key">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <small>{{ stat.label }}</small>
              <h3 class="mb-0 mt-2">{{ stateCounts[stat.key] || 0 }}</h3>
            </div>

            <i :class="stat.icon"></i>
          </div>
        </button>
      </div>

    </div>

    <!-- REQUEST HISTORY -->
    <div class="card border-0 shadow-sm">
      <div class="card-body p-3 p-md-4">

        <!-- TITLE -->
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div>
            <h5 class="mb-1">Asset Requests</h5>
            <small class="text-muted">
              {{ filteredRequests.length }} requests found
            </small>
          </div>
        </div>

        <!-- SEARCH + FILTER -->
        <div class="row g-2 mb-4">

          <div class="col-12 col-md-6">
            <div class="input-group">
              <span class="input-group-text bg-white">
                <i class="bi bi-search"></i>
              </span>

              <input v-model="searchText" type="text" class="form-control"
                placeholder="Search request number, employee or location...">
            </div>
          </div>

          <div class="col-12 col-md-6">
            <select v-model="selectedState" class="form-select">
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="waiting">Waiting</option>
              <option value="confirmed">Confirmed</option>
              <option value="assigned">Ready to Issue</option>
              <option value="done">Completed</option>
              <option value="cancel">Cancelled</option>
            </select>
          </div>

        </div>

        <!-- LOADING -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary"></div>
          <p class="text-muted mt-2">Loading asset requests...</p>
        </div>

        <!-- REQUEST CARDS -->
        <div v-else-if="paginatedRequests.length" class="row g-3">

          <div v-for="item in paginatedRequests" :key="item.id" class="col-12 col-md-6 col-xl-4">
            <div class="request-card h-100">

              <!-- HEADER -->
              <div class="d-flex justify-content-between align-items-start gap-2 mb-3">

                <div class="min-width-0">
                  <div class="fw-semibold fs-6 text-truncate">
                    <i class="bi bi-box-seam text-primary me-2"></i>
                    {{ item.name || `Request #${item.id}` }}
                  </div>

                  <small class="text-muted">
                    {{ formatDate(item.scheduled_date) }}
                  </small>
                </div>

                <span class="badge flex-shrink-0" :class="stateClass(item.state)">
                  {{ item.state_label || item.state || '-' }}
                </span>

              </div>

              <hr class="my-2">

              <!-- INFORMATION -->
              <div class="request-info">

                <div class="info-item">
                  <i class="bi bi-person text-primary"></i>
                  <div>
                    <small>Employee</small>
                    <strong>
                      {{ item.transfer_employee || '-' }}
                    </strong>
                  </div>
                </div>

                <div class="info-item">
                  <i class="bi bi-boxes text-primary"></i>
                  <div>
                    <small>Assets</small>
                    <strong>
                      {{ (item.products || []).length }} products
                    </strong>
                  </div>
                </div>

                <div class="info-item">
                  <i class="bi bi-geo-alt text-primary"></i>
                  <div>
                    <small>Destination</small>
                    <strong>
                      {{ item.destination_location || '-' }}
                    </strong>
                  </div>
                </div>

              </div>

              <hr class="my-3">

              <!-- ACTIONS -->
              <div class="d-flex gap-2">

                <button class="btn btn-outline-primary flex-fill" @click="showDetail(item.id)">
                  <i class="bi bi-eye me-1"></i>
                  Details
                </button>
                <button type="button" class="btn btn-outline-secondary flex-fill" @click="showPrintPreview(item.id)"
                  :disabled="printLoading">
                  <i class="bi bi-printer me-1"></i>
                  Print
                </button>

                <button class="btn btn-outline-primary" @click="openAssetDetail(item.id)">
                  <i class="bi bi-eye me-1"></i>
                  View
                </button>

                <button v-if="canValidate(item)" class="btn btn-success flex-fill" @click="validateRequest(item)"
                  :disabled="actionLoading === item.id">
                  <span v-if="actionLoading === item.id" class="spinner-border spinner-border-sm me-1"></span>

                  <i v-else class="bi bi-check-circle me-1"></i>
                  Issue
                </button>

                <button v-if="canCancel(item)" class="btn btn-outline-danger" @click="cancelRequest(item)"
                  :disabled="actionLoading === item.id" title="Cancel request">
                  <i class="bi bi-x-lg"></i>
                </button>

              </div>

            </div>
          </div>

        </div>

        <!-- EMPTY -->
        <div v-else class="text-center text-muted py-5">
          <i class="bi bi-inbox display-5"></i>
          <p class="mt-3 mb-0">No asset requests found.</p>
        </div>

        <!-- PAGINATION -->
        <div v-if="totalPages > 1" class="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-4">
          <small class="text-muted">
            Page {{ currentPage }} of {{ totalPages }}
          </small>

          <div class="btn-group">
            <button class="btn btn-outline-secondary" :disabled="currentPage <= 1" @click="currentPage--">
              <i class="bi bi-chevron-left"></i>
            </button>

            <button class="btn btn-outline-secondary" :disabled="currentPage >= totalPages" @click="currentPage++">
              <i class="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>

      </div>
    </div>
    <!-- PRINT PREVIEW MODAL -->
    <div class="modal fade" id="assetRequestPrintModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">

          <div class="modal-header">
            <div>
              <h5 class="modal-title">
                <i class="bi bi-printer me-2"></i>
                Print Preview
              </h5>
              <small class="text-muted">
                Review the asset request before printing.
              </small>
            </div>

            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>

          <div class="modal-body">

            <div v-if="printLoading" class="text-center py-5">
              <div class="spinner-border text-primary"></div>
              <p class="text-muted mt-2">Preparing print preview...</p>
            </div>

            <div v-else-if="printRequest" id="assetRequestPrintArea" class="print-document">

              <!-- PRINT HEADER -->
              <div class="print-header">
                <h3>ASSET REQUEST</h3>
                <p class="mb-1">Asset Transfer / Issue Document</p>
                <hr>
              </div>
              <!-- TRANSFER BARCODE -->
              <div class="barcode-section" v-if="printRequest">
                <div class="barcode-label">
                  TRANSFER NUMBER
                </div>

                <svg ref="barcodeElement" class="transfer-barcode"></svg>

                <div class="barcode-number">
                  {{ printRequest.name || '-' }}
                </div>
              </div>

              <!-- REQUEST INFORMATION -->
              <h6 class="print-section-title">Request Information</h6>

              <div class="row g-3 mb-4">

                <div class="col-6">
                  <small>Transfer Number</small>
                  <div class="print-value">
                    {{ printRequest.name || '-' }}
                  </div>
                </div>

                <div class="col-6">
                  <small>Request Date</small>
                  <div class="print-value">
                    {{ formatDate(printRequest.scheduled_date) }}
                  </div>
                </div>

                <div class="col-6">
                  <small>Employee</small>
                  <div class="print-value">
                    {{ printRequest.transfer_employee || '-' }}
                  </div>
                </div>

                <div class="col-6">
                  <small>Status</small>
                  <div class="print-value">
                    {{ printRequest.state_label || printRequest.state || '-' }}
                  </div>
                </div>

                <div class="col-6">
                  <small>Source Location</small>
                  <div class="print-value">
                    {{ printRequest.source_location || '-' }}
                  </div>
                </div>

                <div class="col-6">
                  <small>Destination Location</small>
                  <div class="print-value">
                    {{ printRequest.destination_location || '-' }}
                  </div>
                </div>

                <div class="col-12">
                  <small>Reason</small>
                  <div class="print-value">
                    {{ printRequest.reason || 'No reason provided' }}
                  </div>
                </div>

              </div>

              <!-- PRODUCT TABLE -->
              <h6 class="print-section-title">Requested Assets</h6>

              <table class="table table-bordered align-middle print-table">
                <thead>
                  <tr>
                    <th style="width: 5%">No.</th>
                    <th>Product</th>
                    <th>Product Code</th>
                    <th class="text-end">Requested</th>
                    <th class="text-end">Done</th>
                    <th>Unit</th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-for="(product, index) in printRequest.products || []" :key="product.move_id || index">
                    <td>{{ index + 1 }}</td>
                    <td>{{ product.product_name || '-' }}</td>
                    <td>{{ product.default_code || '-' }}</td>
                    <td class="text-end">{{ product.quantity ?? 0 }}</td>
                    <td class="text-end">{{ product.done_quantity ?? 0 }}</td>
                    <td>{{ product.uom || '-' }}</td>
                  </tr>

                  <tr v-if="!printRequest.products?.length">
                    <td colspan="6" class="text-center">
                      No products found.
                    </td>
                  </tr>
                </tbody>
              </table>

              <!-- SIGNATURES -->
              <div class="row mt-5 signature-area">
                <div class="col-4 text-center">
                  <div class="signature-line"></div>
                  <strong>Requested By</strong>
                </div>

                <div class="col-4 text-center">
                  <div class="signature-line"></div>
                  <strong>Issued By</strong>
                </div>

                <div class="col-4 text-center">
                  <div class="signature-line"></div>
                  <strong>Received By</strong>
                </div>
              </div>

              <div class="print-footer">
                Printed on: {{ new Date().toLocaleString('en-GB', { timeZone: 'Asia/Vientiane' }) }}
              </div>

            </div>
          </div>

          <div class="modal-footer">

            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
              <i class="bi bi-x-circle me-1"></i>
              Close
            </button>

            <!-- DOWNLOAD PDF -->
            <button type="button" class="btn btn-success" @click="downloadAssetRequestPDF"
              :disabled="!printRequest || printLoading">
              <i class="bi bi-file-earmark-pdf me-1"></i>
              Download PDF
            </button>

            <!-- PRINT -->
            <button type="button" class="btn btn-primary" @click="printAssetRequest"
              :disabled="!printRequest || printLoading">
              <i class="bi bi-printer me-1"></i>
              Print
            </button>

          </div>

        </div>
      </div>
    </div>
    <!-- DETAIL MODAL -->
    <div class="modal fade" id="adminAssetDetailModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">

          <div class="modal-header">
            <div>
              <h5 class="modal-title">Asset Request Details</h5>
              <small class="text-muted">
                {{ selectedRequest?.name || '' }}
              </small>
            </div>

            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>

          <div class="modal-body">

            <div v-if="detailLoading" class="text-center py-5">
              <div class="spinner-border text-primary"></div>
              <p class="text-muted mt-2">Loading details...</p>
            </div>

            <template v-else-if="selectedRequest">

              <!-- REQUEST INFORMATION -->
              <div class="row g-3 mb-3">

                <div class="col-md-6">
                  <small class="text-muted">Transfer Number</small>
                  <div class="fw-semibold">
                    {{ selectedRequest.name || '-' }}
                  </div>
                </div>

                <div class="col-md-6">
                  <small class="text-muted">Employee</small>
                  <div class="fw-semibold">
                    {{ selectedRequest.transfer_employee || '-' }}
                  </div>
                </div>

                <div class="col-md-6">
                  <small class="text-muted">Source Location</small>
                  <div>
                    {{ selectedRequest.source_location || '-' }}
                  </div>
                </div>

                <div class="col-md-6">
                  <small class="text-muted">Destination Location</small>
                  <div>
                    {{ selectedRequest.destination_location || '-' }}
                  </div>
                </div>

                <div class="col-md-6">
                  <small class="text-muted">Status</small>
                  <div>
                    <span class="badge" :class="stateClass(selectedRequest.state)">
                      {{ selectedRequest.state_label || selectedRequest.state }}
                    </span>
                  </div>
                </div>

                <div class="col-md-6">
                  <small class="text-muted">Date</small>
                  <div>
                    {{ formatDate(selectedRequest.scheduled_date) }}
                  </div>
                </div>

                <div class="col-12">
                  <small class="text-muted">Reason</small>
                  <div class="p-3 bg-light rounded">
                    {{ selectedRequest.reason || 'No reason provided' }}
                  </div>
                </div>

              </div>

              <hr>

              <!-- PRODUCTS -->
              <h6 class="mb-3">Requested Assets</h6>

              <div class="table-responsive">
                <table class="table table-bordered align-middle">

                  <thead class="table-light">
                    <tr>
                      <th>Product</th>
                      <th>Code</th>
                      <th>Requested</th>
                      <th>Done</th>
                      <th>Unit</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr v-for="product in selectedRequest.products || []" :key="product.move_id">
                      <td>{{ product.product_name }}</td>
                      <td>{{ product.default_code || '-' }}</td>
                      <td>{{ product.quantity }}</td>
                      <td>{{ product.done_quantity }}</td>
                      <td>{{ product.uom }}</td>
                    </tr>

                    <tr v-if="!selectedRequest.products?.length">
                      <td colspan="5" class="text-center text-muted">
                        No products found.
                      </td>
                    </tr>
                  </tbody>

                </table>
              </div>

            </template>

          </div>

          <div class="modal-footer">

            <button v-if="selectedRequest && canValidate(selectedRequest)" class="btn btn-success"
              @click="validateRequest(selectedRequest)" :disabled="actionLoading === selectedRequest.id">
              <i class="bi bi-check-circle me-1"></i>
              Validate / Issue Assets
            </button>

            <button v-if="selectedRequest && canCancel(selectedRequest)" class="btn btn-outline-danger"
              @click="cancelRequest(selectedRequest)" :disabled="actionLoading === selectedRequest.id">
              <i class="bi bi-x-circle me-1"></i>
              Cancel Request
            </button>

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
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  watch,
  nextTick
} from 'vue'
import JsBarcode from 'jsbarcode'

import { useRouter } from 'vue-router'
import { Modal } from 'bootstrap'
import Swal from 'sweetalert2'
import html2pdf from 'html2pdf.js'
import {
  getAssetRequests,
  getAssetRequestDetail,
  validateAssetRequest,
  cancelAssetRequest,
  getAssetRequestStates
} from '../api/asset'

const router = useRouter()

// =====================================================
// STATE
// =====================================================

const requests = ref([])
const loading = ref(false)
const actionLoading = ref(null)

const searchText = ref('')
const selectedState = ref('all')

const selectedRequest = ref(null)
const detailLoading = ref(false)
const printRequest = ref(null)
const printLoading = ref(false)

let printModal = null

const barcodeElement = ref(null)

const generateTransferBarcode = () => {
  const svg = barcodeElement.value
  const transferNumber = printRequest.value?.name

  if (!svg || !transferNumber) {
    console.warn('Barcode not ready:', {
      svgExists: !!svg,
      transferNumber
    })
    return
  }

  try {
    // Clear any previous barcode
    svg.innerHTML = ''

    JsBarcode(svg, String(transferNumber), {
      format: 'CODE128',
      width: 2,
      height: 60,
      displayValue: false,
      margin: 10,
      background: '#ffffff',
      lineColor: '#000000'
    })

    console.log('Barcode generated successfully:', transferNumber)

  } catch (error) {
    console.error('Barcode generation failed:', error)
  }
}

// =====================================================
// PRINT PREVIEW
// =====================================================

const showPrintPreview = async (id) => {
  printRequest.value = null
  printLoading.value = true

  try {
    const response = await getAssetRequestDetail(id)
    const data = checkResponse(response)

    if (!data.request) {
      throw new Error('Asset request details not found.')
    }

    printRequest.value = data.request

    // Important: hide loading first so Vue renders the SVG
    printLoading.value = false

    // Wait until the barcode SVG exists in the DOM
    await nextTick()

    generateTransferBarcode()

    // Open preview after barcode generation
    printModal?.show()

  } catch (error) {
    console.error('Print preview:', error)

    Swal.fire(
      'Error',
      error.message || 'Unable to prepare print preview.',
      'error'
    )
  } finally {
    printLoading.value = false
  }
}


// =====================================================
// PRINT ASSET REQUEST
// =====================================================

const printAssetRequest = async () => {
  if (!printRequest.value) return

  // Ensure barcode has been rendered before printing
  await nextTick()

  if (!barcodeElement.value?.innerHTML) {
    generateTransferBarcode()
  }

  const element = document.getElementById('assetRequestPrintArea')

  if (!element) {
    Swal.fire('Error', 'Print preview not found.', 'error')
    return
  }

  const printWindow = window.open('', '_blank', 'width=1000,height=800')

  if (!printWindow) {
    Swal.fire(
      'Popup Blocked',
      'Please allow popups to print this document.',
      'warning'
    )
    return
  }

  const styles = [...document.querySelectorAll('style, link[rel="stylesheet"]')]
    .map(style => style.outerHTML)
    .join('\n')

  printWindow.document.open()

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${printRequest.value.name || 'Asset Request'}</title>
        <meta charset="UTF-8">
        ${styles}

        <style>
          @page {
            size: A4 portrait;
            margin: 12mm;
          }

          body {
            background: white !important;
            color: black !important;
            font-family: Arial, sans-serif;
          }

          .print-document {
            width: 100%;
            padding: 0;
            background: white;
            color: black;
          }

          .barcode-section {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin: 15px auto 25px;
            text-align: center;
          }

          .transfer-barcode {
            display: block;
            width: auto;
            max-width: 100%;
            height: 80px;
            min-height: 60px;
            margin: 0 auto;
          }

          .barcode-number {
            font-size: 14px;
            font-weight: bold;
            margin-top: 5px;
          }

          .print-table {
            width: 100%;
            border-collapse: collapse;
          }

          .print-table th,
          .print-table td {
            border: 1px solid #333;
            padding: 8px;
            color: black;
          }

          .print-table th {
            background: #eee !important;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          .signature-area,
          .print-table tr {
            page-break-inside: avoid;
          }
        </style>
      </head>

      <body>
        ${element.outerHTML}
      </body>
    </html>
  `)

  printWindow.document.close()

  printWindow.onload = () => {
    printWindow.focus()

    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 500)
  }
}

// =====================================================
// DOWNLOAD ASSET REQUEST PDF
// =====================================================

const downloadAssetRequestPDF = async () => {
  if (!printRequest.value) return

  const element = document.getElementById('assetRequestPrintArea')

  if (!element) {
    Swal.fire('Error', 'Print document not found.', 'error')
    return
  }

  const filename = `${(printRequest.value.name || 'Asset_Request')
    .replace(/[\\/:*?"<>|]/g, '_')}.pdf`

  try {
    Swal.fire({
      title: 'Generating PDF...',
      text: 'Please wait while preparing your document.',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    })

    await html2pdf()
      .set({
        margin: [10, 10, 10, 10],
        filename,
        image: {
          type: 'jpeg',
          quality: 0.98
        },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          scrollY: 0
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait'
        },
        pagebreak: {
          mode: ['avoid-all', 'css', 'legacy']
        }
      })
      .from(element)
      .save()

    Swal.close()

    Swal.fire({
      icon: 'success',
      title: 'PDF Downloaded',
      text: 'Asset request PDF downloaded successfully.',
      timer: 1800,
      showConfirmButton: false
    })

  } catch (error) {
    console.error('Download PDF:', error)

    Swal.fire(
      'Error',
      'Unable to generate PDF.',
      'error'
    )
  }
}

const openAssetDetail = (id) => {
  router.push(`/app/asset-request/${id}`)
}
const stateCounts = ref({
  all: 0,
  draft: 0,
  waiting: 0,
  confirmed: 0,
  assigned: 0,
  done: 0,
  cancel: 0
})

const currentPage = ref(1)
const pageSize = 9

let detailModal = null


// =====================================================
// STATISTICS
// =====================================================

const statistics = [
  {
    key: 'all',
    label: 'All Requests',
    icon: 'bi bi-collection text-primary'
  },
  {
    key: 'draft',
    label: 'Draft',
    icon: 'bi bi-file-earmark text-secondary'
  },
  {
    key: 'waiting',
    label: 'Waiting',
    icon: 'bi bi-hourglass-split text-warning'
  },
  {
    key: 'confirmed',
    label: 'Confirmed',
    icon: 'bi bi-check-circle text-info'
  },
  {
    key: 'assigned',
    label: 'Ready to Issue',
    icon: 'bi bi-box-seam text-primary'
  },
  {
    key: 'done',
    label: 'Completed',
    icon: 'bi bi-check-circle-fill text-success'
  }
]


// =====================================================
// RESPONSE HANDLING
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
// LOAD REQUESTS
// =====================================================

const loadRequests = async () => {
  loading.value = true

  try {
    const [requestResponse, countResponse] = await Promise.all([
      getAssetRequests(),
      getAssetRequestStates()
    ])

    const requestData = checkResponse(requestResponse)
    const countData = checkResponse(countResponse)

    requests.value = requestData.requests || []

    stateCounts.value = {
      ...stateCounts.value,
      ...(countData.counts || {})
    }

  } catch (error) {
    console.error('Load asset requests:', error)

    Swal.fire(
      'Error',
      error.message || 'Unable to load asset requests.',
      'error'
    )
  } finally {
    loading.value = false
  }
}


// =====================================================
// FILTER
// =====================================================

const filteredRequests = computed(() => {
  let result = [...requests.value]

  if (selectedState.value !== 'all') {
    result = result.filter(
      item => item.state === selectedState.value
    )
  }

  const keyword = searchText.value.trim().toLowerCase()

  if (keyword) {
    result = result.filter(item => {
      const searchable = [
        item.name,
        item.transfer_employee,
        item.origin,
        item.source_location,
        item.destination_location
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return searchable.includes(keyword)
    })
  }

  return result
})


// =====================================================
// PAGINATION
// =====================================================

const totalPages = computed(() => {
  return Math.max(
    1,
    Math.ceil(filteredRequests.value.length / pageSize)
  )
})

const paginatedRequests = computed(() => {
  const start = (currentPage.value - 1) * pageSize

  return filteredRequests.value.slice(
    start,
    start + pageSize
  )
})

watch([selectedState, searchText], () => {
  currentPage.value = 1
})

watch(totalPages, value => {
  if (currentPage.value > value) {
    currentPage.value = value
  }
})


// =====================================================
// PERMISSIONS / ACTION CONDITIONS
// =====================================================

const canValidate = item => {
  return ['draft', 'waiting', 'confirmed', 'assigned'].includes(
    item?.state
  )
}

const canCancel = item => {
  return ['draft', 'waiting', 'confirmed', 'assigned'].includes(
    item?.state
  )
}


// =====================================================
// DETAIL MODAL
// =====================================================

const showDetail = async id => {
  selectedRequest.value = null
  detailLoading.value = true

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


// =====================================================
// VALIDATE / ISSUE ASSETS
// =====================================================

const validateRequest = async item => {
  const result = await Swal.fire({
    title: 'Issue Assets?',
    text: `Are you sure you want to validate ${item.name}?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Yes, Issue Assets',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#198754'
  })

  if (!result.isConfirmed) return

  actionLoading.value = item.id

  try {
    const response = await validateAssetRequest(item.id)
    const data = checkResponse(response)

    if (data.action) {
      throw new Error(
        data.message ||
        'Odoo requires an additional inventory operation. Please complete it in Inventory.'
      )
    }

    if (data.request) {
      selectedRequest.value = data.request
    }

    await loadRequests()

    await Swal.fire(
      'Success',
      data.message || 'Assets issued successfully.',
      'success'
    )

  } catch (error) {
    console.error('Validate asset request:', error)

    Swal.fire(
      'Unable to Issue Assets',
      error.message || 'Please check available stock.',
      'error'
    )
  } finally {
    actionLoading.value = null
  }
}


// =====================================================
// CANCEL REQUEST
// =====================================================

const cancelRequest = async item => {
  const result = await Swal.fire({
    title: 'Cancel Request?',
    text: `Are you sure you want to cancel ${item.name}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, Cancel Request',
    cancelButtonText: 'Keep Request',
    confirmButtonColor: '#dc3545'
  })

  if (!result.isConfirmed) return

  actionLoading.value = item.id

  try {
    const response = await cancelAssetRequest(item.id)
    const data = checkResponse(response)

    selectedRequest.value = data.request || selectedRequest.value

    await loadRequests()

    await Swal.fire(
      'Cancelled',
      data.message || 'Asset request cancelled successfully.',
      'success'
    )

  } catch (error) {
    console.error('Cancel asset request:', error)

    Swal.fire(
      'Error',
      error.message || 'Unable to cancel asset request.',
      'error'
    )
  } finally {
    actionLoading.value = null
  }
}


// =====================================================
// STATUS STYLE
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


// =====================================================
// DATE FORMAT
// =====================================================

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


// =====================================================
// BACK
// =====================================================

const goBack = () => {
  router.back()
}


// =====================================================
// LIFECYCLE
// =====================================================
onMounted(async () => {
  const detailElement = document.getElementById(
    'adminAssetDetailModal'
  )

  const printElement = document.getElementById(
    'assetRequestPrintModal'
  )

  if (detailElement) {
    detailModal = new Modal(detailElement)
  }

  if (printElement) {
    printModal = new Modal(printElement)
  }

  await loadRequests()
})

onBeforeUnmount(() => {
  detailModal?.dispose()
  printModal?.dispose()

  detailModal = null
  printModal = null

  document.body.classList.remove('asset-printing')
})
</script>
<style scoped>
.barcode-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin: 15px auto 25px;
  padding: 10px;
  background: #fff;
  text-align: center;
}

.barcode-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1.5px;
  margin-bottom: 8px;
  color: #555;
}

.transfer-barcode {
  display: block;
  width: auto;
  max-width: 100%;
  height: 80px;
  min-height: 60px;
  margin: 0 auto;
}

.barcode-number {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 1px;
  margin-top: 5px;
  color: #000;
}

/* PDF DOCUMENT */

.print-document {
  background: #fff;
  color: #212529;
  padding: 25px;
  min-height: 500px;
  font-size: 14px;
  width: 100%;
}

.print-section-title {
  font-weight: 700;
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 8px;
  margin-bottom: 16px;
  page-break-after: avoid;
}

.print-table {
  width: 100%;
  border-collapse: collapse;
}

.print-table thead {
  display: table-header-group;
}

.print-table tr {
  page-break-inside: avoid;
}

.signature-area {
  page-break-inside: avoid;
}

.print-footer {
  page-break-inside: avoid;
}

/* PRINT PREVIEW */

.print-document {
  background: #fff;
  color: #212529;
  padding: 25px;
  min-height: 500px;
  font-size: 14px;
}

.print-header {
  text-align: center;
  margin-bottom: 30px;
}

.print-header h3 {
  font-weight: 700;
  letter-spacing: 1px;
}

.print-header p {
  color: #6c757d;
}

.print-section-title {
  font-weight: 700;
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 8px;
  margin-bottom: 16px;
}

.print-document small {
  display: block;
  color: #6c757d;
  margin-bottom: 4px;
}

.print-value {
  font-weight: 600;
  overflow-wrap: anywhere;
}

.print-table th {
  background: #f1f3f5;
  white-space: nowrap;
}

.signature-line {
  border-top: 1px solid #333;
  margin: 55px 10px 10px;
}

.print-footer {
  margin-top: 35px;
  padding-top: 10px;
  border-top: 1px solid #dee2e6;
  text-align: right;
  color: #6c757d;
  font-size: 11px;
}

/* PRINT ONLY THE PREVIEW DOCUMENT */

@media print {
  @page {
    size: A4 portrait;
    margin: 12mm;
  }

  body.asset-printing * {
    visibility: hidden !important;
  }

  body.asset-printing #assetRequestPrintArea,
  body.asset-printing #assetRequestPrintArea * {
    visibility: visible !important;
  }

  body.asset-printing #assetRequestPrintArea {
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    width: 100% !important;
    min-height: auto !important;
    padding: 0 !important;
    margin: 0 !important;
    background: #fff !important;
    color: #000 !important;
  }

  body.asset-printing .print-document {
    padding: 0 !important;
  }

  body.asset-printing .print-table {
    width: 100% !important;
    border-collapse: collapse !important;
  }

  body.asset-printing .print-table th,
  body.asset-printing .print-table td {
    border: 1px solid #333 !important;
    padding: 8px !important;
    color: #000 !important;
  }

  body.asset-printing .print-table th {
    background: #eee !important;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }

  body.asset-printing .print-section-title {
    color: #000 !important;
  }

  body.asset-printing .print-footer {
    color: #333 !important;
  }
}

.stat-card {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
  color: #212529;
}

.stat-card:hover {
  border-color: #86b7fe;
  transform: translateY(-2px);
}

.stat-card-active {
  border: 2px solid #0d6efd;
  background: #f4f8ff;
}

.stat-card small {
  color: #6c757d;
  font-size: 12px;
}

.stat-card h3 {
  font-size: 25px;
  font-weight: 600;
}

.stat-card>div>i {
  font-size: 25px;
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

.info-item>i {
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

.min-width-0 {
  min-width: 0;
}

@media (max-width: 576px) {
  .stat-card {
    padding: 13px;
  }

  .stat-card h3 {
    font-size: 21px;
  }

  .request-card {
    padding: 14px;
  }
}
</style>