<template>
  <div class="container-fluid min-vh-100 bg-light py-4">

    <!-- Header -->
    <div class="row justify-content-center mb-4">
      <div class="col-xl-11 col-12">

        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">

          <div>
            <h4 class="fw-bold mb-1 text-dark">
              <i class="bi bi-car-front-fill text-primary me-2"></i>
              ຈັດການລົດ
            </h4>

            <p class="text-muted small mb-0">
              ເພີ່ມ, ແກ້ໄຂ ແລະ ລົບຂໍ້ມູນລົດ
            </p>
          </div>

          <div class="d-flex gap-2">
            <button
              class="btn btn-outline-secondary"
              @click="loadCars"
              :disabled="loading"
            >
              <i class="bi bi-arrow-clockwise me-1"></i>
              ໂຫຼດໃໝ່
            </button>

            <button
              class="btn btn-primary"
              @click="openCreateModal"
            >
              <i class="bi bi-plus-lg me-1"></i>
              ເພີ່ມລົດ
            </button>
          </div>

        </div>

      </div>
    </div>


    <!-- Error -->
    <div class="row justify-content-center">
      <div class="col-xl-11 col-12">

        <div
          v-if="errorMessage"
          class="alert alert-danger alert-dismissible fade show"
        >
          <i class="bi bi-exclamation-triangle-fill me-2"></i>
          {{ errorMessage }}

          <button
            type="button"
            class="btn-close"
            @click="errorMessage = ''"
          ></button>
        </div>

      </div>
    </div>


    <!-- Summary -->
    <div class="row justify-content-center mb-4">
      <div class="col-xl-11 col-12">

        <div class="row g-3">

          <div class="col-6 col-md-3">
            <div class="card border-0 shadow-sm rounded-3 h-100">
              <div class="card-body">
                <div class="text-muted small">
                  ລົດທັງໝົດ
                </div>

                <div class="fs-3 fw-bold text-dark">
                  {{ cars.length }}
                </div>
              </div>
            </div>
          </div>

          <div class="col-6 col-md-3">
            <div class="card border-0 shadow-sm rounded-3 h-100">
              <div class="card-body">
                <div class="text-muted small">
                  ພ້ອມໃຊ້ງານ
                </div>

                <div class="fs-3 fw-bold text-success">
                  {{ availableCount }}
                </div>
              </div>
            </div>
          </div>

          <div class="col-6 col-md-3">
            <div class="card border-0 shadow-sm rounded-3 h-100">
              <div class="card-body">
                <div class="text-muted small">
                  ບໍ່ວ່າງ
                </div>

                <div class="fs-3 fw-bold text-warning">
                  {{ unavailableCount }}
                </div>
              </div>
            </div>
          </div>

          <div class="col-6 col-md-3">
            <div class="card border-0 shadow-sm rounded-3 h-100">
              <div class="card-body">
                <div class="text-muted small">
                  ບຳລຸງຮັກສາ
                </div>

                <div class="fs-3 fw-bold text-danger">
                  {{ maintenanceCount }}
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>


    <!-- Search -->
    <div class="row justify-content-center mb-3">
      <div class="col-xl-11 col-12">

        <div class="card border-0 shadow-sm rounded-3">
          <div class="card-body">

            <div class="row g-2">

              <div class="col-md-6">
                <div class="input-group">

                  <span class="input-group-text bg-white">
                    <i class="bi bi-search"></i>
                  </span>

                  <input
                    v-model="search"
                    type="text"
                    class="form-control"
                    placeholder="ຄົ້ນຫາຊື່ລົດ, ຍີ່ຫໍ້, ທະບຽນ..."
                  />

                </div>
              </div>

              <div class="col-md-3">

                <select
                  v-model="stateFilter"
                  class="form-select"
                >
                  <option value="">ສະຖານະທັງໝົດ</option>
                  <option value="available">ພ້ອມໃຊ້ງານ</option>
                  <option value="unavailable">ບໍ່ວ່າງ</option>
                  <option value="maintenance">ບຳລຸງຮັກສາ</option>
                  <option value="cancelled">ຍົກເລີກ</option>
                </select>

              </div>
              <!-- Search by Type -->
              <div class="col-md-3">
                <select
                  v-model="typeFilter"
                  class="form-select"
                >
                  <option value="">ປະເພດລົດທັງໝົດ</option>
                  <option value="car">ເກງ</option>
                  <option value="van">ຕູ້</option>
                  <option value="pickup">ກະບະ</option>
                  <option value="truck">ບັນທຸກ</option>
                  <option value="compact">ກະປ໋ອງ</option>
                  <option value="jeep">ຈິບ</option>
                  <option value="motorbike">ລົດຈັກ</option> 
                </select>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>


    <!-- Loading -->
    <div
      v-if="loading"
      class="row justify-content-center"
    >
      <div class="col-xl-11 col-12">

        <div class="card border-0 shadow-sm rounded-3">
          <div class="card-body text-center py-5">

            <div
              class="spinner-border text-primary"
              role="status"
            ></div>

            <p class="text-muted mt-3 mb-0">
              ກຳລັງໂຫຼດຂໍ້ມູນລົດ...
            </p>

          </div>
        </div>

      </div>
    </div>


    <!-- Empty -->
    <div
      v-else-if="filteredCars.length === 0"
      class="row justify-content-center"
    >
      <div class="col-xl-11 col-12">

        <div class="card border-0 shadow-sm rounded-3">
          <div class="card-body text-center py-5">

            <i class="bi bi-car-front fs-1 text-muted"></i>

            <h6 class="fw-bold mt-3">
              ບໍ່ພົບຂໍ້ມູນລົດ
            </h6>

            <p class="text-muted small">
              ລອງປ່ຽນຄຳຄົ້ນຫາ ຫຼື ເພີ່ມລົດໃໝ່
            </p>

          </div>
        </div>

      </div>
    </div>


    <!-- Cars -->
    <div
      v-else
      class="row justify-content-center"
    >
      <div class="col-xl-11 col-12">

        <div class="row g-3">

          <div
            v-for="car in filteredCars"
            :key="car.id"
            class="col-12 col-md-6 col-xl-4"
          >

            <div class="card car-card border-0 shadow-sm rounded-3 h-100">

              <!-- Image -->
              <div class="car-image-wrapper">

                <img
                  v-if="car.image"
                  :src="getImageUrl(car.image)"
                  class="car-image"
                  alt="car"
                />

                <div
                  v-else
                  class="car-image-placeholder"
                >
                  <i class="bi bi-car-front-fill"></i>
                </div>

                <span
                  class="position-absolute top-0 end-0 m-3 badge"
                  :class="stateBadgeClass(car.state)"
                >
                  {{ stateLabel(car.state) }}
                </span>

              </div>


              <!-- Body -->
              <div class="card-body">

                <div class="d-flex justify-content-between align-items-start gap-2">

                  <div>
                    <h5 class="fw-bold mb-1">
                      {{ car.name || '-' }}
                    </h5>

                    <div class="text-muted small">
                      {{ car.brand_name || 'ບໍ່ມີຍີ່ຫໍ້' }}
                    </div>
                  </div>

                  <div class="text-end">
                    <div class="fw-bold text-primary">
                      {{ car.sign || '-' }}
                    </div>

                    <small class="text-muted">
                      ທະບຽນ
                    </small>
                  </div>

                </div>


                <hr>


                <div class="row g-2 small">

                  <div class="col-6">
                    <div class="text-muted">
                      <i class="bi bi-people me-1"></i>
                      ຈຸ
                    </div>

                    <strong>
                      {{ car.capacity || 0 }} ຄົນ
                    </strong>
                  </div>


                  <div class="col-6">
                    <div class="text-muted">
                      <i class="bi bi-car-front me-1"></i>
                      ປະເພດ
                    </div>

                    <strong>
                      {{ vehicleTypeLabel(car.vehicle_type) }}
                    </strong>
                  </div>


                  <div class="col-6">
                    <div class="text-muted">
                      <i class="bi bi-palette me-1"></i>
                      ສີ
                    </div>

                    <strong>
                      {{ car.color || '-' }}
                    </strong>
                  </div>


                  <div class="col-6">
                    <div class="text-muted">
                      <i class="bi bi-person me-1"></i>
                      ຜູ້ຮັບຜິດຊອບ
                    </div>

                    <strong>
                      {{ car.responsive_name || '-' }}
                    </strong>
                  </div>

                  <div class="col-6">
                    <div class="text-muted">
                      <i class="bi bi-person me-1"></i>
                      ເລກຖັງ
                    </div>

                    <strong>
                      {{ car.number_tanks || '-' }}
                    </strong>
                  </div> 
                  <div class="col-6">
                    <div class="text-muted">
                      <i class="bi bi-person me-1"></i>
                      ເລກຈັກ
                    </div>

                    <strong>
                      {{ car.number_motor || '-' }}
                    </strong>
                  </div> 

                </div> 


                <!-- <div
                  v-if="car.problem_ids?.length"
                  class="mt-3"
                >
                  <span
                    v-for="problem in car.problem_ids"
                    :key="problem.id"
                    class="badge bg-danger-subtle text-danger me-1"
                  >
                    {{ problem.name }}
                  </span>
                </div> -->
