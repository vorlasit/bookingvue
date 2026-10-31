<template>
  <div class="container-fluid py-4 ticket-dashboard">

    <!-- Header -->
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div>
        <h4 class="mb-1">Ticket Dashboard</h4>
        <p class="text-muted mb-0">
          View and track your problem reports and asset requests.
        </p>
      </div>

      <div class="d-flex flex-wrap gap-2">
        <button class="btn btn-outline-primary" @click="goToProblem">
          <i class="bi bi-exclamation-circle me-1"></i>
          Report Problem
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
      <p class="text-muted mt-3">Loading your tickets...</p>
    </div>

    <template v-else>

      <!-- Error -->
      <div v-if="errorMessage" class="alert alert-danger">
        {{ errorMessage }}
        <button class="btn btn-sm btn-outline-danger ms-2" @click="loadDashboard">
          Retry
        </button>
      </div>

      <!-- Summary Cards -->

      <div class="row g-3 mb-4">

        <!-- Total -->
        <div class="col-6 col-xl-3">
          <div class="summary-card total-card" :class="{ 'summary-card-active': activeFilter === 'all' }"
            @click="setFilter('all')">
            <div class="summary-icon">
              <i class="bi bi-ticket-perforated"></i>
            </div>
            <div>
              <div class="summary-label">Total Requests</div>
              <div class="summary-number">{{ statistics.total }}</div>
            </div>
          </div>
        </div>

        <!-- Draft -->
        <div class="col-6 col-xl-3">
          <div class="summary-card waiting-card" :class="{ 'summary-card-active': activeFilter === 'draft' }"
            @click="setFilter('draft')">
            <div class="summary-icon">
              <i class="bi bi-file-earmark-text"></i>
            </div>
            <div>
              <div class="summary-label">Draft</div>
              <div class="summary-number">{{ statistics.draft }}</div>
            </div>
          </div>
        </div>

        <!-- In Progress -->
        <div class="col-6 col-xl-3">
          <div class="summary-card progress-card" :class="{ 'summary-card-active': activeFilter === 'in_progress' }"
            @click="setFilter('in_progress')">
            <div class="summary-icon">
              <i class="bi bi-arrow-repeat"></i>
            </div>
            <div>
              <div class="summary-label">In Progress</div>
              <div class="summary-number">{{ statistics.inProgress }}</div>
            </div>
          </div>
        </div>

        <!-- Done -->
        <div class="col-6 col-xl-3">
          <div class="summary-card completed-card" :class="{ 'summary-card-active': activeFilter === 'done' }"
            @click="setFilter('done')">
            <div class="summary-icon">
              <i class="bi bi-check-circle"></i>
            </div>
            <div>
              <div class="summary-label">Done</div>
              <div class="summary-number">{{ statistics.done }}</div>
            </div>
          </div>
        </div>

      </div>

      <!-- Ticket Type Summary -->
      <div class="row g-3 mb-4">

        <div class="col-md-12">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex align-items-center justify-content-between">
                <div>
                  <div class="text-muted small">Problem Reports</div>
                  <h3 class="mb-0 mt-2">{{ statistics.problems }}</h3>
                </div>
                <div class="type-icon problem-icon">
                  <i class="bi bi-tools"></i>
                </div>
              </div>
              <button class="btn btn-sm btn-outline-primary mt-3" @click="goToProblem">
                Create Problem Report
                <i class="bi bi-arrow-right ms-1"></i>
              </button>
            </div>
          </div>
        </div>

      </div>

      <!-- My Tickets -->
      <div class="card border-0 shadow-sm">
        <div class="card-body">

          <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
            <div>
              <h5 class="mb-1">My Requests</h5>
              <p class="text-muted small mb-0">
                Track the progress of your submitted tickets.
              </p>
            </div>

            <button class="btn btn-sm btn-outline-secondary" @click="loadDashboard">
              <i class="bi bi-arrow-clockwise me-1"></i>
              Refresh
            </button>
          </div>

          <!-- Filters -->
          <!-- <div class="d-flex flex-wrap gap-2 mb-3">
            <button
              v-for="filter in filters"
              :key="filter.value"
              class="btn btn-sm"
              :class="activeFilter === filter.value
                ? 'btn-primary'
                : 'btn-outline-secondary'"
              @click="activeFilter = filter.value"
            >
              {{ filter.label }}
            </button>
          </div> -->

          <!-- Search -->
          <div class="row mb-3">
            <div class="col-md-5">
              <div class="input-group">
                <span class="input-group-text bg-white">
                  <i class="bi bi-search"></i>
                </span>
                <input v-model="searchText" type="text" class="form-control"
                  placeholder="Search description or request type..." />
              </div> 
            </div>
          </div>

          <!-- Empty -->
          <div v-if="filteredTickets.length === 0" class="text-center py-5">
            <i class="bi bi-inbox display-5 text-muted"></i>
            <h6 class="mt-3">No requests found</h6>
            <p class="text-muted small">
              Your requests will appear here after submission.
            </p>
          </div>

          <!-- Table -->
          <!-- Ticket Cards -->
          <div v-else class="ticket-list">

            <div v-for="ticket in filteredTickets" :key="ticket.id" class="ticket-item" @click="viewTicket(ticket)">

              <!-- Top: Priority, Type, Time -->
              <div class="ticket-item-top">

                <div class="d-flex flex-wrap gap-2"> 
                  <span class="ticket-pill ticket-type-pill">
                    {{ ticket.category_name || ticket.require_type_label || formatType(ticket.require_type) }}
                  </span>

                </div>

                <span class="ticket-time">
                  {{ formatDate(ticket.date) }}
                </span>

              </div>

              <!-- Description -->
              <div class="ticket-description">
                {{ ticket.description || '-' }}
              </div>

              <!-- Ticket Reference -->
              <div class="ticket-reference">
                <span>{{ ticket.ticket_number || formatTicketNumber(ticket.id) }}</span>

                <span v-if="getTargetReference(ticket)">
                  · {{ getTargetReference(ticket) }}
                </span>
              </div>

            </div>

          </div>

          <div class="text-muted small mt-2">
            Showing {{ filteredTickets.length }} of {{ tickets.length }} requests
          </div>

        </div>
      </div>

    </template>

    <!-- Ticket Detail Modal -->
    <div v-if="selectedTicket" class="ticket-modal-backdrop" @click.self="selectedTicket = null">

      <div class="ticket-modal card border-0 shadow">

        <div class="card-header bg-white d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Ticket #{{ selectedTicket.id }}</h5>
          <button class="btn-close" @click="selectedTicket = null"></button>
        </div>

        <div class="card-body">

          <div class="mb-3">
            <label class="detail-label">Request Type</label>
            <div>{{ formatType(selectedTicket.require_type) }}</div>
          </div>

          <div class="mb-3">
            <label class="detail-label">Description</label>
            <div class="detail-description">
              {{ selectedTicket.description || '-' }}
            </div>
          </div>

          <div class="row g-3">
            <div class="col-6">
              <label class="detail-label">Priority</label>
              <div>{{ formatPriority(selectedTicket.priority) }}</div>
            </div>

            <div class="col-6">
              <label class="detail-label">Status</label>
              <div>{{ formatStatus(selectedTicket.state) }}</div>
            </div>

            <div class="col-6">
              <label class="detail-label">Request Date</label>
              <div>{{ formatDate(selectedTicket.date) }}</div>
            </div>

            <div class="col-6">
              <label class="detail-label">Deadline</label>
              <div>{{ formatDate(selectedTicket.deadline) }}</div>
            </div>

            <div class="col-12" v-if="selectedTicket.solution">
              <label class="detail-label">Solution</label>
              <div class="detail-description">
                {{ selectedTicket.solution }}
              </div>
            </div>
          </div>

        </div>

        <div class="card-footer bg-white text-end">
          <button class="btn btn-secondary" @click="selectedTicket = null">
            Close
          </button>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";

