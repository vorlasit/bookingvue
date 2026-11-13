
<template>
  <div class="container-fluid py-4 ticket-detail-page">
    <!-- Header -->
    <div class="d-flex align-items-center gap-3 mb-4">
      <button class="btn btn-outline-secondary" @click="goBack">
        <i class="bi bi-arrow-left me-1"></i>
        Back
      </button>

      <div>
        <h4 class="mb-1">Ticket Details</h4>
        <p class="text-muted mb-0">View your ticket request information.</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
      <p class="text-muted mt-3">Loading ticket details...</p>
    </div>

    <!-- Error -->
    <div v-else-if="errorMessage" class="card border-0 shadow-sm">
      <div class="card-body text-center py-5">
        <i class="bi bi-exclamation-circle text-danger display-4"></i>
        <h5 class="mt-3">Unable to load ticket</h5>
        <p class="text-muted">{{ errorMessage }}</p>

        <button class="btn btn-primary" @click="loadTicket">
          <i class="bi bi-arrow-clockwise me-1"></i>
          Try Again
        </button>
      </div>
    </div>

    <!-- Ticket Detail -->
    <div v-else-if="ticket" class="row g-4">

      <!-- Main information -->
      <div class="col-lg-8">
        <div class="card border-0 shadow-sm rounded-3">
          <div class="card-body p-3 p-md-4">

            <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
              <div>
                <span class="text-muted small">Ticket Number</span>
                <h4 class="mb-0">
                  {{ formatTicketNumber(ticket.id) }}
                </h4>
              </div>

              <span class="status-badge" :class="statusClass(ticket.state)">
                {{ ticket.state_label || formatStatus(ticket.state) }}
              </span>
            </div>

            <hr />

            <h5 class="section-title mb-3">
              <i class="bi bi-info-circle me-2"></i>
              Request Information
            </h5>

            <div class="row g-3">

              <div class="col-md-6">
                <label class="detail-label">Request Type</label>
                <div class="detail-value">
                  {{ ticket.require_type_label || formatType(ticket.require_type) }}
                </div>
              </div>

              <div class="col-md-6">
                <label class="detail-label">Priority</label>
                <div class="detail-value">
                  {{ ticket.priority_label || ticket.priority || '-' }}
                </div>
              </div>

              <div class="col-md-6">
                <label class="detail-label">Request Date</label>
                <div class="detail-value">
                  <i class="bi bi-calendar3 me-2 text-muted"></i>
                  {{ formatDate(ticket.date) }}
                </div>
              </div>

              <div class="col-md-6">
                <label class="detail-label">Deadline</label>
                <div class="detail-value">
                  <i class="bi bi-calendar-check me-2 text-muted"></i>
                  {{ formatDate(ticket.deadline) }}
                </div>
              </div>

              <div class="col-md-6">
                <label class="detail-label">Department</label>
                <div class="detail-value">
                  {{ ticket.department_name || '-' }}
                </div>
              </div>

              <div class="col-md-6">
                <label class="detail-label">Employee</label>
                <div class="detail-value">
                  {{ ticket.employee_name || '-' }}
                </div>
              </div>

              <div class="col-md-6">
                <label class="detail-label">Assigned To</label>
                <div class="detail-value">
                  {{ assignedUsers }}
                </div>
              </div>

              <div class="col-md-6">
                <label class="detail-label">Created At</label>
                <div class="detail-value">
                  {{ formatDateTime(ticket.create_date) }}
                </div>
              </div>

            </div>

            <hr class="my-4" />

            <h5 class="section-title mb-3">
              <i class="bi bi-card-text me-2"></i>
              Description
            </h5>

            <div class="description-box">
              {{ ticket.description || '-' }}
            </div>

            <div v-if="ticket.solution" class="mt-4">
              <h5 class="section-title mb-3">
                <i class="bi bi-chat-left-text me-2"></i>
                Solution / Admin Note
              </h5>

              <div class="solution-box">
                {{ ticket.solution }}
              </div>
            </div>

          </div>
        <!-- Ticket Actions -->
