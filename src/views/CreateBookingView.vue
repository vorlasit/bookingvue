<!-- src/views/CreateBookingView.vue -->
<template>
  <div class="container-fluid min-vh-100 bg-light py-4">
    <!-- Header Block -->
    <div class="row justify-content-center mb-4">
      <div class="col-xl-10 col-12 d-flex justify-content-between align-items-center">
        <div>
          <h4 class="fw-bold mb-1 text-dark">ສົ່ງຄຳຂໍຈອງລົດບໍລິສັດ</h4>
          <p class="text-muted small mb-0">{{ currentCompany }}</p>
        </div>
        <button @click="goBack" class="btn btn-outline-secondary shadow-sm">
          <i class="bi bi-arrow-left me-1"></i> ກັບໄປໜ້າຫຼັກ
        </button>
      </div>
    </div>

    <!-- Main Workspace Layout -->
    <div class="row justify-content-center">
      <div class="col-xl-10 col-12">
        <div class="row g-4">

          <!-- Left Side: Data Fields Entry -->
          <div class="col-lg-7 col-12">
            <div class="card border-0 shadow-sm p-4 bg-white rounded-4">
              <h5 class="fw-bold mb-4 border-bottom pb-2 text-primary">
                <i class="bi bi-file-text me-2"></i>ຕື່ມຂໍ້ມູນການເດີນທາງ
              </h5>

              <div class="mb-3">
                <label class="form-label fw-semibold text-secondary small">ຈຸດປະສົງການເດີນທາງ <span class="text-danger">*</span></label>
                <input type="text" v-model="form.description" class="form-control custom-input" placeholder="ເຊັ່ນ: ໄປຮັບແຂກຜູ້ສະໜອງ" required />
              </div>

              <div class="row mb-3 g-3">
                <div class="col-md-6 col-12">
                  <label class="form-label fw-semibold text-secondary small">ວັນເວລາເລີ່ມຕົ້ນ <span class="text-danger">*</span></label>
                  <input ref="startInput" type="text" class="form-control custom-input" placeholder="ວັນທີ ແລະ ເວລາເລີ່ມຕົ້ນ" required />
                </div>
                <div class="col-md-6 col-12">
                  <label class="form-label fw-semibold text-secondary small">ວັນເວລາສິ້ນສຸດ <span class="text-danger">*</span></label>
                  <input ref="stopInput" type="text" class="form-control custom-input" placeholder="ວັນທີ ແລະ ເວລາສິ້ນສຸດ" required />
                </div>
              </div>

              <div class="row mb-3 g-3">
                <div class="col-md-6 col-12">
                  <label class="form-label fw-semibold text-secondary small">ຈຳນວນຜູ້ເຂົ້າຮ່ວມ <span class="text-danger">*</span></label>
                  <input type="number" v-model="form.number_of_participant" class="form-control custom-input" min="1" placeholder="3 (ລວມຜູ້ຂັບຂີ່)" required />
                </div>
                <div class="col-md-6 col-12">
                  <label class="form-label fw-semibold text-secondary small">ເບີໂທຕິດຕໍ່ <span class="text-danger">*</span></label>
                  <input type="tel" v-model="form.tel" class="form-control custom-input" placeholder="020 xxxxxxxx" required />
                </div>
              </div>

              <div class="mb-3 p-3 bg-light rounded-3 border">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <label class="form-check-label fw-semibold text-dark d-block" for="keepDriver">
                      ຕ້ອງການຄົນຂັບລົດບໍ?
                    </label>
                    <small class="text-muted">ເປີດໃຊ້ງານຖ້າຕ້ອງການໃຫ້ບໍລິສັດຈັດຫາຄົນຂັບໃຫ້</small>
                  </div>
                  <div class="form-check form-switch fs-5">
                    <input
                      id="keepDriver"
                      v-model="form.keep_driver"
                      class="form-check-input"
                      type="checkbox"
                      role="switch"
                    />
                  </div>
                </div>
              </div>

              <!-- Available Vehicles Display List -->
              <h6 class="fw-bold text-dark mb-3">
                <i class="bi bi-car-front me-2"></i>ລົດທີ່ວ່າງໃຫ້ຈອງ
              </h6>

              <div v-if="vehiclesLoading" class="text-muted py-3 text-center" role="status">
                <span class="spinner-border spinner-border-sm me-2 text-primary"></span>
                ກຳລັງໂຫຼດລາຍການລົດ...
              </div>

              <div v-else-if="vehiclesError" class="alert alert-danger mb-2" role="alert">
                {{ vehiclesError }}
              </div>

              <div v-else-if="availableVehicles.length === 0" class="alert alert-warning mb-2">
                ບໍ່ມີລົດວ່າງໃຫ້ຈອງໃນຊ່ວງເວລານີ້
              </div>

              <div class="vehicle-list" style="max-height: 350px; overflow-y: auto;">
                <button
                  v-for="vehicle in availableVehicles"
                  :key="vehicle.id"
                  type="button"
                  class="card w-100 text-start mb-2 p-3 transition-all"
                  :class="selectedVehicleId === vehicle.id ? 'border-primary bg-primary-subtle bg-opacity-10 shadow-sm' : 'border-light shadow-sm'"
                  @click="selectVehicle(vehicle)"
                >
                  <div class="d-flex align-items-center justify-content-between">
                    <div class="d-flex align-items-center">
                      <div class="rounded-circle bg-primary-subtle p-3 me-3 text-primary">
                        <i class="bi bi-car-front-fill fs-4"></i>
                      </div>
                      <div>
                        <strong class="text-dark d-block">{{ vehicle.brand }} {{ vehicle.name }}</strong>
                        <span class="text-muted small d-block">ປ້າຍລົດ: {{ vehicle.sign }} | {{ vehicle.capacity }} ບ່ອນນັ່ງ</span>
                      </div>
                    </div>
                    <span
                      class="badge px-3 py-2 rounded-pill"
                      :class="selectedVehicleId === vehicle.id ? 'bg-primary text-white' : 'bg-success-subtle text-success border border-success'"
                    >
                      {{ selectedVehicleId === vehicle.id ? 'ເລືອກແລ້ວ' : 'ວ່າງ' }}
                    </span>
                  </div>
                </button>
              </div>

            </div>
          </div>

          <!-- Right Side: Finalization Column -->
          <div class="col-lg-5 col-12">
            <div class="card border-primary border-2 p-4 bg-white shadow-sm rounded-4 sticky-top" style="top: 20px;">
              <h5 class="text-primary fw-bold mb-4">
                <i class="bi bi-check2-circle me-2"></i>ສະຫຼຸບຂໍ້ມູນຄຳຂໍຈອງລົດ
              </h5>

            <div class="mb-3"> 
              <div class="fw-bold text-dark fs-6 bg-light p-3 rounded-3 border">
                <div v-if="selectedVehicle">
                  <i class="bi bi-car-front-fill text-primary me-2"></i>
                  {{ selectedVehicle.brand }} {{ selectedVehicle.name }}
                  <span class="text-muted fw-normal small d-block mt-1 ms-4">
                    ປ້າຍລົດ: <span class="fw-semibold text-dark">{{ selectedVehicle.sign }}</span>
                    | {{ selectedVehicle.capacity }} ບ່ອນນັ່ງ
                  </span>
                </div>
                <span v-else class="text-danger small">ບໍ່ເລືອກລົດ (ໃຫ້ທີມບໍລິຫານເລືອກໃຫ້)</span>
              </div>
            </div>

              <div class="d-flex justify-content-between mb-3 border-bottom pb-2">
                <span class="text-muted">ສະຖານະຄົນຂັບ</span>
                <span class="fw-bold text-dark">
                  {{ form.keep_driver ? 'ໃຊ້ຄົນຂັບຂອງບໍລິສັດ' : 'ບໍ່ເອົາຄົນຂັບ' }}
                </span>
              </div>

              <div class="d-flex justify-content-between mb-4 border-bottom pb-2">
                <span class="text-muted">ໄລຍະເວລາລວມ</span>
                <span class="fw-bold text-success fs-5">{{ durationTime }} ຊົ່ວໂມງ</span>
              </div>

              <button
                @click="submitBooking"
                type="button"
                class="btn btn-primary btn-lg w-100 py-3 fw-bold shadow-sm" 
                :disabled="submitting || isFormInvalid"
              >
                <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                <i class="bi bi-send-fill me-2"></i> ສົ່ງຄຳຂໍຈອງ
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getAvailableCars, createBookingEvent } from "../api/axios";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import Swal from "sweetalert2";