import {
  getMyTicketRequirements,
  getTicketRequirementDetail,
} from "../api/ticket";

const router = useRouter();

const loading = ref(false);
const errorMessage = ref("");
const tickets = ref([]);
const selectedTicket = ref(null);

const activeFilter = ref("all");
const searchText = ref("");
function setFilter(state) {
  activeFilter.value = state;
}
const filters = [
  { label: "All", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "In Progress", value: "in_progress" },
  { label: "Waiting Approval", value: "waiting_for_approval" },
  { label: "Approved", value: "approve" },
  { label: "Rejected", value: "rejected" },
];
const statistics = computed(() => {
  const all = tickets.value;

  return {
    total: all.length,

    draft: all.filter(
      t => t.state === "draft"
    ).length,

    inProgress: all.filter(
      t => t.state === "in_progress"
    ).length,

    done: all.filter(
      t => t.state === "done"
    ).length,

    problems: all.filter(
      t => t.require_type !== "asset_request"
    ).length,
  };
});

const filteredTickets = computed(() => {
  let result = [...tickets.value];

  if (activeFilter.value !== "all") {
    result = result.filter(
      ticket => ticket.state === activeFilter.value
    );
  }

  if (searchText.value.trim()) {
    const keyword = searchText.value.toLowerCase();

    result = result.filter(ticket =>
      String(ticket.id).includes(keyword) ||
      String(ticket.description || "").toLowerCase().includes(keyword) ||
      String(ticket.require_type || "").toLowerCase().includes(keyword)
    );
  }

  return result.sort((a, b) => b.id - a.id);
});

