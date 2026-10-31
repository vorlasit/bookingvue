<!-- /home/admin_kc/vuejs/smartbooking/src/views/TicketITView.vue -->
<template>
  <div class="container-fluid py-4">
    <!-- Header -->
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div>
        <h4 class="mb-1">Ticket IT Management</h4>
        <p class="text-muted mb-0">Manage and update employee problem reports.</p>
      </div>

      <button class="btn btn-outline-secondary" @click="loadTickets">
        <i class="bi bi-arrow-clockwise me-1"></i>
        Refresh
      </button>
    </div>

    <!-- Statistics -->
    <!-- Statistics -->
    <div class="row g-3 mb-4">
      <div class="col-6 col-xl-3">
        <div class="stat-card" :class="{ 'stat-card-active': activeFilter === 'all' }" @click="setFilter('all')">
          <div class="stat-label">Total Tickets</div>
          <div class="stat-number">{{ tickets.length }}</div>
        </div>
      </div>

      <div class="col-6 col-xl-3">
        <div class="stat-card" :class="{ 'stat-card-active': activeFilter === 'in_progress' }"
          @click="setFilter('in_progress')">
          <div class="stat-label">In Progress</div>
          <div class="stat-number text-primary">
            {{ countState('in_progress') }}
          </div>
        </div>
      </div>

      <div class="col-6 col-xl-3">
        <div class="stat-card" :class="{ 'stat-card-active': activeFilter === 'done' }" @click="setFilter('done')">
          <div class="stat-label">Done</div>
          <div class="stat-number text-success">
            {{ countState('done') }}
          </div>
        </div>
      </div>

      <div class="col-6 col-xl-3">
        <div class="stat-card" :class="{ 'stat-card-active': activeFilter === 'rejected' }"
          @click="setFilter('rejected')">
          <div class="stat-label">Rejected</div>
          <div class="stat-number text-danger">
            {{ countState('rejected') }}
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="card border-0 shadow-sm">
      <div class="card-body">
        <div class="row g-3 mb-3">
          <div class="col-md-5">
            <input v-model="searchText" type="text" class="form-control"
              placeholder="Search ticket, employee or description..." />
          </div>

          <!-- <div class="col-md-4">
            <select v-model="activeFilter" class="form-select">
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
              <option value="rejected">Rejected</option>
            </select>
          </div> -->
        </div>

        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary"></div>
          <p class="text-muted mt-2">Loading tickets...</p>
        </div>

        <div v-else-if="errorMessage" class="alert alert-danger">
          {{ errorMessage }}
          <button class="btn btn-sm btn-outline-danger ms-2" @click="loadTickets">
            Retry
          </button>
        </div>

        <div v-else-if="filteredTickets.length === 0" class="text-center py-5">
          <i class="bi bi-inbox display-5 text-muted"></i>
          <p class="text-muted mt-3 mb-0">No tickets found.</p>
        </div>
       <div v-else class="ticket-list"> 
            <div v-for="ticket in filteredTickets" :key="ticket.id" class="ticket-item" @click="openTicket(ticket)"> 
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
                <span>{{ ticket.ticket_number || formatTicketNumber(ticket.id) }}</span>  &nbsp;

                <span class="badge bg-info" v-if="ticket.employee_name || ticket.req_employee_name">
                   {{ ticket.employee_name || ticket.req_employee_name || '-' }}
                </span> 
              </div>

            </div>
        </div>

        <div class="text-muted small mt-2">
          Showing {{ filteredTickets.length }} of {{ tickets.length }} tickets
        </div>
      </div>
    </div>

    <!-- Detail / Update Modal -->
    <div v-if="selectedTicket" class="modal-backdrop-custom" @click.self="closeModal">
      <div class="card ticket-modal border-0 shadow">
        <div class="card-header bg-white d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Ticket #{{ selectedTicket.id }}</h5>
          <button class="btn-close" @click="closeModal"></button>
        </div>

        <div class="card-body">
          <div class="mb-3">
            <label class="detail-label">Employee</label>
            <div>
              {{ selectedTicket.req_employee_name || selectedTicket.employee_name || '-' }}
            </div>
          </div>

          <div class="mb-3">
            <label class="detail-label">Department</label>
            <div>{{ selectedTicket.department_name || '-' }}</div>
          </div>

          <div class="mb-3">
            <label class="detail-label">Description</label>
            <div class="description-box">
              {{ selectedTicket.description || '-' }}
            </div>
          </div>

          <div class="row g-3 mb-3">
            <div class="col-6">
              <label class="detail-label">Priority</label>
              <div>{{ selectedTicket.priority || '-' }}</div>
            </div>

            <div class="col-6">
              <label class="detail-label">Request Date</label>
              <div>{{ formatDate(selectedTicket.date) }}</div>
            </div>
          </div>

          <div class="mb-3">
            <label class="detail-label">Current Status</label>
            <div>
              <span class="status-badge" :class="statusClass(selectedTicket.state)">
                {{ formatStatus(selectedTicket.state) }}
              </span>
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label">Admin Note / Solution</label>
            <textarea v-model="adminNote" class="form-control" rows="3"
              placeholder="Enter solution or rejection reason..."></textarea>
          </div>

          <div v-if="actionError" class="alert alert-danger py-2">
            {{ actionError }}
          </div>
        </div>

        <div class="card-footer bg-white">
          <div class="d-flex flex-wrap justify-content-end gap-2">
            <button class="btn btn-outline-secondary" :disabled="updating" @click="closeModal">
              Cancel
            </button>

            <button class="btn btn-primary" :disabled="updating" @click="updateStatus('in_progress')" v-if="selectedTicket.state === 'draft'">
              <i class="bi bi-arrow-repeat me-1"></i>
              In Progress
            </button>

            <button class="btn btn-success" :disabled="updating" @click="updateStatus('done')" v-if="selectedTicket.state === 'in_progress'">
              <i class="bi bi-check-circle me-1"></i>
              Done
            </button>

            <button class="btn btn-danger" :disabled="updating" @click="updateStatus('rejected')"  v-if="selectedTicket.state === 'draft'">
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import {
  getITTicketRequirements,
  updateTicketRequirementStatus,
} from "../api/ticket";