<div
  v-if="car.problem_ids?.length"
  class="mt-3"
>
  <button
    type="button"
    class="btn btn-sm btn-danger"
    @click="showProblems(car)"
  >
    <i class="bi bi-exclamation-triangle me-1"></i>
    {{ car.problem_ids.length }} ບັນຫາ
  </button>
</div>
              </div>


              <!-- Footer -->
              <div class="card-footer bg-white border-0 pt-0 pb-3 px-3">

                <div class="d-flex gap-2">

                  <button
                    class="btn btn-outline-primary btn-sm flex-fill"
                    @click="openEditModal(car)"
                  >
                    <i class="bi bi-pencil me-1"></i>
                    ແກ້ໄຂ
                  </button>

                  <button
                    class="btn btn-outline-danger btn-sm"
                    @click="confirmDelete(car)"
                  >
                    <i class="bi bi-trash"></i>
                  </button>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
<!-- Problem Modal -->
<div
  v-if="showProblemModal"
  class="modal fade show d-block"
  tabindex="-1"
  style="background: rgba(0, 0, 0, 0.6);"
  @click.self="closeProblems"
>
  <div class="modal-dialog modal-lg modal-dialog-centered">
    <div class="modal-content">

      <div class="modal-header">
        <div>
          <h5 class="modal-title fw-bold">
            <i class="bi bi-exclamation-triangle text-danger me-2"></i>
            ລາຍການບັນຫາລົດ
          </h5>

          <small
            v-if="selectedCar"
            class="text-muted"
          >
            {{ selectedCar.name }}
            <span v-if="selectedCar.sign">
              - {{ selectedCar.sign }}
            </span>
          </small>
        </div>

        <button
          type="button"
          class="btn-close"
          @click="closeProblems"
        ></button>
      </div>

      <div class="modal-body">

        <div
          v-if="selectedCar?.problem_ids?.length"
          class="row g-3"
        >
          <div
            v-for="problem in selectedCar.problem_ids"
            :key="problem.id"
            class="col-md-6"
          >
            <div class="card h-100 border-danger shadow-sm">

              <!-- Problem image -->
              <div
                v-if="problem.image"
                class="problem-image-wrapper"
              >
                <img
                  :src="getProblemImage(problem.image)"
                  class="problem-image"
                  :alt="problem.name"
                />
              </div>

              <!-- No image -->
              <div
                v-else
                class="problem-no-image"
              >
                <i class="bi bi-image text-muted fs-1"></i>
                <small class="text-muted">
                  ບໍ່ມີຮູບ
                </small>
              </div>

              <div class="card-body">
                <h6 class="fw-bold text-danger mb-2">
                  {{ problem.name }}
                </h6>

                <div
                  v-if="problem.description"
                  class="text-muted small"
                >
                  {{ problem.description }}
                </div>
              </div>

            </div>
          </div>
        </div>

        <div
          v-else
          class="text-center py-4 text-muted"
        >
          <i class="bi bi-check-circle fs-1 text-success"></i>
          <p class="mt-2 mb-0">
            ບໍ່ພົບບັນຫາ
          </p>
        </div>

      </div>

      <div class="modal-footer">
        <button
          type="button"
          class="btn btn-secondary"
          @click="closeProblems"
        >
          ປິດ
        </button>
      </div>

    </div>
  </div>