async function loadDashboard() {
  loading.value = true;
  errorMessage.value = "";

  try {
    const response = await getMyTicketRequirements();

    if (response.status === false) {
      throw new Error(response.message || "Unable to load tickets.");
    }

    tickets.value = response.tickets || [];

  } catch (error) {
    errorMessage.value =
      error.response?.data?.message ||
      error.message ||
      "Failed to load ticket dashboard.";

  } finally {
    loading.value = false;
  }
}

function goToProblem() {
  router.push("/app/problem");
}

function goToAsset() {
  router.push("/app/asset-request");
}

async function viewTicket(ticket) {
  try {
    const response = await getTicketRequirementDetail(ticket.id);

    if (response.status === false) {
      throw new Error(response.message || "Unable to load ticket details.");
    }

    selectedTicket.value = response.ticket || ticket;

  } catch (error) {
    console.error("Ticket detail error:", error);

    // Fall back to the ticket data already loaded in the dashboard.
    selectedTicket.value = ticket;
  }
}

function formatType(value) {
  return value === "asset_request"
    ? "Asset Request"
    : "Problem Report";
}

function formatPriority(value) {
  const labels = {
    low: "Low",
    normal: "Normal",
    high: "High",
    urgent: "Urgent",
  };

  return labels[value] || value || "-";
}

function formatStatus(value) {
  const labels = {
    draft: "Draft",
    in_progress: "In Progress",
    waiting_for_approval: "Waiting Approval",
    approve: "Approved",
    comment: "Comment",
    rejected: "Rejected",
  };

  return labels[value] || value || "-";
}


const formatDate = (value) => {
  if (!value) return '-'

  const date = new Date(
    String(value).replace(' ', 'T')
  )

  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric', 
  }).format(date)
}


function priorityClass(value) {
  const classes = {
    low: "bg-secondary",
    normal: "bg-info text-dark",
    high: "bg-warning text-dark",
    urgent: "bg-danger",
  };

  return classes[value] || "bg-secondary";
}

