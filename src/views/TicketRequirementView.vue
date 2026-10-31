<template>
  <div class="container-fluid py-4">
    <div class="card border-0 shadow-sm">
      <div class="card-body p-3 p-md-4">

        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 class="mb-1">{{ pageTitle }}</h4>
            <p class="text-muted mb-0">{{ pageDescription }}</p>
          </div>

          <button type="button" class="btn btn-outline-secondary" @click="goBack">
            <i class="bi bi-arrow-left me-1"></i>
            Back
          </button>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary"></div>
          <p class="text-muted mt-3">Loading...</p>
        </div>

        <template v-else>
          <div class="card border ticket-wizard">
            <div class="card-header bg-light">
              <strong>
                <i class="bi bi-plus-circle me-2"></i>
                {{ isAssetRequest ? 'Asset Request Form' : 'Problem Report Form' }}
              </strong>
            </div>

            <div class="card-body p-3 p-md-4">

              <!-- Progress -->
              <div class="wizard-progress mb-3">
                <div v-for="(step, index) in wizardSteps" :key="index" class="wizard-step" :class="{
                  'wizard-step-active': currentStep === index + 1,
                  'wizard-step-completed': currentStep > index + 1
                }">
                  <div class="wizard-step-circle">
                    <i v-if="currentStep > index + 1" class="bi bi-check-lg"></i>
                    <span v-else>{{ index + 1 }}</span>
                  </div>
                  <div class="wizard-step-label">{{ step }}</div>
                </div>
              </div>

              <div class="progress mb-4" style="height: 5px">
                <div class="progress-bar" :style="{
                  width: ((currentStep - 1) / (wizardSteps.length - 1) * 100) + '%'
                }"></div>
              </div>

              <!-- Error -->
              <div v-if="errorMessage" class="alert alert-danger">
                <i class="bi bi-exclamation-circle me-2"></i>
                {{ errorMessage }}
              </div>

              <form @submit.prevent="submitTicket">

                <!-- STEP 1: DEPARTMENT -->
                <div v-if="currentStep === 1" class="wizard-content">
                  <div class="wizard-heading">
                    <div class="wizard-icon">
                      <i class="bi bi-building"></i>
                    </div>
                    <div>
                      <h5>Choose Department</h5>
                      <p>Select the department related to your request.</p>
                    </div>
                  </div>

                  <label class="form-label mt-4">
                    Department <span class="text-danger">*</span>
                  </label>

                  <div v-if="filteredDepartments.length" class="row g-3">
                    <div v-for="department in filteredDepartments" :key="department.id" class="col-12 col-md-6">
                      <button type="button" class="department-card" :class="{
                        active:
                          Number(form.req_department_id) === Number(department.id)
                      }" @click="selectDepartment(department.id)">
                        <div class="d-flex justify-content-between align-items-center">
                          <div>
                            <h5>{{ department.name }}</h5>
                            <small>
                              {{ Number(department.id) === ADMIN_DEPARTMENT_ID ? 'Admin' : 'IT' }}
                            </small>
                          </div>

                          <i v-if="Number(form.req_department_id) === Number(department.id)"
                            class="bi bi-check-circle-fill text-primary"></i>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div v-else class="alert alert-warning mt-3">
                    No Admin or IT department found.
                    Please check department IDs 1359 and 1361.
                  </div>
                </div>

                <!-- STEP 2: REQUEST TYPE AND TARGET -->
                <div v-if="currentStep === 2" class="wizard-content">
                  <div class="wizard-heading">
                    <div class="wizard-icon">
                      <i class="bi bi-ui-checks"></i>
                    </div>
                    <div>
                      <h5>Request Details</h5>
                      <p>Select the request type and target.</p>
                    </div>
                  </div>

                  <!-- Request Type -->
                  <div class="mt-4">
                    <label class="form-label">
                      Request Type <span class="text-danger">*</span>
                    </label>

                    <div v-if="requestTypes.length === 0" class="alert alert-warning">
                      Please select Admin or IT department first.
                    </div>

                    <div v-else class="row g-3">
                      <div v-for="item in requestTypes" :key="item.value" class="col-12 col-md-6">
                        <button type="button" class="request-type-card" :class="{
                          'request-type-selected':
                            form.require_type === item.value
                        }" @click="form.require_type = item.value">
                          <div class="d-flex align-items-center gap-3">
                            <div class="request-type-icon">
                              <i class="bi bi-tools"></i>
                            </div>

                            <div class="text-start flex-grow-1">
                              <div class="request-type-title">
                                {{ item.label }}
                              </div>
                            </div>

                            <i v-if="form.require_type === item.value" class="bi bi-check-circle-fill text-primary"></i>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- STEP 3: DATE AND DEADLINE -->
                <div v-if="currentStep === 3" class="wizard-content">
                  <div class="wizard-heading">
                    <div class="wizard-icon">
                      <i class="bi bi-calendar-event"></i>
                    </div>
                    <div>
                      <h5>Set Date and Deadline</h5>
                      <p>Enter the request date and optional deadline.</p>
                    </div>
                  </div>

                  <div class="row g-3">
                    <!-- Request Date -->
                    <div class="col-12 col-md-6">
                      <label class="form-label">
                        Request Date
                      </label>

                      <div class="date-input-wrapper">
                        <i class="bi bi-calendar-check"></i>
                        <input ref="requestDateInput" type="text" class="form-control date-input"
                          placeholder="Select request date" readonly />
                      </div>
                    </div>

                    <!-- Deadline -->
                    <div class="col-12 col-md-6">
                      <label class="form-label">
                        Deadline
                      </label>

                      <div class="date-input-wrapper">
                        <i class="bi bi-calendar-event"></i>
                        <input ref="deadlineInput" type="text" class="form-control date-input"
                          placeholder="Choose deadline" readonly />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- STEP 4: DESCRIPTION AND REVIEW -->
                <div v-if="currentStep === 4" class="wizard-content">
                  <div class="wizard-heading">
                    <div class="wizard-icon">
                      <i class="bi bi-card-text"></i>
                    </div>
                    <div>
                      <h5>Describe Your Request</h5>
                      <p>Provide details about your problem or request.</p>
                    </div>
                  </div>

                  <div class="mt-4">
                    <label class="form-label">
                      Description <span class="text-danger">*</span>
                    </label>

                    <textarea v-model="form.description" class="form-control wizard-description" rows="5"
                      maxlength="5000" required :placeholder="isAssetRequest
                          ? 'Describe the asset you want to request...'
                          : 'Describe the problem...'
                        "></textarea>

                    <div class="text-end small text-muted mt-1">
                      {{ form.description.length }} / 5000 characters
                    </div>
                  </div>

                  <!-- Review -->
                  <div class="review-card mt-4">
                    <h6 class="mb-3">
                      <i class="bi bi-clipboard-check me-2"></i>
                      Review Your Request
                    </h6>

                    <div class="review-row">
                      <span>Department</span>
                      <strong>{{ selectedDepartmentName }}</strong>
                    </div>

                    <div class="review-row">
                      <span>Request Type</span>
                      <strong>{{ selectedRequireTypeName }}</strong>
                    </div>
 

                    <div class="review-row">
                      <span>Request Date</span>
                      <strong>{{ form.date || '-' }}</strong>
                    </div>

                    <div class="review-row">
                      <span>Deadline</span>
                      <strong>{{ form.deadline || 'Not specified' }}</strong>
                    </div>

                    <div class="review-description">
                      <div class="text-muted small mb-1">Description</div>
                      <div class="description-text">
                        {{ form.description || '-' }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Navigation -->
                <div class="wizard-actions mt-4">
                  <button type="button" class="btn btn-outline-secondary" :disabled="submitting || currentStep === 1"
                    @click="previousStep">
                    <i class="bi bi-arrow-left me-1"></i>
                    Previous
                  </button>

                  <div class="d-flex align-items-center gap-2">
                    <span class="text-muted small">
                      Step {{ currentStep }} of {{ wizardSteps.length }}
                    </span>

                    <button v-if="currentStep < wizardSteps.length" type="button" class="btn btn-primary"
                      @click="nextStep">
                      Next
                      <i class="bi bi-arrow-right ms-1"></i>
                    </button>

                    <button v-else type="submit" class="btn btn-success" :disabled="submitting">
                      <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>

                      <i v-else class="bi bi-send me-1"></i>
                      {{ submitting ? 'Submitting...' : 'Submit Request' }}
                    </button>
                  </div>
                </div>

              </form>
            </div>
          </div>
        </template>
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
  nextTick,
} from "vue";

