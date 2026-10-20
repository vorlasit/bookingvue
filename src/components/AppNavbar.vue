<template>
  <div class="app-layout">

    <!-- =========================
         DESKTOP SIDEBAR
    ========================== -->
    <aside class="sidebar">

      <div class="sidebar-brand">
        <div class="brand-icon">
          <i :class="bookingType === 'room' ? 'bi bi-building' : 'bi bi-car-front'"></i>
        </div>

        <div>
          <div class="brand-name">{{ bookingType === 'room' ? 'Room Booking' : 'Car Booking' }}</div>
          <small>Powered by KCC</small><br/>
          <small>
            <a href="https://khouanchay.com" target="_self" class="text-decoration-none text-light">
              <i class="bi bi-box-arrow-up-right"></i> KC Consulting
            </a>
          </small>

        </div>
      </div>
      <!-- A single menu container that renders if the user has AT LEAST one valid role -->
      <nav class="sidebar-menu"
        v-if="groups_ids.includes('booking.group_kc_vehicle_manager') || groups_ids.includes('booking.group_kc_book_user')">

        <!-- Public/Common Links for both roles -->
        <router-link to="/choose-booking" class="menu-item">
          <i class="bi bi-grid-3x3-gap-fill"></i>
          <span class="menu-text">
            <span>ເລືອກບໍລິການ</span>
            <span>Change Service</span>
          </span>
        </router-link>
        <router-link :to="{ path: '/app/dashboard', query: { type: bookingType } }" class="menu-item"
          v-if="bookingType === 'car'">
          <i class="bi bi-house-door"></i>
          <span class="menu-text">
            <span>ໜ້າຫຼັກ</span>
            <span>Home</span>
          </span>
        </router-link>
        <router-link v-if="bookingType === 'car'" to="/booking/historys" class="menu-item">
          <i class="bi bi-clock-history"></i>
          <span class="menu-text">
            <span>ປະຫວັດຈອງລົດ</span>
            <span>Booking History</span>
          </span>
        </router-link>
        <router-link v-if="bookingType === 'car'" to="/trip/" class="menu-item">
          <i class="bi bi-car-front"></i>
          <span class="menu-text">
            <span>ທຣິບປັດຈຸບັນ </span>
            <span>Current Trip</span>
          </span>
        </router-link>
        <!-- Management Dropdown -->
        <div class="management-menu"
          v-if="bookingType === 'car' && groups_ids.includes('booking.group_kc_vehicle_manager')">
          <button class="menu-item management-toggle" type="button" @click="showManagement = !showManagement">
            <i class="bi bi-gear-fill"></i>

            <span class="menu-text">
              <span>ຈັດການລະບົບ</span>
              <span>Management</span>
            </span>

            <i class="bi management-arrow" :class="showManagement ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
          </button>

          <div v-if="showManagement" class="management-submenu">

            <router-link to="/app/DashboardAdmin" class="menu-item">
              <i class="bi bi-speedometer2"></i>
              <span class="menu-text">
                <span>ສະແດງຜົນທັງໝົດ </span>
                <span>Operation Dashboard</span>
              </span>
            </router-link>

            <router-link to="/booking/draft" class="menu-item">
              <i class="bi bi-bell"></i>
              <span class="menu-text">
                <span>ຈັດລົດໃຫ້ຜູ້ໃຊ້</span>
                <span>Assign Vehicle</span>
              </span>
              <span v-if="draftCount > 0" class="draft-count-badge">
                {{ draftCount }}
              </span>
            </router-link>

            <router-link to="/booking/requests" class="menu-item">
              <i class="bi bi-clock-history"></i>
              <span class="menu-text">
                <span>ຄຳຮ້ອງຂໍ</span>
                <span>All Booking Queue</span>
              </span>
            </router-link>

            <router-link to="/trip/active" class="menu-item">
              <i class="bi bi-car-front"></i>
              <span class="menu-text">
                <span>ລົດກຳລັງໃຊ້ງານ </span>
                <span>Trip in progress</span>
              </span>
            </router-link>

            <router-link to="/indents/" class="menu-item">
              <i class="bi bi-exclamation-triangle"></i>
              <span class="menu-text">
                <span>ແຈ້ງບັນຫາໃຊ້ລົດ</span>
                <span>Report Issue</span>
              </span>
            </router-link>

            <router-link to="/cars/" class="menu-item">
              <i class="bi bi-car-front-fill"></i>
              <span class="menu-text">
                <span>ລາຍການລົດ</span>
                <span>Cars</span>
              </span>
            </router-link>

          </div>
        </div>

        <router-link v-if="bookingType === 'room'" to="/app/roomtype" class="menu-item">
          <i class="bi bi-door-open-fill"></i>
          <span class="menu-text">
            <span>ຫ້ອງປະຊຸມ</span>
            <span>Meeting </span>
          </span>
        </router-link>
        <router-link v-if="bookingType === 'room' && groups_ids.includes('booking.group_kc_vehicle_manager')" to="/room-booking-management" class="menu-item">
          <i class="bi bi-door-open-fill"></i>
          <span class="menu-text">
            <span>ຈັດການການຈອງຫ້ອງປະຊຸມ</span>
            <span>Meeting </span>
          </span>
        </router-link>
        <!-- <router-link to="/profile" class="menu-item">
          <i class="bi bi-person-circle"></i>
          <span>Profile</span>
        </router-link> -->

      </nav>

      <!-- User -->
      <div class="sidebar-user sticky-bottom">

        <router-link to="/profile" class="menu-item">
          <div class="user-avatar">
            {{ currentUsername ? currentUsername.charAt(0).toUpperCase() : '' }}
          </div>
        </router-link>


        <div class="user-info">
          <strong>{{ currentUsername }}</strong>
          <small class="d-block mt-1">
            <!-- Bootstrap Dropdown Container -->
            <div class="dropup position-relative">
              <button class="btn btn-sm btn-outline-secondary py-0 px-2" type="button" @click="openModal">
                View Roles
              </button>
            </div>

          </small>
        </div>

        <button class="logout-btn" @click="logout" title="Logout">
          <i class="bi bi-box-arrow-right"></i>
        </button>

      </div>

    </aside>

    <!-- =========================
         ROLES MODAL OVERLAY
    ========================== -->
    <div v-if="isModalOpen" class="modal-backdrop-custom" @click="closeModal">
      <div class="modal-dialog-custom shadow" @click.stop>

        <!-- Modal Header -->
        <div class="modal-header-custom">
          <h5 class="modal-title-custom">
            <i class="bi bi-shield-lock-fill me-2 text-primary"></i>Assigned Roles
          </h5>
          <button class="btn-close-custom" @click="closeModal">&times;</button>
        </div>

        <!-- Modal Body -->
        <div class="modal-body-custom">
          <ul v-if="groups_ids.length > 0" class="list-group list-group-flush p-0 m-0">
            <li v-for="group_id in groups_ids" :key="group_id"
              class="list-group-item px-0 py-2 border-bottom d-flex align-items-center gap-2">
              <i class="bi bi-check-circle-fill text-success small"></i>
              <span class="small text-dark font-monospace">{{ formatGroupName(group_id) }}</span>
            </li>
          </ul>

          <!-- Fallback if user has no groups assigned -->
          <div v-else class="text-center text-muted py-3 small italic">
            <i class="bi bi-exclamation-circle d-block mb-1 fs-5"></i>
            No assigned roles found.
          </div>
        </div>

      </div>
    </div>

    <!-- =========================
         MAIN CONTENT
    ========================== -->
    <main class="main-content">

      <!-- Mobile top header -->
      <header class="mobile-header">

        <div class="mobile-brand">
          <i class="bi bi-book-fill"></i>
          <strong>SmartBooking</strong>
        </div>


        <div class="profile-dropdown">

          <button class="mobile-profile" type="button" @click="toggleProfileMenu">
            <img v-if="currentimage" :src="currentimage" class="mobile-profile-image" />

            <i v-else class="bi bi-person-circle"></i>
          </button>

          <div v-if="profileMenuOpen" class="profile-dropdown-menu">
            <button class="profile-dropdown-item" @click="goToProfile">
              <i class="bi bi-person"></i>
              <span>Profile</span>
            </button>

            <div class="profile-dropdown-divider"></div>

            <button class="profile-dropdown-item logout-item" @click="logout">
              <i class="bi bi-box-arrow-right"></i>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>
      <div class="page-content">
        <router-view />
      </div>

    </main>


    <!-- =========================
         MOBILE BOTTOM BAR (3 items including Candybox)
    ========================== -->
    <nav class="mobile-bottom-nav">
      <!-- ເມນູຫຼັກ 1: Home -->
        <router-link to="/choose-booking" class="bottom-item">
          <i class="bi bi-grid-3x3-gap-fill"></i>
          <span class="menu-text">
            <span>ເລືອກບໍລິການ</span> 
             
          </span>
        </router-link>
      <router-link :to="{ path: '/app/dashboard', query: { type: bookingType } }" v-if="bookingType === 'car'" class="bottom-item">
        <i class="bi bi-house-door"></i>
         <span class="menu-text">
            <span>Home</span>
          
        </span>
      
      </router-link>
      
        <router-link v-if="bookingType === 'room'" to="/app/roomtype" class="bottom-item">
          <i class="bi bi-door-open-fill"></i>
           <span class="menu-text">
        <span>ຫ້ອງປະຊຸມ</span> 
      </span>
        </router-link> 
      <!-- ເມນູຫຼັກ 2: Trip -->
      <router-link v-if="bookingType === 'car'" to="/trip/" class="bottom-item">
        <i class="bi bi-car-front"></i>
        <span>Current Trip</span>
      </router-link>



      <!-- ເມນູຫຼັກ 3 (ຫຼື ປຸ່ມ Profile ຕາມຄວາມເໝາະສົມ): Profile -->
      <!-- ປຸ່ມ Candybox (ສຳລັບເປີດເມນູທີ່ເຫຼືອ) -->
      <button type="button" class="bottom-item candybox-btn" @click="toggleCandybox">
        <i class="bi bi-boxes"></i>
        <span>More</span>
      </button>
    </nav>

    <!-- =========================
         CANDYBOX MODAL / OVERLAY
    ========================== -->
    <div v-if="isCandyboxOpen" class="candybox-backdrop " @click="toggleCandybox">
      <div class="candybox-container shadow-lg" @click.stop>
        <div class="candybox-header">
          <h6 class="m-0"><i class="bi bi-boxes me-2 text-primary"></i>Menu</h6>
          <button class="btn-close-custom" @click="toggleCandybox">&times;</button>
        </div>
        <div class="candybox-body mb-5">
          <div class="candybox-grid">

            <!-- Admin -->
            <router-link to="/app/DashboardAdmin" class="candybox-item"
              v-if="bookingType === 'car' && groups_ids.includes('booking.group_kc_vehicle_manager')"
              @click="toggleCandybox">
               <i class="bi bi-speedometer2"></i>
               <span class="menu-text">
                <span>ສະແດງຜົນທັງໝົດ </span>
                <span>Operation Dashboard</span>
              </span>
            </router-link>
            
        <router-link v-if="bookingType === 'room' && groups_ids.includes('booking.group_kc_vehicle_manager')" to="/room-booking-management" class="candybox-item">
          <i class="bi bi-door-open-fill"></i>
          <span class="menu-text">
            <span>ຈັດການການຈອງຫ້ອງປະຊຸມ</span>
            <span>Meeting </span>
          </span>
        </router-link>
        

            <!-- MY HIS -->
            <router-link v-if="bookingType === 'car'" to="/booking/historys" class="candybox-item mb-2"
              @click="toggleCandybox">
              <i class="bi bi-clock-history text-success"></i>
               <span class="menu-text">
                <span>ປະຫວັດຈອງລົດ</span>
                <span>Booking History</span>
              </span>

            </router-link>

            <!-- Requests -->
            <router-link to="/booking/requests" class="candybox-item"
              v-if="bookingType === 'car' && groups_ids.includes('booking.group_kc_vehicle_manager')"
              @click="toggleCandybox">
              <i class="bi bi-journal-text text-warning"></i>
             <span class="menu-text">
                <span>ຄຳຮ້ອງຂໍ</span>
                <span>All Booking Queue</span>
              </span>
            </router-link>
              <router-link to="/booking/draft" class="candybox-item"
              v-if="bookingType === 'car' && groups_ids.includes('booking.group_kc_vehicle_manager')"
              @click="toggleCandybox">
              <i class="bi bi-bell"></i>
              <span class="menu-text">
                <span>ຈັດລົດໃຫ້ຜູ້ໃຊ້</span>
                <span>Assign Vehicle</span>
              </span>
              <span v-if="draftCount > 0" class="draft-count-badge">
                {{ draftCount }}
              </span>
            </router-link>

            <!-- Incident -->
            <router-link to="/indents/" class="candybox-item"
              v-if="bookingType === 'car' && groups_ids.includes('booking.group_kc_vehicle_manager')"
              @click="toggleCandybox">
              <i class="bi bi-exclamation-triangle text-danger"></i>
              <span class="menu-text">
                <span>ແຈ້ງບັນຫາໃຊ້ລົດ</span>
                <span>Report Issue</span>
              </span>
            </router-link>
                <!-- Requests -->
            <router-link to="/cars/" class="candybox-item"
              v-if="bookingType === 'car' && groups_ids.includes('booking.group_kc_vehicle_manager')"
              @click="toggleCandybox">
              <i class="bi bi-car-front-fill text-warning"></i>
             <span class="menu-text">
                <span>ລາຍການລົດ</span>
                <span>Cars</span>
              </span>
            </router-link>
            
            
            <!-- <router-link to="/profile" class="candybox-item">
              <i class="bi bi-person-circle"></i>
              <span>Profile</span>
            </router-link> -->

          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { getGroups, getUserProfile, getNotiDraftCount } from "../api/axios";


