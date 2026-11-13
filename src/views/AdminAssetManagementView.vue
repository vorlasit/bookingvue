<template>
  <div class="container-fluid py-4 asset-management">
    <!-- Header -->
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div>
        <h4 class="mb-1">Asset Management</h4>
        <p class="text-muted mb-0">Manage products, stock and employee transfers</p>
      </div>
      <button class="btn btn-outline-secondary" @click="loadProducts">
        <i class="bi bi-arrow-clockwise me-1"></i> Refresh
      </button>
    </div>

    <!-- Tabs -->
    <div class="card border-0 shadow-sm">
      <div class="card-body p-3">
        <ul class="nav nav-pills asset-tabs gap-2 mb-4">
          <li class="nav-item">
            <button class="nav-link" :class="{ active: activeTab === 'products' }" @click="activeTab = 'products'">
              <i class="bi bi-box-seam me-2"></i>Products
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link" :class="{ active: activeTab === 'stock' }" @click="activeTab = 'stock'">
              <i class="bi bi-boxes me-2"></i>Stock Adjustment
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link" :class="{ active: activeTab === 'transfer' }" @click="activeTab = 'transfer'">
              <i class="bi bi-arrow-left-right me-2"></i>Internal Transfer
            </button>
          </li>
        </ul>

        <!-- PRODUCT TAB -->
        <section v-if="activeTab === 'products'">
          <div class="d-flex flex-wrap justify-content-between gap-2 mb-3">
            <div>
              <h5 class="mb-1">Products</h5>
              <small class="text-muted">{{ filteredProducts.length }} products</small>
            </div>
            <button class="btn btn-primary" @click="openProductForm()">
              <i class="bi bi-plus-lg me-1"></i> Create Product
            </button>
          </div>

          <div class="row g-2 mb-3">
            <!-- Search -->
            <div class="col-md-5">
              <input v-model="productSearch" class="form-control" placeholder="Search product name or code..." />
            </div>

            <!-- Category Filter -->
            <div class="col-md-4">
              <select v-model.number="selectedCategory" class="form-select">
                <option :value="0">All Categories</option>
                <option v-for="category in productCategories" :key="category.id" :value="category.id">
                  {{ category.name }}
                </option>
              </select>
            </div>

            <!-- Clear Filter -->
            <div class="col-md-3">
              <button type="button" class="btn btn-outline-secondary w-100" @click="clearProductFilters">
                <i class="bi bi-x-circle me-1"></i>
                Clear Filters
              </button>
            </div>
          </div>

          <div v-if="loadingProducts" class="text-center py-5">
            <div class="spinner-border text-primary"></div>
          </div>

          <div v-else class="table-responsive">
            <table class="table table-hover align-middle">
              <thead class="table-light">
                <tr>
                  <th>Product</th>
                  <th>Code</th>
                  <th>Department</th>
                  <th>Category</th>
                  <th>Unit</th>
                  <th>Status</th>
                  <th class="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="product in filteredProducts" :key="product.id">
                  <td class="fw-medium">{{ product.name }}</td>
                  <td>{{ product.default_code || '-' }}</td>
                  <td>{{ product.department_name || '-' }}</td>
                  <td>{{ product.category_name || '-' }}</td>
                  <td>{{ product.uom_name || '-' }}</td>
                  <td>
                    <span class="badge"
                      :class="product.active ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'">
                      {{ product.active ? 'Active' : 'Archived' }}
                    </span>
                  </td>
                  <td class="text-end">
                    <button class="btn btn-sm btn-outline-primary me-1" @click="openProductForm(product)">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-secondary" @click="toggleProduct(product)">
                      <i :class="product.active ? 'bi bi-archive' : 'bi bi-arrow-counterclockwise'"></i>
                    </button>
                  </td>
                </tr>
                <tr v-if="!filteredProducts.length">
                  <td colspan="7" class="text-center text-muted py-4">
                    No products found
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Product Form -->
          <div v-if="showProductModal" class="modal fade show d-block" tabindex="-1"
            style="background: rgba(0,0,0,0.5);">
            <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
              <div class="modal-content">

                <!-- Header -->
                <div class="modal-header">
                  <h5 class="modal-title">
                    {{ editingProduct ? 'Update Product' : 'Create Product' }}
                  </h5>

                  <button type="button" class="btn-close" @click="closeProductModal"></button>
                </div>

                <!-- Scrollable Form -->
                <form @submit.prevent="saveProduct">
                  <div class="modal-body product-modal-body">
                    <div class="mb-3">
                      <label class="form-label">Product Name *</label>
                      <input v-model.trim="productForm.name" class="form-control" required />
                    </div>

                    <div class="mb-3">
                      <label class="form-label">Internal Reference / Code</label>
                      <input v-model.trim="productForm.default_code" class="form-control" />
                    </div>

                    <div class="row g-3">
                      <div class="col-md-6">
                        <label class="form-label">Department *</label>
                        <select v-model.number="productForm.department_id" class="form-select" required>
                          <option value="">Select Department</option>
                          <option v-for="item in departments" :key="item.id" :value="item.id">
                            {{ item.name }}
                          </option>
                        </select>
                      </div>

                      <div class="col-md-6">
                        <label class="form-label">Category *</label>
                        <select v-model.number="productForm.category_id" class="form-select" required>
                          <option value="">Select Category</option>
                          <option v-for="item in categories" :key="item.id" :value="item.id">
                            {{ item.name }}
                          </option>
                        </select>
                      </div>

                      <div class="col-md-6">
                        <label class="form-label">Unit of Measure *</label>
                        <select v-model.number="productForm.uom_id" class="form-select" required>
                          <option value="">Select Unit</option>
                          <option v-for="item in units" :key="item.id" :value="item.id">
                            {{ item.name }}
                          </option>
                        </select>
                      </div>

                      <div class="col-md-6">
                        <label class="form-label">Brand</label>
                        <select v-model.number="productForm.brand_id" class="form-select">
                          <option value="">Select Brand</option>
                          <option v-for="item in brands" :key="item.id" :value="item.id">
                            {{ item.name }}
                          </option>
                        </select>
                      </div>
                    </div>
                    <hr />

                    <h6 class="mb-3">Product Information</h6>

                    <div class="row g-3">
                      <div class="col-md-6">
                        <label class="form-label">Cost</label>
                        <input v-model.number="productForm.standard_price" type="number" min="0" step="any"
                          class="form-control" placeholder="Enter product cost" />
                      </div>

                      <div class="col-md-6">
                        <label class="form-label">Barcode</label>
                        <div class="input-group">
                          <input v-model.trim="productForm.barcode" class="form-control"
                            placeholder="Scan or enter barcode" />
                          <span class="input-group-text">
                            <i class="bi bi-upc-scan"></i>
                          </span>
                        </div>
                        <small class="text-muted">Supports barcode scanners that type into the input.</small>
                      </div>

                      <div class="col-12">
                        <div class="form-check form-switch">
                          <input id="isStorable" v-model="productForm.is_storable" class="form-check-input"
                            type="checkbox" />
                          <label class="form-check-label" for="isStorable">
                            Is Storable Product
                          </label>
                        </div>
                      </div>
                    </div>

                    <hr />

                    <h6 class="mb-3">Computer / Device Specifications</h6>

                    <div class="row g-3">
                      <div class="col-md-6">
                        <label class="form-label">CPU</label>
                        <input v-model.trim="productForm.cpu" class="form-control"
                          placeholder="Example: Intel Core i7" />
                      </div>

                      <div class="col-md-6">
                        <label class="form-label">RAM</label>
                        <input v-model.trim="productForm.ram" class="form-control" placeholder="Example: 16GB DDR5" />
                      </div>

                      <div class="col-md-6">
                        <label class="form-label">Storage</label>
                        <input v-model.trim="productForm.storage" class="form-control"
                          placeholder="Example: 512GB SSD" />
                      </div>

                      <div class="col-md-6">
                        <label class="form-label">Operating System</label>
                        <input v-model.trim="productForm.operating_system" class="form-control"
                          placeholder="Example: Windows 11 Pro" />
                      </div>

                      <div class="col-md-6">
                        <label class="form-label">Battery</label>
                        <input v-model.trim="productForm.battery" class="form-control" placeholder="Example: 57Wh" />
                      </div>

                      <div class="col-md-6">
                        <label class="form-label">Screen Size</label>
                        <input v-model.trim="productForm.screen_size" class="form-control"
                          placeholder="Example: 15.6 inches" />
                      </div>
                    </div>

                    <small class="text-muted d-block mt-3">
                      Enter the existing Odoo Department, Product Category and Unit of Measure IDs.
                    </small>
                  </div>

                  <!-- Footer stays visible -->
                  <div class="modal-footer bg-white">
                    <button type="button" class="btn btn-outline-secondary" @click="closeProductModal">
                      Cancel
                    </button>

                    <button type="submit" class="btn btn-primary">
                      {{ editingProduct ? 'Update Product' : 'Create Product' }}
                    </button>
                  </div>
                </form>

              </div>
            </div>
          </div>
        </section>

        <!-- STOCK ADJUSTMENT TAB -->
        <section v-if="activeTab === 'stock'">
          <div class="mb-4">
            <h5 class="mb-1">Stock Adjustment</h5>
            <p class="text-muted mb-0">Add or remove product quantities from an internal location.</p>
          </div>

          <div class="row">
            <div class="col-lg-7">
              <div class="card border">
                <div class="card-body p-4">
                  <form @submit.prevent="submitStockAdjustment">
                    <!-- SEARCH STOCK PRODUCT -->
                    <div class="mb-3 position-relative">
                      <label class="form-label">Product *</label>

                      <div class="input-group">
                        <input type="text" class="form-control" v-model="stockProductSearch"
                          placeholder="Search product name, code, barcode, brand..." autocomplete="off"
                          @focus="showStockProductResults = true" @input="onStockProductSearch" />

                        <button v-if="stockForm.product_id" type="button" class="btn btn-outline-secondary"
                          @click="clearStockProduct">
                          <i class="bi bi-x-lg"></i>
                        </button>

                        <span v-else class="input-group-text">
                          <i class="bi bi-search"></i>
                        </span>
                      </div>

                      <!-- SEARCH RESULTS -->
                      <div v-if="showStockProductResults && filteredStockProducts.length" class="stock-product-results">
                        <button v-for="p in filteredStockProducts" :key="p.product_id" type="button"
                          class="stock-product-item" @click="selectStockProduct(p)">
                          <div class="d-flex justify-content-between align-items-center">
                            <strong>{{ p.name }}</strong>

                            <span class="badge bg-success-subtle text-success">
                              Active
                            </span>
                          </div>

                          <small class="text-muted d-block">
                            Code: {{ p.default_code || '-' }}
                            | Barcode: {{ p.barcode || '-' }}
                          </small>

                          <small class="text-muted d-block">
                            Brand: {{ p.brand_name || '-' }}
                            | Category: {{ p.category_name || '-' }}
                          </small>

                          <small class="text-muted d-block">
                            Department: {{ p.department_name || '-' }}
                            | Unit: {{ p.uom_name || '-' }}
                          </small>
                        </button>
                      </div>

                      <div v-else-if="showStockProductResults && stockProductSearch.trim()"
                        class="stock-product-results p-3 text-center text-muted">
                        No products found.
                      </div>

                      <!-- SELECTED PRODUCT -->
                      <div v-if="selectedStockProduct" class="selected-stock-product mt-2">
                        <i class="bi bi-box-seam text-success me-2"></i>
                        <strong>{{ selectedStockProduct.name }}</strong>
                        <small class="text-muted ms-2">
                          {{ selectedStockProduct.default_code || '' }}
                        </small>
                      </div>
                    </div>

                    <div class="mb-3">
                      <label class="form-label">Internal Location *</label>
                      <select v-model.number="stockForm.location_id" class="form-select" required>
                        <option value="">Select Location</option>
                        <option v-for="loc in locations" :key="loc.id" :value="loc.id">
                          {{ loc.name }}
                        </option>
                      </select>
                    </div>

                    <div class="mb-3">
                      <label class="form-label">Adjustment Type *</label>
                      <div class="row g-2">
                        <div class="col-6">
                          <button type="button" class="btn w-100"
                            :class="stockForm.type === 'add' ? 'btn-success' : 'btn-outline-success'"
                            @click="stockForm.type = 'add'">
                            <i class="bi bi-plus-circle me-1"></i>Add Stock
                          </button>
                        </div>
                        <div class="col-6">
                          <button type="button" class="btn w-100"
                            :class="stockForm.type === 'remove' ? 'btn-danger' : 'btn-outline-danger'"
                            @click="stockForm.type = 'remove'">
                            <i class="bi bi-dash-circle me-1"></i>Remove Stock
                          </button>
                        </div>
                      </div>
                    </div>

                    <div class="mb-3">
                      <label class="form-label">
                        Quantity to {{ stockForm.type === 'add' ? 'Add' : 'Remove' }} *
                      </label>
                      <input v-model.number="stockForm.quantity" type="number" min="0.001" step="any"
                        class="form-control" placeholder="Enter quantity" required />
                    </div>

                    <div class="mb-3">
                      <label class="form-label">Reason</label>
                      <textarea v-model.trim="stockForm.reason" class="form-control" rows="3"
                        placeholder="Enter adjustment reason..."></textarea>
                    </div>

                    <button class="btn btn-primary w-100" :disabled="saving">
                      <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
                      Apply Stock Adjustment
                    </button>
                  </form>
                </div>
              </div>
            </div>

            <div class="col-lg-5 mt-3 mt-lg-0">
              <div class="alert alert-info">
                <h6><i class="bi bi-info-circle me-2"></i>How it works</h6>
                <p class="mb-2">Choose Add Stock to increase the quantity.</p>
                <p class="mb-2">Choose Remove Stock to decrease the quantity.</p>
                <p class="mb-0">The adjustment is applied through Odoo inventory adjustment.</p>
              </div>
              <div class="card border">
                <div class="card-body">
                  <h6>Adjustment Preview</h6>
                  <div class="d-flex justify-content-between py-2">
                    <span class="text-muted">Product</span>
                    <strong>{{ selectedStockProduct?.name || '-' }}</strong>
                  </div>
                  <div class="d-flex justify-content-between py-2">
                    <span class="text-muted">Operation</span>
                    <strong>{{ stockForm.type === 'add' ? 'Add Stock' : 'Remove Stock' }}</strong>
                  </div>
                  <div class="d-flex justify-content-between py-2">
                    <span class="text-muted">Adjustment</span>
                    <strong :class="stockForm.type === 'add' ? 'text-success' : 'text-danger'">
                      {{ stockForm.type === 'add' ? '+' : '-' }}{{ stockForm.quantity || 0 }}
                    </strong>
                  </div>
                  <small class="text-muted">
                    This preview shows the adjustment amount, not the resulting stock balance.
                  </small>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- INTERNAL TRANSFER TAB -->
        <section v-if="activeTab === 'transfer'">
          <div class="mb-4">
            <h5 class="mb-1">Internal Transfer to Employee</h5>
            <p class="text-muted mb-0">Transfer assets from Main Warehouse to an employee's stock location.</p>
          </div>

          <div class="row">
            <div class="col-lg-8">
              <div class="card border">
                <div class="card-body p-4">
                  <form @submit.prevent="submitTransfer">
                    <!-- SEARCH EMPLOYEE -->
                    <div class="mb-3 position-relative">
                      <label class="form-label">Employee *</label>

                      <div class="input-group">
                        <input type="text" class="form-control" v-model="employeeSearch"
                          placeholder="Search employee name or department..." autocomplete="off"
                          @focus="showEmployeeResults = true" @input="onEmployeeSearch" />

                        <button v-if="transferForm.employee_id" type="button" class="btn btn-outline-secondary"
                          @click="clearSelectedEmployee">
                          <i class="bi bi-x-lg"></i>
                        </button>

                        <span v-else class="input-group-text">
                          <i class="bi bi-search"></i>
                        </span>
                      </div>

                      <!-- SEARCH RESULTS -->
                      <div v-if="showEmployeeResults && filteredEmployees.length" class="employee-search-results">
                        <button v-for="emp in filteredEmployees" :key="emp.id" type="button"
                          class="employee-search-item" @click="selectEmployee(emp)">
                          <div class="d-flex align-items-center gap-2">
                            <div class="employee-avatar">
                              <i class="bi bi-person"></i>
                            </div>

                            <div class="flex-grow-1">
                              <div class="fw-semibold">{{ emp.name }}</div>

                              <small class="text-muted">
                                Department: {{ emp.department || '-' }}
                              </small>

                              <small class="text-muted d-block">
                                Location: {{ emp.location_name || '-' }}
                              </small>
                            </div>

                            <i class="bi bi-check-circle text-success"
                              v-if="Number(transferForm.employee_id) === Number(emp.id)">
                            </i>
                          </div>
                        </button>
                      </div>

                      <div v-else-if="showEmployeeResults && employeeSearch.trim()"
                        class="employee-search-results p-3 text-center text-muted">
                        No employees found.
                      </div>

                      <!-- SELECTED EMPLOYEE -->
                      <div v-if="selectedEmployee" class="selected-employee-info mt-2">
                        <i class="bi bi-person-check-fill text-success me-2"></i>
                        <strong>{{ selectedEmployee.name }}</strong>
                        <span class="text-muted ms-2">
                          {{ selectedEmployee.department || '' }}
                        </span>
                      </div>
                    </div>

                    <div class="mb-3">
                      <label class="form-label">Source Location</label>
                      <input class="form-control" value="Main Warehouse" disabled />
                    </div>

                    <div class="mb-3">
                      <label class="form-label">Destination Location</label>
                      <input class="form-control" :value="selectedEmployee?.location_name || 'Select employee first'"
                        disabled />
                    </div>

                    <hr />

                    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                      <h6 class="mb-0">Transfer Products</h6>

                      <div class="d-flex gap-2">
                        <!-- Scan Barcode -->
                        <button type="button" class="btn btn-sm btn-success" @click="openBarcodeScanner">
                          <i class="bi bi-upc-scan me-1"></i>
                          Scan Barcode
                        </button>

                        <!-- Add Product -->
                        <button type="button" class="btn btn-sm btn-outline-primary" @click="addTransferLine">
                          <i class="bi bi-plus-lg me-1"></i>
                          Add Product
                        </button>
                      </div>
                    </div>

                    <div v-for="(line, index) in transferForm.products" :key="index" class="border rounded p-3 mb-3">
                      <div class="d-flex justify-content-between mb-2">
                        <strong>Product {{ index + 1 }}</strong>
                        <button type="button" class="btn btn-sm btn-outline-danger" @click="removeTransferLine(index)">
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>

                      <div class="row g-2">
                        <div class=" col-8 position-relative">
                          <label class="form-label">Product</label>

                          <input type="text" class="form-control" v-model="line.product_search"
                            placeholder="Search product name, barcode, code, brand..."
                            @focus="line.show_product_results = true" @input="onTransferProductSearch(line)"
                            autocomplete="off" />

                          <!-- Search results -->
                          <div v-if="line.show_product_results && searchTransferProducts(line).length"
                            class="product-search-results">
                            <button v-for="p in searchTransferProducts(line)" :key="p.product_id" type="button"
                              class="product-search-item" @click="selectTransferProduct(line, p)">
                              <div class="fw-semibold">{{ p.name }}</div>

                              <small class="text-muted">
                                Code: {{ p.default_code || '-' }}
                                | Barcode: {{ p.barcode || '-' }}
                              </small>

                              <div class="small text-muted">
                                Brand: {{ p.brand_name || '-' }}
                                | Category: {{ p.category_name || '-' }}
                                | Department: {{ p.department_name || '-' }}
                              </div>
                            </button>
                          </div>

                          <div v-else-if="line.show_product_results && line.product_search"
                            class="product-search-results text-muted p-3">
                            No products found.
                          </div>
                        </div>
                        <div class="col-4">
                          <label class="form-label">Quantity *</label>
                          <input v-model.number="line.quantity" type="number" min="0.001" step="any"
                            class="form-control" required />
                        </div>
                      </div>
                    </div>

                    <button class="btn btn-primary w-100" :disabled="saving || !transferForm.products.length">
                      <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
                      Create Internal Transfer
                    </button>
                  </form>
                </div>
              </div>
            </div>

            <div class="col-lg-4 mt-3 mt-lg-0">
              <div class="card border">
                <div class="card-body">
                  <h6 class="mb-3">Transfer Summary</h6>
                  <div class="mb-3">
                    <small class="text-muted d-block">Employee</small>
                    <strong>{{ selectedEmployee?.name || '-' }}</strong>
                  </div>
                  <div class="mb-3">
                    <small class="text-muted d-block">Destination</small>
                    <strong>{{ selectedEmployee?.location_name || '-' }}</strong>
                  </div>
                  <div class="mb-3">
                    <small class="text-muted d-block">Product Lines</small>
                    <strong>{{ transferForm.products.length }}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>

    <div v-if="message.text" class="alert mt-3" :class="message.type === 'success' ? 'alert-success' : 'alert-danger'">
      {{ message.text }}
    </div>
  </div>

  <!-- BARCODE SCANNER MODAL -->
  <div v-if="showBarcodeScanner" class="scanner-overlay">

    <div class="scanner-modal">

      <!-- Header -->
      <div class="scanner-header">
        <div>
          <h5 class="mb-1">
            <i class="bi bi-upc-scan me-2"></i>
            Scan Product Barcode
          </h5>
          <small class="text-muted">
            Point your camera at the product barcode
          </small>
        </div>

        <button type="button" class="btn-close" @click="closeBarcodeScanner">
        </button>
      </div>

      <!-- Camera -->
      <div class="scanner-camera">

        <video ref="scannerVideo" autoplay muted playsinline>
        </video>

        <div class="scanner-frame">
          <div class="scanner-line"></div>
        </div>

        <div v-if="scannerLoading" class="scanner-loading">
          <div class="spinner-border text-light"></div>
          <p class="text-white mt-2 mb-0">
            Opening camera...
          </p>
        </div>

      </div>

      <!-- Scanner Status -->
      <div class="p-3">

        <div class="alert alert-info mb-3">
          <i class="bi bi-info-circle me-2"></i>
          Keep the barcode inside the scanning area.
        </div>

        <div v-if="scannerError" class="alert alert-danger mb-0">
          {{ scannerError }}
        </div>

      </div>

      <!-- Footer -->
      <div class="scanner-footer">
        <button type="button" class="btn btn-outline-secondary w-100" @click="closeBarcodeScanner">
          <i class="bi bi-x-circle me-1"></i>
          Close Camera
        </button>
      </div>

    </div>
  </div>
