<!-- src/views/StartTripView.vue -->
<template>
  <div class="container-fluid min-vh-100 bg-light py-4">
    <!-- Top Step Navigation Header Bar -->
    <div class="row justify-content-center mb-3">
      <div class="col-xl-9 col-12 d-flex justify-content-between align-items-center">
        <div>
          <h4 class="fw-bold mb-1 text-dark">ຂໍ້ມູນການໃຊ້ງານການເດີນທາງ</h4>
          <p class="text-muted small mb-0">ທຣິບ: {{ booking?.description || 'ກຳລັງໂຫຼດ...' }}</p>
        </div>
        <span class="text-success fw-bold small"><i class="bi bi-circle-fill fs-8 me-1"></i> ພ້ອມເລີ່ມທຣິບ</span>
      </div>
    </div>

    <!-- Step Information Breadcrumb Ribbon Indicator -->
    <!-- <div class="row justify-content-center mb-4">
      <div class="col-xl-9 col-12 d-flex justify-content-between align-items-center border-bottom pb-2">
        <span class="text-primary fw-bold small">ຂັ້ນຕອນທີ 1: ການເລີ່ມໃຊ້ງານທຣິບ</span>
        <span class="text-muted small">ຂັ້ນທີ 1 ຈາກ 2</span>
      </div>
    </div> -->

    <!-- Core Submission Workspace Layout -->
    <div class="row justify-content-center">
      <div class="col-xl-9 col-12">
        <form @submit.prevent="handleStartTripSubmit" class="card border-0 shadow-sm p-4 bg-white rounded-3">
          
          <!-- Section 1: Driver Profile Selector Group -->
          <div class="mb-4">
            <h6 class="fw-bold text-dark mb-1">ຂໍ້ມູນການໃຊ້ງານທຣິບ</h6>
            <label class="form-label fw-semibold text-muted small mb-2">ຜູ້ຂັບລົດສຳລັບທຣິບນີ້</label>
            
            <!-- Pseudo Dropdown Field Container Layout Block matching Image -->
            <div class="d-flex align-items-center justify-content-between p-3 border rounded-3 bg-white cursor-pointer">
              <div class="d-flex align-items-center">
                <!-- Driver Dummy Avatar Frame -->
                <div class="bg-light rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 42px; height: 42px; overflow: hidden;">
                  <i class="bi bi-person-fill text-secondary fs-4"></i>
                </div>
                <div>
                  <strong class="text-dark d-block fs-6">{{ booking?.driver || 'อนุชา ไชยดี' }}</strong> 
                </div>
              </div>
              <i class="bi bi-chevron-down text-muted"></i>
            </div>
            <span class="text-muted text-xxs d-block mt-2">ຜູ້ຂັບລົດຈິງອາດບໍ່ແມ່ນຄົນທີ່ຈອງ ຫາກຕ້ອງການປ່ຽນໃຫ້ເລືອກຈາກພະນັກງານບໍລິສັດ</span>
          </div>

          <!-- Section 2: Numerical Input for Mileage Counter Tracker -->
     <!-- Section 2: Numerical Input for Mileage Counter Tracker -->
          <div class="mb-3">
            <label class="form-label fw-semibold text-dark small mb-1">ເລກໄມລ໌ກ່ອນໃຊ້ງານ (ກິໂລແມັດ) <span class="text-danger">*</span></label>
            <input 
              type="number" 
              min="0"
              v-model="startForm.mile_before" 
              class="form-control form-control-sm bg-white border"
              placeholder="ປ້ອນເລກໄມລ໌ ເຊັ່ນ: 123456"
              required
            />
            <!-- <span class="text-muted text-xxs d-block mt-1">
              * ເລກໄມລ໌ຫຼ້າສຸດຂອງລົດກ່ອນເລີ່ມທຣິບແມ່ນ {{ booking?.latest_mile || '142,500' }} ກມ.
            </span> -->
          </div>

          <!-- Section 3: Graphic Photo Base64 Uploader Box Element Layout -->
          <div class="mb-4">
            <label class="form-label fw-semibold text-dark mb-1">ຮູບໜ້າປັດກ່ອນໃຊ້ງານ *</label>
            
            <!-- Clickable Interactive Photo Upload Trigger Anchor Workspace Box -->
            <div 
              @click="triggerFileSelect"
              class="border border-dashed rounded-3 p-5 text-center bg-light cursor-pointer position-relative d-flex flex-column align-items-center justify-content-center"
              style="border-style: dashed !important; min-height: 180px;"
            >
              <!-- Show dynamic preview placeholder if file is selected successfully -->
              <template v-if="!startForm.image_mile_before">
                <i class="bi bi-camera-fill text-muted fs-1 mb-2"></i>
                <span class="text-muted small">ກົດເພື່ອເປີດກ້ອງຖ່າຍຮູບໜ້າປັດລົດ</span>
              </template>
              <template v-else>
                <img :src="`data:image/png;base64,${startForm.image_mile_before}`" class="img-fluid rounded shadow-sm" style="max-height: 160px;" />
                <span class="badge bg-dark position-absolute bottom-0 mb-2">ກົດເພື່ອປ່ຽນຮູບ</span>
              </template>
              
              <!-- Hidden Native Input Element Box Target -->
              <input ref="fileInput" type="file" accept="image/*" capture="environment" class="d-none" @change="handlePhotoCapture" />
            </div>
          </div>

          <!-- Actions Submission Button Frame Footer Layout -->
          <button 
            type="submit" 
            class="btn btn-success btn-lg w-100 py-3 fw-bold mt-2" 
            :disabled="submitting || !startForm.mile_before || !startForm.image_mile_before"
          >
            <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
            ບັນທຶກ ແລະ ເລີ່ມທຣິບ <i class="bi bi-arrow-right ms-1"></i>
          </button>

        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getEventDetail, startBookingTripAPI } from "../api/axios";