const router = useRouter();
const currentCompany = ref("ບສກ. ທາຍໂຊລູຊັ່ນສ໌ ລໍຈິສຕິກສ໌");
const submitting = ref(false);
const startInput = ref(null);
const stopInput = ref(null);
let startPicker = null;
let stopPicker = null;

const availableVehicles = ref([]);
const vehiclesLoading = ref(false);
const vehiclesError = ref("");
const selectedVehicleId = ref(null);

const selectedVehicle = computed(() =>
  availableVehicles.value.find((vehicle) => vehicle.id === selectedVehicleId.value)
);

const formatToDateTimeLocal = (dateInput) => {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
};

// ເວລາປັດຈຸບັນ ຕັດວິນາທີອອກ (ກັນ defaultDate ຕໍ່າກວ່າ minDate ແລ້ວຖືກ flatpickr ຖິ້ມ)
const getNowToMinute = () => {
  const d = new Date();
  d.setSeconds(0, 0);
  return d;
};

const form = ref({
  booking_id: null,
  start: formatToDateTimeLocal(new Date()),
  stop: formatToDateTimeLocal(new Date(Date.now() + 2 * 60 * 60 * 1000)),
  description: "",
  note: "",
  number_of_participant: null,
  tel: "",
  keep_driver: false,
});

