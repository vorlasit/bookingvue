<!-- src/views/HistoryBookingView.vue -->
<template>
  <div class="container-fluid min-vh-100 bg-light py-4">
    <!-- Header Summary Block -->
    <div class="row justify-content-center mb-4">
      <div class="col-xl-10 col-12 d-flex justify-content-between align-items-center">
        <div>
          <h4 class="fw-bold mb-1 text-dark">ທຣິບປັດຈຸບັນ</h4>
          <p class="text-muted small mb-0">ລາຍການທຣິບປັດຈຸບັນຂອງທ່ານ</p>
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
          <p class="text-muted mt-2">ກຳລັງໂຫລດທຣິບປັດຈຸບັນ...</p>
        </div>

        <!-- Empty Framework Layout Alternative Banner -->
        <div v-else-if="historyEvents.length === 0" class="alert alert-info text-center py-4 rounded-3">
          <i class="bi bi-calendar-x fs-1 d-block mb-2 text-muted"></i>
          ບໍ່ມີທຣິບປັດຈຸບັນໃນລະບົບ
        </div>

        <!-- Render List Cards Structure Group -->
        <div v-else class="row g-3">
          <div v-for="item in historyEvents" :key="item.id" class="col-12">
            <!-- ໃສ່ @click ແລະ cursor pointer ທີ່ Card -->
            <div 
              @click="goToDetail(item.id)" 
              class="card border-0 shadow-sm p-3 bg-white rounded-3 hover-shadow transition-all"
              style="cursor: pointer;"
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
                      
                      <!-- ສະຖານະຕົວທີ 1 (ສະແດງຕະຫຼອດ) - ໃຊ້ v-html -->
                      <span :class="statusBadgeClass(item.confirmed_state)" class="badge py-1 px-2 rounded-1 small">
                        <span v-html="getStateLabel(item.confirmed_state)"></span>
                      </span>
                      
                      <!-- ສະຖານະຕົວທີ 2 (ສະແດງສະເພາະເມື່ອສະຖານະຕົວທີ 1 ເປັນ completed ຫຼື returned) - ໃຊ້ v-html -->
                      <span 
                        v-if="['completed', 'returned'].includes(item.confirmed_state)" 
                        :class="statusBadgeClass(item.state)" 
                        class="badge py-1 px-2 rounded-1 small"
                      >
                        <span v-html="getStateLabel(item.state)"></span>
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

                <!-- Right Hand Link Action Column (ສະແດງສະເພາະຊື່ຜູ້ຂັບລົດ) -->
                <div class="text-end d-flex flex-row flex-md-column justify-content-between align-items-end gap-2 pt-2 pt-md-0 border-top border-md-top-0 border-light">
                  <div class="text-start text-md-end">
                    <span class="text-muted d-block small text-xxs">ຜູ້ຂັບລົດ</span>
                    <span class="fw-semibold text-dark small">{{ item.driver_name || 'ຂັບເອງ / ຍັງບໍ່ມອບໝາຍ' }}</span>
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
import { getActiveEvents, updateBookingToWaiting } from '../api/axios';
import { stateTranslations, stateColors } from '../util/constants';
import { formatDateTime } from "../util/formatdate";

const router = useRouter();
const historyEvents = ref([]);
const loading = ref(true);

const getStateLabel = (state) => {
  return stateTranslations[state] || state;
};

const statusBadgeClass = (state) => {
  const color = stateColors[state] || 'light';
  
  // ຈັດການກໍລະນີສີເປັນ Hex code
  if (color.startsWith('#')) {
    return 'badge text-white'; 
  }
  
  // ຈັດການສີ Bootstrap Theme ທົ່ວໄປ
  switch (color) {
    case 'warning': return 'bg-warning text-dark';
    case 'danger': return 'bg-danger text-white';
    case 'success': return 'bg-success text-white';
    case 'primary': return 'bg-primary text-white';
    case 'secondary': return 'bg-secondary text-white';
    default: return 'bg-light text-dark border';
  }
};

const fetchHistoryData = async () => {
  loading.value = true;
  try {
    const response = await getActiveEvents();
    if (response && response.status) {
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
  router.push({ name: 'BookingDetail', params: { id: id } });
};

const handleWaitingBooking = async (bookingId) => {
  if (!bookingId) return;

  try {
    const result = await updateBookingToWaiting(bookingId);
    if (result && result.status) {
      await fetchHistoryData();
      alert(result.message || 'ອັບເດດສະຖານະແລ້ວ');
    } else {
      alert(result?.message || 'ບໍ່ສາມາດອັບເດດສະຖານະໄດ້');
    }
  } catch (error) {
    console.error('Error updating booking to waiting state:', error);
    alert('ມີຂໍ້ຜິດພາດໃນການອັບເດດສະຖານະ');
  }
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
</style>