</template>



<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick ,watch} from 'vue'
import { BrowserMultiFormatReader } from '@zxing/browser'

import {
  getAdminAssetProducts,
  createAdminAssetProduct,
  updateAdminAssetProduct,
  updateAdminAssetProductActive,
  adjustAssetStock,
  getAssetEmployees,
  getAssetLocations,
  createAssetInternalTransfer,
  getAdminAssetProductOptions
} from '../api/asset'

// =====================================================
// GENERAL STATE
// =====================================================

const activeTab = ref('products')

const products = ref([])
const employees = ref([])
const locations = ref([])

const loadingProducts = ref(false)
const saving = ref(false)

const defaultDepartmentId = ref('')
const productSearch = ref('')
const selectedCategory = ref(0)

const showProductModal = ref(false)
const editingProduct = ref(null)

const message = ref({
  text: '',
  type: 'success'
})

const departments = ref([])
const categories = ref([])
const units = ref([])
const brands = ref([])
const employeeSearch = ref('')
const showEmployeeResults = ref(false)
const stockProductSearch = ref('')
const showStockProductResults = ref(false)

watch(
  locations,
  (newLocations) => {
    const defaultLocation = newLocations.find(
      loc => loc.replenish_location === true
    )

    if (defaultLocation && !stockForm.value.location_id) {
      stockForm.value.location_id = defaultLocation.id
    }
  },
  { immediate: true }
)
const filteredStockProducts = computed(() => {
  const keyword = stockProductSearch.value.trim().toLowerCase()

  return activeProducts.value
    .filter(p => {
      const searchable = [
        p.name,
        p.default_code,
        p.barcode,
        p.brand_name,
        p.category_name,
        p.department_name,
        p.uom_name
      ]

      return !keyword || searchable.some(value =>
        String(value || '').toLowerCase().includes(keyword)
      )
    })
    .slice(0, 30)
})
function onStockProductSearch() {
  // Remove previous selection when the search changes
  stockForm.value.product_id = ''
  showStockProductResults.value = true
}