const durationTime = computed(() => {
  if (!form.value.start || !form.value.stop) return 0;
  const startObj = new Date(form.value.start);
  const stopObj = new Date(form.value.stop);
  const differenceInMs = stopObj - startObj;

  return differenceInMs > 0
    ? parseFloat((differenceInMs / (1000 * 60 * 60)).toFixed(1))
    : 0;
});

const loadAvailableVehicles = async () => {
  vehiclesLoading.value = true;
  vehiclesError.value = "";
  try {
    const result = await getAvailableCars();
    if (!result?.status || !Array.isArray(result.data)) {
      throw new Error(result?.message || "Unable to load vehicles");
    }
    availableVehicles.value = result.data;
    if (!availableVehicles.value.some((vehicle) => vehicle.id === selectedVehicleId.value)) {
      selectedVehicleId.value = null;
      form.value.booking_id = null;
    }
  } catch (error) {
    console.error("Failed to load available vehicles:", error);
    vehiclesError.value = "ບໍ່ສາມາດໂຫຼດລາຍການລົດໄດ້";
  } finally {
    vehiclesLoading.value = false;
  }
};

const selectVehicle = (vehicle) => {
  if (selectedVehicleId.value === vehicle.id) {
    // Click the same car again to cancel selection
    selectedVehicleId.value = null;
    form.value.booking_id = null;
  } else {
    // Select a car
    selectedVehicleId.value = vehicle.id;
    form.value.booking_id = vehicle.id;
  }
};

const goBack = () => {
  router.push({ name: "Dashboard" });
};

const warn = (title, icon = "warning") =>
  Swal.fire({
    icon,
    title,
    showConfirmButton: false,
    timer: 3000,
  });

const isFormInvalid = computed(() => {
  return (
    !form.value.description?.trim() ||
    !form.value.start ||
    !form.value.stop ||
    !form.value.number_of_participant ||
    Number(form.value.number_of_participant) < 1 ||
    !form.value.tel?.trim() || form.value.tel.replace(/\D/g, "").length < 8 ||
    new Date(form.value.stop) <= new Date(form.value.start)
  );
});

