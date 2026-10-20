<!-- src/views/HistoryDraftView.vue -->
<template>
  <div class="container-fluid min-vh-100 bg-light py-4">
    <!-- Header Summary Block -->
    <div class="row justify-content-center mb-4">
      <div class="col-xl-10 col-12 d-flex justify-content-between align-items-center">
        <div>
          <h4 class="fw-bold mb-1 text-dark">ຈັດລົດໃຫ້ຜູ້ໃຊ້</h4>
          <p class="text-muted small mb-0">ລາຍການຈັດລົດທັງໝົດຂອງທ່ານ {{ historyEvents.length }}</p>
        </div>
         <button @click="router.push('/app/dashboard')" class="btn btn-sm btn-outline-primary rounded-pill px-3">
          <i class="bi bi-house-door me-1"></i> ໜ້າຫຼັກ
        </button>
      </div>
    </div>

    <div class="row justify-content-center">
      <div class="col-xl-10 col-12">
        
        <!-- Loading UI State Indicator -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="text-muted mt-2">ກຳລັງໂຫລດລາຍການຈັດລົດ...</p>
        </div>

        <!-- Empty Framework Layout Alternative Banner -->
        <div v-else-if="historyEvents.length === 0" class="alert alert-info text-center py-4 rounded-3">
          <i class="bi bi-calendar-x fs-1 d-block mb-2 text-muted"></i>
          ບໍ່ມີລາຍການຈັດລົດໃນລະບົບ
        </div>

        <!-- Render List Cards Structure Group -->
        <div v-else class="row g-3">
          <div v-for="item in historyEvents" :key="item.id" class="col-12">
            <!-- ປ່ຽນມากົດທີ່ Card ໂດຍກົງ ແລະ ຕື່ມ cursor-pointer -->
            <div 
              @click="goToDetail(item.id)" 
              class="card border-0 shadow-sm p-3 bg-white rounded-3 hover-shadow transition-all cursor-pointer"
            >
              <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                
                <!-- Left Hand Details Column -->
                <div class="d-flex align-items-start gap-3">
                  <div class="bg-light p-3 rounded-3 text-primary d-none d-sm-block"> 
                    <i class="bi bi-clock-history fs-3"></i>
                  </div>
                  <div>
                    <div class="d-flex align-items-center gap-2 mb-1 flex-wrap">
                      <h6 class="fw-bold mb-0 text-dark">{{ item.booking_name || 'ບໍ່ມີຂໍ້ມູນລົດ' }}</h6> 
                      <span :class="statusBadgeClass(item.confirmed_state)" class="badge py-1 px-2 rounded-1 small">
                        {{ getStateLabel(item.confirmed_state) }}
                      </span> 
                    </div>
                    <p class="text-dark small fw-medium mb-2">{{ item.description || 'ບໍ່ມີຈຸດປະສົງການເດີນທາງ' }}</p>
                    
                    <!-- Timespan Data Block -->
                    <div class="d-flex align-items-center gap-3 text-muted text-xxs flex-wrap">
                      <span><i class="bi bi-calendar-event me-1"></i> <strong>ເລີ່ມ:</strong> {{ formatDateTime(item.start) }}</span>
                      <span><i class="bi bi-calendar-check me-1"></i> <strong>ສິ້ນສຸດ:</strong> {{ formatDateTime(item.stop) }}</span>
                    </div>
                  </div>
                </div>

                <!-- Right Hand Link Action Column Button Layout (ເອົາປຸ່ມເບິ່ງລາຍລະອຽດອອກ ເຫຼືອໄວ້ສະເພາະປຸ່ມສະຖານະອື່ນຖ້າມີ) -->
                <div class="text-end d-flex flex-row flex-md-column justify-content-between align-items-end gap-2 pt-2 pt-md-0 border-top border-md-top-0 border-light" @click.stop>
                  <div class="text-start text-md-end">
                    <span class="text-muted d-block small text-xxs">ຜູ້ຂັບລົດ</span>
                    <span class="fw-semibold text-dark small">{{ item.driver_name || 'ຂັບເອງ / ຍັງບໍ່ມອບໝາຍ' }}</span>
                  </div>
                  <div class="d-flex gap-2">
                    <button
                      v-if="item.confirmed_state === 'draft'"
                      @click.stop="handleWaitingBooking(item.id)"
                      class="btn btn-warning btn-sm px-3 rounded-2 fw-semibold text-dark"
                    >
                      ລໍຖ້າອະນຸມັດ
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getNotiDraft } from '../api/axios';
import { stateTranslations } from '../util/constants';
import { formatDateTime } from '../util/formatdate';

const router = useRouter();
const historyEvents = ref([]);
const loading = ref(true);

const getStateLabel = (state) => {
  return stateTranslations[state] || state;
};

const statusBadgeClass = (state) => {
  switch (state) {
    case 'draft': return 'bg-secondary text-white';
    case 'waiting_for_approval': return 'bg-warning text-dark';
    case 'approved': return 'bg-success text-white';
    case 'not_approved': return 'bg-danger text-white';
    case 'start': return 'bg-primary text-white';
    case 'completed': return 'bg-dark text-white';
    case 'cancel': return 'bg-danger-subtle text-danger border border-danger';
    default: return 'bg-light text-dark border';
  }
};



const fetchHistoryData = async () => {
  loading.value = true;
  try {
    const response = await getNotiDraft();
    if (response && response.status) {
      console.log("Fetched history events:", response.data);
      historyEvents.value = response.data;
    } else {
      historyEvents.value = [];
    }
  } catch (error) {
    console.error("Error fetching event data history stack:", error);
    historyEvents.value = [];
  } finally {
    loading.value = false;
  }
};

const goToDetail = (id) => {
  if (!id) return;
  // Option 1: Direct navigation to the matching named detailed preview panel
  router.push({ name: 'BookingDetail', params: { id: id } });
};
 

onMounted(() => {
  fetchHistoryData();
});
</script>

<style scoped>
.text-xxs {
  font-size: 0.8rem;
}
.transition-all {
  transition: all 0.25s ease;
}
.hover-shadow:hover {
  transform: translateY(-2px);
  box-shadow: 0 .5rem 1rem rgba(0,0,0,.08)!important;
}
@media (min-width: 768px) {
  .border-md-top-0 {
    border-top: 0 !important;
  }
}
.cursor-pointer {
  cursor: pointer;
}
.hover-shadow:hover {
  box-shadow: 0 .5rem 1rem rgba(0,0,0,.15) !important;
  transition: all 0.2s ease-in-out;
}
</style>