const tickets = ref([]);
const loading = ref(false);
const updating = ref(false);
const errorMessage = ref("");
const actionError = ref("");

const selectedTicket = ref(null);
const adminNote = ref("");

const searchText = ref("");
const activeFilter = ref("all");
function setFilter(state) {
  activeFilter.value = state;
}
async function loadTickets() {
  loading.value = true;
  errorMessage.value = "";

  try {
    const response = await getITTicketRequirements();

    if (response.status === false) {
      throw new Error(response.message || "Unable to load tickets.");
    }

    tickets.value = response.tickets || [];
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message ||
      error.message ||
      "Failed to load tickets.";
  } finally {
    loading.value = false;
  }
}

const filteredTickets = computed(() => {
  let result = [...tickets.value];

  if (activeFilter.value !== "all") {
    result = result.filter(
      ticket => ticket.state === activeFilter.value
    );
  }

  const keyword = searchText.value.trim().toLowerCase();

  if (keyword) {
    result = result.filter(ticket =>
      String(ticket.id).includes(keyword) ||
      String(ticket.description || "").toLowerCase().includes(keyword) ||
      String(ticket.req_employee_name || ticket.employee_name || "")
        .toLowerCase().includes(keyword)
    );
  }

  return result.sort((a, b) => b.id - a.id);
});

function countState(state) {
  return tickets.value.filter(ticket => ticket.state === state).length;
}

function openTicket(ticket) {
  selectedTicket.value = ticket;
  adminNote.value = ticket.solution || "";
  actionError.value = "";
}

function closeModal() {
  if (updating.value) return;

  selectedTicket.value = null;
  adminNote.value = "";
  actionError.value = "";
}

