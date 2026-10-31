<template>
  
  <!-- Dashboard -->

  <div class="row">
   <div
  class="col-12 rounded-4 p-3 shadow-sm "
  style="background: linear-gradient(135deg, #eef5ff, #ffffff); border: 1px solid #dbeafe;"
>
  <div class="d-flex justify-content-between align-items-center gap-2">
    <div>
      <h5 class="fw-bold text-primary mb-2">
        <i class="bi bi-sun-fill me-1"></i>
        Hello {{ currentUsername }}
      </h5>

      <p class="text-secondary mb-0 small">
        <i class="bi bi-calendar-check me-1"></i>
        ມີ
        <span class="fw-bold text-primary">{{ bookingCounts.approved }}</span>
        ການເດີນທາງທີ່ຕ້ອງໄປ
      </p>
    </div>

    <button
      class="btn btn-primary rounded-3 px-3 py-2 shadow-sm text-nowrap"
      @click="goToNewBooking"
    >
      <i class="bi bi-plus-circle me-1"></i>
      ຄຳຮ້ອງໃໝ່
    </button>
  </div>
</div>

    <div class="col-sm-12 col-lg-9 mt-1">
      <h4>ແຜນການເດີນທາງ</h4>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden"> Loading... </span>
        </div>

        <p class="mt-2">Loading bookings...</p>
      </div>

      <!-- Error -->
      <div v-else-if="errorMessage" class="alert alert-danger">
        {{ errorMessage }}
      </div>
      <div v-else-if="events.length === 0" class="alert alert-info">
        ບໍ່ມີລາຍການແຜນເດີນທາງ
      </div>

      <!-- Events -->
<!-- Events -->
<div v-for="event in events" :key="event.id" class="col-12 mb-4">
  <div 
    class="card h-100 shadow-sm" 
    @click="goToDetail(event.id)" 
    style="cursor: pointer;"
  >
    <div class="card-body">
      <!-- <p class="text-muted small mb-0">ID: {{ event.id }}</p> -->

      <h6 class="card-title d-flex justify-content-between align-items-center">
        <div>
          <span v-if="event.booking_id" class="text-black px-2 py-1 rounded">
            ຈັດລົດແລ້ວ
          </span>
          <span v-else class="text-black px-2 py-1 rounded">
            ຍັງບໍ່ໄດ້ຈັດລົດ
          </span>
          <span v-if="event.booking_number" class="text-muted ms-2">
            {{ event.booking_number }}
          </span>
        </div>

        <span v-if="event.driver_name" class="bg-primary text-white px-2 py-1 rounded">
          ຄົນຂັບລົດ: ({{ event.driver_name }})
        </span> 
      </h6>

      <h2 v-if="event.description" class="card-text" style="font-size: 18px; font-weight: bold">
        <strong>{{ event.description }}</strong> 
      </h2>
      <p class="card-text mb-1 d-flex align-items-left">
        <i class="bi bi-calendar-check me-2 text-warning"></i>
        <span v-if="isSameDate(event.start, event.stop)">
          {{ formatDate(event.start) }}
          {{ formatTime(event.start) }}
          -
          {{ formatTime(event.stop) }} 
        </span>

        <span v-else>
          {{ formatDate(event.start) }}
          {{ formatTime(event.start) }} -
          {{ formatDate(event.stop) }}
          {{ formatTime(event.stop) }} 
        </span>
      </p>
      <hr class="my-2" />

      <div class="row">
        <div class="col-3">
          <p
            class="mb-1 fw-bold text-center rounded text-white"
            :class="stateBackgroundClass(event.confirmed_state)"
            :style="stateBackgroundStyle(event.confirmed_state )"
          >
            {{ event.row_state || "-" }}
          </p>
          <img
            v-if="event.image"
            :src="event.image"
            alt="Booking"
            class="img-fluid"
            style="
              max-width: 200px;
              max-height: 120px;
              object-fit: contain;
            "
          />
        </div>
        <div class="col-9">
          <p class="card-text mb-1 fw-bold">
            {{ event.booking_name || "ຍັງບໍ່ວ່າງ" }}
          </p>
          {{ event.sign_brand || "-" }}
        </div>
      </div>
    </div>
  </div>