import Swal from "sweetalert2";

const route = useRoute();
const router = useRouter();

const fileInput = ref(null);
const booking = ref(null);
const loading = ref(true);
const submitting = ref(false);
const errorMessage = ref("");

const startForm = ref({
  booking_id: route.params.id,
  mile_before: null,
  image_mile_before: ""
});

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

const fetchBookingContext = async () => {
  try {
    const response = await getEventDetail(route.params.id);
    if (response && response.status) {
      booking.value = response.data;
    }
  } catch (err) {
    errorMessage.value = "ບໍ່ສາມາດໂຫຼດຂໍ້ມູນການເດີນທາງໄດ້";
  } finally {
    loading.value = false;
  }
};

const triggerFileSelect = () => {
  fileInput.value.click();
};

// Converts the captured dashboard camera element picture into a clean Base64 string for Odoo

const handlePhotoCapture = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alertWarning("ກະລຸນາເລືອກຮູບພາບ");
    event.target.value = "";
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    const img = new Image();

    img.onload = () => {
      const maxSize = 1280;
      const scale = Math.min(
        1,
        maxSize / Math.max(img.width, img.height)
      );

      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.75);

      startForm.value.image_mile_before =
        compressedDataUrl.split(",")[1];
    };

    img.onerror = () => {
      alertError("ບໍ່ສາມາດໂຫຼດຮູບພາບໄດ້");
    };

    img.src = reader.result;
  };

  reader.onerror = () => {
    alertError("ບໍ່ສາມາດອ່ານຮູບພາບໄດ້");
  };

  reader.readAsDataURL(file);
};

const handleStartTripSubmit = async () => {
  submitting.value = true;
  try {
    const res = await startBookingTripAPI(startForm.value);
    console.log("Start Trip API Response:", res);
    if (res.status) {
      await alertSuccess("ເລີ່ມການໃຊ້ງານສຳເລັດ");
      router.push(`/booking/history/${res.data.id}`);
    } else {
      alertError(res.message || "ເກີດຂໍ້ຜິດພາດ");
    }
  } catch (error) {
    console.error(error);
    alertError("ລະບົບມີຂໍ້ຜິດພາດ ກະລຸນາລອງໃໝ່");
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  fetchBookingContext();
});
</script>

<style scoped>
.text-xxs {
  font-size: 0.76rem;
}
.cursor-pointer {
  cursor: pointer;
}
.border-dashed {
  border: 2px dashed #dee2e6 !important;
}
</style>