</div>

    <!-- ====================================================== -->
    <!-- CREATE / EDIT MODAL -->
    <!-- ====================================================== -->

    <div
      v-if="showModal"
      class="modal-backdrop-custom"
      @click.self="closeModal"
    >

      <div class="modal-dialog-custom">

        <div class="modal-content border-0 shadow-lg rounded-4">

          <!-- Modal Header -->
          <div class="modal-header border-0 px-4 pt-4">

            <div>
              <h5 class="modal-title fw-bold">
                <i
                  class="bi bi-car-front-fill text-primary me-2"
                ></i>

                {{ editingCar ? 'ແກ້ໄຂຂໍ້ມູນລົດ' : 'ເພີ່ມລົດໃໝ່' }}
              </h5>

              <small class="text-muted">
                {{ editingCar ? 'ປັບປຸງຂໍ້ມູນລົດ' : 'ກອກຂໍ້ມູນລົດໃໝ່' }}
              </small>
            </div>

            <button
              type="button"
              class="btn-close"
              @click="closeModal"
            ></button>

          </div>


          <!-- Modal Body -->
          <div class="modal-body px-4">

            <form @submit.prevent="saveCar">

              <div class="row g-3">

                <!-- Name -->
                <div class="col-12">

                  <label class="form-label fw-semibold">
                    ຊື່ລົດ
                    <span class="text-danger">*</span>
                  </label>

                  <input
                    v-model="form.name"
                    type="text"
                    class="form-control"
                    placeholder="ເຊັ່ນ Toyota Fortuner"
                    required
                  >

                </div>


                <!-- Brand -->
                <div class="col-md-6">

                  <label class="form-label fw-semibold">
                    ຍີ່ຫໍ້
                  </label>

                  <input
                    v-model.number="form.brand_id"
                    type="number"
                    class="form-control"
                    placeholder="Brand ID"
                  >

                </div>


                <!-- Sign -->
                <div class="col-md-6">

                  <label class="form-label fw-semibold">
                    ປ້າຍທະບຽນ
                  </label>

                  <input
                    v-model="form.sign"
                    type="text"
                    class="form-control"
                    placeholder="ເຊັ່ນ ກກ 1234"
                  >

                </div>


                <!-- Capacity -->
                <div class="col-md-6">

                  <label class="form-label fw-semibold">
                    ຈຳນວນບ່ອນນັ່ງ
                  </label>

                  <input
                    v-model.number="form.capacity"
                    type="number"
                    min="0"
                    class="form-control"
                    placeholder="7"
                  >

                </div>


                <!-- Vehicle Type -->
                <div class="col-md-6">

                  <label class="form-label fw-semibold">
                    ປະເພດລົດ
                  </label>

                  <select
                    v-model="form.vehicle_type"
                    class="form-select"
                  >
                    <option value="car">Car</option>
                    <option value="van">Van</option>
                    <option value="pickup">Pickup</option>
                    <option value="truck">Truck</option>
                    <option value="compact">Compact</option>
                    <option value="jeep">Jeep</option>
                    <option value="motorbike">Motorbike</option>
                    <option value="bicycle">Bicycle</option>
                  </select>

                </div>


                <!-- Color -->
                <div class="col-md-6">

                  <label class="form-label fw-semibold">
                    ສີ
                  </label>

                  <input
                    v-model="form.color"
                    type="text"
                    class="form-control"
                    placeholder="White"
                  >

                </div>


                <!-- State -->
                <div class="col-md-6">

                  <label class="form-label fw-semibold">
                    ສະຖານະ
                  </label>

                  <select
                    v-model="form.state"
                    class="form-select"
                  >
                    <option value="available">
                      ພ້ອມໃຊ້ງານ
                    </option>

                    <option value="unavailable">
                      ບໍ່ວ່າງ
                    </option>

                    <option value="maintenance">
                      ບຳລຸງຮັກສາ
                    </option>

                    <option value="cancelled">
                      ຍົກເລີກ
                    </option>
                  </select>

                </div>


                <!-- Use Type -->
                <div class="col-md-6">

                  <label class="form-label fw-semibold">
                    ຮູບແບບການໃຊ້
                  </label>

                  <select
                    v-model="form.use_type"
                    class="form-select"
                  >
                    <option value="borrow">
                      Borrow
                    </option>

                    <option value="personal">
                      Personal
                    </option>
                  </select>

                </div>


                <!-- Motor -->
                <div class="col-md-6">

                  <label class="form-label fw-semibold">
                    ເລກ Motor
                  </label>

                  <input
                    v-model="form.number_motor"
                    type="text"
                    class="form-control"
                  >

                </div>


                <!-- Tanks -->
                <div class="col-md-6">

                  <label class="form-label fw-semibold">
                    ເລກຖັງ
                  </label>

                  <input
                    v-model="form.number_tanks"
                    type="text"
                    class="form-control"
                  >

                </div>


                <!-- Tall Type -->
                <div class="col-md-6">

                  <label class="form-label fw-semibold">
                    Tall Type
                  </label>

                  <select
                    v-model="form.tall_type"
                    class="form-select"
                  >
                    <option value="short">
                      Short
                    </option>

                    <option value="tall">
                      Tall
                    </option>
                  </select>

                </div>


                <!-- Responsible User --> 