</div>
    </div>
   <div class="col-sm-12 col-lg-3 mt-2">
  <h4 class="mb-3 fw-bold text-dark"><i class="bi bi-map me-2 text-primary"></i>ແຜນການເດີນທາງ</h4>  
  <div class="row card shadow-sm p-3 border-0 rounded-4" style="font-size: 14px; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);">
    
    <!-- Draft -->
    <div class="col-12 mb-2">
      <div class="status-card bg-white rounded-3 p-3 shadow-xs border-start border-4 border-secondary d-flex justify-content-between align-items-center transition-all" @click="loadEventsByState('draft')">
        <div class="d-flex align-items-center">
          <div class="icon-box bg-secondary-subtle text-secondary rounded-circle me-3 d-flex align-items-center justify-content-center" style="width: 38px; height: 38px;">
            <i class="bi bi-file-earmark-text fs-5"></i>
          </div>
          <div class="text-secondary">
    <div class="fw-semibold ">ລໍຖ້າຈັດລົດ</div>
    <div class="fw-semibold ">Pending Assign</div>
</div>
        </div>
        <h3 class="fw-bold text-secondary m-0">{{ bookingCounts.draft }}</h3>
      </div>  
    </div>
    <!-- Waiting for Approval -->
    <div class="col-12 mb-2">  
      <div class="status-card bg-white rounded-3 p-3 shadow-xs border-start border-4 border-warning d-flex justify-content-between align-items-center transition-all" @click="loadEventsByState('waiting_for_approval')">
        <div class="d-flex align-items-center">
          <div class="icon-box bg-warning-subtle text-warning rounded-circle me-3 d-flex align-items-center justify-content-center" style="width: 38px; height: 38px;">
            <i class="bi bi-hourglass-split fs-5"></i>
          </div>
                 <div class="text-warning">
    <div class="fw-semibold ">ລໍຖ້າອະນຸມັດ</div>
    <div class="fw-semibold ">Pending Approve</div>
</div>
        </div>
        <h3 class="fw-bold text-warning m-0">{{ bookingCounts.waiting_for_approval }}</h3>
      </div>  
    </div>

<!-- Approved -->
<div class="col-12 mb-2">
  <div
    class="status-card bg-white rounded-3 p-3 shadow-xs d-flex justify-content-between align-items-center transition-all"
    style="border-left: 4px solid #fd7e14;"
    @click="loadEventsByState('approved')"
  >
    <div class="d-flex align-items-center">
      <div
        class="icon-box rounded-circle me-3 d-flex align-items-center justify-content-center"
        style="width: 38px; height: 38px; background-color: #fff0e0; color: #fd7e14;"
      >
        <i class="bi bi-patch-check-fill fs-5"></i>
      </div>
     <div>

    <div class="fw-semibold"style="color: #fd7e14;">ອະນຸມັດແລ້ວ</div>

    <div class="fw-semibold " style="color: #fd7e14;">Approved</div>

</div>
    </div>

    <h3 class="fw-bold m-0" style="color: #fd7e14;">
      {{ bookingCounts.approved }}
    </h3>
  </div>
</div>
    <!-- ບໍ່ອະນຸມັດ (Not Approved) -->
    <div class="col-12">  
      <div class="status-card bg-white rounded-3 p-3 shadow-xs border-start border-4 border-danger d-flex justify-content-between align-items-center transition-all" @click="loadEventsByState('not_approved')">
        <div class="d-flex align-items-center">
          <div class="icon-box bg-danger-subtle text-danger rounded-circle me-3 d-flex align-items-center justify-content-center" style="width: 38px; height: 38px;">
            <i class="bi bi-x-circle fs-5"></i>
          </div>
          <div class="text-danger">
    <div class="fw-semibold ">ບໍ່ອະນຸມັດ</div>
    <div class="fw-semibold ">Rejected</div>
</div>
        </div>
        <h3 class="fw-bold text-danger m-0">{{ bookingCounts.not_approved }}</h3>
      </div>  
    </div>

<!-- ກຳລັງໃຊ້ງານ (Start) -->
<div class="col-12 mb-2">
  <div
    class="status-card bg-white rounded-3 p-3 shadow-xs border-start border-4 border-primary d-flex justify-content-between align-items-center transition-all"
    @click="loadEventsByState('start')"
  >
    <div class="d-flex align-items-center">
      <div
        class="icon-box bg-primary-subtle text-primary rounded-circle me-3 d-flex align-items-center justify-content-center"
        style="width: 38px; height: 38px;"
      >
        <i class="bi bi-play-circle-fill fs-5"></i>
      </div>
      <div class="text-primary">
    <div class="fw-semibold ">ກຳລັງໃຊ້ງານ</div>
    <div class="fw-semibold ">In Use</div>
</div>
    </div>
    <h3 class="fw-bold text-primary m-0">
      {{ bookingCounts.start }}
    </h3>
  </div>
</div>

