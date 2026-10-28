import { createRouter, createWebHistory } from "vue-router";
import Login from "../views/Login.vue";

import Dashboard from "../views/Dashboard.vue";
import DashboardAdmin from "../views/DashboardAdmin.vue";
import MainLayout from "../layouts/MainLayout.vue";
import CreateBookingView from "../views/CreateBookingView.vue";
import BookingDetail from "../views/BookingDetailView.vue";
import StartTripView from "../views/StartTripView.vue";
import HistoryBooking from "../views/HistoryBookingView.vue";
import HistoryRequest from "../views/HistoryRequestView.vue";
import ActiveTrip from "../views/ActiveTrip.vue";
import ActiveTripuser from "../views/ActiveTripUser.vue";
import Indents from "../views/Indents.vue";
import CarManagementView from "../views/CarManagementView.vue";
import ProfileView from "../views/ProfileView.vue";
import HistoryDraftview from "../views/HistoryDraftview.vue";
import RoomTypeView from "../views/RoomTypeView.vue";
import ChooseBookingView from "../components/ChooseBookingView.vue";
import RoomBookingManagement from "../views/RoomBookingManagement.vue";
import RoomBookingDetail from "../views/RoomBookingDetail.vue";
import RoomManagementView from "../views/RoomManagementView.vue";
import MyRoomBookingsView from "../views/MyRoomBookingsView.vue";
import RoomBookingApprovalView from "../views/RoomBookingApprovalView.vue";

const routes = [
  {
    path: "/choose-booking",
    name: "ChooseBooking",
    component: ChooseBookingView,
    meta: {
      requiresAuth: true,
      title: "Choose Booking - Smart Booking",
    },
  },
  {
    path: "/",
    name: "Login",
    component: Login,
    meta: {
      title: "Login - Smart Booking",
    },
  },
  {
    path: "/",
    component: MainLayout,
    children: [
      {
        path: "app/roomtype",
        name: "RoomTypeView",
        component: RoomTypeView,
        meta: {
          requiresAuth: true,
          title: "ຈອງຫ້ອງປະຊູມ - Smart Booking",
        },
      },
      {
        path: "/room-booking-management",
        name: "RoomBookingManagement",
        component: RoomBookingManagement,
        meta: {
          requiresAuth: true,
          requiresManager: true,
          title: "ຈອງຫ້ອງປະຊູມ - Smart Booking",
        },
      },
      {
        path: "/room-management",
        name: "RoomManagement",
        component: RoomManagementView,
        meta: {
          title: "Room Management",
          requiresAuth: true,
        },
      },
      {
        path: "room-booking-approval",
        name: "RoomBookingApproval",
        component: RoomBookingApprovalView,
      },
      {
        path: "/room-booking/:id",
        name: "RoomBookingDetail",
        component: RoomBookingDetail,
      },
      {
        path: "/my-room-bookings",
        name: "MyRoomBookings",
        component: MyRoomBookingsView,
      },

      {
        path: "app/dashboard",
        name: "Dashboard",
        component: Dashboard,
        meta: {
          requiresAuth: true,
          title: "ໜ້າຫຼັກ - Smart Booking",
        },
      },
      {
        path: "app/DashboardAdmin",
        name: "DashboardAdmin",
        component: DashboardAdmin,
        meta: {
          requiresAuth: true,
          title: "Dashboard Admin - Smart Booking",
        },
      },

      {
        path: "booking/new",
        name: "CreateBookingView",
        component: CreateBookingView,
        meta: {
          requiresAuth: true,
          title: "ຈອງລົດໃໝ່ - Smart Booking",
        },
      },

      {
        path: "/booking/history/:id",
        name: "BookingDetail",
        component: BookingDetail,
        props: true,
        meta: {
          requiresAuth: true,
          title: "ລາຍລະອຽດການຈອງ - Smart Booking",
        },
      },
      {
        path: "booking/start-trip/:id",
        name: "StartTrip",
        component: StartTripView,
        props: true, // Automatically maps route.params.id to a prop
        meta: {
          requiresAuth: true,
          title: "ເລີ່ມການເດີນທາງ - Smart Booking",
        },
      },
      {
        path: "/booking/historys",
        name: HistoryBooking,
        component: HistoryBooking,
        meta: {
          requiresAuth: true,
          title: "ປະຫວັດການຈອງ - Smart Booking",
        },
      },
      {
        path: "/booking/requests",
        name: "BookingRequests",
        component: HistoryRequest,
        meta: {
          requiresAuth: true,
          title: "ຄຳຂໍຈອງລົດ - Smart Booking",
        },
      },
      {
        path: "/booking/draft",
        name: "BookingDrafts",
        component: HistoryDraftview,
        meta: {
          requiresAuth: true,
          title: "ຄຳຂໍຈອງລົດ - Smart Booking",
        },
      },

      {
        path: "/trip/",
        name: ActiveTrip,
        component: ActiveTripuser,
        meta: {
          requiresAuth: true,
          title: "ການເດີນທາງ - Smart Booking",
        },
      },
      {
        path: "/trip/active",
        name: ActiveTripuser,
        component: ActiveTrip,
        meta: {
          requiresAuth: true,
          title: "ການເດີນທາງ - Smart Booking",
        },
      },

      {
        path: "/indents/",
        name: "Indents",
        component: Indents,
        meta: {
          requiresAuth: true,
          title: "INDENTS - Smart Booking",
        },
      },
      {
        path: "/cars/",
        name: "CarManagement",
        component: CarManagementView,
        meta: {
          requiresAuth: true,
          title: "ຈັດການລົດ",
        },
      },
      {
        path: "/profile",
        name: "ProfileView",
        component: ProfileView,
        meta: {
          requiresAuth: true,
          title: "ໂປຣໄຟລ໌ - Smart Booking",
        },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Protect pages after login
router.beforeEach((to) => {
  const token = localStorage.getItem("user-token");

  if (to.path !== "/" && !token) {
    return "/";
  }

  if (to.path === "/" && token) {
    return "/choose-booking";
    // return 'app/dashboard'
  }
});

// Set browser tab title
router.afterEach((to) => {
  document.title = to.meta.title || "Smart Booking";
});
export default router;