const router = useRouter();
const route = useRoute();

// Keep the selected service available across page refreshes.
const bookingType = ref(
  route.query.type === "room" || route.query.type === "car"
    ? route.query.type
    : (localStorage.getItem("booking_type") || "car")
);

watch(
  () => route.query.type,
  (type) => {
    if (type === "room" || type === "car") {
      bookingType.value = type;
      localStorage.setItem("booking_type", type);
    }
  },
  { immediate: true }
);

const currentUsername = ref("");
const currentimage = ref("");
const groups_ids = ref([]);
const isModalOpen = ref(false);
const profileMenuOpen = ref(false);

const draftCount = ref(0);
let draftCountTimer = null;
const showManagement = ref(false);
// Fetch the number of draft bookings
const fetchDraftCount = async () => {
  // Only managers should see the draft count
  if (bookingType.value !== "car" || !groups_ids.value.includes(
    "booking.group_kc_vehicle_manager"
  )) {
    draftCount.value = 0;
    return;
  }

  try {
    // Replace this URL with your actual Odoo count API
    const response = await getNotiDraftCount();
    if (response.status === true) {
      draftCount.value = Number(
        response.count || 0
      );
    }
  } catch (error) {
    console.error("Failed to fetch draft count:", error);
  }
};

const toggleProfileMenu = () => {
  profileMenuOpen.value = !profileMenuOpen.value;
};
// ເພີ່ມໄວ້ໃນ script setup
const isCandyboxOpen = ref(false);