import { useRoute, useRouter } from "vue-router";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";

import {
  getTicketOptions,
  getTicketDepartments,
  createTicketRequirement,
} from "../api/ticket";
import Swal from "sweetalert2";
// =========================================================
// ROUTER
// =========================================================

const route = useRoute();
const router = useRouter();

// =========================================================
// BASIC STATE
// =========================================================

const loading = ref(false);
const submitting = ref(false);
const errorMessage = ref("");
const currentStep = ref(1);

const ADMIN_DEPARTMENT_ID = 1359;
const IT_DEPARTMENT_ID = 1361;

const wizardSteps = [
  "Department",
  "Request Type",
  "Date & Deadline",
  "Description",
];

// =========================================================
// DATE HELPERS
// =========================================================

function getTodayDate() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// =========================================================
// FORM
// =========================================================

const form = ref({
  req_department_id: "", 
  require_type: "",
  design_type: "",
  priority: "",
  date: getTodayDate(),
  deadline: "",
  description: "",
});

// =========================================================
// API DATA
// =========================================================

const departments = ref([]);
const targets = ref([]);

// =========================================================
// FLATPICKR
// =========================================================

const requestDateInput = ref(null);
const deadlineInput = ref(null);

// IMPORTANT: These must be let, not const.
let requestDatePicker = null;
let deadlinePicker = null;