<!-- ສຳເລັດແລ້ວ (Completed) -->
<div class="col-12 mb-2">
  <div
    class="status-card bg-white rounded-3 p-3 shadow-xs border-start border-4 border-success d-flex justify-content-between align-items-center transition-all"
    @click="loadEventsByState('completed')"
  >
    <div class="d-flex align-items-center">
      <div
        class="icon-box bg-success-subtle text-success rounded-circle me-3 d-flex align-items-center justify-content-center"
        style="width: 38px; height: 38px;"
      >
        <i class="bi bi-check2-all fs-5"></i>
      </div>
        <div class="text-success">
    <div class="fw-semibold">ສຳເລັດ</div>
    <div class="fw-semibold">Vehicle Returned</div>
</div>
    </div>
    <h3 class="fw-bold text-success m-0">
      {{ bookingCounts.completed }}
    </h3>
  </div>
</div>




  </div>
</div>
  </div>
</template>

<script setup>
import { ref, onMounted ,computed  } from "vue";
import { useRouter } from "vue-router";
import { formatDate, formatTime, isSameDate } from "../util/formatdate";
const router = useRouter();
import { getEvents, getBookingCounts, getEventsByState } from "../api/axios";
import { Button } from "bootstrap";
import { stateColors, stateTranslations } from "../util/constants";
const currentUsername = ref("");
const currentCompany = ref("");
const groups_ids = ref([]);
const events = ref([]);
const loading = ref(false);
const errorMessage = ref("");
const getStateColor = (state) => {
  const stateKey = stateColors[state]
    ? state
    : Object.keys(stateTranslations).find(
        (key) => stateTranslations[key] === state,
      );
  return stateColors[stateKey] || "";
};
const stateBackgroundClass = (state) => {
  const color = getStateColor(state);
  return color && !color.startsWith("#") ? `bg-${color}` : color ? "" : "bg-success";
};
const stateBackgroundStyle = (state) => {
  const color = getStateColor(state);
  return color?.startsWith("#") ? { backgroundColor: color } : {};
};
// ==============================
// Load Dashboard
// ==============================

const approvedCount = computed(() =>
  events.value.filter(item => item.row_state === 'completed').length
)
const goToDetail = (id) => {

  if (!id) return;
  // Option 1: Using named route (recommended)
  
  router.push({ name: 'BookingDetail', params: { id }});

  // Option 2: Using path string (uncomment if you use direct paths)
  // router.push(`/booking/detail/${id}`);
};

const bookingCounts = ref({
  draft: 0,
  waiting_for_approval: 0,
  not_approved: 0,
  completed: 0,
  approved: 0,
  start: 0,
});

const loadBookingCounts = async () => {
  try {
    const response = await getBookingCounts();

    console.log("Booking counts response:", response);

    if (response.status && response.counts) {
      bookingCounts.value = {
        draft: response.counts.draft || 0,
        waiting_for_approval: response.counts.waiting_for_approval || 0,
        not_approved: response.counts.not_approved || 0,
        completed: response.counts.completed || 0,
        start: response.counts.start || 0,
        approved: response.counts.approved || 0,
      };

      console.log("Booking counts:", bookingCounts.value);
    }
  } catch (error) {
    console.error("Error loading booking counts:", error);
  }
};
const loadEventsByState = async (state) => {
  loading.value = true;
  errorMessage.value = "";

  try {
    const response = await getEventsByState(state);

    console.log("State events:", response);

    if (response.status && Array.isArray(response.data)) {
      events.value = response.data;
    } else {
      events.value = [];
    }
  } catch (error) {
    console.error("Error loading state events:", error);

    errorMessage.value =
      error.response?.data?.message || "Unable to load booking events.";

    events.value = [];
  } finally {
    loading.value = false;
  }
};
const loadEvents = async () => {
  loading.value = true;
  errorMessage.value = "";
  try {
    const response = await getEvents();
    console.log(response);
    if (response.status && Array.isArray(response.data)) {
      
      console.log("load events:", response);
      events.value = response.data;
    } else {
      events.value = [];
    }
  } catch (error) {
    console.error(error);
    errorMessage.value =
      error.response?.data?.message || "Unable to load booking events.";
    events.value = [];
  } finally {
    loading.value = false;
  }
};

const goToNewBooking = () => {
  router.push("/booking/new"); // Redirects programmatically
};
// ==============================
// Mounted
// ==============================
onMounted(() => {
  currentUsername.value = localStorage.getItem("username") || "User";
  currentCompany.value = localStorage.getItem("company_name") || "";
  const storedGroups = localStorage.getItem("groups_id") || "[]";
  try {
    const parsedGroups = JSON.parse(storedGroups);
    groups_ids.value = Array.isArray(parsedGroups)
      ? parsedGroups
      : [parsedGroups];
  } catch {
    groups_ids.value = storedGroups.split(",").filter(Boolean);
  }
  // Get booking events
  loadEvents();
  loadBookingCounts();
});

</script>
