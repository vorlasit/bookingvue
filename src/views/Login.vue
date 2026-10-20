<script setup>
import { reactive, ref,onMounted } from 'vue'
import { useRouter } from 'vue-router' 
import { loginUser,getCompanyLogo } from '../api/axios'
import Swal from 'sweetalert2'

const router = useRouter()
const loading = ref(false)
const username = ref('')
const password = ref('')
const showPassword = ref(false)
const errorMessage = ref('')
const logo = ref('')
const form = reactive({
    username: '',
    password: '',
    remember: false,
}) 
const login = async () => {
    errorMessage.value = ''

    if (!username.value || !password.value) {
        errorMessage.value = 'Please enter username and password.'
        return
    }

    loading.value = true

    try {
       const result = await loginUser(
            username.value,
            password.value
        )
        if (result && result.status === true) {
      // Save login information 
    console.log('image',result.image)
    localStorage.setItem('user-token', result.access_token)
    localStorage.setItem(
    "login-date",
    new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Vientiane",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date())
    );
    localStorage.setItem('username', result.name) 
    localStorage.setItem('image', result.image) 
    localStorage.setItem('company_name', result.company_name || '')
    localStorage.setItem('groups_id', JSON.stringify(result.groups_id ?? []))
    localStorage.setItem('odoo_uid', result.uid) // Success message 
      await Swal.fire({
        icon: 'success',
        title: 'Login Successful!',
        text: 'ຍີນດີຕ້ອນຮັບ ທ່ານເຂົ້າໃຊ້ລະບົບ',
        confirmButtonColor: '#0d6efd',
        timer: 1500,
        timerProgressBar: true,
      }) // Go to dashboard 
      router.push('/choose-booking')
    //   router.push('/app/dashboard')

    }
    else {
      errorMessage.value = result?.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: errorMessage.value,
        confirmButtonColor: '#dc3545',
      })
    }

    } catch (error) {
        console.error('Login error:', error)

        if (error.response) {

            errorMessage.value =
                error.response.data?.message ||
                'Login failed.'

        } else {

            errorMessage.value =
                'Cannot connect to server.'

        }

    } finally {

        loading.value = false

    }
}

const loadCompanyLogo = async () => {
    try {
    const blob = await getCompanyLogo()
    logo.value = URL.createObjectURL(blob)
  }
  catch (error) {
    console.error('Error loading company logo:', error)
    logo.value = false
  }
}

onMounted(() => {
    loadCompanyLogo()
})
</script>

<template>
    <div class="login-page">
        <div class="login-card shadow-lg">
            
            <!-- Company Banner Header (ໂລໂກ້ ແລະ ຊື່ບໍລິສັດຢູ່ເທິງແຖບສີຟ້າທັງໝົດ) -->
            <div class="company-banner">
                <div v-if="logo" class="logo-wrapper shadow">
                    <img :src="logo" alt="Company Logo" class="company-logo" />
                </div>
                <div v-else class="logo-placeholder shadow">
                    <i class="bi bi-building-fill"></i>
                </div>
                <h3 class="company-title">
                    ບໍລິສັດ ຂວັນໃຈການຄ້າ ຂາອອກ - ຂາເຂົ້າ ຈຳກັດ
                </h3>
                <p class="company-subtitle">ຍິນດີຕ້ອນຮັບກັບເຂົ້າສູ່ລະບົບຈັດການ</p>
            </div>

            <!-- Card Body Content (ຟອມເຂົ້າສູ່ລະບົບ) -->
            <div class="card-body-content">
                <!-- Heading -->
                <div class="text-center mb-4">
                    <h4 class="fw-bold text-dark mb-1">ເຂົ້າສູ່ລະບົບ</h4>
                   <p class="login-subtitle">ກະລຸນາປ້ອນຂໍ້ມູນບັນຊີຂອງທ່ານເພື່ອເຂົ້າສູ່ລະບົບ</p>
                </div>

                <!-- Error Message -->
                <div
                    v-if="errorMessage"
                    class="alert alert-danger d-flex align-items-center"
                    role="alert"
                >
                    <i class="bi bi-exclamation-circle me-2"></i>
                    {{ errorMessage }}
                </div>

                <!-- Form -->
                <form @submit.prevent="login">

                    <!-- Username -->
                    <div class="mb-3">
                        <label
                            for="username"
                            class="form-label text-uppercase fw-bold"
                        >
                            ຊື່ຜູ້ໃຊ້ ຫຼື ອີເມວ (USERNAME / EMAIL)
                        </label>
                        <div class="input-group">
                            <span class="input-group-text">
                                <i class="bi bi-person"></i>
                            </span>
                            <input
                                id="username"
                                v-model="username"
                                type="text"
                                class="form-control"
                                placeholder="name@company.com"
                                autocomplete="username"
                            />
                        </div>
                    </div>

                    <!-- Password -->
                    <div class="mb-3">
                        <label
                            for="password"
                            class="form-label text-uppercase fw-bold"
                        >
                            ລະຫັດຜ່ານ (PASSWORD)
                        </label>
                        <div class="input-group">
                            <span class="input-group-text">
                                <i class="bi bi-lock"></i>
                            </span>
                            <input
                                id="password"
                                v-model="password"
                                :type="showPassword ? 'text' : 'password'"
                                class="form-control"
                                placeholder="••••••••"
                                autocomplete="current-password"
                            />
                            <button
                                type="button"
                                class="btn btn-outline-secondary toggle-pass-btn"
                                @click="showPassword = !showPassword"
                            >
                                <i
                                    :class="
                                        showPassword
                                            ? 'bi bi-eye-slash'
                                            : 'bi bi-eye'
                                    "
                                ></i>
                            </button>
                        </div>
                    </div>

                    <!-- Remember & Forgot Password -->
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <!-- <div class="form-check">
                            <input
                                id="remember"
                                v-model="form.remember"
                                class="form-check-input"
                                type="checkbox"
                            />
                            <label
                                for="remember"
                                class="form-check-label text-secondary small"
                            >
                                ຈື່ຂ້ອຍໄວ້ໃນລະບົບ
                            </label>
                        </div> -->
                        <a
                            href="#"
                            class="small text-decoration-none fw-semibold text-primary"
                        >
                            ລືມລະຫັດຜ່ານ?
                        </a>
                    </div>

                    <!-- Login button (ສີເຫຼືອງສົດໃສ) -->
                    <button
                        type="submit"
                        class="btn btn-warning w-100 py-2 fw-bold text-dark shadow-sm"
                        :disabled="loading"
                    >
                        <span
                            v-if="loading"
                            class="spinner-border spinner-border-sm me-2"
                        ></span>
                        <span v-else>
                            ເຂົ້າສູ່ລະບົບ <i class="bi bi-arrow-right ms-1"></i>
                        </span>
                    </button>

                </form>

                <!-- Footer Support Link -->
                <div class="text-center mt-4 pt-3 border-top">
                    <small class="text-muted">
                       Booking Enterprise<a href="#" class="text-decoration-none fw-semibold text-primary"></a>
                    </small>
                </div>
            </div>

        </div>
    </div>