<div class="card-footer bg-white">
  <div class="d-flex flex-wrap justify-content-end gap-2">

    <button
      class="btn btn-outline-secondary"
      :disabled="updating"
      @click="goBack"
    >
      Cancel
    </button>

    <button
      class="btn btn-primary"
      :disabled="updating"
      @click="updateStatus('in_progress')"
      v-if="ticket.state === 'draft'"
    >
      <i class="bi bi-arrow-repeat me-1"></i>
      In Progress
    </button>

    <button
      class="btn btn-success"
      :disabled="updating"
      @click="updateStatus('done')"
      v-if="ticket.state === 'in_progress'"
    >
      <i class="bi bi-check-circle me-1"></i>
      Done
    </button>

    <button
      class="btn btn-danger"
      :disabled="updating"
      @click="updateStatus('rejected')"
      v-if="ticket.state === 'draft'"
    >
      <i class="bi bi-x-circle me-1"></i>
      Reject
    </button>

  </div>

  <div v-if="updating" class="text-muted small text-end mt-2">
    Updating ticket...
  </div>
</div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="col-lg-4">

        <div class="card border-0 shadow-sm rounded-3 mb-3">
          <div class="card-body p-4">
            <h5 class="section-title mb-3">
              <i class="bi bi-clipboard-check me-2"></i>
              Ticket Status
            </h5>

            <div class="text-center py-3">
              <div class="status-icon mb-3" :class="statusClass(ticket.state)">
                <i :class="statusIcon(ticket.state)"></i>
              </div>

              <h5>{{ ticket.state_label || formatStatus(ticket.state) }}</h5>

              <p class="text-muted small mb-0">
                Current ticket progress
              </p>
            </div>
          </div>
        </div>

        <div class="card border-0 shadow-sm rounded-3">
          <div class="card-body p-4">
            <h5 class="section-title mb-3">
              <i class="bi bi-person-circle me-2"></i>
              Requester
            </h5>

            <div class="detail-row">
              <span>Employee</span>
              <strong>{{ ticket.employee_name || '-' }}</strong>
            </div>

            <div class="detail-row">
              <span>Department</span>
              <strong>{{ ticket.department_name || '-' }}</strong>
            </div>

            <div class="detail-row">
              <span>Ticket ID</span>
              <strong>#{{ ticket.id }}</strong>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getTicketRequirementDetail,updateTicketRequirementStatus  } from "../api/ticket";

const route = useRoute();
const router = useRouter();

const ticket = ref(null);
const loading = ref(false);
const errorMessage = ref("");

const updating = ref(false);

const updateStatus = async (newStatus) => {
  if (!ticket.value?.id || updating.value) return;

  try {
    updating.value = true;

    const response = await updateTicketRequirementStatus(
      ticket.value.id,
      newStatus
    );

    if (response?.status) {
      await loadTicket();
    } else {
      alert(response?.message || "Unable to update ticket status.");
    }
  } catch (error) {
    console.error("Update ticket status error:", error);
    alert(
      error.response?.data?.message ||
      "Failed to update ticket status."
    );
  } finally {
    updating.value = false;
  }
};
const assignedUsers = computed(() => {
  const users = ticket.value?.reponsive_ids || [];

  if (!users.length) return "-";

  return users.map(user => {
    return Array.isArray(user) ? user[1] : user.name || "";
  }).filter(Boolean).join(", ");
});

// Load ticket detail
async function loadTicket() {
  const token = localStorage.getItem("user-token");

  if (!token) {
    router.replace({
      name: "Login",
      query: {
        redirect: route.fullPath
      }
    });
    return;
  }

  const ticketId = Number(route.params.id);

  if (!ticketId || ticketId <= 0) {
    errorMessage.value = "Invalid ticket ID.";
    return;
  }

  loading.value = true;
  errorMessage.value = "";
  ticket.value = null;

  try {
    const response = await getTicketRequirementDetail(ticketId);

    if (!response || response.status === false) {
      throw new Error(response?.message || "Ticket not found.");
    }

    ticket.value = response.ticket;

    if (!ticket.value) {
      throw new Error("Ticket details not found.");
    }

  } catch (error) {
    const status = error.response?.status;

    if (status === 401) {
      localStorage.removeItem("user-token");

      router.replace({
        name: "Login",
        query: {
          redirect: route.fullPath
        }
      });

      return;
    }

    errorMessage.value =
      error.response?.data?.message ||
      error.message ||
      "Failed to load ticket details.";

  } finally {
    loading.value = false;
  }
}