function statusClass(value) {
  const classes = {
    draft: "status-draft",
    in_progress: "status-progress",
    waiting_for_approval: "status-waiting",
    approve: "status-approved",
    comment: "status-comment",
    rejected: "status-rejected",
  };

  return classes[value] || "status-draft";
}
function formatTime(value) {
  if (!value) return "-";

  const date = new Date(String(value).replace(" ", "T"));

  if (isNaN(date.getTime())) return "-";

  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatTicketNumber(id) {
  return `HD-${String(id).padStart(6, "0")}`;
}

function getTargetReference(ticket) {
  return (
    ticket.target_reference ||
    ticket.target_code ||
    ticket.asset_code ||
    ticket.asset_name ||
    ""
  );
}

function formatPriorityCard(value) {
  const labels = {
    low: "ຕ່ຳ",
    normal: "ປົກກະຕິ",
    high: "ສູງ",
    urgent: "ດ່ວນ",
  };

  return labels[value] || value || "-";
}

function priorityCardClass(value) {
  const classes = {
    low: "priority-low",
    normal: "priority-normal",
    high: "priority-high",
    urgent: "priority-urgent",
  };

  return classes[value] || "priority-normal";
}
onMounted(loadDashboard);
</script>

<style scoped>
/* Ticket card list */
.ticket-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ticket-item {
  background: #fff;
  border: 1px solid #dfe3eb;
  border-radius: 17px;
  padding: 15px 17px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.ticket-item:hover {
  border-color: #b9c9e5;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.05);
  transform: translateY(-1px);
}

.ticket-item-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.ticket-pill {
  display: inline-flex;
  align-items: center;
  padding: 6px 13px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
}

.priority-low {
  background: #e5f5e9;
  color: #218348;
}

.priority-normal {
  background: #e5efff;
  color: #1765bd;
}

.priority-high {
  background: #fff0dc;
  color: #c46b00;
}

.priority-urgent {
  background: #fde5e5;
  color: #c62828;
}

.ticket-type-pill {
  background: #edf0f5;
  color: #505b6d;
}

.ticket-time {
  color: #697386;
  font-size: 14px;
  white-space: nowrap;
}

.ticket-description {
  color: #252b38;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.5;
  margin-bottom: 9px;
  overflow-wrap: anywhere;
}

.ticket-reference {
  color: #737e91;
  font-size: 14px;
}

@media (max-width: 576px) {
  .ticket-item {
    padding: 14px 15px;
    border-radius: 16px;
  }

  .ticket-description {
    font-size: 16px;
  }

  .ticket-pill {
    padding: 5px 11px;
    font-size: 12px;
  }

  .ticket-time {
    font-size: 13px;
  }

  .ticket-reference {
    font-size: 13px;
  }
}

.ticket-dashboard {
  color: #343a40;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: white;
  border: 1px solid #eee;
  border-radius: 12px;
  height: 100%;
}

.summary-card-active {
  border: 2px solid #3975cf !important;
  background: #f5f8ff;
  box-shadow: 0 3px 10px rgba(57, 117, 207, 0.12);
}

.summary-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.total-card .summary-icon {
  background: #e8f0ff;
  color: #3975cf;
}

.progress-card .summary-icon {
  background: #e7f3ff;
  color: #1683c7;
}

.waiting-card .summary-icon {
  background: #fff3dc;
  color: #d18a13;
}

.completed-card .summary-icon {
  background: #e3f5e9;
  color: #269b53;
}

.summary-label {
  color: #777;
  font-size: 13px;
}

.summary-number {
  font-size: 26px;
  font-weight: 600;
  margin-top: 3px;
}

.type-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 25px;
}

.problem-icon {
  background: #eaf1ff;
  color: #3975cf;
}

.asset-icon {
  background: #e5f6eb;
  color: #269b53;
}

.type-label {
  font-size: 13px;
  white-space: nowrap;
}

.description-column {
  min-width: 180px;
  max-width: 280px;
  white-space: normal;
}

.status-badge {
  display: inline-block;
  border-radius: 20px;
  padding: 5px 10px;
  font-size: 12px;
  white-space: nowrap;
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

.status-approved {
  background: #e1f5e7;
  color: #218348;
}

.status-comment {
  background: #e2f4f7;
  color: #16788a;
}

.status-rejected {
  background: #fde8e8;
  color: #c33;
}

.ticket-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1050;
  background: rgb(0 0 0 / 45%);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 15px;
}

.ticket-modal {
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 12px;
}

.detail-label {
  display: block;
  font-size: 12px;
  color: #888;
  margin-bottom: 5px;
}

.detail-description {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

@media (max-width: 576px) {
  .summary-card {
    padding: 14px;
    gap: 10px;
  }

  .summary-icon {
    width: 40px;
    height: 40px;
    font-size: 19px;
  }

  .summary-number {
    font-size: 22px;
  }
}
</style>