function destroyDatePickers() {
  if (requestDatePicker) {
    requestDatePicker.destroy();
    requestDatePicker = null;
  }

  if (deadlinePicker) {
    deadlinePicker.destroy();
    deadlinePicker = null;
  }
}

function initializeDatePickers() {
  // The inputs exist only when currentStep === 3.
  if (!requestDateInput.value || !deadlineInput.value) {
    return;
  }

  // Prevent duplicate Flatpickr instances.
  destroyDatePickers();

  if (!form.value.date) {
    form.value.date = getTodayDate();
  }

  requestDatePicker = flatpickr(requestDateInput.value, {
    dateFormat: "Y-m-d",
    altInput: true,
    altFormat: "d M Y",
    altInputClass: "form-control date-input",
    defaultDate: form.value.date,
    disableMobile: true,
    allowInput: false,
    clickOpens: true,

    onChange(selectedDates, dateStr) {
      form.value.date = dateStr;

      if (deadlinePicker) {
        deadlinePicker.set("minDate", dateStr);

        if (
          form.value.deadline &&
          form.value.deadline < dateStr
        ) {
          deadlinePicker.clear();
          form.value.deadline = "";
        }
      }
    },
  });

  deadlinePicker = flatpickr(deadlineInput.value, {
    dateFormat: "Y-m-d",
    altInput: true,
    altFormat: "d M Y",
    altInputClass: "form-control date-input",
    defaultDate: form.value.deadline || null,
    minDate: form.value.date || getTodayDate(),
    disableMobile: true,
    allowInput: false,
    clickOpens: true,

    onChange(selectedDates, dateStr) {
      form.value.deadline = dateStr;
    },
  });
}

// Initialize only after Step 3 has rendered.
watch(
  currentStep,
  async (step) => {
    if (step === 3) {
      await nextTick();
      initializeDatePickers();
    } else {
      destroyDatePickers();
    }
  }
);

// =========================================================
// REQUEST TYPES
// =========================================================

const adminRequestTypes = [
  { value: "cars_problem", label: "Cars Problem" },
  { value: "bike_problem", label: "Bike Problem" },
  { value: "building_problem", label: "Building Problem" },
  { value: "other", label: "Other" },
];

const itRequestTypes = [
  { value: "return", label: "Return" },
  { value: "internet", label: "Internet" },
  { value: "item_problem", label: "Item Problem" },
  { value: "technical", label: "Technical" },
  { value: "open_bill", label: "Open Bill" },
  { value: "system_support", label: "System Support" },
  { value: "other", label: "Other" },
];

