<!-- src/views/Incidents.vue -->
<template>
  <div class="container-fluid min-vh-100 bg-light py-4">

    <!-- Header -->

    <div class="row justify-content-center mb-4">
      <div class="col-xl-10 col-12 d-flex justify-content-between align-items-start align-items-md-center gap-2">
        <div>
          <h4 class="fw-bold mb-1 text-dark">
            ປະຫວັດບັນຫາລົດ
          </h4>
          <p class="text-muted small mb-0">
            ລາຍການບັນຫາລົດທີ່ເກີດຂຶ້ນໃນລະຫວ່າງການເດີນທາງ
          </p>
        </div>

          <button @click="router.push('/app/dashboard')" class="btn btn-sm btn-outline-primary rounded-pill px-3">
          <i class="bi bi-house-door me-1"></i> ໜ້າຫຼັກ
        </button>
      </div>
    </div>

    <div class="row justify-content-center">
      <div class="col-xl-10 col-12">

        <!-- Loading -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="text-muted mt-2">
            ກຳລັງໂຫລດລາຍການບັນຫາລົດ...
          </p>
        </div>

        <!-- Error -->
        <div
          v-else-if="errorMessage"
          class="alert alert-danger rounded-3 text-center"
        >
          <i class="bi bi-exclamation-triangle me-2"></i>
          {{ errorMessage }}

          <div class="mt-3">
            <button
              @click="fetchIncidents"
              class="btn btn-sm btn-outline-danger"
            >
              <i class="bi bi-arrow-clockwise me-1"></i>
              ລອງໃໝ່
            </button>
          </div>
        </div>

        <!-- Empty -->
        <div
          v-else-if="incidents.length === 0"
          class="alert alert-info text-center py-5 rounded-3"
        >
          <i class="bi bi-check-circle fs-1 d-block mb-2 text-success"></i>

          <div class="fw-semibold">
            ບໍ່ພົບບັນຫາລົດ
          </div>

          <div class="small text-muted mt-1">
            ບໍ່ມີລາຍການບັນຫາລົດໃນລະບົບ
          </div>
        </div>

        <!-- Incident List -->
        <div v-else class="row g-3">

          <div
            v-for="item in incidents"
            :key="item.booking_id"
            class="col-12"
          >
            <div class="card border-0 shadow-sm rounded-3 overflow-hidden">

              <!-- Card Header -->
              <div class="card-body p-3">

                <div
                  class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3"
                >

                  <!-- Vehicle information -->
                  <div class="d-flex align-items-start gap-3">

                    <div
                      class="bg-danger-subtle text-danger p-3 rounded-3 flex-shrink-0"
                    >
                      <i class="bi bi-car-front-fill fs-3"></i>
                    </div>

                    <div>

                      <!-- Booking number -->
                      <div
                        class="d-flex align-items-center gap-2 flex-wrap mb-1"
                      >
                        <h6 class="fw-bold mb-0 text-dark">
                          {{ item.vehicle_id || 'ບໍ່ມີຂໍ້ມູນລົດ' }}
                        </h6>

                        <span class="badge bg-danger">
                          {{ item.problems?.length || 0 }}
                          ບັນຫາ
                        </span>
                      </div>

                      <!-- Booking -->
                      <div class="small text-muted mb-1">
                        <i class="bi bi-file-text me-1"></i>
                        ເລກທີການຈອງ:
                        <strong class="text-dark">
                          {{ item.booking_number || '-' }}
                        </strong>
                      </div>
                      <div class="small text-muted mb-1">
                        <i class="bi bi-file-text me-1"></i>
                        ລົດທີ່ມີປັນຫາ:
                        <strong class="text-dark">
                          {{ item.vehicle_display || '-' }}
                        </strong>
                      </div>

                      <!-- Driver -->
                      <div class="small text-muted">
                        <i class="bi bi-person-fill me-1"></i>
                        ຜູ້ຂັບລົດ:
                        <strong class="text-dark">
                          {{ item.driver || 'ຂັບເອງ / ບໍ່ມີຂໍ້ມູນ' }}
                        </strong>
                      </div>

                    </div>
                  </div>

                </div>

                <!-- Problems -->
                <div
                  v-if="item.problems && item.problems.length"
                  class="mt-4"
                >

                  <div class="border-top pt-3">

                    <div class="fw-semibold text-dark mb-3">
                      <i class="bi bi-exclamation-triangle-fill text-danger me-2"></i>
                      ລາຍການບັນຫາ
                    </div>

                    <div class="row g-3">

                      <div
                        v-for="problem in item.problems"
                        :key="problem.problem_id"
                        class="col-12 col-md-6 col-lg-4"
                      >

                        <div class="card h-100 border bg-light rounded-3">

                          <!-- Problem image -->
                          <div
                            v-if="problem.image"
                            class="problem-image-wrapper"
                          >
                            <img
                              :src="problem.image"
                              :alt="problem.name"
                              class="problem-image"
                              @error="handleImageError"
                            />
                          </div>

                          <!-- No image -->
                          <div
                            v-else
                            class="problem-image-placeholder"
                          >
                            <i class="bi bi-image text-muted fs-1"></i>
                          </div>

                          <!-- Problem info -->
                          <div class="card-body p-3">
 

                            <div class="fw-semibold text-dark">
                              {{ problem.name || 'ບໍ່ມີຊື່ບັນຫາ' }}
                            </div>
                            <div class="fw-semibold text-dark">
                              {{ problem.create_date }}
                            </div> 

                          </div>
                        </div>

                      </div>

                    </div>

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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getBookingIncidents } from '../api/axios'

const router = useRouter()

const incidents = ref([])
const loading = ref(true)
const errorMessage = ref('')


const fetchIncidents = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await getBookingIncidents()

    console.log('Booking incidents response:', response)

    if (response && response.status) {
      incidents.value = Array.isArray(response.data)
        ? response.data
        : []
    } else {
      incidents.value = []

      errorMessage.value =
        response?.message || 'ບໍ່ສາມາດໂຫລດຂໍ້ມູນບັນຫາລົດໄດ້'
    }

  } catch (error) {
    console.error('Error fetching booking incidents:', error)

    incidents.value = []

    errorMessage.value =
      error?.response?.data?.message ||
      error?.message ||
      'ມີຂໍ້ຜິດພາດໃນການໂຫລດຂໍ້ມູນ'
  } finally {
    loading.value = false
  }
}


const handleImageError = (event) => {
  event.target.style.display = 'none'
}


onMounted(() => {
  fetchIncidents()
})
</script>


<style scoped>

.problem-image-wrapper {
  width: 100%;
  height: 180px;
  overflow: hidden;
  background: #f8f9fa;
}

.problem-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.problem-image-placeholder {
  width: 100%;
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
}

.card {
  transition: all 0.25s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 .5rem 1rem rgba(0, 0, 0, .08) !important;
}

</style>