const submitBooking = async () => {
  // Read the actual selected date/time values
  if (startPicker) form.value.start = startPicker.input.value;
  if (stopPicker) form.value.stop = stopPicker.input.value;

  // Validate required fields
  const missingFields = [];

  if (form.value.description?.trim() == "") {
    missingFields.push("ຈຸດປະສົງການເດີນທາງ");
  }

  if (!form.value.start) missingFields.push("ວັນທີ່ເລີ່ມ");
  if (!form.value.stop) missingFields.push("ວັນທີ່ສິ້ນສຸດ");

  if (
    !form.value.number_of_participant ||
    Number(form.value.number_of_participant) < 1
  ) {
    missingFields.push("ຈຳນວນຜູ້ເຂົ້າຮ່ວມ");
  }
  if (!form.value.tel?.trim()) {
    missingFields.push("ເບີໂທລະສັບ");
  }

  // IMPORTANT: A vehicle must be selected
  // if (
  //   selectedVehicleId.value === null ||
  //   selectedVehicleId.value === undefined ||
  //   selectedVehicleId.value === ""
  // ) {
  //   missingFields.push("ລົດທີ່ຕ້ອງການຈອງ");
  // }

  // if (missingFields.length > 0) {
  //   await Swal.fire({
  //     icon: "warning",
  //     title: "ກະລຸນາກວດສອບຂໍ້ມູນ",
  //     text: "ຂໍ້ມູນທີ່ຂາດ: " + missingFields.join(", "),
  //     confirmButtonText: "ຕົກລົງ",
  //   });
  //   return;
  // }

  const startDate = new Date(form.value.start);
  const stopDate = new Date(form.value.stop);

  if (
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(stopDate.getTime())
  ) {
    await warn("ຮູບແບບວັນທີ່ບໍ່ຖືກຕ້ອງ");
    return;
  }

  if (startDate < getNowToMinute()) {
    await warn("ວັນເວລາເລີ່ມຕົ້ນຕ້ອງບໍ່ຍ້ອນຫຼັງ");
    return;
  }

  if (stopDate <= startDate) {
    await warn("ວັນເວລາສິ້ນສຸດຕ້ອງຫຼາຍກວ່າວັນເວລາເລີ່ມຕົ້ນ");
    return;
  }

  if (submitting.value) return;

  submitting.value = true;

  try {
    const vehicleId = Number(selectedVehicleId.value);

    // if (!Number.isInteger(vehicleId) || vehicleId <= 0) {
    //   throw new Error("Invalid vehicle ID: " + selectedVehicleId.value);
    // }

    const payload = {
      booking_id: vehicleId,
      start: form.value.start.replace("T", " ") + ":00",
      stop: form.value.stop.replace("T", " ") + ":00",
      description: form.value.description.trim(),
      // confirmed_state: "waiting_for_approval",
      number_of_participant: Number(form.value.number_of_participant),
      tel: form.value.tel.trim(),
      duration_time: durationTime.value,
      keep_driver: Boolean(form.value.keep_driver),
      note: form.value.note || "",
    }; 
    const response = await createBookingEvent(payload); 
    const result = response?.data ?? response;  
    if (
      result?.status === false ||
      result?.success === false ||
      result?.error
    ) {
      throw new Error(
        result.message ||
        result.error_description ||
        (typeof result.error === "string" ? result.error : "") ||
        "Odoo rejected the booking request"
      );
    }

    await Swal.fire({
      icon: "success",
      title: "ສົ່ງຄຳຂໍຈອງລົດສຳເລັດແລ້ວ",
      confirmButtonText: "ຕົກລົງ",
      timer: 2500,
      timerProgressBar: true,
    });

    goBack();
  } catch (err) { 
    const errorMessage =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      "Unknown error";

    await Swal.fire({
      icon: "error",
      title: "ບໍ່ສາມາດສົ່ງຄຳຂໍຈອງລົດໄດ້",
      text: String(errorMessage),
      confirmButtonText: "ປິດ",
    });
  } finally {
    submitting.value = false;
  }
};