function selectStockProduct(product) {
  stockForm.value.product_id = Number(product.product_id)

  stockProductSearch.value = product.name

  showStockProductResults.value = false
}

function clearStockProduct() {
  stockForm.value.product_id = ''
  stockProductSearch.value = ''
  showStockProductResults.value = false
}
const filteredEmployees = computed(() => {
  const keyword = employeeSearch.value.trim().toLowerCase()

  return employees.value
    .filter(emp => {
      const searchable = [
        emp.name,
        emp.department,
        emp.location_name
      ]

      return !keyword || searchable.some(value =>
        String(value || '').toLowerCase().includes(keyword)
      )
    })
    .slice(0, 30)
})

function onEmployeeSearch() {
  // Clear old selection when searching for another employee
  transferForm.value.employee_id = ''
  showEmployeeResults.value = true
}

function selectEmployee(emp) {
  transferForm.value.employee_id = Number(emp.id)

  employeeSearch.value = emp.name

  showEmployeeResults.value = false
}

function clearSelectedEmployee() {
  transferForm.value.employee_id = ''
  employeeSearch.value = ''
  showEmployeeResults.value = false
}

// =====================================================
// BARCODE SCANNER
// =====================================================

const showBarcodeScanner = ref(false)
const scannerLoading = ref(false)
const scannerError = ref('')
const scannerVideo = ref(null)