const toggleCandybox = () => {
  isCandyboxOpen.value = !isCandyboxOpen.value;
};
const goToProfile = () => {
  profileMenuOpen.value = false;
  router.push("/profile");
};
// =========================
// Modal
// =========================
const openModal = () => {
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

// =========================
// Format Odoo XML ID
// =========================
const formatGroupName = (groupString) => {
  if (!groupString) return "";

  const parts = groupString.split(".");
  const target = parts[parts.length - 1];

  return target
    .replace(/^group_/, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

// =========================
// Logout
// =========================
const logout = () => {
  profileMenuOpen.value = false;
  localStorage.removeItem("user-token");
  localStorage.removeItem("user");
  localStorage.removeItem("company_name");
  localStorage.removeItem("username");
  localStorage.removeItem("groups_id");
  localStorage.removeItem("image");
  localStorage.removeItem("booking_type");

  groups_ids.value = [];
  currentUsername.value = "";
  currentimage.value = "";

  router.push("/");
};

// =========================
// Load cached groups first
// =========================
const loadCachedGroups = () => {
  console.log('dg image', currentimage)
  currentUsername.value =
    localStorage.getItem("username") || "User";
  currentimage.value =
    localStorage.getItem("image") || "";
  const storedGroups = localStorage.getItem("groups_id");
  console.log('image ', currentimage)
  if (!storedGroups) {
    groups_ids.value = [];
    return;
  }

  try {
    const parsedGroups = JSON.parse(storedGroups);

    groups_ids.value = Array.isArray(parsedGroups)
      ? parsedGroups
      : [];
  } catch (error) {
    console.error("Invalid groups_id in localStorage:", error);

    groups_ids.value = [];
  }
};

// =========================
// Get LIVE groups from Odoo
// =========================
const syncUserGroups = async () => {
  try {
    const result = await getGroups();

    console.log("LIVE USER GROUPS:", result);

    // Odoo API failed
    if (!result || result.status !== true) {
      console.warn(
        "Unable to validate user:",
        result?.message
      );

      // Only logout when API explicitly says invalid/expired
      if (
        result?.status === false &&
        (
          result.message?.toLowerCase().includes("expired") ||
          result.message?.toLowerCase().includes("invalid") ||
          result.message?.toLowerCase().includes("unauthorized")
        )
      ) {
        logout();
      }

      return;
    }

    // =========================
    // Update username
    // =========================
    currentUsername.value = result.username || "User";

    localStorage.setItem(
      "username",
      currentUsername.value
    );

    // =========================
    // Update groups
    // =========================
    const liveGroups = Array.isArray(result.groups_id)
      ? result.groups_id
      : [];

    groups_ids.value = liveGroups;

    localStorage.setItem(
      "groups_id",
      JSON.stringify(liveGroups)
    );

    console.log(
      "Updated groups:",
      groups_ids.value
    );

  } catch (error) {
    console.error(
      "Failed to synchronize user groups:",
      error
    );

    // Keep cached groups if network/Odoo is temporarily unavailable.
  }
};

// =========================
// Component mounted
// =========================

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
      profile.value = response.data;

      currentUsername.value = response.data.name || "User";

      currentimage.value = response.data.image || "";

      localStorage.setItem(
        "username",
        currentUsername.value
      );

      if (response.data.image) {
        localStorage.setItem(
          "image",
          response.data.image
        );
      } else {
        localStorage.removeItem("image");
      }
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

onMounted(async () => {
  // Show cached values immediately
  loadCachedGroups();

  fetchProfile()
  // Then ALWAYS request latest groups from Odoo
  await syncUserGroups();
  // Fetch the draft count for an authorized manager
  await fetchDraftCount();

  // Refresh the count every 30 seconds
  draftCountTimer = setInterval(() => {
    fetchDraftCount();
  }, 30000);
});
onUnmounted(() => {
  if (draftCountTimer) {
    clearInterval(draftCountTimer);
    draftCountTimer = null;
  }
});
</script>


<style scoped>
* {
  font-family: "Noto Sans Lao", "Noto Sans", sans-serif;
}

.draft-count-badge {
  margin-left: auto;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background-color: #dc3545;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
  box-shadow: 0 0 0 2px #072593;
}

.sticky-bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #1e40af;
  /* ปรับพื้นหลังส่วนล่างของ Sidebar ให้กลมกลืน */
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.profile-dropdown {
  position: relative;
}

.mobile-profile {
  width: 40px;
  height: 40px;

  border: none;
  background: transparent;

  color: var(--primary);

  font-size: 25px;

  padding: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
}

.mobile-profile-image {
  width: 36px;
  height: 36px;

  border-radius: 50%;

  object-fit: cover;

  display: block;
}

.profile-dropdown-menu {
  position: absolute;

  top: 48px;
  right: 0;

  width: 170px;

  background: #ffffff;

  border: 1px solid #e5e5e5;

  border-radius: 10px;

  padding: 6px;

  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);

  z-index: 2000;
}

.profile-dropdown-item {
  width: 100%;

  border: none;
  background: transparent;

  display: flex;
  align-items: center;

  gap: 10px;

  padding: 10px 12px;

  border-radius: 7px;

  font-size: 14px;

  color: #444;

  text-align: left;

  cursor: pointer;
}

.profile-dropdown-item:hover {
  background: #f5f5f5;
}

.profile-dropdown-item i {
  width: 20px;
  font-size: 17px;
}

.profile-dropdown-divider {
  height: 1px;

  background: #eeeeee;

  margin: 5px 0;
}

.profile-dropdown-item.logout-item {
  color: #dc3545;
}

.profile-dropdown-item.logout-item:hover {
  background: #fff1f1;
}

/* =========================
   CUSTOM MODAL OVERLAY STYLES
========================= */

.modal-backdrop-custom {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  /* Ensure it stays above everything else */
}

.modal-dialog-custom {
  background: #ffffff;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  overflow: hidden;
  animation: fadeInModal 0.2s ease-out;
}

.modal-header-custom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eeeeee;
}

.modal-title-custom {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.btn-close-custom {
  background: transparent;
  border: none;
  font-size: 24px;
  line-height: 1;
  color: #aaa;
  cursor: pointer;
  padding: 0;
}

.btn-close-custom:hover {
  color: #666;
}

.modal-body-custom {
  padding: 20px;
  max-height: 300px;
  overflow-y: auto;
}

@keyframes fadeInModal {
  from {
    transform: scale(0.95);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* =========================
   VARIABLES
========================= */
.dropup .dropdown-menu {
  display: block !important;
  /* Let Vue handle visibility instead of Bootstrap CSS */
  position: absolute !important;
  bottom: 100% !important;
  top: auto !important;
  left: 0 !important;
  transform: none !important;
  margin-bottom: 8px !important;
  min-width: 160px;
  z-index: 1060;
}

.app-layout {
  --primary: #2563eb;
  --primary-dark: #1d4ed8;
  --sidebar-width: 240px;

  min-height: 100vh;
  background: #f6f7f9;
}


/* =========================
   SIDEBAR (เปลี่ยนพื้นหลังเป็นสีฟ้า)
========================= */

.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;

  width: var(--sidebar-width);

  background: #072593;
  border-right: 1px solid #072593;

  display: flex;
  flex-direction: column;

  z-index: 1000;
}


/* Brand */

.sidebar-brand {
  height: 75px;

  display: flex;
  align-items: center;

  padding: 0 20px;

  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.brand-icon {
  width: 40px;
  height: 40px;

  background: #cc9f46;
  /* ปรับไอคอนแบรนด์เป็นสีเหลืองเพื่อความโดดเด่น */
  color: #1e3a8a;

  border-radius: 10px;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 20px;

  margin-right: 10px;
}

.brand-name {
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  /* เปลี่ยนชื่อแบรนด์เป็นสีขาว */
}

.sidebar-brand small {
  color: #93c5fd;
  /* เปลี่ยน sub-title เป็นสีฟ้าอ่อน */
}



/* Menu */
.sidebar-menu {
  flex: 1;
  padding: 20px 12px 100px;
  overflow-y: auto;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;

  padding: 12px 15px;
  margin-bottom: 5px;

  border-radius: 8px;
  text-decoration: none;
  color: #bfdbfe;
  font-size: 14px;

  transition: all 0.2s ease;
}

/* Icon */
.menu-item i {
  width: 25px;
  min-width: 25px;
  font-size: 20px;
  text-align: center;
}

/* Text 2 lines */
.menu-text {
  display: flex;
  flex-direction: column;
  line-height: 1.5;
}

.menu-text span:first-child {
  font-size: 14px;
  font-weight: 600;
}

.menu-text span:last-child {
  font-size: 12px;
  opacity: 0.8;
}

/* Hover */
.menu-item:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
}

/* Active */
.menu-item.router-link-active {
  background: #f6f5f4de;
  color: #1e3a8a;
  font-weight: 600;
}

.menu-item.router-link-active .menu-text span:last-child {
  opacity: 1;
}


/* User */

.sidebar-user {
  padding: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);

  display: flex;
  align-items: center;

  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;

  background: #1e40af;
  /* พื้นหลังส่วนผู้ใช้ด้านล่างเป็นสีฟ้าเข้ม */
}

.user-avatar {
  width: 38px;
  height: 38px;

  border-radius: 50%;

  background: #fbbf24;
  /* อະວາຕາເປັນສີເຫຼືອງ */
  color: #1e3a8a;
  font-weight: 700;

  display: flex;
  align-items: center;
  justify-content: center;

  margin-right: 10px;
}

.user-avatar img {
  width: 40px;
  height: 40px;
  object-fit: cover;
}

.avatar-placeholder {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fbbf24;
  color: #1e3a8a;
  font-size: 22px;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-info strong {
  display: block;

  font-size: 13px;
  color: #ffffff;
  /* ชื่อผู้ใช้เป็นสีขาว */

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-info small {
  color: #93c5fd;
}

.logout-btn {
  border: none;
  background: transparent;

  color: #bfdbfe;
  /* ไอคอน Logout สีฟ้าอ่อน */

  font-size: 18px;

  cursor: pointer;
}

.logout-btn:hover {
  color: #fca5a5;
  /* Hover เป็นสีแดงอ่อน */
}

/* =========================
   MAIN CONTENT
========================= */

.main-content {
  margin-left: var(--sidebar-width);
  min-height: 100vh;
}

.page-content {
  padding: 2px;
}


/* =========================
   MOBILE HEADER
========================= */

.mobile-header {
  display: none;
}


/* =========================
   MOBILE BOTTOM BAR
========================= */

.mobile-bottom-nav {
  display: none;
}


/* =========================
   MOBILE RESPONSIVE
========================= */

@media (max-width: 768px) {

  .sidebar {
    display: none;
  }

  .main-content {
    margin-left: 0;
    padding-bottom: 75px;
  }

  .mobile-header {
    position: sticky;
    top: 0;
    height: 60px;
    background: #ffffff;
    border-bottom: 1px solid #eeeeee;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    z-index: 900;
  }

  .mobile-brand {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--primary);
    font-size: 17px;
    text-decoration: none !important;
  }

  .mobile-brand i {
    font-size: 21px;
  }

  .mobile-profile {
    border: none;
    background: transparent;
    color: var(--primary);
    font-size: 25px;
  }

  .page-content {
    padding: 15px;
  }

  /* Bottom navigation */
  .mobile-bottom-nav {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 68px;
    display: flex;
    overflow-x: auto;
    overflow-y: hidden;
    background: #fff;
    border-top: 1px solid #e5e5e5;
    z-index: 1000;
    scrollbar-width: none;
  }

  .mobile-bottom-nav::-webkit-scrollbar {
    display: none;
  }

  .bottom-item {
    flex: 1 1 0;
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 5px 0;
    color: #6c757d;
    font-size: 11px;
    font-weight: 500;
    text-decoration: none !important;
    background: transparent;
    border: none;
    height: 100%;
    transition: color 0.2s;
  }

  .bottom-item i {
    font-size: 20px;
    margin-bottom: 2px;
  }

  .bottom-item:hover,
  .bottom-item.router-link-active {
    color: var(--primary);
    text-decoration: none !important;
  }


  /* Bottom navigation */

  .mobile-bottom-nav {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;

    width: 100%;
    height: 68px;

    display: flex;
    overflow-x: auto;
    overflow-y: hidden;

    background: #fff;
    border-top: 1px solid #e5e5e5;
    z-index: 1000;

    scrollbar-width: none;
  }

  .mobile-bottom-nav::-webkit-scrollbar {
    display: none;
  }

  .bottom-item {

    flex: 1 1 0;
    width: 20%;
    /* if you have 5 buttons */
    min-width: 0;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    text-align: center;
    padding: 5px 0;
  }

  /* =========================
   CANDYBOX MOBILE POPUP STYLES (1 Menu per Row)
========================= */
  .candybox-btn {
    background: transparent;
    border: none;
    color: #6c757d;
    cursor: pointer;
  }

  .candybox-btn:hover {
    color: var(--primary);
  }

  .candybox-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(3px);
    display: flex;
    align-items: flex-end;
    z-index: 1100;
  }

  .candybox-container {
    background: #ffffff;
    width: 100%;
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
    max-height: 70vh;
    overflow-y: auto;
    animation: slideUpPopup 0.25s ease-out;
  }

  .candybox-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid #eee;
  }

  .candybox-header h6 {
    font-size: 15px;
  }

  .btn-close-custom {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: #6c757d;
    line-height: 1;
  }

  .candybox-body {
    padding: 16px;
  }

  .candybox-grid {
    display: grid;
    grid-template-columns: 1fr;
    /* เปลี่ยนเป็น 1 คอลัมน์ (แຖວລະ 1 เมນູ) */
    gap: 10px;
    /* ระยะห่างระหว่างแถว */
  }

  .candybox-item {
    display: flex;
    flex-direction: row;
    /* เรียง Icon กับ Text ให้อยู่บรรทัดเดียวกันแบบแนวนอน */
    align-items: center;
    justify-content: flex-start;
    /* ชิดซ้าย */
    padding: 12px 16px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    text-decoration: none;
    color: #1e293b;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s;
  }

  .candybox-item i {
    font-size: 20px;
    margin-bottom: 0;
    /* ลบ Margin เก่าออก */
    margin-right: 12px;
    /* เพิ่มระยะห่างทางขวาของ Icon แทน */
  }

  .candybox-item:hover {
    background: #eff6ff;
    border-color: #bfdbfe;
    color: var(--primary);
  }

  @keyframes slideUpPopup {
    from {
      transform: translateY(100%);
    }

    to {
      transform: translateY(0);
    }
  }


}

.management-menu {
  width: 100%;
}

.management-toggle {
  width: 100%;
  border: none;
  background: transparent;
  color: #bfdbfe;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
}

.management-toggle:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}

.management-arrow {
  width: auto !important;
  min-width: 0;
  margin-left: auto;
  font-size: 13px !important;
}

.management-submenu {
  margin: 4px 0 8px 12px;
  padding-left: 8px;
  border-left: 2px solid rgba(255, 255, 255, 0.25);
}

.management-submenu .menu-item {
  padding: 10px 12px;
  margin-bottom: 4px;
  font-size: 13px;
  border-radius: 7px;
}

.management-submenu .menu-text span:first-child {
  font-size: 13px;
}

.management-submenu .menu-text span:last-child {
  font-size: 11px;
  opacity: 0.8;
}

.management-submenu .menu-item.router-link-active {
  background: #f6f5f4de;
  color: #1e3a8a;
}
</style>