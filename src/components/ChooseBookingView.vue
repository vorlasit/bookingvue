<template>
  <div class="choose-page">
    <div class="container py-5">
      <!-- Header Section -->
      <div class="text-center mb-5 animate-fade-in">
        <div
          class="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill mb-3 fw-semibold shadow-sm"
        >
          <i class="bi bi-grid-fill me-1"></i> SmartBooking System
        </div>
        <h1 class="fw-bold display-6 mb-2 text-dark">
          ຍິນດີຕ້ອນຮັບສູ່ລະບົບຈອງ
        </h1>
        <p class="text-muted fs-6">
          ກະລຸນາເລືອກປະເພດການບໍລິການທີ່ທ່ານຕ້ອງການໃຊ້ງານ
        </p>
      </div>

      <!-- Cards Grid -->
      <div class="row justify-content-center g-4">
        <!-- Room Booking -->
        <div class="col-12 col-md-6 col-lg-5">
          <div
            class="service-card room-card h-100 text-center"
            @click="chooseService('room')"
          >
            <div
              class="card-body p-4 p-md-5 d-flex flex-column justify-content-between"
            >
              <div>
                <div class="d-flex justify-content-center mb-4">
                  <div class="service-icon room-icon shadow-sm">
                    <i class="bi bi-building"></i>
                  </div>
                </div>
                <h4 class="fw-bold mb-2 text-dark">ຈອງຫ້ອງປະຊຸມ</h4>
                <p class="text-muted mb-4">
                  ຈອງຫ້ອງປະຊຸມ, ຈັດການຕາຕະລາງ ແລະ ບໍລິຫານການໃຊ້ງານພື້ນທີ່ພາຍໃນ.
                </p>
              </div>

              <button
                type="button"
                class="btn btn-room w-100 py-2 rounded-3 fw-semibold shadow-sm text-white border-0"
              >
                <span>ເຂົ້າສູ່ລະບົບຈອງຫ້ອງ</span>
                <i class="bi bi-arrow-right ms-2"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Car Booking -->
        <div class="col-12 col-md-6 col-lg-5">
          <div 
            class="service-card car-card h-100 text-center" 
            @click="chooseService('car')"
          >
            <div class="card-body p-4 p-md-5 d-flex flex-column justify-content-between">
              <div>
                <div class="d-flex justify-content-center mb-4">
                  <div class="service-icon car-icon shadow-sm">
                    <i class="bi bi-car-front-fill"></i>
                  </div>
                </div>
                <h4 class="fw-bold mb-2 text-dark">ຈອງລົດ</h4>
                <p class="text-muted mb-4">
                  ຈອງລົດ, ຈັດການເສັ້ນທາງເດີນທາງ ແລະ ຕິດຕາມສະຖານະການໃຊ້ງານລົດ.
                </p>
              </div>
              
              <button 
                type="button" 
                class="btn btn-car w-100 py-2 rounded-3 fw-semibold shadow-sm text-dark border-0"
              >
                <span>ເຂົ້າສູ່ລະບົບຈອງລົດ</span>
                <i class="bi bi-arrow-right ms-2"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const chooseService = (type) => {
  localStorage.setItem("booking_type", type);
  if (type === "car") {
    router.push({
      path: "/app/dashboard",
      query: { type },
    });
  } else {
    router.push({
      path: "/app/roomtype",
      query: { type },
    });
  }
};
</script>

<style scoped>
.choose-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%);
  padding: 40px 0;
}

.service-card {
  background: #ffffff;
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 24px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.04), 0 8px 10px -6px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.service-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: transparent;
  transition: background 0.3s ease;
}

.room-card:hover::before {
  background: #26368c;
}

.car-card:hover::before {
  background: #d4a702;
}

.service-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 35px -10px rgba(0, 0, 0, 0.08);
  border-color: transparent;
}

.service-icon {
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  font-size: 32px;
  transition: transform 0.3s ease;
}

.service-card:hover .service-icon {
  transform: scale(1.08);
}

/* Room Icon & Button Theme */
.room-icon {
  color: #26368c;
  background: #eef2ff;
}

.btn-room {
  background-color: #26368c;
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
}

.room-card:hover .btn-room {
  background-color: #1d2a6d;
  box-shadow: 0 4px 12px rgba(38, 54, 140, 0.3) !important;
}

/* Car Icon & Button Theme */
.car-icon {
  color: #b89302;
  background: #fef9c3;
}

.btn-car {
  background-color: #e8c106;
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
}

.car-card:hover .btn-car {
  background-color: #d4a702;
  box-shadow: 0 4px 12px rgba(232, 193, 6, 0.3) !important;
}
</style>