let barcodeReader = null
let scannerControls = null
let isProcessingBarcode = false

// =====================================================
// PRODUCT SEARCH AND SELECTION
// =====================================================

const searchTransferProducts = (line) => {
  const keyword = (line.product_search || '').trim().toLowerCase()

  return activeProducts.value
    .filter((p) => {
      const searchable = [
        p.name,
        p.default_code,
        p.barcode,
        p.brand_name,
        p.category_name,
        p.department_name,
        p.uom_name
      ]

      return !keyword || searchable.some(value =>
        String(value || '').toLowerCase().includes(keyword)
      )
    })
    .slice(0, 30)
}

function onTransferProductSearch(line) {
  // Clear the previous selection when the user changes the search
  line.product_id = ''
  line.show_product_results = true
}

function selectTransferProduct(line, product) {
  line.product_id = Number(product.product_id)
  line.product_search = product.name
  line.show_product_results = false

  if (!Array.isArray(line.serial_numbers)) {
    line.serial_numbers = []
  }
}

function clearTransferProduct(line) {
  line.product_id = ''
  line.product_search = ''
  line.show_product_results = false
  line.quantity = 1
  line.serial_numbers = []
}

// =====================================================
// TRANSFER FORM
// =====================================================

function emptyTransferLine() {
  return {
    product_id: '',
    quantity: 1,
    serial_numbers: [],
    product_search: '',
    show_product_results: false
  }
}

