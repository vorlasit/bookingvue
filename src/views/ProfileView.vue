<script setup>
import { ref, onMounted } from 'vue'
import { getUserProfile } from '../api/axios'

const loading = ref(true)
const profile = ref(null)
const errorMessage = ref('')

const fetchProfile = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await getUserProfile()

    console.log('Profile:', response)

    if (response && response.status) {
      profile.value = response.data
    } else {
      errorMessage.value =
        response?.message || 'ບໍ່ສາມາດໂຫລດຂໍ້ມູນໂປຣໄຟລ໌ໄດ້'
    }
  } catch (error) {
    console.error('Profile error:', error)

    errorMessage.value =
      error?.response?.data?.message ||
      'ມີຂໍ້ຜິດພາດ'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchProfile()
})
</script>
<template>
  <div class="container py-4">

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border"></div>
      <div class="text-muted mt-2">
        ກຳລັງໂຫລດຂໍ້ມູນ...
      </div>
    </div>

    <div v-else-if="errorMessage" class="alert alert-danger">
      {{ errorMessage }}
    </div>

    <div v-else-if="profile" class="card border-0 shadow-sm">

      <div class="card-body">

        <div class="text-center mb-4">
 
          <img
            v-if="profile.image"
            :src="profile.image"
            class="rounded-circle profile-image"
            alt="Profile"
          />

          <div
            v-else
              class="rounded-circle bg-secondary text-white profile-placeholder mx-auto"
                      >
              {{ profile.name ? profile.name.charAt(0).toUpperCase() : '' }}
          </div>

          <h4 class="fw-bold mt-3 mb-1">
            {{ profile.name }}
          </h4>

          <div class="text-muted">
            {{ profile.job_position_name || profile.job_title || '-' }}
          </div>

        </div>

        <div class="row g-3">

          <div class="col-md-6">
            <label class="text-muted small">
              Username
            </label>
            <div class="fw-semibold">
              {{ profile.login || '-' }}
            </div>
          </div>

          <div class="col-md-6">
            <label class="text-muted small">
              Email
            </label>
            <div class="fw-semibold">
              {{ profile.email || '-' }}
            </div>
          </div>

          <div class="col-md-6">
            <label class="text-muted small">
              Phone
            </label>
            <div class="fw-semibold">
              {{ profile.phone || '-' }}
            </div>
          </div>

          <div class="col-md-6">
            <label class="text-muted small">
              Mobile
            </label>
            <div class="fw-semibold">
              {{ profile.mobile || '-' }}
            </div>
          </div>

          <div class="col-md-6">
            <label class="text-muted small">
              Company
            </label>
            <div class="fw-semibold">
              {{ profile.company_name || '-' }}
            </div>
          </div>

          <div class="col-md-6">
            <label class="text-muted small">
              Department
            </label>
            <div class="fw-semibold">
              {{ profile.department_name || '-' }}
            </div>
          </div>

          <div class="col-md-6">
            <label class="text-muted small">
              Position
            </label>
            <div class="fw-semibold">
              {{ profile.job_position_name || profile.job_title || '-' }}
            </div>
          </div>

        </div>

      </div>
    </div>

  </div>
</template>

<style scoped>
.profile-image,
.profile-placeholder {
  width: 120px;
  height: 120px;
}

.profile-image {
  object-fit: cover;
}

.profile-placeholder {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: bold;
}
</style>