const requestTypes = computed(() => {
  const departmentId = Number(form.value.req_department_id);

  if (departmentId === ADMIN_DEPARTMENT_ID) {
    return adminRequestTypes;
  }

  if (departmentId === IT_DEPARTMENT_ID) {
    return itRequestTypes;
  }

  return [];
});

// =========================================================
// DEPARTMENT WATCHER
// =========================================================

watch(
  () => form.value.req_department_id,
  () => {
    form.value.require_type = ""; 
  }
);

// =========================================================
// PAGE TYPE
// =========================================================

const isAssetRequest = computed(() => {
  return (
    route.path.includes("asset-request") ||
    route.query.type === "asset" ||
    localStorage.getItem("booking_type") === "asset"
  );
});

const pageTitle = computed(() =>
  isAssetRequest.value
    ? "ຄຳຂໍເບີກຊັບສິນ"
    : "ແຈ້ງແກ້ບັນຫາ"
);

const pageDescription = computed(() =>
  isAssetRequest.value
    ? "Create and track your asset request."
    : "Report a problem and track its progress."
);

// =========================================================
// DEPARTMENTS
// =========================================================

const filteredDepartments = computed(() => {
  return departments.value.filter((department) =>
    [
      ADMIN_DEPARTMENT_ID,
      IT_DEPARTMENT_ID,
    ].includes(Number(department.id))
  );
});

// =========================================================
// REVIEW LABELS
// =========================================================

const selectedDepartmentName = computed(() => {
  const department = departments.value.find(
    (item) =>
      Number(item.id) === Number(form.value.req_department_id)
  );

  return department?.name || "-";
});

const selectedRequireTypeName = computed(() => {
  const item = requestTypes.value.find(
    (item) => item.value === form.value.require_type
  );

  return item?.label || "-";
});
 

// =========================================================
// TOKEN
// =========================================================

function getToken() {
  return localStorage.getItem("user-token") || "";
}

// =========================================================
// NAVIGATION
// =========================================================

function goBack() {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push("/app/choose-booking");
  }
}

function selectDepartment(departmentId) {
  form.value.req_department_id = Number(departmentId);
}

// =========================================================
// RESET FORM
// =========================================================

function resetForm() {
  form.value = {
    req_department_id: "", 
    require_type: "",
    design_type: "",
    priority: "",
    date: getTodayDate(),
    deadline: "",
    description: "",
  };

  errorMessage.value = "";
  currentStep.value = 1;
}

// =========================================================
// NEXT STEP
// =========================================================

function nextStep() {
  errorMessage.value = "";

  if (currentStep.value === 1) {
    if (!form.value.req_department_id) {
      errorMessage.value = "Please select a department.";
      return;
    }
  }

  if (currentStep.value === 2) {
    if (!form.value.require_type) {
      errorMessage.value = "Please select a request type.";
      return;
    }
 
  }

  if (currentStep.value === 3) {
    if (!form.value.date) {
      errorMessage.value = "Please select a request date.";
      return;
    }

    if (
      form.value.deadline &&
      form.value.deadline < form.value.date
    ) {
      errorMessage.value =
        "The deadline cannot be earlier than the request date.";
      return;
    }
  }

  if (currentStep.value < wizardSteps.length) {
    currentStep.value++;
  }
}

// =========================================================
// PREVIOUS STEP
// =========================================================

function previousStep() {
  errorMessage.value = "";

  if (currentStep.value > 1 && !submitting.value) {
    currentStep.value--;
  }
}

// =========================================================
// LOAD DEPARTMENTS
// =========================================================

async function loadDepartments() {
  const response = await getTicketDepartments();

  if (!response?.status) {
    throw new Error(
      response?.message || "Failed to load departments."
    );
  }

  departments.value = response.departments || [];

  const availableIds = departments.value.map(
    (department) => Number(department.id)
  );

  const missingIds = [
    ADMIN_DEPARTMENT_ID,
    IT_DEPARTMENT_ID,
  ].filter((id) => !availableIds.includes(id));

  if (missingIds.length) {
    console.warn("Department IDs not returned:", missingIds);
  }
}

// =========================================================
// LOAD TARGET OPTIONS
// =========================================================

