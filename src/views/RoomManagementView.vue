
<template>
  <div class="container-fluid py-4 room-management">
    <!-- Header -->
    <div
      class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4"
    >
      <div>
        <h4 class="fw-bold mb-1">Room Management</h4>
        <p class="text-muted mb-0">
          Create, view, update, and delete room records.
        </p>
      </div>

      <button
        type="button"
        class="btn btn-primary"
        @click="openCreateForm"
        :disabled="loading || saving"
      >
        <i class="bi bi-plus-lg me-2"></i>
        Add Room
      </button>
    </div>

    <!-- Alert -->
    <div
      v-if="alert.message"
      class="alert alert-dismissible fade show"
      :class="alert.type === 'success' ? 'alert-success' : 'alert-danger'"
      role="alert"
    >
      {{ alert.message }}
      <button
        type="button"
        class="btn-close"
        aria-label="Close"
        @click="alert.message = ''"
      ></button>
    </div>

    <!-- Summary -->
    <div class="row g-3 mb-4">
      <div class="col-12 col-sm-6 col-xl-4">
        <div class="card border-0 shadow-sm rounded-3 h-100">
          <div class="card-body d-flex align-items-center gap-3">
            <div class="summary-icon bg-primary-subtle text-primary">
              <i class="bi bi-door-open"></i>
            </div>
            <div>
              <div class="text-muted small">Total Rooms</div>
              <h4 class="fw-bold mb-0">{{ rooms.length }}</h4>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 col-sm-6 col-xl-4">
        <div class="card border-0 shadow-sm rounded-3 h-100">
          <div class="card-body d-flex align-items-center gap-3">
            <div class="summary-icon bg-success-subtle text-success">
              <i class="bi bi-check-circle"></i>
            </div>
            <div>
              <div class="text-muted small">Available</div>
              <h4 class="fw-bold mb-0">{{ availableCount }}</h4>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 col-sm-6 col-xl-4">
        <div class="card border-0 shadow-sm rounded-3 h-100">
          <div class="card-body d-flex align-items-center gap-3">
            <div class="summary-icon bg-secondary-subtle text-secondary">
              <i class="bi bi-funnel"></i>
            </div>
            <div>
              <div class="text-muted small">Filtered Results</div>
              <h4 class="fw-bold mb-0">{{ filteredRooms.length }}</h4>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="card border-0 shadow-sm rounded-3">
      <div
        class="card-header bg-white border-0 p-3 d-flex flex-wrap justify-content-between align-items-center gap-3"
      >
        <h6 class="fw-bold mb-0">Room Records</h6>

        <div class="d-flex flex-wrap gap-2">
          <div class="search-box">
            <i class="bi bi-search"></i>
            <input
              v-model.trim="search"
              type="search"
              class="form-control"
              placeholder="Search rooms..."
              aria-label="Search rooms"
            />
          </div>

          <select
            v-model="stateFilter"
            class="form-select state-filter"
            aria-label="Filter by state"
          >
            <option value="">All states</option>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
            <option value="maintenance">Maintenance</option>
          </select>

          <button
            type="button"
            class="btn btn-outline-secondary"
            @click="loadRooms"
            :disabled="loading"
            title="Refresh"
          >
            <span
              v-if="loading"
              class="spinner-border spinner-border-sm"
              role="status"
            ></span>
            <i v-else class="bi bi-arrow-clockwise"></i>
          </button>
        </div>
      </div>

      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="text-muted mt-2 mb-0">Loading rooms...</p>
      </div>

      <div v-else-if="loadError" class="text-center py-5 px-3">
        <i class="bi bi-exclamation-circle text-danger fs-2"></i>
        <p class="mt-2 mb-3">{{ loadError }}</p>
        <button class="btn btn-outline-primary" @click="loadRooms">
          Try Again
        </button>
      </div>

      <div v-else-if="filteredRooms.length === 0" class="text-center py-5">
        <i class="bi bi-door-closed text-muted fs-2"></i>
        <p class="text-muted mt-2 mb-0">
          {{ rooms.length ? "No rooms match your search." : "No rooms found." }}
        </p>
      </div>

      <div v-else class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th class="ps-3">#</th>
              <th>Room Name</th>
              <th>Capacity</th>
              <!-- <th>Sign</th> -->
              <!-- <th>State</th> -->
              <th class="text-end pe-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(room, index) in filteredRooms" :key="room.id">
              <td class="ps-3 text-muted">
                {{ index + 1 }}
              </td>

              <td>
                <div class="fw-medium">{{ room.name || "Unnamed room" }}</div>
                <small class="text-muted">ID: {{ room.id }}</small>
              </td>

              <td>{{ room.capacity ?? "—" }}</td>
              <!-- <td>{{ room.sign || "—" }}</td> -->

              <!-- <td>
                <span
                  class="badge rounded-pill"
                  :class="stateBadgeClass(room.state)"
                >
                  {{ formatState(room.state) }}
                </span>
              </td> -->

              <td class="text-end pe-3">
                <div class="d-inline-flex gap-1">
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-primary"
                    title="Edit room"
                    @click="openEditForm(room)"
                    :disabled="saving || deletingId === room.id"
                  >
                    <i class="bi bi-pencil"></i>
                  </button>

                  <button
                    type="button"
                    class="btn btn-sm btn-outline-danger"
                    title="Delete room"
                    @click="deleteRoom(room)"
                    :disabled="saving || deletingId !== null"
                  >
                    <span
                      v-if="deletingId === room.id"
                      class="spinner-border spinner-border-sm"
                    ></span>
                    <i v-else class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        class="card-footer bg-white border-0 text-muted small px-3 py-3"
        v-if="!loading && !loadError"
      >
        Showing {{ filteredRooms.length }} of {{ rooms.length }} rooms
      </div>
    </div>

    <!-- Create / Edit Form -->
    <div
      v-if="showForm"
      class="modal-backdrop-custom"
      @click.self="closeForm"
      @keydown.esc="closeForm"
    >
      <div
        class="room-modal card border-0 shadow-lg rounded-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="room-form-title"
      >
        <div
          class="card-header bg-white border-0 px-4 pt-4 pb-2 d-flex justify-content-between align-items-center"
        >
          <div>
            <h5 id="room-form-title" class="fw-bold mb-1">
              {{ isEditing ? "Edit Room" : "Create Room" }}
            </h5>
            <p class="text-muted small mb-0">
              Enter the room information below.
            </p>
          </div>

          <button
            type="button"
            class="btn-close"
            aria-label="Close"
            @click="closeForm"
            :disabled="saving"
          ></button>
        </div>

        <form @submit.prevent="saveRoom">
          <div class="card-body px-4 py-3">
            <div class="mb-3">
              <label for="room-name" class="form-label fw-semibold">
                Room Name <span class="text-danger">*</span>
              </label>
              <input
                id="room-name"
                v-model.trim="form.name"
                type="text"
                class="form-control"
                placeholder="Enter room name"
                maxlength="120"
                required
                :disabled="saving"
              />
            </div>

            <div class="mb-3">
              <label for="room-capacity" class="form-label fw-semibold">
                Capacity
              </label>
              <input
                id="room-capacity"
                v-model="form.capacity"
                type="number"
                class="form-control"
                placeholder="Number of participants"
                min="0"
                step="1"
                :disabled="saving"
              />
              <small class="text-muted">Enter 0 or greater.</small>
            </div>

            <!-- <div class="mb-3">
              <label for="room-sign" class="form-label fw-semibold">
                Sign
              </label>
              <input
                id="room-sign"
                v-model.trim="form.sign"
                type="text"
                class="form-control"
                placeholder="Enter room sign (optional)"
                :disabled="saving"
              />
            </div> -->

            <div class="mb-2">
              <label for="room-state" class="form-label fw-semibold">
                Availability State
              </label>
              <select
                id="room-state"
                v-model="form.state"
                class="form-select"
                :disabled="saving"
              >
                <option value="">Not specified</option>
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            <div v-if="formError" class="alert alert-danger py-2 mt-3 mb-0">
              {{ formError }}
            </div>
          </div>

          <div
            class="card-footer bg-white border-0 px-4 pb-4 d-flex justify-content-end gap-2"
          >
            <button
              type="button"
              class="btn btn-light"
              @click="closeForm"
              :disabled="saving"
            >
              Cancel
            </button>

            <button
              type="submit"
              class="btn btn-primary"
              :disabled="saving"
            >
              <span
                v-if="saving"
                class="spinner-border spinner-border-sm me-2"
              ></span>
              {{ saving ? "Saving..." : isEditing ? "Save Changes" : "Create Room" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import {
  getRoomManagement,
  createRoomManagement,
  updateRoomManagement,
  deleteRoomManagement,
} from "../api/axios";

const rooms = ref([]);
const loading = ref(false);
const saving = ref(false);
const deletingId = ref(null);
const loadError = ref("");
const search = ref("");
const stateFilter = ref("");

const showForm = ref(false);
const isEditing = ref(false);
const editingId = ref(null);
const formError = ref("");

const alert = ref({
  type: "success",
  message: "",
});

const emptyForm = () => ({
  name: "",
  capacity: "",
  sign: "",
  state: "available",
});

const form = ref(emptyForm());

const filteredRooms = computed(() => {
  const keyword = search.value.toLowerCase();

  return rooms.value.filter((room) => {
    const matchesSearch =
      !keyword ||
      String(room.name || "").toLowerCase().includes(keyword) ||
      String(room.sign || "").toLowerCase().includes(keyword) ||
      String(room.id).includes(keyword);

    const matchesState =
      !stateFilter.value ||
      String(room.state || "").toLowerCase() === stateFilter.value;

    return matchesSearch && matchesState;
  });
});

const availableCount = computed(
  () =>
    rooms.value.filter(
      (room) => String(room.state || "").toLowerCase() === "available"
    ).length
);

function extractRecords(response) {
  // Supports common JSON response shapes:
  // { data: [...] }, { rooms: [...] }, or [...]
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.rooms)) return response.rooms;
  if (Array.isArray(response?.result)) return response.result;

  return [];
}