</template>

<style scoped>

@font-face {
  font-family: "Noto Sans Lao";
  src: url("./font/NotoSansLao-VariableFont_wdth,wght.ttf") format("truetype");
  font-weight: 700;
}
* {
    font-family: "Noto Sans Lao", "Noto Sans", sans-serif;
}

.login-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #fef9c3 0%, #e0f2fe 100%);
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    padding: 20px;
}

.login-card {
    position: relative;
    width: 100%;
    max-width: 480px;
    background: #ffffff;
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 20px 40px rgba(37, 99, 235, 0.12);
}

/* ສ່ວນຫົວ Banner ສີຟ້າເຕັມດ້ານເທິງ (ຮວມໂລໂກ້ ແລະ ຊື່ບໍລິສັດ) */
.company-banner {
    background: linear-gradient(135deg, #072593 );
    text-align: center;
    padding: 40px 20px 50px 20px;
    color: white;
}

.logo-wrapper {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: white;
    padding: 12px;
    border-radius: 16px;
    width: 75px;
    height: 75px;
    margin: 0 auto 15px auto;
}

.company-logo {
    max-height: 60px;
    max-width: 60px;
    object-fit: contain;
}

.logo-placeholder {
    width: 75px;
    height: 75px;
    margin: 0 auto 15px auto;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 16px;
    background: #fbbf24;
    color: #072593 ;
    font-size: 34px;
}

.login-subtitle {
    font-family: "Noto Sans Lao", "Phetsarath OT", "Lao Sans Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
    font-size: 13.5px !important;
    color: #64748b !important; /* ເປັນສີເທວານຄ້າຍຄື text-muted ແຕ່ຊັດເຈນກວ່າ */
    margin-bottom: 0;
}
.company-title {
    
    font-size: 19px;
    font-weight: 700;
    margin-bottom: 6px;
    color: #ffffff;
}

.company-subtitle {
    font-family: "Noto Sans Lao", "Phetsarath OT", "Lao Sans Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
    font-size: 13.5px;
    color: #E8C106;
    margin-bottom: 0;
    font-weight: 500; 
}

/* ສ່ວນເນື້ອຫາຟອມດ້ານລຸ່ມ (ຕິດຂອບໂຄ້ງມົນເຂົ້າກັບແຖບສີຟ້າ) */
.card-body-content {
    padding: 30px 35px 35px 35px;
    background: #ffffff;
    margin-top: -25px;
    border-top-left-radius: 28px;
    border-top-right-radius: 28px;
}

.form-label {
    font-size: 11px;
    color: #64748b;
    letter-spacing: 0.5px;
    margin-bottom: 6px;
}

.input-group-text {
    background: #f8fafc;
    border-color: #e2e8f0;
    color: #64748b;
    border-top-left-radius: 10px;
    border-bottom-left-radius: 10px;
}

.form-control {
    background: #f8fafc;
    border-color: #e2e8f0;
    padding: 10px 14px;
    font-size: 14px;
    border-top-right-radius: 10px;
    border-bottom-right-radius: 10px;
}

.form-control:focus {
    background: #ffffff;
    box-shadow: none;
    border-color: #2563eb;
}

.toggle-pass-btn {
    border-color: #e2e8f0;
    color: #64748b;
    background: #f8fafc;
    border-top-right-radius: 10px;
    border-bottom-right-radius: 10px;
}

.toggle-pass-btn:hover {
    background: #e2e8f0;
    color: #1e293b;
}

.form-check-input:checked {
    background-color: #2563eb;
    border-color: #2563eb;
}

/* ປຸ່ມເຂົ້າສູ່ລະບົບສີເຫຼືອງ */
.btn-warning {
    background-color: #E8C106;
    border-color: #E8C106;
    border-radius: 12px;
    font-size: 15px;
    transition: all 0.3s ease;
}

.btn-warning:hover {
    background-color: #E8C106;
    border-color: #E8C106;
    box-shadow: 0 6px 15px rgba(251, 191, 36, 0.4);
}

@media (max-width: 576px) {
    .card-body-content {
        padding: 20px;
    }
    .login-card {
        border-radius: 16px;
    }
}
</style>