async function loadOptions() {
  const response = await getTicketOptions();

  console.log("Ticket options API:", response);

  if (!response?.status) {
    throw new Error(
      response?.message || "Failed to load ticket options."
    );
  }

  targets.value =
    response.targets ||
    response.target ||
    response.data?.targets ||
    [];

  console.log("Loaded targets:", targets.value);
}

// =========================================================
// SUBMIT TICKET
// =========================================================
async function submitTicket() {
  errorMessage.value = "";

  if (!getToken()) {
    await Swal.fire({
      icon: "warning",
      title: "Session Expired",
      text: "Your session has expired. Please log in again.",
      confirmButtonColor: "#714b67",
    });
    return;
  }

  if (!form.value.req_department_id) {
    currentStep.value = 1;
    errorMessage.value = "Please select a department.";
    return;
  }

  const validRequestType = requestTypes.value.some(
    (item) => item.value === form.value.require_type
  );

  if (!validRequestType) {
    currentStep.value = 2;
    errorMessage.value =
      "Please select a valid request type for this department.";
    return;
  }

  if (!form.value.date) {
    currentStep.value = 3;
    errorMessage.value = "Please select a request date.";
    return;
  }

  if (
    form.value.deadline &&
    form.value.deadline < form.value.date
  ) {
    currentStep.value = 3;
    errorMessage.value =
      "The deadline cannot be earlier than the request date.";
    return;
  }

  if (!form.value.description.trim()) {
    currentStep.value = 4;
    errorMessage.value = "Please enter a description.";
    return;
  }

  submitting.value = true;

  try {
    const payload = {
      req_department_id: Number(form.value.req_department_id),
      require_type: form.value.require_type,
      design_type: form.value.design_type || "others",
      priority: String(form.value.priority || "1"),
      date: form.value.date,
      deadline: form.value.deadline || "",
      description: form.value.description.trim(),
    };

    console.log("Ticket submission payload:", payload);

    const response = await createTicketRequirement(payload);

    if (!response?.status) {
      throw new Error(
        response?.message || "Request submission failed."
      );
    }

    // Success message
    await Swal.fire({
      icon: "success",
      title: "Submitted Successfully!",
      text: response.message || "Your request has been submitted successfully.",
      confirmButtonText: "Go to Dashboard",
      confirmButtonColor: "#714b67",
      allowOutsideClick: false,
      allowEscapeKey: false,
    });

    // Clean up date pickers
    destroyDatePickers();

    // Return to dashboard
    router.push("/app/ticket-dashboard");

  } catch (error) {
    console.error("Submit ticket error:", error);

    Swal.fire({
      icon: "error",
      title: "Submission Failed",
      text:
        error.response?.data?.message ||
        error.message ||
        "Failed to submit the request.",
      confirmButtonText: "OK",
      confirmButtonColor: "#714b67",
    });

  } finally {
    submitting.value = false;
  }
}
// =========================================================
// INITIALIZE PAGE
// =========================================================

async function initializePage() {
  loading.value = true;
  errorMessage.value = "";

  try {
    await Promise.all([
      loadDepartments(),
      loadOptions(),
    ]);
  } catch (error) {
    console.error("Initialize ticket form error:", error);

    errorMessage.value =
      error.response?.data?.message ||
      error.message ||
      "Failed to load ticket form.";
  } finally {
    loading.value = false;
  }
}

// Route changes: reset and reload the form.
watch(
  () => route.fullPath,
  async () => {
    destroyDatePickers();
    resetForm();
    await initializePage();
  }
);

onMounted(() => {
  initializePage();
});

onBeforeUnmount(() => {
  destroyDatePickers();
});
</script>

<style scoped>

.date-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.date-input-wrapper > i {
  position: absolute;
  left: 14px;
  z-index: 3;
  color: #714b67;
  font-size: 18px;
  pointer-events: none;
}

.date-input-wrapper .date-input,
.date-input-wrapper input.form-control {
  width: 100%;
  height: 48px;
  padding-left: 44px;
  border: 1px solid #dee2e6;
  border-radius: 10px;
  background-color: #fff;
  font-size: 14px;
  font-weight: 400;
  cursor: pointer;
}

.date-input-wrapper .date-input:focus,
.date-input-wrapper input.form-control:focus {
  border-color: #714b67;
  box-shadow: 0 0 0 3px rgba(113, 75, 103, 0.12);
}