const transferForm = ref({
  employee_id: '',
  products: [emptyTransferLine()]
})

const addTransferLine = () => {
  transferForm.value.products.push(emptyTransferLine())
}

function removeTransferLine(index) {
  transferForm.value.products.splice(index, 1)
}

function removeEmptyTransferLines() {
  transferForm.value.products =
    transferForm.value.products.filter(line => line.product_id)
}

// =====================================================
// PRODUCT FORM
// =====================================================

const emptyProductForm = () => ({
  name: '',
  default_code: '',
  department_id: '',
  category_id: '',
  uom_id: '',
  brand_id: '',
  standard_price: 0,
  barcode: '',
  is_storable: true,
  cpu: '',
  ram: '',
  storage: '',
  operating_system: '',
  battery: '',
  screen_size: ''
})

const productForm = ref(emptyProductForm())

// =====================================================
// STOCK FORM
// =====================================================

const stockForm = ref({
  product_id: '',
  location_id: '',
  type: 'add',
  quantity: null,
  reason: ''
})

// =====================================================
// COMPUTED VALUES
// =====================================================

const activeProducts = computed(() =>
  products.value.filter(p => p.active)
)

const productCategories = computed(() => {
  const categoryMap = new Map()

  products.value.forEach(product => {
    if (product.category_id) {
      categoryMap.set(Number(product.category_id), {
        id: Number(product.category_id),
        name: product.category_name || 'Uncategorized'
      })
    }
  })

  return Array.from(categoryMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  )
})