<div class="col-md-4">
  <label class="form-label fw-semibold">
    ຜູ້ຮັບຜິດຊອບ
  </label>

  <div class="position-relative">
    <div
      class="form-control d-flex align-items-center gap-2"
      style="cursor: text; min-height: 38px;"
      @click="showResponsiveDropdown = true"
    >
      <i class="bi bi-person text-muted"></i>

      <!-- Selected responsible user -->
      <span v-if="responsiveFilter" class="flex-grow-1">
        {{ responsiveFilter.name }}
      </span>

      <!-- Search input -->
      <input
        v-else
        v-model="responsiveSearch"
        type="text"
        class="border-0 flex-grow-1"
        style="outline: none; min-width: 0;"
        placeholder="ຄົ້ນຫາຜູ້ຮັບຜິດຊອບ..."
        @focus="showResponsiveDropdown = true"
        @input="showResponsiveDropdown = true"
        @keydown.esc="showResponsiveDropdown = false"
      />

      <!-- Clear selected user -->
      <button
        v-if="responsiveFilter"
        type="button"
        class="btn btn-sm p-0 ms-auto"
        @click.stop="
          responsiveFilter = null;
          form.responsive_uid = null;
          responsiveSearch = '';
          showResponsiveDropdown = true;
        "
      >
        <i class="bi bi-x-circle text-muted"></i>
      </button>

      <i
        v-else
        class="bi bi-chevron-down ms-auto text-muted"
      ></i>
    </div>

    <!-- User dropdown -->
    <div
      v-if="showResponsiveDropdown"
      class="dropdown-menu show w-100 shadow"
      style="
        max-height: 250px;
        overflow-y: auto;
        position: absolute;
        top: 100%;
        left: 0;
        z-index: 1050;
      "
    >
      <!-- Current selection shown first -->
      <button
        v-if="responsiveFilter"
        type="button"
        class="dropdown-item active"
        @click="
          form.responsive_uid = responsiveFilter.id;
          showResponsiveDropdown = false;
        "
      >
        <i class="bi bi-check-circle me-2"></i>
        {{ responsiveFilter.name }}
        <small class="ms-1">(Selected)</small>
      </button>

      <!-- Other searchable users -->
      <button
        v-for="user in filteredResponsiveUsers.filter(
          user => Number(user.id) !== Number(responsiveFilter?.id)
        )"
        :key="user.id"
        type="button"
        class="dropdown-item"
        @click="
          responsiveFilter = user;
          form.responsive_uid = user.id;
          responsiveSearch = '';
          showResponsiveDropdown = false;
        "
      >
        <i class="bi bi-person me-2"></i>
        {{ user.name }}

        <small v-if="user.login" class="text-muted ms-1">
          ({{ user.login }})
        </small>
      </button>

      <div
        v-if="
          filteredResponsiveUsers.filter(
            user => Number(user.id) !== Number(responsiveFilter?.id)
          ).length === 0 && !responsiveFilter
        "
        class="text-muted text-center py-3"
      >
        ບໍ່ພົບຜູ້ໃຊ້
      </div>
    </div>
  </div>