async function updateStatus(newState) {
  if (!selectedTicket.value) return;

  actionError.value = "";

  if (newState === "rejected" && !adminNote.value.trim()) {
    actionError.value = "Please enter a reason for rejection.";
    return;
  }

  const ticketId = selectedTicket.value.id;

  const labels = {
    in_progress: "In Progress",
    done: "Done",
    rejected: "Rejected",
  };

  if (!window.confirm(`Change ticket #${ticketId} to ${labels[newState]}?`)) {
    return;
  }

  updating.value = true;

  try {
    const response = await updateTicketRequirementStatus({
      id: ticketId,
      state: newState,
      solution: adminNote.value,
    });

    if (response.status === false) {
      throw new Error(response.message || "Unable to update ticket.");
    }

    // Update ticket in the table
    const index = tickets.value.findIndex(
      ticket => ticket.id === ticketId
    );

    if (index !== -1) {
      tickets.value[index] = {
        ...tickets.value[index],
        state: newState,
        solution: adminNote.value,
      };
    }

    // Close modal after successful update
    selectedTicket.value = null;
    adminNote.value = "";
    actionError.value = "";

  } catch (error) {
    actionError.value =
      error.response?.data?.message ||
      error.message ||
      "Failed to update ticket.";
  } finally {
    updating.value = false;
  }
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

function priorityClass(value) {
  const classes = {
    low: "bg-secondary",
    normal: "bg-info text-dark",
    high: "bg-warning text-dark",
    urgent: "bg-danger",
  };

  return classes[value] || "bg-secondary";
}
function priorityCardClass(value) {
  const classes = {
    low: "priority-low",
    normal: "priority-normal",
    high: "priority-high",
    urgent: "priority-urgent",
  };

  return classes[String(value || "").toLowerCase()] || "priority-normal";
}

function formatPriorityCard(value) {
  if (!value) return "Normal";

  const labels = {
    low: "Low",
    normal: "Normal",
    high: "High",
    urgent: "Urgent",
  };

  return labels[String(value).toLowerCase()] || value;
}

function formatType(value) {
  if (!value) return "General";

  const labels = {
    asset_request: "Asset Request",
    problem: "Problem",
    it: "IT Support",
  };

  return labels[String(value).toLowerCase()] || String(value).replaceAll("_", " ");
}

function getTargetReference(ticket) {
  return (
    ticket.target_name ||
    ticket.target_reference ||
    ticket.target ||
    ""
  );
}

function formatTicketNumber(id) {
  return `TKT-${String(id || 0).padStart(5, "0")}`;
}
onMounted(loadTickets);
</script>

<style scoped>
.ticket-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ticket-item {
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #fff;
  cursor: pointer;
  transition: background 0.2s ease, box-shadow 0.2s ease;
}

.ticket-item:hover {
  background: #f9fafb;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.06);
}

.ticket-item-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 12px;
}

.ticket-pill {
  display: inline-flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 400;
}

.priority-low {
  background: #e5e7eb;
  color: #374151;
}

.priority-normal {
  background: #dbeafe;
  color: #1d4ed8;
}

.priority-high {
  background: #fef3c7;
  color: #92400e;
}

.priority-urgent {
  background: #fee2e2;
  color: #b91c1c;
}

.ticket-type-pill {
  background: #f3e8ff;
  color: #7e22ce;
}

.ticket-time {
  color: #6b7280;
  font-size: 12px;
}

.ticket-description {
  margin-bottom: 10px;
  font-size: 14px;
  overflow-wrap: anywhere;
}

.ticket-reference {
  color: #6b7280;
  font-size: 12px;
}
.stat-card {
  padding: 18px;
  border: 1px solid #eee;
  border-radius: 12px;
  background: #fff;
  height: 100%;
  cursor: pointer;
  transition: all 0.2s ease;
}

.stat-card:hover {
  border-color: #3975cf;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.stat-card-active {
  border: 2px solid #3975cf;
  background: #f5f8ff;
}

.stat-label {
  color: #777;
  font-size: 13px;
}

.stat-number {
  font-size: 27px;
  font-weight: 600;
  margin-top: 5px;
}

.description-cell {
  min-width: 180px;
  max-width: 300px;
  white-space: normal;
}

.status-badge {
  display: inline-block;
  padding: 5px 10px;
  border-radius: 20px;
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

.status-done {
  background: #e1f5e7;
  color: #218348;
}

.status-rejected {
  background: #fde8e8;
  color: #c33;
}

.modal-backdrop-custom {
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
  max-width: 650px;
  max-height: 92vh;
  overflow-y: auto;
  border-radius: 12px;
}

.detail-label {
  display: block;
  color: #888;
  font-size: 12px;
  margin-bottom: 5px;
}

.description-box {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
</style>