function errorMessage(error) {
  const data = error?.response?.data;

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  return (
    data?.message ||
    data?.error ||
    error?.message ||
    "An unexpected error occurred. Please try again."
  );
}

function showAlert(message, type = "success") {
  alert.value = { message, type };
}

async function loadRooms() {
  loading.value = true;
  loadError.value = "";

  try {
    const response = await getRoomManagement();

    if (response?.status === false || response?.success === false) {
      throw new Error(response.message || "Unable to load rooms.");
    }

    rooms.value = extractRecords(response);
  } catch (error) {
    loadError.value = errorMessage(error);
    rooms.value = [];
  } finally {
    loading.value = false;
  }
}

function openCreateForm() {
  isEditing.value = false;
  editingId.value = null;
  form.value = emptyForm();
  formError.value = "";
  showForm.value = true;
}

function openEditForm(room) {
  isEditing.value = true;
  editingId.value = room.id;

  form.value = {
    name: room.name || "",
    capacity: room.capacity ?? "",
    sign: room.sign || "",
    state: room.state || "",
  };

  formError.value = "";
  showForm.value = true;
}

function closeForm() {
  if (saving.value) return;

  showForm.value = false;
  formError.value = "";
}

function validateForm() {
  if (!form.value.name.trim()) {
    formError.value = "Please enter the room name.";
    return false;
  }

  if (
    form.value.capacity !== "" &&
    (!Number.isInteger(Number(form.value.capacity)) ||
      Number(form.value.capacity) < 0)
  ) {
    formError.value = "Capacity must be a whole number greater than or equal to 0.";
    return false;
  }

  return true;
}