</div> 
              </div>


              <!-- Form Error -->
              <div
                v-if="formError"
                class="alert alert-danger mt-3 mb-0"
              >
                <i class="bi bi-exclamation-triangle me-2"></i>
                {{ formError }}
              </div>

            </form>

          </div>


          <!-- Modal Footer -->
          <div class="modal-footer border-0 px-4 pb-4">

            <button
              type="button"
              class="btn btn-light"
              @click="closeModal"
              :disabled="saving"
            >
              ຍົກເລີກ
            </button>

            <button
              type="button"
              class="btn btn-primary px-4"
              @click="saveCar"
              :disabled="saving"
            >

              <span
                v-if="saving"
                class="spinner-border spinner-border-sm me-2"
              ></span>

              <i
                v-else
                class="bi bi-check-lg me-1"
              ></i>

              {{ saving ? 'ກຳລັງບັນທຶກ...' : 'ບັນທຶກ' }}

            </button>

          </div>

        </div>

      </div>

    </div>


    <!-- ====================================================== -->
    <!-- DELETE CONFIRM MODAL -->
    <!-- ====================================================== -->

    <div
      v-if="showDeleteModal"
      class="modal-backdrop-custom"
      @click.self="showDeleteModal = false"
    >

      <div class="delete-modal">

        <div class="text-center p-4">

          <div class="delete-icon mb-3">
            <i class="bi bi-trash3-fill"></i>
          </div>

          <h5 class="fw-bold">
            ຢືນຢັນການລົບ
          </h5>

          <p class="text-muted mb-1">
            ທ່ານຕ້ອງການລົບລົດ:
          </p>

          <div class="fw-bold text-dark mb-3">
            {{ selectedCar?.display_name || selectedCar?.name }}
          </div>

          <p class="small text-danger">
            ການດຳເນີນການນີ້ບໍ່ສາມາດຍ້ອນກັບໄດ້.
          </p>

          <div class="d-flex justify-content-center gap-2">

            <button
              class="btn btn-light px-4"
              @click="showDeleteModal = false"
              :disabled="deleting"
            >
              ຍົກເລີກ
            </button>

            <button
              class="btn btn-danger px-4"
              @click="deleteCar"
              :disabled="deleting"
            >

              <span
                v-if="deleting"
                class="spinner-border spinner-border-sm me-2"
              ></span>

              <i
                v-else
                class="bi bi-trash me-1"
              ></i>

              ລົບ
            </button>

          </div>

        </div>

      </div>

    </div>

  </div>