const filteredProducts = computed(() => {
  const search = productSearch.value.toLowerCase().trim()

  return products.value.filter(product => {
    const matchesSearch =
      !search ||
      (product.name || '').toLowerCase().includes(search) ||
      (product.default_code || '').toLowerCase().includes(search)

    const matchesCategory =
      !selectedCategory.value ||
      Number(product.category_id) === Number(selectedCategory.value)

    return matchesSearch && matchesCategory
  })
})

const selectedStockProduct = computed(() =>
  activeProducts.value.find(p =>
    Number(p.product_id) === Number(stockForm.value.product_id)
  )
)

const selectedEmployee = computed(() =>
  employees.value.find(e =>
    Number(e.id) === Number(transferForm.value.employee_id)
  )
)

// =====================================================
// COMMON FUNCTIONS
// =====================================================

function showMessage(text, type = 'success') {
  message.value = { text, type }
}

function getError(error) {
  return error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    'Something went wrong'
}

function clearProductFilters() {
  productSearch.value = ''
  selectedCategory.value = 0
}

// =====================================================
// LOAD DATA
// =====================================================

async function loadProducts() {
  loadingProducts.value = true

  try {
    const response = await getAdminAssetProducts()
    products.value = response.data.products || []
  } catch (error) {
    showMessage(getError(error), 'error')
  } finally {
    loadingProducts.value = false
  }
}

async function loadEmployees() {
  try {
    const response = await getAssetEmployees()
    employees.value = response.data.employees || []
  } catch (error) {
    showMessage(getError(error), 'error')
  }
}

async function loadLocations() {
  try {
    const response = await getAssetLocations()
    locations.value = response.data.locations || []
  } catch (error) {
    showMessage(getError(error), 'error')
  }
}

async function loadProductOptions() {
  try {
    const response = await getAdminAssetProductOptions()

    if (!response.data.status) {
      throw new Error(
        response.data.message || 'Unable to load product options'
      )
    }

    const data = response.data

    departments.value = data.departments || []
    categories.value = data.categories || []
    units.value = data.units || []
    brands.value = data.brands || []

    defaultDepartmentId.value = data.default_department_id || ''

  } catch (error) {
    showMessage(getError(error), 'error')
  }
}

// =====================================================
// PRODUCT CREATE / UPDATE
// =====================================================

function openProductForm(product = null) {
  editingProduct.value = product

  if (product) {
    productForm.value = {
      name: product.name || '',
      default_code: product.default_code || '',
      department_id: Number(product.department_id) || defaultDepartmentId.value || '',
      category_id: Number(product.category_id) || '',
      uom_id: Number(product.uom_id) || '',
      brand_id: Number(product.brand_id) || '',
      standard_price: product.standard_price || 0,
      barcode: product.barcode || '',
      is_storable: product.is_storable ?? true,
      cpu: product.cpu || '',
      ram: product.ram || '',
      storage: product.storage || '',
      operating_system: product.operating_system || '',
      battery: product.battery || '',
      screen_size: product.screen_size || ''
    }
  } else {
    productForm.value = {
      ...emptyProductForm(),
      department_id: defaultDepartmentId.value || ''
    }
  }

  showProductModal.value = true
}