onMounted(() => {
  currentCompany.value =
    localStorage.getItem("company_name") ||
    "ບສກ. ທາຍໂຊລູຊັ່ນສ໌ ລໍຈິສຕິກສ໌";

  loadAvailableVehicles();

  const getCurrentMinute = () => {
    const now = new Date();
    now.setSeconds(0, 0);
    return now;
  };

  const getNextMinute = () => {
    const now = new Date();
    now.setSeconds(0, 0);
    now.setMinutes(now.getMinutes() + 1);
    return now;
  };

  const getTimeString = (date) =>
    `${String(date.getHours()).padStart(2, "0")}:${String(
      date.getMinutes()
    ).padStart(2, "0")}`;

  const baseOptions = {
    enableTime: true,
    time_24hr: true,
    dateFormat: "Y-m-d\\TH:i",
    altInput: true,
    altFormat: "d/m/Y H:i",
    minuteIncrement: 1,
    allowInput: false,
  // Important: use Flatpickr on mobile instead of native picker
  disableMobile: true,
  };

  // START DATE/TIME
  startPicker = flatpickr(startInput.value, {
    ...baseOptions,
    defaultDate: getNextMinute(),
    minDate: getCurrentMinute(),
    minTime: getTimeString(getNextMinute()),

    onReady(_, __, picker) {
      updateStartLimits(picker);
    },

    onOpen(_, __, picker) {
      updateStartLimits(picker);
    },

    onChange(selectedDates, dateStr) {
      form.value.start = dateStr;

      if (!selectedDates.length || !stopPicker) return;

      const start = selectedDates[0];
      const minEnd = new Date(start.getTime() + 60 * 1000);
      const now = getNextMinute();

      stopPicker.set("minDate", minEnd > now ? minEnd : now);

      const currentStop = stopPicker.selectedDates[0];

      if (!currentStop || currentStop < minEnd || currentStop < now) {
        stopPicker.setDate(
          new Date(start.getTime() + 2 * 60 * 60 * 1000),
          true
        );
      }

      updateStopLimits();
    },
  });

  function updateStartLimits(picker) {
    const now = getNextMinute();
    const selected = picker.selectedDates[0];

    picker.set("minDate", getCurrentMinute());

    if (
      selected &&
      selected.toDateString() === now.toDateString()
    ) {
      picker.set("minTime", getTimeString(now));
    } else {
      picker.set("minTime", "00:00");
    }
  }

  // END DATE/TIME
  stopPicker = flatpickr(stopInput.value, {
    ...baseOptions,
    defaultDate: new Date(Date.now() + 2 * 60 * 60 * 1000),
    minDate: getNextMinute(),

    onReady(_, __, picker) {
      updateStopLimits();
    },

    onOpen() {
      updateStopLimits();
    },

    onChange(_, dateStr) {
      form.value.stop = dateStr;
    },
  });

  function updateStopLimits() {
    if (!stopPicker) return;

    const now = getNextMinute();
    const start = startPicker?.selectedDates[0];

    const minEnd = start
      ? new Date(Math.max(start.getTime() + 60 * 1000, now.getTime()))
      : now;

    stopPicker.set("minDate", minEnd);

    const selected = stopPicker.selectedDates[0];

    if (
      selected &&
      selected.toDateString() === minEnd.toDateString()
    ) {
      stopPicker.set("minTime", getTimeString(minEnd));
    } else {
      stopPicker.set("minTime", "00:00");
    }
  }

  updateStopLimits();
});


onBeforeUnmount(() => {
  if (startPicker) startPicker.destroy();
  if (stopPicker) stopPicker.destroy();
});
</script>

<style scoped>
.transition-all {
  transition: all 0.2s ease-in-out;
}

.custom-input {
  font-weight: 400 !important;
  color: #333333 !important;
  border-color: #adb5bd !important;
  border-width: 1.5px !important;
}

.custom-input:focus {
  border-color: #86b7fe !important;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.15) !important;
}

.custom-input::placeholder {
  color: #adb5bd !important;
  opacity: 1 !important;
}

:deep(.form-control.input) {
  font-weight: 400 !important;
  color: #333333 !important;
  border-color: #adb5bd !important;
  border-width: 1.5px !important;
}

:deep(.form-control.input::placeholder) {
  color: #adb5bd !important;
}

:deep(.form-control.input:focus) {
  border-color: #86b7fe !important;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.15) !important;
}
</style>