async function saveRoom() {
  formError.value = "";

  if (!validateForm()) return;

  const payload = {
    name: form.value.name.trim(),
    capacity:
      form.value.capacity === "" ? null : Number(form.value.capacity),
    sign: form.value.sign.trim(),
    state: form.value.state || null,
  };

  if (isEditing.value) {
    payload.id = editingId.value;
  }

  saving.value = true;

  try {
    const response = isEditing.value
      ? await updateRoomManagement(payload)
      : await createRoomManagement(payload);

    if (response?.status === false || response?.success === false) {
      throw new Error(response.message || "Unable to save the room.");
    }

    showForm.value = false;

    showAlert(
      response?.message ||
        (isEditing.value
          ? "Room updated successfully."
          : "Room created successfully.")
    );

    await loadRooms();
  } catch (error) {
    formError.value = errorMessage(error);
  } finally {
    saving.value = false;
  }
}

async function deleteRoom(room) {
  const confirmed = window.confirm(
    `Delete room "${room.name}" (ID: ${room.id})?\n\nThis action cannot be undone.`
  );

  if (!confirmed) return;

  deletingId.value = room.id;
  alert.value.message = "";

  try {
    const response = await deleteRoomManagement(room.id);

    if (response?.status === false || response?.success === false) {
      throw new Error(response.message || "Unable to delete the room.");
    }

    showAlert(response?.message || "Room deleted successfully.");
    await loadRooms();
  } catch (error) {
    showAlert(errorMessage(error), "error");
  } finally {
    deletingId.value = null;
  }
}

function formatState(state) {
  if (!state) return "Not specified";

  const labels = {
    available: "Available",
    unavailable: "Unavailable",
    maintenance: "Maintenance",
  };

  return labels[String(state).toLowerCase()] || String(state);
}

function stateBadgeClass(state) {
  const value = String(state || "").toLowerCase();

  if (value === "available") return "text-bg-success";
  if (value === "maintenance") return "text-bg-warning";
  if (value === "unavailable") return "text-bg-secondary";

  return "text-bg-light border text-dark";
}

onMounted(loadRooms);
</script>

<style scoped>
.room-management {
  min-width: 0;
}

.summary-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.35rem;
  flex-shrink: 0;
}

.search-box {
  position: relative;
  min-width: 220px;
}

.search-box > i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  pointer-events: none;
}

.search-box .form-control {
  padding-left: 36px;
}

.state-filter {
  width: auto;
  min-width: 145px;
}

.table th {
  font-size: 0.82rem;
  font-weight: 600;
  white-space: nowrap;
}

.table td {
  font-size: 0.9rem;
  font-weight: 400;
}

.modal-backdrop-custom {
  position: fixed;
  inset: 0;
  z-index: 1055;
  background: rgb(0 0 0 / 45%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  overflow-y: auto;
}

.room-modal {
  width: 100%;
  max-width: 520px;
  max-height: calc(100vh - 32px);
  overflow-y: auto;
  margin: auto;
}

@media (max-width: 576px) {
  .search-box {
    width: 100%;
    min-width: 0;
  }

  .state-filter {
    flex: 1;
    min-width: 0;
  }

  .room-modal {
    max-height: calc(100dvh - 24px);
  }
}
</style>
