```vue
<template>
  <div class="container-fluid py-4">
    <div class="card border-0 shadow-sm">
      <div class="card-body p-3 p-md-4">

        <!-- Header -->
        <div class="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h4 class="mb-1">Admin Create Ticket</h4>
            <p class="text-muted mb-0">
              Submit a request on behalf of an employee
            </p>
          </div>

          <button
            type="button"
            class="btn btn-outline-secondary"
            @click="router.back()"
          >
            <i class="bi bi-arrow-left me-1"></i>
            Back
          </button>
        </div>

        <!-- Step Progress -->
        <div class="mb-4">
          <div class="d-flex align-items-center justify-content-between">

            <div
              v-for="step in steps"
              :key="step.number"
              class="text-center flex-fill"
            >
              <div
                class="step-circle mx-auto mb-2"
                :class="{
                  'step-active': currentStep === step.number,
                  'step-completed': currentStep > step.number
                }"
              >
                <i
                  v-if="currentStep > step.number"
                  class="bi bi-check-lg"
                ></i>
                <span v-else>{{ step.number }}</span>
              </div>

              <small
                :class="currentStep === step.number
                  ? 'text-primary fw-semibold'
                  : 'text-muted'"
              >
                {{ step.label }}
              </small>
            </div>
          </div>

          <div class="progress mt-3" style="height: 5px;">
            <div
              class="progress-bar"
              :style="{ width: progressWidth + '%' }"
            ></div>
          </div>
        </div>

        <form @submit.prevent="submitTicket">

          <!-- STEP 1: Request Information -->
          
<!-- STEP 1: Request Information -->
<div v-if="currentStep === 1">

  <h5 class="mb-1">Request Information</h5>
  <p class="text-muted small mb-4">
    Choose a department and request type.
  </p>

  <!-- Department Cards -->
  <div class="mb-4">
    <label class="form-label fw-semibold mb-3">
      Select Department *
    </label>

    <div class="row g-3">
      <div
        v-for="department in departments"
        :key="department.id"
        class="col-6"
      >
        <button
          type="button"
          class="selection-card w-100"
          :class="{
            'selection-card-active':
              Number(form.req_department_id) === Number(department.id)
          }"
          @click="
            form.req_department_id = department.id;
            form.require_type = ''
          "
        >
          <div class="selection-icon mb-2">
            <i
              :class="department.id === 1359
                ? 'bi bi-building'
                : 'bi bi-pc-display'"
            ></i>
          </div>

          <div class="fw-semibold">
            {{ department.name }}
          </div>

          <small class="text-muted">
            {{ department.id === 1359
              ? 'Administration'
              : 'Information Technology' }}
          </small>

          <i
            v-if="Number(form.req_department_id) === Number(department.id)"
            class="bi bi-check-circle-fill selected-check"
          ></i>
        </button>
      </div>
    </div>
  </div>

  <!-- Request Type Cards -->
  <div v-if="form.req_department_id">
    <label class="form-label fw-semibold mb-3">
      Select Request Type *
    </label>

    <div class="row g-3">
      <div
        v-for="type in requestTypes"
        :key="type.value"
        class="col-6 col-md-4"
      >
        <button
          type="button"
          class="selection-card request-type-card w-100"
          :class="{
            'selection-card-active':
              form.require_type === type.value
          }"
          @click="form.require_type = type.value"
        >
          <div class="selection-icon mb-2">
            <i :class="type.icon"></i>
          </div>

          <div class="fw-semibold">
            {{ type.label }}
          </div>

          <i
            v-if="form.require_type === type.value"
            class="bi bi-check-circle-fill selected-check"
          ></i>
        </button>
      </div>
    </div>
  </div>

  <div v-else class="text-center text-muted py-4">
    <i class="bi bi-arrow-up-circle fs-3 d-block mb-2"></i>
    Please select a department first.
  </div>

</div>


          <!-- STEP 2: Employee -->
          <div v-if="currentStep === 2">

            <h5 class="mb-1">Select Employee</h5>
            <p class="text-muted small mb-4">
              Search all employees and select the employee for this ticket.
            </p>

            <div class="mb-3">
              <label class="form-label fw-semibold">
                ພະນັກງານ *
              </label>

              <div class="position-relative">

                <div
                  class="form-control d-flex align-items-center gap-2"
                  style="min-height: 42px; cursor: text;"
                  @click="focusEmployeeSearch"
                >
                  <i class="bi bi-person text-muted"></i>

                  <!-- Selected Employee -->
                  <span
                    v-if="employeeFilter"
                    class="flex-grow-1 text-truncate"
                  >
                    {{ employeeFilter.employee_name }}

                    <small class="text-muted ms-1">
                      ({{ employeeFilter.department_name || 'No department' }})
                    </small>
                  </span>

                  <!-- Search Input -->
                  <input
                    v-else
                    ref="employeeInput"
                    v-model="employeeSearch"
                    type="text"
                    class="border-0 flex-grow-1"
                    style="outline: none; min-width: 0;"
                    :disabled="loadingEmployees"
                    placeholder="ຄົ້ນຫາພະນັກງານ..."
                    @focus="showEmployeeDropdown = true"
                    @input="showEmployeeDropdown = true"
                    @keydown.esc="showEmployeeDropdown = false"
                  />

                  <button
                    v-if="employeeFilter"
                    type="button"
                    class="btn btn-sm p-0 ms-auto"
                    @click.stop="clearEmployee"
                  >
                    <i class="bi bi-x-circle text-muted"></i>
                  </button>

                  <i
                    v-else
                    class="bi bi-chevron-down ms-auto text-muted"
                  ></i>
                </div>

                <!-- Employee Dropdown -->
                <div
                  v-if="showEmployeeDropdown"
                  class="dropdown-menu show w-100 shadow"
                  style="
                    max-height: 250px;
                    overflow-y: auto;
                    position: absolute;
                    top: 100%;
                    left: 0;
                    z-index: 1050;
                  "
                >
                  <div
                    v-if="loadingEmployees"
                    class="text-center text-muted py-3"
                  >
                    <span class="spinner-border spinner-border-sm me-2"></span>
                    Loading employees...
                  </div>

                  <template v-else>

                    <button
                      v-for="employee in filteredEmployees"
                      :key="employee.employee_id"
                      type="button"
                      class="dropdown-item"
                      @click="selectEmployee(employee)"
                    >
                      <i class="bi bi-person me-2"></i>

                      {{ employee.employee_name }}

                      <small class="text-muted ms-1">
                        {{ employee.department_name || '' }}
                      </small>
                    </button>

                    <div
                      v-if="filteredEmployees.length === 0"
                      class="text-muted text-center py-3"
                    >
                      ບໍ່ພົບພະນັກງານ
                    </div>
                  </template>
                </div>

              </div>

              <small class="text-muted">
                {{ employees.length }} employee(s) available
              </small>
            </div>

            <!-- Selected Employee Details -->
            <div
              v-if="employeeFilter"
              class="alert alert-success d-flex align-items-start gap-2 mt-3"
            >
              <i class="bi bi-check-circle-fill mt-1"></i>

              <div>
                <strong>{{ employeeFilter.employee_name }}</strong>
                <div class="small">
                  Department:
                  {{ employeeFilter.department_name || 'Not specified' }}
                </div>
                <div
                  v-if="employeeFilter.login"
                  class="small"
                >
                  {{ employeeFilter.login }}
                </div>
              </div>
            </div>

          </div>

          <!-- STEP 3: Request Details -->
          <div v-if="currentStep === 3">

            <h5 class="mb-1">Request Details</h5>
            <p class="text-muted small mb-4">
              Enter the request date, deadline, and description.
            </p>

            <div class="mb-3">
              <label class="form-label fw-semibold">
                Request Date *
              </label>

              <input
                v-model="form.date"
                type="date"
                class="form-control"
                required
              />
            </div>

            <div class="mb-3">
              <label class="form-label fw-semibold">
                Deadline *
              </label>

              <input
                v-model="form.deadline"
                type="date"
                class="form-control"
                :min="form.date"
                required
              />
            </div>

            <div class="mb-4">
              <label class="form-label fw-semibold">
                Description *
              </label>

              <textarea
                v-model="form.description"
                class="form-control"
                rows="5"
                placeholder="Enter request details..."
                required
              ></textarea>
            </div>

            <!-- Summary -->
            <div class="card bg-light border-0 mb-3">
              <div class="card-body">
                <h6 class="mb-3">Request Summary</h6>

                <div class="mb-2">
                  <small class="text-muted">Department</small>
                  <div>{{ selectedDepartmentName }}</div>
                </div>

                <div class="mb-2">
                  <small class="text-muted">Request Type</small>
                  <div>{{ selectedRequestTypeLabel }}</div>
                </div>

                <div class="mb-2">
                  <small class="text-muted">Employee</small>
                  <div>{{ employeeFilter?.employee_name }}</div>
                </div>

                <div>
                  <small class="text-muted">Deadline</small>
                  <div>{{ form.deadline }}</div>
                </div>
              </div>
            </div>

          </div>

          <!-- Navigation Buttons -->
          <div class="d-flex justify-content-between gap-2 mt-4">

            <button
              v-if="currentStep > 1"
              type="button"
              class="btn btn-light"
              :disabled="submitting"
              @click="previousStep"
            >
              <i class="bi bi-arrow-left me-1"></i>
              Previous
            </button>

            <button
              v-else
              type="button"
              class="btn btn-light"
              @click="resetForm"
            >
              Reset
            </button>

            <button
              v-if="currentStep < 3"
              type="button"
              class="btn btn-primary ms-auto"
              @click="nextStep"
            >
              Next
              <i class="bi bi-arrow-right ms-1"></i>
            </button>

            <button
              v-else
              type="submit"
              class="btn btn-primary ms-auto"
              :disabled="submitting"
            >
              <span
                v-if="submitting"
                class="spinner-border spinner-border-sm me-2"
              ></span>

              <i v-else class="bi bi-send me-1"></i>

              {{ submitting ? 'Submitting...' : 'Submit Ticket' }}
            </button>

          </div>

        </form>
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
  nextTick
} from "vue";

import { useRouter } from "vue-router";
import Swal from "sweetalert2";

import {
  getTicketEmployees,
  createTicketRequirement
} from "../api/ticket";

const router = useRouter();

// --------------------------------------------------
// Wizard Steps
// --------------------------------------------------

const currentStep = ref(1);

const steps = [
  { number: 1, label: "Request" },
  { number: 2, label: "Employee" },
  { number: 3, label: "Details" }
];

const progressWidth = computed(() => {
  return ((currentStep.value - 1) / (steps.length - 1)) * 100;
});

// --------------------------------------------------
// Departments
// --------------------------------------------------

const departments = ref([
  { id: 1359, name: "Admin" },
  { id: 1361, name: "IT" }
]);

// --------------------------------------------------
// State
// --------------------------------------------------

const employees = ref([]);
const loadingEmployees = ref(false);
const submitting = ref(false);

const employeeSearch = ref("");
const employeeFilter = ref(null);
const showEmployeeDropdown = ref(false);
const employeeInput = ref(null);

// --------------------------------------------------
// Form
// --------------------------------------------------

function getTodayDate() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const form = reactive({
  req_department_id: "",
  req_employee_id: "",
  require_type: "",
  date: getTodayDate(),
  deadline: getTodayDate(),
  description: ""
});

// --------------------------------------------------
// Request Types
// Values must match Odoo selection keys.
// --------------------------------------------------


const requestTypes = computed(() => {
  if (Number(form.req_department_id) === 1359) {
    return [ 
      {
        value: "building_problem",
        label: "Building Problem",
        icon: "bi bi-building"
      },
      {
        value: "other",
        label: "Other",
        icon: "bi bi-three-dots"
      }
    ];
  }

  if (Number(form.req_department_id) === 1361) {
    return [ 
      {
        value: "internet",
        label: "Internet",
        icon: "bi bi-wifi"
      },
      {
        value: "item_problem",
        label: "Item Problem",
        icon: "bi bi-box"
      },
      {
        value: "technical",
        label: "Technical",
        icon: "bi bi-tools"
      }, 
      {
        value: "system_support",
        label: "System Support",
        icon: "bi bi-headset"
      },
      {
        value: "other",
        label: "Other",
        icon: "bi bi-three-dots"
      }
    ];
  }

  return [];
});


// --------------------------------------------------
// Summary
// --------------------------------------------------

const selectedDepartmentName = computed(() => {
  return departments.value.find(
    department =>
      Number(department.id) === Number(form.req_department_id)
  )?.name || "";
});

const selectedRequestTypeLabel = computed(() => {
  return requestTypes.value.find(
    type => type.value === form.require_type
  )?.label || "";
});

// --------------------------------------------------
// Filter Employees
// Employee search is independent of department.
// --------------------------------------------------

const filteredEmployees = computed(() => {
  const search = employeeSearch.value.toLowerCase().trim();

  let list = employees.value;

  if (employeeFilter.value) {
    list = list.filter(
      employee =>
        Number(employee.employee_id) !==
        Number(employeeFilter.value.employee_id)
    );
  }

  if (!search) {
    return list;
  }

  return list.filter(employee => {
    return (
      (employee.employee_name || "").toLowerCase().includes(search) ||
      (employee.department_name || "").toLowerCase().includes(search) ||
      (employee.login || "").toLowerCase().includes(search)
    );
  });
});

// --------------------------------------------------
// Step Navigation
// --------------------------------------------------

async function nextStep() {
  if (currentStep.value === 1) {
    if (!form.req_department_id) {
      Swal.fire(
        "Missing Department",
        "Please select a department.",
        "warning"
      );
      return;
    }

    if (!form.require_type) {
      Swal.fire(
        "Missing Request Type",
        "Please select a request type.",
        "warning"
      );
      return;
    }
  }

  if (currentStep.value === 2) {
    if (!form.req_employee_id) {
      Swal.fire(
        "Missing Employee",
        "Please select an employee.",
        "warning"
      );
      return;
    }
  }

  showEmployeeDropdown.value = false;
  currentStep.value++;

  if (currentStep.value === 2) {
    await nextTick();

    if (!employeeFilter.value) {
      employeeInput.value?.focus();
    }
  }
}

function previousStep() {
  showEmployeeDropdown.value = false;

  if (currentStep.value > 1) {
    currentStep.value--;
  }
}

// --------------------------------------------------
// Employee Dropdown
// --------------------------------------------------

async function focusEmployeeSearch() {
  if (loadingEmployees.value) {
    return;
  }

  if (employeeFilter.value) {
    employeeFilter.value = null;
    form.req_employee_id = "";
    employeeSearch.value = "";
  }

  showEmployeeDropdown.value = true;

  await nextTick();

  employeeInput.value?.focus();
}

function selectEmployee(employee) {
  if (!employee || !employee.employee_id) {
    Swal.fire({
      icon: "error",
      title: "Invalid Employee",
      text: "Employee ID was not returned by the server."
    });
    return;
  }

  employeeFilter.value = employee;
  form.req_employee_id = Number(employee.employee_id);

  employeeSearch.value = "";
  showEmployeeDropdown.value = false;
}

function clearEmployee() {
  employeeFilter.value = null;
  form.req_employee_id = "";
  employeeSearch.value = "";
  showEmployeeDropdown.value = true;

  nextTick(() => {
    employeeInput.value?.focus();
  });
}

// --------------------------------------------------
// Load All Employees
// --------------------------------------------------

async function loadEmployees() {
  loadingEmployees.value = true;

  try {
    const response = await getTicketEmployees();
    const data = response?.data ?? response;

    employees.value = Array.isArray(data?.employees)
      ? data.employees
      : [];

    if (!employees.value.length) {
      console.warn("No employees returned by Odoo.");
    }

  } catch (error) {
    console.error("Failed to load employees:", error);

    employees.value = [];

    Swal.fire({
      icon: "error",
      title: "Employee Loading Failed",
      text:
        error.response?.data?.message ||
        error.message ||
        "Unable to load employees."
    });

  } finally {
    loadingEmployees.value = false;
  }
}

// --------------------------------------------------
// Reset Form
// --------------------------------------------------

function resetForm() {
  currentStep.value = 1;

  form.req_department_id = "";
  form.req_employee_id = "";
  form.require_type = "";
  form.date = getTodayDate();
  form.deadline = getTodayDate();
  form.description = "";

  employeeFilter.value = null;
  employeeSearch.value = "";
  showEmployeeDropdown.value = false;
}

// --------------------------------------------------
// Submit Ticket
// --------------------------------------------------

async function submitTicket() {
  if (submitting.value) {
    return;
  }

  if (!form.req_department_id || !form.require_type) {
    currentStep.value = 1;
    Swal.fire(
      "Missing Information",
      "Please complete the request information.",
      "warning"
    );
    return;
  }

  if (!form.req_employee_id) {
    currentStep.value = 2;
    Swal.fire(
      "Missing Employee",
      "Please select an employee.",
      "warning"
    );
    return;
  }

  const selectedEmployee = employees.value.find(
    employee =>
      Number(employee.employee_id) === Number(form.req_employee_id)
  );

  if (!selectedEmployee) {
    currentStep.value = 2;
    Swal.fire(
      "Invalid Employee",
      "Please select an employee from the employee list.",
      "warning"
    );
    return;
  }

  if (!form.date || !form.deadline) {
    Swal.fire(
      "Missing Date",
      "Please select request date and deadline.",
      "warning"
    );
    return;
  }

  if (form.deadline < form.date) {
    Swal.fire(
      "Invalid Deadline",
      "Deadline cannot be before request date.",
      "warning"
    );
    return;
  }

  if (!form.description.trim()) {
    Swal.fire(
      "Missing Description",
      "Please enter request details.",
      "warning"
    );
    return;
  }

  submitting.value = true;

  try {
    const payload = {
      req_department_id: Number(form.req_department_id),
      req_employee_id: Number(form.req_employee_id),
      require_type: form.require_type,
      date: form.date,
      deadline: form.deadline,
      description: form.description.trim()
    };

    console.log("Create ticket payload:", payload);

    const response = await createTicketRequirement(payload);
    const data = response?.data ?? response;

    console.log("Create ticket result:", data);

    if (data?.status !== true) {
      throw new Error(data?.message || "Ticket creation failed.");
    }

    await Swal.fire({
      icon: "success",
      title: "Success!",
      text: "Employee ticket created successfully.",
      confirmButtonText: "OK"
    });

    router.back();

  } catch (error) {
    console.error("Create employee ticket error:", error);

    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Unable to create ticket.";

    Swal.fire({
      icon: "error",
      title: "Failed",
      text: errorMessage
    });

  } finally {
    submitting.value = false;
  }
}

// --------------------------------------------------
// Close Dropdown Outside Click
// --------------------------------------------------

function handleOutsideClick(event) {
  const target = event.target;

  if (!target.closest(".position-relative")) {
    showEmployeeDropdown.value = false;
  }
}

// --------------------------------------------------
// Lifecycle
// --------------------------------------------------

onMounted(() => {
  loadEmployees();

  document.addEventListener("click", handleOutsideClick);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleOutsideClick);
});
</script>

<style scoped>

.selection-card {
  position: relative;
  min-height: 125px;
  padding: 20px 12px;
  border: 1px solid #dee2e6;
  border-radius: 12px;
  background: #fff;
  color: #343a40;
  text-align: center;
  transition: all 0.2s ease;
}

.selection-card:hover {
  border-color: #86b7fe;
  background: #f8fbff;
}

.selection-card-active {
  border: 2px solid #0d6efd;
  background: #f0f6ff;
  color: #0d6efd;
}

.selection-icon {
  font-size: 28px;
  color: #6c757d;
}

.selection-card-active .selection-icon {
  color: #0d6efd;
}

.selected-check {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 17px;
  color: #0d6efd;
}

.request-type-card {
  min-height: 110px;
}

@media (max-width: 576px) {
  .selection-card {
    min-height: 110px;
    padding: 15px 8px;
  }

  .selection-icon {
    font-size: 24px;
  }
}

.step-circle {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 2px solid #dee2e6;
  color: #6c757d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  background: #fff;
}

.step-circle.step-active {
  border-color: #0d6efd;
  background: #0d6efd;
  color: #fff;
}

.step-circle.step-completed {
  border-color: #198754;
  background: #198754;
  color: #fff;
}

.progress-bar {
  transition: width 0.25s ease;
}
</style>
```