function closeProductModal() {
  showProductModal.value = false
  editingProduct.value = null

  productForm.value = {
    ...emptyProductForm(),
    department_id: defaultDepartmentId.value || ''
  }
}

async function saveProduct() {
  saving.value = true

  try {
    if (editingProduct.value) {
      await updateAdminAssetProduct(
        editingProduct.value.id,
        productForm.value
      )

      showMessage('Product updated successfully')
    } else {
      await createAdminAssetProduct(productForm.value)

      showMessage('Product created successfully')
    }

    // Correct function name
    closeProductModal()

    await loadProducts()

  } catch (error) {
    showMessage(getError(error), 'error')
  } finally {
    saving.value = false
  }
}

async function toggleProduct(product) {
  const action = product.active ? 'archive' : 'activate'

  if (!confirm(`Are you sure you want to ${action} this product?`)) {
    return
  }

  try {
    await updateAdminAssetProductActive(product.id, !product.active)

    showMessage(`Product ${action}d successfully`)

    await loadProducts()

  } catch (error) {
    showMessage(getError(error), 'error')
  }
}

// =====================================================
// STOCK ADJUSTMENT
// =====================================================

async function submitStockAdjustment() {
  if (!stockForm.value.product_id || !stockForm.value.location_id) {
    showMessage('Please select product and location', 'error')
    return
  }

  if (
    !stockForm.value.quantity ||
    Number(stockForm.value.quantity) <= 0
  ) {
    showMessage('Please enter a quantity greater than zero', 'error')
    return
  }

  const adjustment = stockForm.value.type === 'add'
    ? Number(stockForm.value.quantity)
    : -Number(stockForm.value.quantity)

  if (!confirm(
    `Are you sure you want to ${stockForm.value.type} ${stockForm.value.quantity} units?`
  )) {
    return
  }

  saving.value = true

  try {
    const response = await adjustAssetStock({
      product_id: stockForm.value.product_id,
      location_id: stockForm.value.location_id,
      quantity: adjustment,
      reason: stockForm.value.reason
    })

    showMessage(
      `${response.data.message}. New quantity: ${response.data.new_quantity}`
    )

    stockForm.value.quantity = null
    stockForm.value.reason = ''
    stockForm.value.product_id = ''
    stockProductSearch.value = ''
    showStockProductResults.value = false

  } catch (error) {
    showMessage(getError(error), 'error')
  } finally {
    saving.value = false
  }
}

// =====================================================
// BARCODE SCANNING
// =====================================================

async function openBarcodeScanner() {
  if (showBarcodeScanner.value) return

  showBarcodeScanner.value = true
  scannerLoading.value = true
  scannerError.value = ''
  isProcessingBarcode = false

  try {
    await nextTick()

    barcodeReader = new BrowserMultiFormatReader()

    scannerControls = await barcodeReader.decodeFromVideoDevice(
      undefined,
      scannerVideo.value,
      (result, error) => {
        if (result && !isProcessingBarcode) {
          isProcessingBarcode = true

          const barcode = result.getText()

          handleScannedBarcode(barcode)
        }
      }
    )

    scannerLoading.value = false

  } catch (error) {
    scannerLoading.value = false

    scannerError.value =
      'Unable to access camera. Please allow camera permission and try again.'

    console.error('Camera error:', error)
  }
}

function handleScannedBarcode(barcode) {
  const scannedBarcode = String(barcode || '').trim()

  if (!scannedBarcode) {
    isProcessingBarcode = false
    return
  }

  // Find product by barcode
  const product = activeProducts.value.find(p =>
    String(p.barcode || '').trim() === scannedBarcode
  )

  if (!product) {
    scannerError.value =
      `Product with barcode "${scannedBarcode}" was not found.`

    isProcessingBarcode = false
    return
  }

  // Remove unused lines before adding the scanned product
  removeEmptyTransferLines()

  const existingLine = transferForm.value.products.find(line =>
    Number(line.product_id) === Number(product.product_id)
  )

  if (existingLine) {
    existingLine.quantity =
      Number(existingLine.quantity || 0) + 1

    existingLine.product_search = product.name
    existingLine.show_product_results = false

  } else {
    transferForm.value.products.push({
      product_id: Number(product.product_id),
      quantity: 1,
      serial_numbers: [],
      product_search: product.name,
      show_product_results: false
    })
  }

  showMessage(`${product.name} added successfully`, 'success')

  closeBarcodeScanner()
}

function closeBarcodeScanner() {
  if (scannerControls) {
    scannerControls.stop()
    scannerControls = null
  }

  if (scannerVideo.value?.srcObject) {
    scannerVideo.value.srcObject
      .getTracks()
      .forEach(track => track.stop())

    scannerVideo.value.srcObject = null
  }

  showBarcodeScanner.value = false
  scannerLoading.value = false
  scannerError.value = ''
  isProcessingBarcode = false
}

// =====================================================
// INTERNAL TRANSFER
// =====================================================