</template>


<script setup>
import { ref, computed, onMounted } from 'vue'

import {
  getCars,
  createCar,
  updateCar,
  deleteCar as deleteCarAPI,
  getBookingUsers,
} from '../api/axios'


// ============================================================
// STATE
// ============================================================

const cars = ref([])
const loading = ref(false)

const search = ref('')
const stateFilter = ref('')

const errorMessage = ref('')

const showModal = ref(false)
const editingCar = ref(null)

const saving = ref(false)
const formError = ref('')

const showDeleteModal = ref(false)
const selectedCar = ref(null)
const deleting = ref(false)

const users = ref([])
const usersLoading = ref(false)
const showProblemModal = ref(false) 

const responsiveFilter = ref(null)
const responsiveSearch = ref('')
const showResponsiveDropdown = ref(false)
const typeFilter = ref(""); 
 
const filteredResponsiveUsers = computed(() => {
  const keyword = responsiveSearch.value.trim().toLowerCase()

  if (!keyword) {
    return users.value
  }

  return users.value.filter(user => {
    return [
      user.name,
      user.login,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(keyword)
  })
})

const showProblems = (car) => {
  selectedCar.value = car
  showProblemModal.value = true
}

const closeProblems = () => {
  showProblemModal.value = false
  selectedCar.value = null
}
const getProblemImage = (image) => {
  if (!image) return ''

  if (image.startsWith('data:image')) {
    return image
  }

  return `data:image/png;base64,${image}`
}

const loadUsers = async () => {
  usersLoading.value = true

  try {
    const response = await getBookingUsers()

    if (response?.status === true) {
      users.value = Array.isArray(response.data)
        ? response.data
        : []
    } else {
      users.value = []
    }

  } catch (error) {
    console.error('Load users error:', error)
    users.value = []
  } finally {
    usersLoading.value = false
  }
}
// ============================================================
// FORM
// ============================================================

const emptyForm = () => ({
  name: '',
  brand_id: null,
  capacity: 0,
  vehicle_type: 'car',
  number_tanks: '',
  number_motor: '',
  tall_type: 'short',
  color: '',
  sign: '',
  state: 'available',
  use_type: 'borrow',
  responsive_uid: null,
  responsive_uids: [],
  problem_ids: [],
})

const form = ref(emptyForm())


// ============================================================
// COMPUTED
// ============================================================

const filteredCars = computed(() => {

  let result = [...cars.value]

  const keyword = search.value.trim().toLowerCase()

  if (keyword) {

    result = result.filter(car => {

      const text = [
        car.name,
        car.display_name,
        car.brand_name,
        car.sign,
        car.color,
        car.vehicle_type,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return text.includes(keyword)
    })
  }

  if (stateFilter.value) {
    result = result.filter(
      car => car.state === stateFilter.value
    )
  }
  if (typeFilter.value) {
    result = result.filter(
      car =>
        String(car.vehicle_type || '').toLowerCase() ===
        String(typeFilter.value).toLowerCase()
    )
  }

  return result
})


const availableCount = computed(() => {
  return cars.value.filter(
    car => car.state === 'available'
  ).length
})


const unavailableCount = computed(() => {
  return cars.value.filter(
    car => car.state === 'unavailable').length
})


const maintenanceCount = computed(() => {
  return cars.value.filter(
    car => car.state === 'maintenance'
  ).length
})


// ============================================================
// LOAD CARS
// ============================================================

const loadCars = async () => {

  loading.value = true
  errorMessage.value = ''

  try {

    const response = await getCars()

    if (response) {
        console.log('Load cars response:', response.data)
      cars.value = response.data
         

    } else {

      cars.value = []

      errorMessage.value =
        response?.message ||
        'ບໍ່ສາມາດໂຫຼດລາຍການລົດໄດ້'
    }

  } catch (error) {

    console.error('Load cars error:', error)

    cars.value = []

    errorMessage.value =
      error?.response?.data?.message ||
      error?.message ||
      'ເກີດຂໍ້ຜິດພາດ'
  } finally {

    loading.value = false
  }
}


// ============================================================
// CREATE
// ============================================================

const openCreateModal = () => {

  editingCar.value = null
  form.value = emptyForm()

  responsiveFilter.value = null
  responsiveSearch.value = ''
  showResponsiveDropdown.value = false

  formError.value = ''
  showModal.value = true
}


// ============================================================
// EDIT
// ============================================================
 
const openEditModal = (car) => {
  editingCar.value = car

  form.value = {
    name: car.name || '',
    brand_id: car.brand_id || null,
    capacity: car.capacity || 0,
    vehicle_type: car.vehicle_type || 'car',
    number_tanks: car.number_tanks || '',
    number_motor: car.number_motor || '',
    tall_type: car.tall_type || 'short',
    color: car.color || '',
    sign: car.sign || '',
    state: car.state || 'available',
    use_type: car.use_type || 'borrow',

    responsive_uid: car.responsive_uid
      ? Number(car.responsive_uid)
      : null,

    responsive_uids: Array.isArray(car.responsive_uids)
      ? car.responsive_uids.map(item =>
          typeof item === 'object' ? Number(item.id) : Number(item)
        )
      : [],

    problem_ids: Array.isArray(car.problem_ids)
      ? car.problem_ids.map(item =>
          typeof item === 'object' ? item.id : item
        )
      : [],
  }

  // Automatically select the current responsible user.
  const responsibleId = Number(
    Array.isArray(car.responsive_uid)
      ? car.responsive_uid[0]
      : car.responsive_uid?.id ?? car.responsive_uid
  )

  const selectedUser = users.value.find(
    user => Number(user.id) === responsibleId
  )

  responsiveFilter.value = selectedUser || null
  responsiveSearch.value = ''
  showResponsiveDropdown.value = false

  formError.value = ''
  showModal.value = true
} 
const selectedUser = users.value.find(
  user => Number(user.id) === Number(car.responsive_uid)
)

responsiveFilter.value = selectedUser || null
responsiveSearch.value = ''
showResponsiveDropdown.value = false

// ============================================================
// CLOSE MODAL
// ============================================================

const closeModal = () => {

  if (saving.value) {
    return
  }

  showModal.value = false
  editingCar.value = null
  formError.value = ''
}


// ============================================================
// SAVE
// ============================================================

const saveCar = async () => {

  formError.value = ''

  if (!form.value.name.trim()) {

    formError.value = 'ກະລຸນາກອກຊື່ລົດ'

    return
  }

  saving.value = true

  try {

    const payload = {
      name: form.value.name.trim(),

      brand_id:
        form.value.brand_id || false,

      capacity:
        Number(form.value.capacity) || 0,

      vehicle_type:
        form.value.vehicle_type || 'car',

      number_tanks:
        form.value.number_tanks || false,

      number_motor:
        form.value.number_motor || false,

      tall_type:
        form.value.tall_type || 'short',

      color:
        form.value.color || false,

      sign:
        form.value.sign || false,

      state:
        form.value.state || 'available',

      use_type:
        form.value.use_type || 'borrow',

      responsive_uid:
        form.value.responsive_uid || false,

      responsive_uids:
        form.value.responsive_uids || [],

      problem_ids:
        form.value.problem_ids || [],
    }


    let response

    if (editingCar.value) {

      response = await updateCar(
        editingCar.value.id,
        payload
      )

    } else {

      response = await createCar(payload)
    }


    if (response?.status === true) {

      showModal.value = false
      editingCar.value = null

      await loadCars()

    } else {

      formError.value =
        response?.message ||
        'ບັນທຶກບໍ່ສຳເລັດ'
    }

  } catch (error) {

    console.error('Save car error:', error)

    formError.value =
      error?.response?.data?.message ||
      error?.message ||
      'ເກີດຂໍ້ຜິດພາດ'

  } finally {

    saving.value = false
  }
}


// ============================================================
// DELETE
// ============================================================

const confirmDelete = (car) => {

  selectedCar.value = car
  showDeleteModal.value = true
}


const deleteCar = async () => {

  if (!selectedCar.value) {
    return
  }

  deleting.value = true
  errorMessage.value = ''

  try {

    const response = await deleteCarAPI(
      selectedCar.value.id
    )

    if (response?.status === true) {

      showDeleteModal.value = false
      selectedCar.value = null

      await loadCars()

    } else {

      errorMessage.value =
        response?.message ||
        'ລົບລົດບໍ່ສຳເລັດ'
    }

  } catch (error) {

    console.error('Delete car error:', error)

    errorMessage.value =
      error?.response?.data?.message ||
      error?.message ||
      'ລົບລົດບໍ່ສຳເລັດ'

  } finally {

    deleting.value = false
  }
}


// ============================================================
// LABELS
// ============================================================

const stateLabel = (state) => {

  const labels = {
    available: 'ພ້ອມໃຊ້ງານ',
    unavailable: 'ບໍ່ວ່າງ',
    maintenance: 'ບຳລຸງຮັກສາ',
    cancelled: 'ຍົກເລີກ',
  }

  return labels[state] || state || '-'
}


const stateBadgeClass = (state) => {

  const classes = {
    available: 'bg-success',
    unavailable: 'bg-warning text-dark',
    maintenance: 'bg-danger',
    cancelled: 'bg-secondary',
  }

  return classes[state] || 'bg-secondary'
}


const vehicleTypeLabel = (type) => {

  const labels = {
    car: 'Car',
    van: 'Van',
    pickup: 'Pickup',
    truck: 'Truck',
    compact: 'Compact',
    jeep: 'Jeep',
    motorbike: 'Motorbike',
    bicycle: 'Bicycle',
  }

  return labels[type] || type || '-'
}


// ============================================================
// IMAGE
// ============================================================

const getImageUrl = (image) => {

  if (!image) {
    return ''
  }

  if (image.startsWith('data:image')) {
    return image
  }

  return `data:image/png;base64,${image}`
}


// ============================================================
// INIT
// ============================================================

onMounted(() => {
  loadCars()
  loadUsers()
})
</script>


<style scoped>
.problem-image-wrapper {
  width: 100%;
  height: 220px;
  overflow: hidden;
  background: #f8f9fa;
}

.problem-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.problem-no-image {
  height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
}
.car-card {
  overflow: hidden;
  transition: all 0.25s ease;
}

.car-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 .75rem 1.5rem rgba(0, 0, 0, .10) !important;
}

.car-image-wrapper {
  height: 190px;
  position: relative;
  background: #f1f3f5;
  overflow: hidden;
}

.car-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.car-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #adb5bd;
  font-size: 4rem;
}


/* Custom modal */

.modal-backdrop-custom {
  position: fixed;
  inset: 0;
  z-index: 1055;
  background: rgba(245, 242, 242, 0.5);

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 15px;

  overflow-y: auto;
}

.modal-dialog-custom {
  width: 100%;
  max-width: 720px;
background-color: aliceblue;
  margin: auto;
}

.modal-content {
  max-height: 90vh;
  overflow-y: auto;
}


/* Delete */

.delete-modal {
  width: 100%;
  max-width: 420px;

  background: white;
  border-radius: 18px;

  box-shadow: 0 1rem 3rem rgba(0, 0, 0, .25);
}

.delete-icon {
  width: 70px;
  height: 70px;

  margin: auto;

  border-radius: 50%;

  display: flex;
  align-items: center;
  justify-content: center;

  background: #f8d7da;
  color: #dc3545;

  font-size: 28px;
}


/* Mobile */

@media (max-width: 576px) {

  .modal-dialog-custom {
    max-width: 100%;
  }

  .car-image-wrapper {
    height: 170px;
  }

}

</style>