.flatpickr-calendar {
  border-radius: 12px !important;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12) !important;
}

.flatpickr-day.selected,
.flatpickr-day.selected:hover {
  background: #714b67 !important;
  border-color: #714b67 !important;
}

.flatpickr-day.today {
  border-color: #714b67;
}

@media (max-width: 576px) {
  .date-input-wrapper .date-input,
  .date-input-wrapper input.form-control {
    height: 50px;
    font-size: 15px;
  }
}

.card {
  border-radius: 12px;
}

.form-label {
  font-weight: 400;
  margin-bottom: 6px;
}

.form-control,
.form-select {
  min-height: 42px;
  border-radius: 8px;
  font-weight: 400;
}

.wizard-input {
  min-height: 46px;
}

.wizard-description {
  min-height: 150px;
  resize: vertical;
  font-weight: 400;
}

.wizard-progress {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.wizard-step {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
  color: #8a8f98;
}

.wizard-step-circle {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 2px solid #dee2e6;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 400;
}

.wizard-step-active {
  color: #0d6efd;
}

.wizard-step-active .wizard-step-circle {
  border-color: #0d6efd;
  background: #0d6efd;
  color: #fff;
}

.wizard-step-completed {
  color: #198754;
}

.wizard-step-completed .wizard-step-circle {
  border-color: #198754;
  background: #198754;
  color: #fff;
}

.wizard-step-label {
  font-size: 12px;
  line-height: 1.4;
}

.progress-bar {
  transition: width 0.25s ease;
}

.wizard-content {
  min-height: 280px;
  animation: wizardFadeIn 0.2s ease;
}

.wizard-heading {
  display: flex;
  align-items: center;
  gap: 14px;
}

.wizard-heading h5 {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 4px;
}

.wizard-heading p {
  color: #6c757d;
  font-size: 13px;
  margin-bottom: 0;
}

.wizard-icon,
.request-type-icon {
  width: 46px;
  height: 46px;
  flex-shrink: 0;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eaf2ff;
  color: #0d6efd;
  font-size: 21px;
}

.department-card {
  width: 100%;
  padding: 18px;
  border: 1px solid #dee2e6;
  border-radius: 12px;
  background: #fff;
  text-align: left;
  transition: 0.2s ease;
}

.department-card:hover {
  border-color: #0d6efd;
  background: #f8fbff;
}

.department-card.active {
  border: 2px solid #0d6efd;
  background: #f0f6ff;
}

.department-card h5 {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 5px;
}

.department-card small {
  color: #6c757d;
}

.request-type-card {
  width: 100%;
  height: 100%;
  padding: 16px;
  border: 1px solid #dee2e6;
  border-radius: 12px;
  background: #fff;
  text-align: left;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.request-type-card:hover {
  border-color: #0d6efd;
  background: #f8fbff;
}

.request-type-selected {
  border: 2px solid #0d6efd;
  background: #f0f6ff;
}

.request-type-title {
  font-size: 14px;
  font-weight: 500;
  color: #212529;
  margin-bottom: 4px;
}

.review-card {
  padding: 16px;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  background: #f8f9fa;
}

.review-card h6 {
  font-weight: 500;
}

.review-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  padding: 10px 0;
  border-bottom: 1px solid #e9ecef;
  font-size: 13px;
}

.review-row>span {
  color: #6c757d;
}

.review-row strong {
  text-align: right;
  font-weight: 500;
  overflow-wrap: anywhere;
}

.review-description {
  padding-top: 14px;
}

.description-text {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font-size: 14px;
  line-height: 1.6;
}

.wizard-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.wizard-actions .btn {
  min-height: 40px;
}

@keyframes wizardFadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 576px) {
  .wizard-step-circle {
    width: 32px;
    height: 32px;
  }

  .wizard-step-label {
    font-size: 10px;
  }

  .wizard-content {
    min-height: 250px;
  }

  .wizard-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .wizard-actions>button,
  .wizard-actions>div {
    width: 100%;
  }

  .wizard-actions>div {
    justify-content: space-between;
  }

  .review-row {
    gap: 10px;
  }
}
</style>
