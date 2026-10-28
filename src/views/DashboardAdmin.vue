<template>
    <div class="dashboard-admin animate-fade-in">
        <!-- 1. KPI TOP SUMMARY CARDS -->
        <div class="row g-3 mb-4">
            <!-- Total Vehicles -->
            <div class="col-12 col-sm-6 col-xl-3">
                <div class="kpi-card shadow-sm">
                    <div class="kpi-body">
                        <span class="text-muted small d-block mb-1">ລົດທັງໝົດໃນລະບົບ</span>
                        <div class="d-flex align-items-baseline gap-2">
                            <span class="fs-2 fw-bold text-dark">{{ summary.total_vehicles }}</span>
                            <span class="text-muted small">ຄັນ</span>
                        </div>
                    </div>
                    <div class="kpi-icon icon-blue">
                        <i class="bi bi-car-front"></i>
                    </div>
                </div>
            </div>

            <!-- Ready to Use -->
            <div class="col-12 col-sm-6 col-xl-3">
                <div class="kpi-card shadow-sm">
                    <div class="kpi-body">
                        <span class="text-muted small d-block mb-1">ພ້ອມໃຊ້ງານ</span>
                        <div class="d-flex align-items-baseline gap-2">
                            <span class="fs-2 fw-bold text-dark">{{ summary.available_vehicles }}</span>
                            <span class="text-muted small">ຄັນ</span>
                        </div>
                    </div>
                    <div class="kpi-icon icon-green">
                        <i class="bi bi-check-circle"></i>
                    </div>
                </div>
            </div>

            <!-- Active Trips -->
            <div class="col-12 col-sm-6 col-xl-3">
                <div class="kpi-card shadow-sm">
                    <div class="kpi-body">
                        <span class="text-muted small d-block mb-1">ກຳລັງໃຊ້ງານ</span>
                        <div class="d-flex align-items-baseline gap-2">
                            <span class="fs-2 fw-bold text-dark">{{ summary.on_trip }}</span>
                            <span class="text-muted small">ຄັນ</span>
                        </div>
                    </div>
                    <div class="kpi-icon icon-orange">
                        <i class="bi bi-cursor"></i>
                    </div>
                </div>
            </div>

            <!-- Maintenance -->
            <div class="col-12 col-sm-6 col-xl-3">
                <div class="kpi-card shadow-sm">
                    <div class="kpi-body">
                        <span class="text-muted small d-block mb-1">ຢູ່ລະຫວ່າງສ້ອມແປງ</span>
                        <div class="d-flex align-items-baseline gap-2">
                            <span class="fs-2 fw-bold text-dark">{{ summary.maintenance }}</span>
                            <span class="text-muted small">ຄັນ</span>
                        </div>
                    </div>
                    <div class="kpi-icon icon-red">
                        <i class="bi bi-wrench"></i>
                    </div>
                </div>
            </div>
        </div>

        <!-- 2. SPLIT LAYOUT: CRITICAL ALERTS & PENDING RETURNS -->
        <div class="row g-4">
            <!-- LEFT HAND SIDE: ALERTS & TODAY'S TRIPS -->
            <div class="col-12 col-lg-7">
                <!-- Critical Alerts & Problem Results Block -->
                <div class="card border-0 shadow-sm p-4 mb-4 dashboard-block">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h5 class="fw-bold m-0 section-title">
                            <i class="bi bi-exclamation-triangle text-danger me-2"></i>ລາຍການແຈ້ງປັນຫາ ແລະ ເຕືອນໄພ
                        </h5>
                    </div>

                    <!-- Empty State for Alerts -->
                    <div v-if="problem_results.length === 0 && alerts.length === 0"
                        class="text-center text-muted py-3 small">
                        ບໍ່ມີລາຍການແຈ້ງເຕືອນໃນຂະນະນີ້
                    </div>

                    <!-- Problem Results -->
                    <div v-for="problem in problem_results" :key="problem.booking_id"
                        class="alert-item alert-critical mb-3 border shadow-sm cursor-pointer"
                        @click="openAlert(problem.booking_id)">
                        <div class="fw-bold d-flex align-items-center gap-2 text-danger">
                            <i class="bi bi-exclamation-octagon-fill"></i>
                            <span>{{ problem.booking_id }} - {{ problem.driver }}</span>
                        </div>
                        <small class="text-muted d-block mb-2">{{ problem.booking_number || "" }}</small>
                        <div v-for="prob in problem.problems" :key="prob.problem_id"
                            class="d-flex align-items-center gap-2 ps-3 mb-1">
                            <img v-if="prob.image" :src="prob.image" class="rounded border"
                                style="width: 30px; height: 30px; object-fit: cover;" />
                            <p class="mb-0 text-secondary small text-wrap">
                                • {{ prob.name || "" }}
                            </p>
                        </div>
                    </div>

                    <!-- General System Alerts -->
                    <div v-for="alertItem in alerts" :key="alertItem.id"
                        class="alert-item mb-3 shadow-sm cursor-pointer"
                        :class="alertItem.level === 'critical' ? 'alert-critical' : 'alert-warning'"
                        @click="openAlert(alertItem.id)">
                        <div class="fw-bold d-flex align-items-center gap-2 mb-1"
                            :class="alertItem.level === 'critical' ? 'text-danger' : 'text-warning'">
                            <i class="bi"
                                :class="alertItem.level === 'critical' ? 'bi-exclamation-triangle-fill' : 'bi-exclamation-circle-fill'"></i>
                            <span>{{ alertItem.title }}</span>
                        </div>
                        <small class="text-muted d-block mb-1">{{ alertItem.time_ago || "" }}</small>
                        <div class="text-secondary small ps-4 text-wrap" style="white-space: pre-line;">
                            {{ alertItem.message }}
                        </div>
                    </div>
                </div>

                <!-- Employee Trips Timeline Block -->
                <div class="card border-0 shadow-sm p-4 dashboard-block">
                    <h5 class="fw-bold mb-3 section-title">
                        <i class="bi bi-clock-history text-primary me-2"></i>ການເດີນທາງທີ່ກຳລັງດຳເນີນຢູ່
                    </h5>

                    <div v-if="todayTrips.length === 0" class="text-center text-muted py-3 small">
                        ບໍ່ມີການເດີນທາງໃນມື້ນີ້
                    </div>

                    <div class="trip-timeline">
                        <div v-for="trip in todayTrips" :key="trip.id"
                            class="trip-item border-bottom pb-3 mb-3 cursor-pointer" @click="openAlert(trip.id)">
                            <h6 class="fw-bold text-danger mb-1">{{ trip.booking_number }}</h6>
                            <h6 class="fw-bold text-dark mb-1">{{ trip.name }}</h6>
                            <div class="text-muted small d-flex flex-wrap gap-3">
                                <span><i class="bi bi-person me-1"></i>{{ trip.employee }}</span>
                                <span><i class="bi bi-car-front me-1"></i>{{ trip.vehicle_name }} ({{ trip.vehicle_plate
                                    }})</span>
                                <span><i class="bi bi-clock me-1"></i>{{ formatDateTime(trip.start) }} - {{
                                    formatDateTime(trip.stop) }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- RIGHT HAND SIDE: PENDING APPROVALS / RETURNS -->
            <div class="col-12 col-lg-5">
                <!-- Pending Approval Requests -->
                <div class="mb-4 request-inner-card border rounded p-3">
                    <div v-if="wait_data.length === 0" class="text-center text-muted py-3 small">
                        ບໍ່ມີຄຳຂໍລໍຖ້າອະນຸມັດ
                    </div>

                    <div class="d-flex justify-content-between align-items-center mb-3 p-1">
                            <h5 class="fw-bold m-0 section-title">
                                <i class="bi bi-clipboard-check text-warning me-2"></i>
                                ລໍຖ້າອະນຸມັດ
                            </h5>

                            <span class="badge bg-warning bg-opacity-10 text-dark px-2 py-1 small rounded">
                                {{ wait_data.length }} ລາຍການ
                            </span>
                        </div>

                    <div v-for="request in wait_data" :key="request.id" class=" p-1 mb-3 shadow-lg cursor-pointer rounded" @click="openAlert(request.id)"> 

                        <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
                            <div class="fw-bold text-dark">
                                {{ request.booking_number || request.name || `#${request.id}` }}
                            </div>

                            <span class="badge bg-warning bg-opacity-10 text-dark rounded-pill px-2 py-1 small">
                                ລໍຖ້າອະນຸມັດ
                            </span>
                        </div>

                        <div class="text-secondary small row">
                            <div class="mb-1 col-6">
                                <i class="bi bi-person me-2"></i>
                                {{ request.employee || 'ບໍ່ລະບຸຜູ້ຈອງ' }}
                            </div>

                            <div class="mb-1 col-6">
                                <i class="bi bi-car-front me-2"></i>
                                {{ request.vehicle_name || 'ບໍ່ລະບຸລົດ' }}
                                <span v-if="request.vehicle_plate">
                                    ({{ request.vehicle_plate }})
                                </span>
                            </div>

                            <div v-if="request.start">
                                <i class="bi bi-calendar3 me-2"></i>
                                {{ formatDateTime(request.start) }}
                                <span v-if="request.stop">
                                    - {{ formatDateTime(request.stop) }}
                                </span>
                            </div>

                            <div v-if="request.driver" class="mt-1">
                                <i class="bi bi-person-badge me-2"></i>ຄົນຂັບລົດ
                                {{ request.driver }}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="mb-4 request-inner-card border rounded p-3">
                    <div v-if="approvalRequests.length === 0" class="text-center text-muted py-3 small">
                        ບໍ່ມີຄຳຂໍທີ່ອະນຸມັດແລ້ວ
                    </div>
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h5 class="fw-bold m-0 section-title">
                            <i class="bi bi-clipboard-check text-warning me-2"></i>
                            ຄຳຂໍອະນຸມັດແລ້ວ
                        </h5>

                        <span class="badge bg-warning bg-opacity-10 text-dark px-2 py-1 small rounded">
                            {{ approvalRequests.length }} ລາຍການ
                        </span>
                    </div>


                    <div v-for="request in approvalRequests" :key="request.id" class="rounded p-1 mb-3 shadow-lg cursor-pointer" @click="openAlert(request.id)"> 
                        <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
                            <div class="fw-bold text-dark">
                                {{ request.booking_number || request.name || `#${request.id}` }}
                            </div> 
                            <span class="badge bg-warning bg-opacity-10 text-dark rounded-pill px-2 py-1 small">
                                ອະນຸມັດແລ້ວ
                            </span>
                        </div> 
                        <div class="text-secondary small row">
                            <div class="mb-1 col-6">
                                <i class="bi bi-person me-2"></i>
                                {{ request.employee || 'ບໍ່ລະບຸຜູ້ຈອງ' }}
                            </div> 
                            <div class="mb-1 col-6">
                                <i class="bi bi-car-front me-2"></i>
                                {{ request.vehicle_name || 'ບໍ່ລະບຸລົດ' }}
                                <span v-if="request.vehicle_plate">
                                    ({{ request.vehicle_plate }})
                                </span>
                            </div> 
                            <div v-if="request.start">
                                <i class="bi bi-calendar3 me-2"></i>
                                {{ formatDateTime(request.start) }}
                                <span v-if="request.stop">
                                    - {{ formatDateTime(request.stop) }}
                                </span>
                            </div>

                            <div v-if="request.driver" class="mt-1">
                                <i class="bi bi-person-badge me-2"></i>
                                {{ request.driver }}
                            </div>
                        </div>
                    </div>
                </div>

                <hr class="text-muted opacity-25 mb-4" />
                <div class="card border-0 shadow-sm p-4 dashboard-block">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h5 class="fw-bold m-0 section-title">ຄຳຂໍຄືນລົດ</h5>
                        <span class="badge bg-primary bg-opacity-10 text-primary px-2 py-1 small rounded">{{
                            returnRequests.length }} ລາຍການ</span>
                    </div>

                    <div v-if="returnRequests.length === 0" class="text-center text-muted py-4 small">
                        ບໍ່ມີລາຍການອະນຸມັດ
                    </div>

                    <div class="request-inner-card border rounded p-3 mb-3 shadow-sm" v-for="request in returnRequests"
                        :key="request.id">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <div class="fw-bold text-dark">{{ request.employee }}</div>
                            <span
                                class="badge bg-info bg-opacity-10 text-info rounded-pill px-2 py-1 small">ລໍຖ້າຮັບລົດຄືນ</span>
                        </div>

                        <div class="text-secondary small mb-3">
                            <div class="mb-1">
                                <i class="bi bi-calendar3 me-2"></i> ວັນທີ່ເດີນທາງ: {{ formatDateTime(request.start) }}
                            </div>
                            <div class="mb-1">
                                <i class="bi bi-car-front me-2"></i> ລົດທີ່ໃຊ້: {{ request.vehicle_name }} ({{
                                request.vehicle_plate }})
                            </div>
                            <div>
                                <i class="bi bi-person-badge me-2"></i> ຄົນຂັບ: {{ request.driver || "ບໍ່ມີຄົນຂັບ" }}
                            </div>
                        </div>

                        <div class="col-12">
                            <button type="button" class="btn btn-primary w-100 py-2 fw-medium shadow-sm"
                                @click="receiveBookingCarAction(request.id)" :disabled="receivingCar">
                                <span v-if="receivingCar" class="spinner-border spinner-border-sm me-1"></span>
                                <i v-else class="bi bi-check-circle me-1"></i>
                                {{ receivingCar ? "ກຳລັງຮັບລົດຄືນ..." : "ຮັບລົດຄືນ" }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Swal from "sweetalert2";
import { getBookingDashboard, receiveBookingCar } from "../api/axios";
import router from "../router";
import { formatDateTime } from "../util/formatdate";

const loading = ref(true);
const receivingCar = ref(false);
const errorMessage = ref("");
const approvalRequests = ref([]);
const wait_data = ref([]);
const summary = ref({
    total_vehicles: 0,
    available_vehicles: 0,
    on_trip: 0,
    maintenance: 0,
});

const alerts = ref([]);
const todayTrips = ref([]);
const returnRequests = ref([]);
const problem_results = ref([]);

// ==========================================
// SweetAlert helpers
// ==========================================
const alertSuccess = (text) =>
    Swal.fire({
        icon: "success",
        title: "ສຳເລັດ",
        text,
        timer: 1500,
        showConfirmButton: false,
    });

const alertError = (text) =>
    Swal.fire({
        icon: "error",
        title: "ເກີດຂໍ້ຜິດພາດ",
        text,
        confirmButtonText: "ຕົກລົງ",
    });

const alertWarning = (text) =>
    Swal.fire({
        icon: "warning",
        title: "ແຈ້ງເຕືອນ",
        text,
        confirmButtonText: "ຕົກລົງ",
    });

const confirmDialog = async (text, confirmText = "ຢືນຢັນ") => {
    const result = await Swal.fire({
        icon: "question",
        title: "ຢືນຢັນ",
        text,
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: "ຍົກເລີກ",
        confirmButtonColor: "#198754",
        cancelButtonColor: "#6c757d",
    });
    return result.isConfirmed;
};

const openAlert = (id) => {
    if (!id) return;
    router.push(`/booking/history/${id}`);
};

const receiveBookingCarAction = async (bookingId) => {
    if (!bookingId) {
        alertWarning("ບໍ່ພົບ Booking ID");
        return;
    }

    const confirmed = await confirmDialog(
        "ທ່ານໄດ້ກວດສອບລົດ ແລະ ເລກໄມລ໌ ແລ້ວ ແລະ ຕ້ອງການຮັບລົດຄືນບໍ?",
        "ຮັບລົດຄືນ",
    );
    if (!confirmed) return;

    receivingCar.value = true;

    try {
        const response = await receiveBookingCar(bookingId);
        if (response?.status) {
            await alertSuccess("ຮັບລົດຄືນສຳເລັດ");
            await loadDashboard(); // โหลดข้อมูล Dashboard ใหม่
        } else {
            alertError(response?.message || "ບໍ່ສາມາດຮັບລົດຄືນໄດ້");
        }
    } catch (error) {
        console.error("Receive car error:", error);
        alertError(error.response?.data?.message || "ລະບົບຂັດຂ້ອງ ບໍ່ສາມາດຮັບລົດຄືນໄດ້");
    } finally {
        receivingCar.value = false;
    }
};

const loadDashboard = async () => {
    try {
        loading.value = true;
        const result = await getBookingDashboard();
        if (result) {
            summary.value = result.summary || summary.value;
            alerts.value = result.alerts || [];
            todayTrips.value = result.today_trips || [];
            returnRequests.value = result.return_requests || [];
            problem_results.value = result.problem_results || [];
            // New approval requests
            approvalRequests.value = result.approval_requests || [];
            wait_data.value = result.wait_data || [];
        }
    } catch (error) {
        console.error("Failed to load dashboard:", error);
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    loadDashboard();
});
</script>

<style scoped>
.dashboard-admin {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    color: #333333;
}

.section-title {
    font-size: 16px;
    color: #2c2c2c;
}

.cursor-pointer {
    cursor: pointer;
}

/* --- KPI Summary Card Styles --- */
.kpi-card {
    background: #ffffff;
    border-radius: 12px;
    padding: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: 1px solid #f0f0f2;
    transition: transform 0.2s;
}

.kpi-card:hover {
    transform: translateY(-2px);
}

.kpi-icon {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
}

.icon-blue {
    background-color: #ebf3ff;
    color: #1e74fd;
}

.icon-green {
    background-color: #e6f9f0;
    color: #10b981;
}

.icon-orange {
    background-color: #fff4eb;
    color: #f59e0b;
}

.icon-red {
    background-color: #fdf2f2;
    color: #ef4444;
}

/* --- Dashboard Blocks Layout --- */
.dashboard-block {
    border-radius: 14px;
    background-color: #ffffff;
}

/* --- Alert Styling Tones --- */
.alert-item {
    padding: 14px 16px;
    border-radius: 8px;
    font-size: 14px;
    transition: opacity 0.2s;
}

.alert-item:hover {
    opacity: 0.9;
}

.alert-critical {
    background-color: #fff5f5;
    border-left: 4px solid #ef4444;
}

.alert-warning {
    background-color: #fffbeb;
    border-left: 4px solid #f59e0b;
}

/* --- Sub Card Design (Right Column) --- */
.request-inner-card {
    background-color: #ffffff;
    border-color: #eaeaea !important;
    transition: transform 0.2s, box-shadow 0.2s;
}

.request-inner-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

.btn-primary {
    background-color: #2563eb !important;
    border-color: #2563eb !important;
}

.btn-primary:hover {
    background-color: #1d4ed8 !important;
}

/* --- Simple Animations --- */
.animate-fade-in {
    animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>