function goBack() {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push("/");
  }
}

function formatTicketNumber(id) {
  return `HD-${String(id).padStart(6, "0")}`;
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(String(value).replace(" ", "T"));

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatDateTime(value) {
  if (!value) return "-";

  const date = new Date(String(value).replace(" ", "T"));

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatType(value) {
  const labels = {
    internet: "Internet",
    item_problem: "Item Problem",
    technical: "Technical",
    system_support: "System Support",
    other: "Others",
  };

  return labels[value] || value || "-";
}

function formatStatus(value) {
  const labels = {
    draft: "Draft",
    in_progress: "In Progress",
    waiting_for_approval: "Waiting Approval",
    approve: "Approved",
    done: "Done",
    rejected: "Rejected",
    comment: "Comment",
  };

  return labels[value] || value || "-";
}

function statusClass(value) {
  const classes = {
    draft: "status-draft",
    in_progress: "status-progress",
    waiting_for_approval: "status-waiting",
    approve: "status-done",
    done: "status-done",
    rejected: "status-rejected",
    comment: "status-waiting",
  };

  return classes[value] || "status-draft";
}

function statusIcon(value) {
  const icons = {
    draft: "bi bi-file-earmark-text",
    in_progress: "bi bi-arrow-repeat",
    waiting_for_approval: "bi bi-hourglass-split",
    approve: "bi bi-check-circle",
    done: "bi bi-check-circle-fill",
    rejected: "bi bi-x-circle",
    comment: "bi bi-chat-dots",
  };

  return icons[value] || "bi bi-ticket-detailed";
}

watch(
  () => route.params.id,
  () => loadTicket()
);
const checkLogin = () => {
  const token = localStorage.getItem("user-token");

  if (!token) {
    router.replace({
      name: "Login",
      query: {
        redirect: route.fullPath,
      },
    });

    return false;
  }

  return true;
};

onMounted(() => {
  if (checkLogin()) {
    loadTicket();
  }
}); 
</script>

<style scoped>
.ticket-detail-page {
  color: #343a40;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #343a40;
}

.detail-label {
  display: block;
  color: #8992a3;
  font-size: 13px;
  margin-bottom: 6px;
}

.detail-value {
  font-size: 15px;
  color: #343a40;
  font-weight: 500;
  overflow-wrap: anywhere;
}

.description-box,
.solution-box {
  background: #f7f8fa;
  border: 1px solid #e9edf2;
  border-radius: 10px;
  padding: 16px;
  line-height: 1.8;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font-size: 14px;
}

.solution-box {
  background: #f0f8f3;
  border-color: #d9eddf;
}

.status-badge {
  display: inline-block;
  padding: 7px 14px;
  border-radius: 20px;
  font-size: 13px;
}

.status-draft {
  background: #eee;
  color: #666;
}

.status-progress {
  background: #e4efff;
  color: #2468bd;
}

.status-waiting {
  background: #fff1d6;
  color: #a66c00;
}

.status-done {
  background: #e1f5e7;
  color: #218348;
}

.status-rejected {
  background: #fde8e8;
  color: #c33;
}

.status-icon {
  width: 65px;
  height: 65px;
  border-radius: 50%;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  font-size: 28px;
}

.detail-row {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 11px 0;
  border-bottom: 1px solid #eee;
  font-size: 14px;
}

.detail-row:last-child {
  border-bottom: 0;
}

.detail-row span {
  color: #8992a3;
}

.detail-row strong {
  font-weight: 500;
  overflow-wrap: anywhere;
}
</style>