async function submitTransfer() {
  if (!transferForm.value.employee_id) {
    showMessage('Please select an employee', 'error')
    return
  }

  if (!transferForm.value.products.length) {
    showMessage('Please add at least one product', 'error')
    return
  }

  const invalidLine = transferForm.value.products.some(line =>
    !line.product_id ||
    !line.quantity ||
    Number(line.quantity) <= 0
  )

  if (invalidLine) {
    showMessage('Please check all product and quantity fields', 'error')
    return
  }

  if (!confirm(
    'Create this internal transfer to the selected employee?'
  )) {
    return
  }

  saving.value = true

  try {
    const response = await createAssetInternalTransfer({
      employee_id: Number(transferForm.value.employee_id),

      products: transferForm.value.products.map(line => ({
        product_id: Number(line.product_id),
        quantity: Number(line.quantity),
        serial_numbers: line.serial_numbers || []
      }))
    })

    showMessage(
      `Transfer ${response.data.picking_name} created successfully`
    )

    transferForm.value = {
      employee_id: '',
      products: [emptyTransferLine()]
    }

    employeeSearch.value = ''
    showEmployeeResults.value = false
  } catch (error) {
    showMessage(getError(error), 'error')
  } finally {
    saving.value = false
  }
}

// =====================================================
// LIFECYCLE
// =====================================================

onMounted(async () => {
  await Promise.all([
    loadProducts(),
    loadEmployees(),
    loadLocations(),
    loadProductOptions()
  ])
})

onUnmounted(() => {
  closeBarcodeScanner()
})
</script>


<style scoped>
/* STOCK PRODUCT SEARCH */

.stock-product-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1100;
  max-height: 320px;
  overflow-y: auto;
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.12);
  margin-top: 4px;
}

.stock-product-item {
  display: block;
  width: 100%;
  padding: 12px;
  text-align: left;
  background: #fff;
  border: 0;
  border-bottom: 1px solid #eee;
  transition: background 0.2s;
}

.stock-product-item:hover {
  background: #f5f3f6;
}

.selected-stock-product {
  padding: 10px 12px;
  background: #f0f9f4;
  border: 1px solid #d1e9d9;
  border-radius: 7px;
  font-size: 13px;
}

/* EMPLOYEE SEARCH */

.employee-search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1100;
  max-height: 320px;
  overflow-y: auto;
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.12);
  margin-top: 4px;
}

.employee-search-item {
  display: block;
  width: 100%;
  padding: 12px;
  text-align: left;
  background: #fff;
  border: 0;
  border-bottom: 1px solid #eee;
  transition: background 0.2s;
}

.employee-search-item:hover {
  background: #f5f3f6;
}

.employee-avatar {
  width: 38px;
  height: 38px;
  min-width: 38px;
  border-radius: 50%;
  background: #f0eaf0;
  color: #714b67;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.selected-employee-info {
  padding: 10px 12px;
  background: #f0f9f4;
  border: 1px solid #d1e9d9;
  border-radius: 7px;
  font-size: 13px;
}

.product-search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1050;
  max-height: 320px;
  overflow-y: auto;
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.12);
}

.product-search-item {
  display: block;
  width: 100%;
  padding: 12px;
  text-align: left;
  background: #fff;
  border: 0;
  border-bottom: 1px solid #eee;
}

.product-search-item:hover {
  background: #f5f3f6;
}

.product-search-item {
  display: block;
  width: 100%;
  padding: 12px;
  text-align: left;
  background: white;
  border: 0;
  border-bottom: 1px solid #eee;
}

.product-search-item:hover {
  background: #f5f3f6;
}

.selected-product-info {
  font-size: 13px;
  padding: 8px;
  background: #f0f9f4;
  border-radius: 6px;
}

/* ===================================
   BARCODE SCANNER
=================================== */

.scanner-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15px;
}

.scanner-modal {
  width: 100%;
  max-width: 550px;
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.scanner-header {
  padding: 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #eee;
}

.scanner-camera {
  position: relative;
  width: 100%;
  height: 350px;
  background: #111;
  overflow: hidden;
}

.scanner-camera video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.scanner-frame {
  position: absolute;
  width: 75%;
  height: 130px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 2px solid #00e676;
  border-radius: 12px;
  pointer-events: none;
}

.scanner-line {
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 2px;
  background: #00e676;
  box-shadow: 0 0 8px #00e676;
}

.scanner-loading {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.scanner-footer {
  padding: 15px;
  border-top: 1px solid #eee;
}

@media (max-width: 576px) {
  .scanner-camera {
    height: 300px;
  }

  .scanner-frame {
    width: 85%;
    height: 110px;
  }
}

.product-modal-body {
  max-height: 70vh;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 24px;
}

.modal-xl {
  max-width: 1100px;
}

.modal-content {
  border: 0;
  border-radius: 12px;
}

.modal-header,
.modal-footer {
  flex-shrink: 0;
}

.asset-management {
  font-family: inherit;
  color: #343a40;
}

.asset-tabs .nav-link {
  color: #555;
  background: #f3f4f6;
  border-radius: 8px;
  padding: 10px 16px;
}

.asset-tabs .nav-link.active {
  color: #fff;
  background: #714b67;
}

.table th {
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

.table td {
  font-size: 14px;
}

.modal-backdrop-custom {
  position: fixed;
  inset: 0;
  z-index: 1050;
  background: rgba(0, 0, 0, .45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15px;
}

.modal-backdrop-custom .modal-dialog {
  width: 100%;
  max-width: 550px;
  margin: auto;
}

.modal-backdrop-custom .modal-content {
  border-radius: 12px;
}

@media (max-width: 576px) {
  .asset-tabs {
    flex-wrap: wrap;
  }

  .asset-tabs .nav-link {
    font-size: 13px;
    padding: 8px 10px;
  }
}
</style>