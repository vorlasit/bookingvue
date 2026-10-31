<!-- src/views/BookingDetailView.vue -->
<template>
  <div class="container-fluid min-vh-100 bg-light py-4">
    <!-- Header Block -->
    <div class="row justify-content-center mb-4">
      <div class="col-xl-11 col-12 d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center gap-2">
          <h4 class="fw-bold mb-0 text-dark">ລາຍລະອຽດການຈອງລົດ</h4>
        </div>
        <button @click="router.back()" class="btn btn-sm btn-outline-secondary px-3">
          <i class="bi bi-arrow-left me-1"></i> ກັບໜ້າຫຼັກ
        </button>
      </div>
    </div>

    <!-- Main Workspace Layout -->
    <div class="row justify-content-center">
      <div class="col-xl-11 col-12">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="text-muted mt-2">ກຳລັງໂຫຼດຂໍ້ມູນ...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="errorMessage" class="alert alert-danger" role="alert">
          {{ errorMessage }}
        </div>

        <!-- Dynamic Data Layout -->
        <div v-else-if="booking" class="row g-4">
          <!-- LEFT SIDE: Travel Information Profile Cards -->
          <div class="col-lg-7 col-12">
            <div class="card border-0 shadow-sm p-4 bg-white rounded-3 mb-4">
              <h5 class="fw-bold mb-4 text-dark border-bottom pb-2">
                ຂໍ້ມູນການເດີນທາງ ({{ booking.raw_state }}) <span class="text-danger"> ສາ້ງໂດຍ - {{ booking.create_for_uid }} </span>
              </h5>

              <!-- Core Technical Fields Grid -->
              <div class="row mb-3 align-items-baseline">
                <div class="col-md-3 text-muted fw-semibold small">
                  ວັດຖຸປະສົງ
                </div>
                <div class="col-md-9 text-dark fw-bold">
                  {{ booking.description }}
                </div>
              </div>
              <div class="row mb-3 align-items-baseline">
                <div class="col-md-3 text-muted fw-semibold small">
                  ລາຍລະອຽດເພີ່ມເຕີມ
                </div>
                <div class="col-md-9 text-dark fw-bold">
                  {{ booking.detail }}
                </div>
              </div>

              <div class="row mb-3 align-items-baseline">
                <div class="col-md-3 text-muted fw-semibold small">
                  ວັນເດີນທາງ
                </div>
                <div class="col-md-9 text-dark fw-bold">
                  {{ formatDateTime(booking.start) }}
                  <span class="text-muted fw-normal mx-1">ເຖິງ</span>
                  {{ formatDateTime(booking.stop) }}
                </div>
              </div>


              <div class="row mb-4 align-items-center">
                <div class="col-md-3 text-muted fw-semibold small">
                  ລົດທີ່ຂໍ ຫຼື ລົດທີ່ໃຊ້ໄດ້
                </div>

                <div class="col-md-9">
                  <div class="d-flex align-items-center justify-content-between gap-2">
                    <div class="text-dark fw-bold">
                      {{ booking.car_request_id || "ຍັງບໍ່ໄດ້ເລືອກລົດ" }} 
                    </div>
                  </div>
                </div>
              </div>

              <!-- Internal Status Callout Banner -->
              <div class="p-3 rounded-3 mb-4" style="
                  background-color: #f4fbf7;
                  border-left: 4px solid #198754;
                ">
                <div class="fw-bold text-success mb-1">
                  {{ booking.raw_state }}
                </div>
                <div class="text-muted small">
                  ຝ່າຍບໍລິຫານໄດ້ມອບໝາຍລົດ ແລະ
                  ຄົນຂັບລົດໃຫ້ສຳລັບການເດີນທາງຄັ້ງນີ້.
                  ລາຍລະອຽດເພີ່ມເຕີມສາມາດເບີ່ງໄດ້ດ້ານລຸ່ມນີ້.
                </div>
              </div>

              <!-- Assignment Info Details -->
              <div class="row mb-3 align-items-center">
                <h5 class="fw-bold mb-4 text-dark border-bottom pb-2">
                  ຂໍ້ມູນໃຊ້ງານລົດຕົວຈິງ
                </h5>
                <div class="col-md-3 text-muted fw-semibold small">
                  ລົດທີ່ໄດ້ຮັບ
                </div>
                <div class="col-md-6 text-dark fw-bold">
                  {{ booking.assigned_vehicle_name || booking.vehicle_name }}
                  <span class="text-muted ms-2">ທະບຽນ:
                    {{
                      booking.assigned_vehicle_sign || booking.vehicle_sign
                    }}</span>
                </div>
                <div class="col-md-3 text-dark fw-bold"> 
                  <button type="button" class="btn btn-sm btn-primary" @click="openCarModal" v-if="
                    (booking.row_state === 'draft' ||
                    booking.row_state === 'waiting_for_approval') && 
                    groups_ids.includes('booking.group_kc_vehicle_manager')
                    ">
                    <i class="bi bi-car-front-fill me-1"></i>
                    ເລືອກລົດ
                  </button>
                </div>
              </div>

              <div class="row mb-3 align-items-baseline">
                <div class="col-md-3 text-muted fw-semibold small">
                  ຕ້ອງການຄົນຂັບບໍ່
                </div>
                <div class="col-md-9 text-dark fw-bold">
                  <!-- Displays Lao translations cleanly based on your 'yes'/'no' database keys -->
                  {{ booking.keep_driver ? "ຕ້ອງການຄົນຂັບ" : "ຂັບເອງ" }}
                </div>
              </div>

              <div class="row mb-2 align-items-baseline" v-if="booking.keep_driver === true">
                <div class="col-md-3 text-muted fw-semibold small">
                  ຜູ້ຂັບລົດແທ້
                </div>
                <div class="col-md-9 text-dark fw-bold text-primary">
                  <div class="d-flex align-items-center justify-content-between gap-2">
                    <div class="text-primary fw-bold">
                      {{ booking.driver || "ຍັງບໍ່ໄດ້ມອບໝາຍ" }}
                    </div>

                    <button v-if="
                      booking.keep_driver === true &&
                      groups_ids.includes('booking.group_kc_book_manager')
                    " type="button" class="btn btn-sm btn-outline-primary" @click="openDriverModal">
                      <i class="bi bi-person-gear me-1"></i>
                      ປ່ຽນຄົນຂັບ
                    </button>
                  </div>
                </div>
              </div>
              <div class="row mb-3 align-items-baseline" v-if="booking.state_date_start">
                <div class="col-md-3 text-muted fw-semibold small">
                  ວັນທີ່ເລີ່ມເດີນທາງ
                </div>
                <div class="col-md-9 text-dark fw-bold">
                  {{ formatDateTime(booking.state_date_start) }}
                </div>
              </div>

              <!-- Car Returned -->
              <div class="row mb-3 align-items-baseline" v-if="booking.state_date_returned">
                <div class="col-md-3 text-muted fw-semibold small">
                  ເວລາສົ່ງລົດຄືນ
                </div>
                <div class="col-md-9 text-dark fw-bold">
                  {{ formatDateTime(booking.state_date_returned) }}
                </div>
              </div>
              <!-- Car Received -->
              <div class="row mb-3 align-items-baseline" v-if="
                booking.state === 'received' && booking.state_date_received
              ">
                <div class="col-md-3 text-muted fw-semibold small">
                  ເວລາຮັບລົດຄືນ
                </div>
                <div class="col-md-9 text-dark fw-bold">
                  {{ formatDateTime(booking.state_date_received) }}
                </div>
              </div>

              <!-- <div class="row mb-3 align-items-baseline">
                <div class="col-md-3 text-muted fw-semibold small">
                  ວັນເວລາທີ່ຕ້ອງສົ່ງ
                </div>
                <div class="col-md-9 text-dark fw-bold">
                  {{ booking.stop_display || booking.stop }}
                </div>
              </div> -->
            </div>

            <!-- Start Trip Activation Action Card -->
            <div class="card border-0 shadow-sm p-4 bg-white rounded-3 d-flex gap-2"
              style="border: 1px solid #e3f2fd !important">
              <h6 class="fw-bold text-primary mb-2">
                ວິທີການເລີ່ມຕົ້ນການເດີນທາງເມື່ອເວລາມາຮອດ.
              </h6>
              <p class="text-muted small mb-3">
                ເມື່ອຮອດເວລາເລີ່ມຕົ້ນການເດີນທາງ, ໃຫ້ກວດສອບລົດ ແລະ ຄົນຂັບ,
                ຈາກນັ້ນກົດເລີ່ມຕົ້ນການເດີນທາງ.
              </p>
              <button @click="startTripAction" v-if="booking.row_state === 'approved'"
                class="btn btn-primary btn-lg w-100 py-2 fs-6 fw-bold">
                ເລີ່ມຕົ້ນເດີນທາງ
              </button>
              <button v-if="
                booking.row_state === 'waiting_for_approval' || booking.row_state === 'draft' &&
                booking?.vehicle_sign &&
                groups_ids.includes('booking.group_kc_vehicle_manager')
              " type="button" class="btn btn-success" @click="approveBookingAction">
                <i class="bi bi-check-circle me-1"></i>
                ອະນຸມັດການຈອງ
              </button>
              <!-- Non Approve -->
              <button type="button" class="btn btn-danger" v-if="
                (booking.row_state === 'draft' ||
                  booking.row_state === 'waiting_for_approval') &&
                groups_ids.includes('booking.group_kc_vehicle_manager')
              " @click="openNonApproveModal">
                <i class="bi bi-x-circle me-1"></i>
                ບໍ່ອະນຸມັດ
              </button>
              <button v-if="
                booking.row_state === 'start' && 
                booking.state !== 'returned'
              " type="button" class="btn btn-outline-danger w-100 mb-2" @click="openProblemModal">
                <i class="bi bi-exclamation-triangle me-1"></i>
                ແຈ້ງບັນຫາລົດ
              </button>
            </div>
          </div>

          <!-- RIGHT SIDE: Timeline Processing History Tracker -->
          <div class="col-lg-5 col-12">
            <div class="card border-0 shadow-sm p-4 bg-white rounded-3">
              <h5 class="fw-bold mb-4 text-dark">ປະຫວັດການປະມວນຜົນ</h5>

              <!-- Visual Vertical Timeline Structure -->
              <div class="position-relative ps-4 border-start border-2 border-light ms-2 mt-2">
                <!-- Node 1: Submission (Active for 'draft' and all later states) -->
                <div class="mb-4 position-relative">
                  <div class="position-absolute rounded-circle transition-all" :class="isStatePassed([
                    'draft',
                    'waiting_for_approval',
                    'approved',
                    'not_approved',
                    'start',
                    'completed',
                  ])
                      ? 'bg-success timeline-dot-active'
                      : 'bg-secondary'
                    " style="width: 12px; height: 12px; left: -29px; top: 6px"></div>
                  <div :class="booking.row_state === 'draft'
                      ? 'text-success fw-bold'
                      : 'text-dark'
                    " class="small mb-0">
                    ສົ່ງຄຳຂໍແລ້ວ
                  </div>
                  <span class="text-muted text-xxs d-block mb-1">ຂໍ້ມູນຖືກສົ່ງເຂົ້າລະບົບກວດສອບແລ້ວ</span>
                </div>

                <!-- Node 2: Waiting Approval -->
                <div class="mb-4 position-relative" v-if="
                  booking.row_state !== 'not_approved' &&
                  booking.row_state !== 'cancel'
                ">
                  <div class="position-absolute rounded-circle transition-all" :class="isStatePassed([
                    'waiting_for_approval',
                    'approved',
                    'start',
                    'completed',
                  ])
                      ? 'bg-success timeline-dot-active'
                      : 'bg-secondary'
                    " style="width: 12px; height: 12px; left: -29px; top: 6px"></div>
                  <div :class="booking.row_state === 'waiting_for_approval'
                      ? 'text-warning fw-bold'
                      : 'text-dark'
                    " class="small mb-0">
                    ກຳລັງລໍຖ້າການອະນຸມັດ
                  </div>
                  <span class="text-muted text-xxs d-block mb-1">ລໍຖ້າຝ່າຍບໍລິຫານກວດສອບຄວາມເໝາະສົມ</span>
                </div>

                <!-- Node 3: Approved / Not Approved Branching -->
                <div class="mb-4 position-relative">
                  <!-- If Approved -->
                  <template v-if="booking.row_state !== 'not_approved'">
                    <div class="position-absolute rounded-circle transition-all" :class="isStatePassed(['approved', 'start', 'completed'])
                        ? 'bg-success timeline-dot-active'
                        : 'bg-secondary'
                      " style="width: 12px; height: 12px; left: -29px; top: 6px"></div>
                    <div :class="booking.row_state === 'approved'
                        ? 'text-success fw-bold'
                        : 'text-dark'
                      " class="small mb-0">
                      ອະນຸມັດ ແລະ ຈັດລົດແລ້ວ
                    </div>
                    <span class="text-muted text-xxs d-block mb-1">ຝ່າຍບໍລິຫານອະນຸມັດ ແລະ ມອບໝາຍຄົນຂັບແລ້ວ</span>
                  </template>

                  <!-- If Rejected/Not Approved -->
                  <template v-else>
                    <div class="position-absolute bg-danger rounded-circle timeline-dot-error"
                      style="width: 12px; height: 12px; left: -29px; top: 6px"></div>
                    <div class="fw-bold text-danger small mb-0">
                      ຄຳຂໍຖືກປະຕິເສດ (ບໍ່ອະນຸມັດ)
                    </div>
                    <span class="text-muted text-xxs d-block mb-1">ຄຳຂໍຈອງລົດນີ້ບໍ່ຜ່ານການອະນຸມັດຈາກລະບົບ</span>
                    <span v-if="booking.remark" class="text-danger d-block mb-1">ເນື່ອງຈາກ {{ booking.remark }}</span>
                  </template>
                </div>

                <!-- Node 4: Trip Started -->
                <div class="mb-4 position-relative" v-if="booking.row_state !== 'not_approved'">
                  <div class="position-absolute rounded-circle transition-all" :class="isStatePassed(['start', 'completed'])
                      ? 'bg-success timeline-dot-active'
                      : 'bg-secondary'
                    " style="width: 12px; height: 12px; left: -29px; top: 6px"></div>
                  <div :class="booking.row_state === 'start'
                      ? 'text-primary fw-bold'
                      : 'text-dark'
                    " class="small mb-0">
                    ເລີ້ມຕົ້ນການເດີນທາງ
                  </div>
                  <span class="text-muted text-xxs d-block mb-1">ລົດກຳລັງເດີນທາງຢູ່ໃນທຣິບ</span>
                </div>

                <!-- Node 5: Finished Complete -->
                <div class="position-relative" v-if="booking.row_state !== 'not_approved'">
                  <div class="position-absolute rounded-circle transition-all" :class="booking.row_state === 'completed'
                      ? 'bg-success timeline-dot-active'
                      : 'bg-secondary'
                    " style="width: 12px; height: 12px; left: -29px; top: 6px"></div>
                  <div :class="booking.row_state === 'completed'
                      ? 'text-success fw-bold'
                      : 'text-dark'
                    " class="small mb-0">
                    ສຳເລັດການເດີນທາງແລ້ວ
                  </div>
                  <span class="text-muted text-xxs d-block">ທຣິບສິ້ນສຸດ ແລະ ສົ່ງຄືນລົດສຳເລັດ</span>
                </div>

                <!-- Node 6: Cancelled Fallback (Only shows if state is cancel) -->
                <div class="position-relative" v-if="booking.row_state === 'cancel'">
                  <div class="position-absolute bg-danger rounded-circle timeline-dot-error"
                    style="width: 12px; height: 12px; left: -29px; top: 6px"></div>
                  <div class="fw-bold text-danger small mb-0">
                    ຍົກເລີກລາຍການແລ້ວ
                  </div>
                  <span class="text-muted text-xxs d-block">ຜູ້ໃຊ້ງານ ຫຼື ລະບົບໄດ້ຍົກເລີກການຈອງນີ້ແລ້ວ</span>
                </div>
              </div>
            </div>
            
          <div class="col-lg-12 col-12 card  mt-3">
            <div class=" shadow-sm p-4 bg-white rounded-3" v-if="booking.mile_before">
              ເລກໄມລົດຕອນເດີນທາງ:<br/> <span class="fw-bold text-danger">{{ booking.mile_before ?? '-' }}</span>

              <img v-if="booking.image_mile_before" :src="booking.image_mile_before" alt="Mileage before"
                class="mx-2 rounded" style="width: 40px; height: 40px; object-fit: cover; cursor: pointer;" />
              </div>
            <div class="shadow-sm p-4 bg-white rounded-3" v-if="booking.mile_after">
              ເລກໄມລົດຕອນສົ່ງລົດ:<br/> <span class="fw-bold text-danger">{{ booking.mile_after ?? '-' }}</span>

              <img v-if="booking.image_mile_after" :src="booking.image_mile_after" alt="Mileage after"
                class="mx-2 rounded" style="width: 40px; height: 40px; object-fit: cover; cursor: pointer;" />
            </div>
            </div>
            <div class="card border-0 shadow-sm p-4 bg-white rounded-3 mt-4" v-if="
              booking.row_state === 'start' && booking.state !== 'returned'
              ">
              <div class="list-group list-group-flush">
                <button type="button" class="btn btn-success w-100" @click="openReturnModal">
                  <i class="bi bi-car-front me-1"></i>
                  ສົ່ງລົດຄືນ
                </button>
              </div>
            </div>

            <!-- Vehicle manager receives returned car -->
            <div class="card border-0 shadow-sm p-4 bg-white rounded-3 mt-4" v-if="
              booking.state === 'returned' &&
              groups_ids.includes('booking.group_kc_vehicle_manager')
              ">
              <div class="alert alert-warning mb-3">
                <i class="bi bi-info-circle me-1"></i>

                ລົດຖືກສົ່ງຄືນແລ້ວ
                <br />

                <small class="text-muted">
                  ກະລຸນາກວດສອບລົດ ແລະ ເລກໄມລ໌ ກ່ອນກົດຮັບລົດຄືນ
                </small>
              </div>

              <button type="button" class="btn btn-primary w-100" @click="receiveBookingCarAction"
                :disabled="receivingCar">
                <span v-if="receivingCar" class="spinner-border spinner-border-sm me-1"></span>

                <i v-else class="bi bi-check-circle me-1"></i>

                {{ receivingCar ? "ກຳລັງຮັບລົດຄືນ..." : "ຮັບລົດຄືນ" }}
              </button>
            </div>

            <div class="card border-0 shadow-sm p-4 bg-white rounded-3 mt-4">
              <h5 class="fw-bold mb-4 text-dark">ປະຫວັດການແຈ້ງບັນຫາ</h5>
              <div v-if="
                booking.problem_history && booking.problem_history.length > 0
              " class="list-group list-group-flush">
                <div v-for="problem in booking.problem_history" :key="problem.id" class="list-group-item px-0 py-3">
                  <!-- Header -->
                  <div class="d-flex justify-content-between align-items-start">
                    <div>
                      <div class="fw-bold text-dark">
                        {{ problem.reported_by }}
                      </div>

                      <div class="text-muted small">
                        {{ problem.reported_at }}
                      </div>
                    </div>

                    <span class="badge bg-danger rounded-pill"> ບັນຫາ </span>
                  </div>

                  <!-- Description -->
                  <div class="mt-2 text-dark">
                    {{ problem.description }}
                  </div>
                  <!-- Image -->
                  <div class="mt-3" v-if="problem.image">
                    <img :src="problem.image" alt="Problem image" class="img-fluid rounded border" style="
                        max-width: 300px;
                        max-height: 250px;
                        object-fit: cover;
                        cursor: pointer;
                      " />
                  </div>
                </div>
              </div>
              <div v-else class="text-muted small">
                ຍັງບໍ່ມີການແຈ້ງບັນຫາໃນເທື່ອນີ້
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ===================================================== -->
  <!-- UPDATE DRIVER MODAL -->
  <!-- ===================================================== -->

  <div v-if="showDriverModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0, 0, 0, 0.5)">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content border-0 shadow">
        <!-- Header -->
        <div class="modal-header">
          <h5 class="modal-title fw-bold">
            <i class="bi bi-person-gear me-2"></i>
            ປ່ຽນຄົນຂັບລົດ
          </h5>

          <button type="button" class="btn-close" @click="showDriverModal = false" :disabled="savingDriver"></button>
        </div>

        <!-- Body -->
        <div class="modal-body">
          <div class="alert alert-info">
            <i class="bi bi-info-circle me-1"></i>

            ຄົນຂັບປັດຈຸບັນ:
            <strong>
              {{ booking?.driver || "ຍັງບໍ່ໄດ້ມອບໝາຍ" }}
            </strong>
          </div>

          <!-- Loading -->
          <div v-if="driversLoading" class="text-center py-4">
            <div class="spinner-border text-primary"></div>
            <div class="text-muted mt-2">ກຳລັງໂຫຼດລາຍການຄົນຂັບ...</div>
          </div>

          <!-- Empty -->
          <div v-else-if="availableDrivers.length === 0" class="alert alert-warning">
            <i class="bi bi-exclamation-triangle me-2"></i>
            ບໍ່ພົບລາຍການຄົນຂັບ
          </div>

          <!-- Drivers -->
          <div v-else class="row g-3">
            <div v-for="driver in availableDrivers" :key="driver.id" class="col-md-6">
              <div class="card h-100" :class="selectedDriverId === driver.id
                  ? 'border-primary border-2 bg-primary-subtle'
                  : 'border'
                " style="cursor: pointer" @click="selectedDriverId = driver.id">
                <div class="card-body">
                  <div class="d-flex align-items-center gap-3">
                    <div class="fs-2 text-primary">
                      <i class="bi bi-person-circle"></i>
                    </div>

                    <div class="flex-grow-1">
                      <div class="fw-bold">
                        {{ driver.name }}
                      </div>

                      <div v-if="driver.phone" class="text-muted small">
                        <i class="bi bi-telephone me-1"></i>
                        {{ driver.phone }}
                      </div>
                    </div>

                    <div>
                      <i v-if="selectedDriverId === driver.id" class="bi bi-check-circle-fill text-primary fs-4"></i>

                      <i v-else class="bi bi-circle text-muted fs-4"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button type="button" class="btn btn-outline-secondary" @click="showDriverModal = false"
            :disabled="savingDriver">
            ຍົກເລີກ
          </button>

          <button type="button" class="btn btn-primary" @click="saveBookingDriver"
            :disabled="!selectedDriverId || savingDriver">
            <span v-if="savingDriver" class="spinner-border spinner-border-sm me-1"></span>

            <i v-else class="bi bi-check-lg me-1"></i>

            {{ savingDriver ? "ກຳລັງບັນທຶກ..." : "ຢືນຢັນປ່ຽນຄົນຂັບ" }}
          </button>
        </div>
      </div>
    </div>
  </div>
  <!-- ===================================================== -->
  <!-- RETURN CAR MODAL -->
  <!-- ===================================================== -->

  <div v-if="showReturnModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0, 0, 0, 0.5)">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content border-0 shadow">
        <div class="modal-header">
          <h5 class="modal-title fw-bold text-success">
            <i class="bi bi-car-front me-2"></i>
            ສົ່ງລົດຄືນ
          </h5>

          <button type="button" class="btn-close" @click="showReturnModal = false"></button>
        </div>

        <div class="modal-body">
          <div class="alert alert-info">
            <i class="bi bi-info-circle me-1"></i>

            ກະລຸນາກວດສອບເລກໄມລ໌ ແລະ ຖ່າຍຮູບກ່ອນສົ່ງລົດຄືນ
          </div>

          <!-- Mileage -->
          <div class="mb-3">
            <label class="form-label fw-semibold">
              ເລກໄມລ໌ຫຼັງເດີນທາງ
              <span class="text-danger">*</span>
            </label>

            <input type="number" min="0" class="form-control" v-model="mileAfter" placeholder="ຕົວຢ່າງ: 12500" />
          </div>

          <!-- Mileage Image -->
          <div class="mb-3">
            <label class="form-label fw-semibold"> ຮູບເລກໄມລ໌ </label>

            <div @click="triggerReturnFileSelect"
              class="border border-dashed rounded-3 p-4 text-center bg-light cursor-pointer position-relative d-flex flex-column align-items-center justify-content-center"
              style="
                border-style: dashed !important;
                min-height: 180px;
                cursor: pointer;
              ">
              <!-- No image -->
              <template v-if="!returnPreview">
                <i class="bi bi-camera-fill text-muted fs-1 mb-2"></i>

                <span class="text-muted small">
                  ແຕະເພື່ອເປີດກ້ອງຖ່າຍຮູບເລກໄມລ໌
                </span>

                <span class="text-muted small"> ຫຼື ເລືອກຮູບຈາກ Gallery </span>
              </template>

              <!-- Image selected -->
              <template v-else>
                <img :src="`data:image/jpeg;base64,${returnPreview}`" class="img-fluid rounded shadow-sm" style="
                    max-height: 160px;
                    max-width: 100%;
                    object-fit: contain;
                  " />

                <span class="badge bg-dark position-absolute bottom-0 mb-2">
                  ແຕະເພື່ອປ່ຽນຮູບ
                </span>
              </template>

              <!-- Hidden camera/gallery input -->
              <input ref="returnFileInput" type="file" accept="image/*" capture="environment" class="d-none"
                @change="handleReturnPhotoCapture" />
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-outline-secondary" @click="showReturnModal = false"
            :disabled="returningCar">
            ຍົກເລີກ
          </button>

          <button type="button" class="btn btn-success" @click="submitReturnCar" :disabled="returningCar">
            <span v-if="returningCar" class="spinner-border spinner-border-sm me-1"></span>

            <i v-else class="bi bi-check-circle me-1"></i>

            {{ returningCar ? "ກຳລັງສົ່ງລົດຄືນ..." : "ຢືນຢັນສົ່ງລົດຄືນ" }}
          </button>
        </div>
      </div>
    </div>
  </div>
  <div v-if="showProblemModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0, 0, 0, 0.5)">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content border-0 shadow">
        <div class="modal-header">
          <h5 class="modal-title fw-bold text-danger">
            <i class="bi bi-exclamation-triangle me-2"></i>
            ແຈ້ງບັນຫາລົດ
          </h5>

          <button type="button" class="btn-close" @click="showProblemModal = false"></button>
        </div>

        <div class="modal-body">
          <div class="alert alert-warning">
            <i class="bi bi-info-circle me-1"></i>

            ກະລຸນາລະບຸບັນຫາທີ່ພົບຈາກລົດ
          </div>

          <!-- Problem Description -->
          <div class="mb-3">
            <label class="form-label fw-semibold">
              ລາຍລະອຽດບັນຫາ
              <span class="text-danger">*</span>
            </label>

            <textarea v-model="problemDescription" class="form-control" rows="5"
              placeholder="ຕົວຢ່າງ: ລົດມີສຽງຜິດປົກກະຕິ..."></textarea>
          </div>

          <!-- Attachment -->
          <!-- Problem Image -->
          <div class="mb-3">
            <label class="form-label fw-semibold"> ຮູບພາບບັນຫາ </label>

            <div @click="triggerProblemFileSelect"
              class="border border-dashed rounded-3 p-4 text-center bg-light cursor-pointer position-relative d-flex flex-column align-items-center justify-content-center"
              style="
                border-style: dashed !important;
                min-height: 180px;
                cursor: pointer;
              ">
              <!-- No image -->
              <template v-if="!problemPreview">
                <i class="bi bi-camera-fill text-muted fs-1 mb-2"></i>

                <span class="text-muted small"> ແຕະເພື່ອເປີດກ້ອງຖ່າຍຮູບ </span>

                <span class="text-muted small"> ຫຼື ເລືອກຮູບຈາກ Gallery </span>
              </template>

              <!-- Image selected -->
              <template v-else>
                <img :src="`data:image/jpeg;base64,${problemPreview}`" class="img-fluid rounded shadow-sm" style="
                    max-height: 160px;
                    max-width: 100%;
                    object-fit: contain;
                  " />

                <span class="badge bg-dark position-absolute bottom-0 mb-2">
                  ແຕະເພື່ອປ່ຽນຮູບ
                </span>
              </template>

              <!-- Hidden input -->
              <input ref="problemFileInput" type="file" accept="image/*" capture="environment" class="d-none"
                @change="handleProblemPhotoCapture" />
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-outline-secondary" @click="showProblemModal = false"
            :disabled="reportingProblem">
            ຍົກເລີກ
          </button>

          <button type="button" class="btn btn-danger" @click="submitProblem" :disabled="reportingProblem">
            <span v-if="reportingProblem" class="spinner-border spinner-border-sm me-1"></span>

            <i v-else class="bi bi-send me-1"></i>

            {{ reportingProblem ? "ກຳລັງສົ່ງ..." : "ສົ່ງແຈ້ງບັນຫາ" }}
          </button>
        </div>
      </div>
    </div>
  </div>
  <div v-if="showCarModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0, 0, 0, 0.5)">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content border-0 shadow">
        <!-- Header -->
        <div class="modal-header">
          <h5 class="modal-title fw-bold">
            <i class="bi bi-car-front-fill me-2"></i>
            ເລືອກລົດສຳລັບການຈອງ
          </h5>

          <button type="button" class="btn-close" @click="showCarModal = false"></button>
        </div>

        <!-- Body -->
        <div class="modal-body">
          <!-- Loading -->
          <div v-if="carsLoading" class="text-center py-5">
            <div class="spinner-border text-primary"></div>

            <div class="text-muted mt-2">ກຳລັງໂຫຼດລົດ...</div>
          </div>

          <!-- Empty -->
          <div v-else-if="availableCars.length === 0" class="alert alert-warning mb-0">
            <i class="bi bi-exclamation-triangle me-2"></i>
            ບໍ່ມີລົດທີ່ສາມາດເລືອກໄດ້
          </div>

          <!-- Cars -->
          <div v-else class="row g-3">
            <div v-for="car in availableCars" :key="car.id" class="col-md-6">
              <div class="card h-100" :class="selectedCarId === car.id
                  ? 'border-primary border-2 bg-primary-subtle'
                  : 'border'
                " style="cursor: pointer" @click="selectedCarId = car.id">
                <div class="card-body">
                  <div class="d-flex align-items-start gap-3">
                    <div class="fs-2 text-primary">
                      <i class="bi bi-car-front"></i>
                    </div>

                    <div class="flex-grow-1">
                      <div class="fw-bold">
                        {{ car.name || car.vehicle_name || "-" }}
                      </div>

                      <div v-if="car.sign || car.vehicle_sign" class="text-muted small">
                        ທະບຽນ:
                        {{ car.sign || car.vehicle_sign }}
                      </div>

                      <div v-if="car.brand_name" class="text-muted small">
                        ຍີ່ຫໍ້:
                        {{ car.brand_name }}
                      </div>
                    </div>

                    <div>
                      <i v-if="selectedCarId === car.id" class="bi bi-check-circle-fill text-primary fs-4"></i>

                      <i v-else class="bi bi-circle text-muted fs-4"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button type="button" class="btn btn-outline-secondary" @click="showCarModal = false" :disabled="savingCar">
            ຍົກເລີກ
          </button>

          <button type="button" class="btn btn-primary" @click="saveBookingCar" :disabled="!selectedCarId || savingCar">
            <span v-if="savingCar" class="spinner-border spinner-border-sm me-1"></span>

            <i v-else class="bi bi-check-lg me-1"></i>

            {{ savingCar ? "ກຳລັງບັນທຶກ..." : "ຢືນຢັນເລືອກລົດ" }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- NON-APPROVE REMARK MODAL -->
  <div v-if="showNonApproveModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0, 0, 0, 0.5)">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content border-0 shadow">

        <div class="modal-header">
          <h5 class="modal-title fw-bold text-danger">
            <i class="bi bi-x-circle me-2"></i>
            ບໍ່ອະນຸມັດການຈອງ
          </h5>

          <button type="button" class="btn-close" @click="closeNonApproveModal" :disabled="rejectingBooking"></button>
        </div>

        <div class="modal-body">
          <div class="alert alert-warning">
            <i class="bi bi-info-circle me-1"></i>
            ກະລຸນາລະບຸເຫດຜົນທີ່ບໍ່ອະນຸມັດການຈອງນີ້
          </div>

          <div class="mb-3">
            <label class="form-label fw-semibold">
              ເຫດຜົນ / Remark
              <span class="text-danger">*</span>
            </label>

            <textarea v-model="nonApproveRemark" class="form-control" rows="4" maxlength="1000"
              placeholder="ຕົວຢ່າງ: ລົດບໍ່ຫວ່າງ, ຂໍ້ມູນການຈອງບໍ່ຄົບ..." :disabled="rejectingBooking"></textarea>

            <div class="text-muted small text-end mt-1">
              {{ nonApproveRemark.length }}/1000
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-outline-secondary" @click="closeNonApproveModal"
            :disabled="rejectingBooking">
            ຍົກເລີກ
          </button>

          <button type="button" class="btn btn-danger" @click="handleNonApprove"
            :disabled="rejectingBooking || !nonApproveRemark.trim()">
            <span v-if="rejectingBooking" class="spinner-border spinner-border-sm me-1"></span>

            <i v-else class="bi bi-x-circle me-1"></i>

            {{
              rejectingBooking
                ? "ກຳລັງບັນທຶກ..."
                : "ຢືນຢັນບໍ່ອະນຸມັດ"
            }}
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { formatDateTime } from "../util/formatdate";
import Swal from 'sweetalert2'
import {
  getEventDetail,
  updateBookingCar,
  getAvailableCars,
  approveBooking,
  getGroups,
  reportBookingProblem,
  returnBookingCar,
  receiveBookingCar,
  getAvailableDrivers,
  updateBookingDriver,
  nonApproveBooking,
} from "../api/axios";
const route = useRoute();
const router = useRouter();
const booking = ref(null);
const loading = ref(true);
const errorMessage = ref("");
const showCarModal = ref(false);
const availableCars = ref([]);
const selectedCarId = ref(null);
const carsLoading = ref(false);
const savingCar = ref(false);
// ==========================================
// Driver
// ==========================================
const showDriverModal = ref(false);
const availableDrivers = ref([]);
const selectedDriverId = ref(null);
const driversLoading = ref(false);
const savingDriver = ref(false);
// ==========================================
// Problem
// ==========================================
const showProblemModal = ref(false);
const problemDescription = ref("");
const problemFile = ref(null);
const problemPreview = ref(null);
const problemFileInput = ref(null);
const reportingProblem = ref(false);

// ==========================================
// Return Car
// ==========================================
const showReturnModal = ref(false);
const mileAfter = ref("");
const durationTime = ref("");
const returnFile = ref(null);
const returnPreview = ref(null);
const returnFileInput = ref(null);

const returningCar = ref(false);
const receivingCar = ref(false);
const currentUsername = ref("User");
const groups_ids = ref([]);
// ==========================================
// Non-Approve Booking
// ==========================================
const showNonApproveModal = ref(false);
const nonApproveRemark = ref("");
const rejectingBooking = ref(false);
const openNonApproveModal = () => {
  nonApproveRemark.value = "";
  showNonApproveModal.value = true;
};

const closeNonApproveModal = () => {
  if (rejectingBooking.value) return;

  showNonApproveModal.value = false;
  nonApproveRemark.value = "";
};

// ==========================================
// SweetAlert helpers
// ==========================================
const alertSuccess = (text) =>
  Swal.fire({
    icon: "success",
    title: "ສຳເລັດ",
    text,
    timer: 1500,
    showConfirmButton: false,
  });

const alertError = (text) =>
  Swal.fire({
    icon: "error",
    title: "ເກີດຂໍ້ຜິດພາດ",
    text,
    confirmButtonText: "ຕົກລົງ",
  });

const alertWarning = (text) =>
  Swal.fire({
    icon: "warning",
    title: "ແຈ້ງເຕືອນ",
    text,
    confirmButtonText: "ຕົກລົງ",
  });

const confirmDialog = async (text, confirmText = "ຢືນຢັນ") => {
  const result = await Swal.fire({
    icon: "question",
    title: "ຢືນຢັນ",
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: "ຍົກເລີກ",
    confirmButtonColor: "#198754",
    cancelButtonColor: "#6c757d",
  });
  return result.isConfirmed;
};

const handleNonApprove = async () => {
  if (!booking.value?.id) {
    alertWarning("ບໍ່ພົບ Booking ID");
    return;
  }

  const confirmed = await confirmDialog(
    "ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການບໍ່ອະນຸມັດການຈອງນີ້?",
    "ບໍ່ອະນຸມັດ",
  );
  if (!confirmed) return;

  try {
    const response = await nonApproveBooking(
      booking.value.id,
      nonApproveRemark.value
    );
    console.log("NON APPROVE RESPONSE:", response);

    if (response?.status) {
      await alertSuccess("ບໍ່ອະນຸມັດການຈອງສຳເລັດ");
      await fetchBookingDetail();
    } else {
      alertError(response?.message || "ບໍ່ສາມາດບໍ່ອະນຸມັດການຈອງໄດ້");
    }
  } catch (error) {
    alertError(
      error.response?.data?.message ||
      "ລະບົບຂັດຂ້ອງ ບໍ່ສາມາດບໍ່ອະນຸມັດການຈອງໄດ້",
    );
  } finally {
    closeNonApproveModal();
  }
};

const saveBookingDriver = async () => {
  if (!booking.value?.id) {
    alertWarning("ບໍ່ພົບ Booking ID");
    return;
  }
  if (!selectedDriverId.value) {
    alertWarning("ກະລຸນາເລືອກຄົນຂັບ");
    return;
  }

  savingDriver.value = true;
  try {
    const response = await updateBookingDriver(
      booking.value.id,
      selectedDriverId.value,
    );
    console.log("UPDATE DRIVER RESPONSE:", response);

    if (response?.status) {
      showDriverModal.value = false;
      selectedDriverId.value = null;
      await alertSuccess("ປ່ຽນຄົນຂັບສຳເລັດ");
      await fetchBookingDetail();
    } else {
      alertError(response?.message || "ບໍ່ສາມາດປ່ຽນຄົນຂັບໄດ້");
    }
  } catch (error) {
    console.error("Update driver error:", error);
    alertError(
      error.response?.data?.message || "ລະບົບຂັດຂ້ອງ ບໍ່ສາມາດປ່ຽນຄົນຂັບໄດ້",
    );
  } finally {
    savingDriver.value = false;
  }
};

const openDriverModal = async () => {
  showDriverModal.value = true;
  driversLoading.value = true;

  try {
    const response = await getAvailableDrivers();
    console.log("AVAILABLE DRIVERS:", response);

    if (response?.status && Array.isArray(response.data)) {
      availableDrivers.value = response.data;
      selectedDriverId.value = booking.value?.driver_id || null;
    } else {
      availableDrivers.value = [];
      alertError(response?.message || "ບໍ່ສາມາດໂຫຼດລາຍການຄົນຂັບໄດ້");
    }
  } catch (error) {
    console.error("Load drivers error:", error);
    alertError(error.response?.data?.message || "ບໍ່ສາມາດໂຫຼດລາຍການຄົນຂັບໄດ້");
  } finally {
    driversLoading.value = false;
  }
};

const receiveBookingCarAction = async () => {
  if (!booking.value?.id) {
    alertWarning("ບໍ່ພົບ Booking ID");
    return;
  }
  if (booking.value.state !== "returned") {
    alertWarning("ລົດຄັນນີ້ຍັງບໍ່ໄດ້ສົ່ງຄືນ");
    return;
  }

  const confirmed = await confirmDialog(
    "ທ່ານໄດ້ກວດສອບລົດ ແລະ ເລກໄມລ໌ ແລ້ວ ແລະ ຕ້ອງການຮັບລົດຄືນບໍ?",
    "ຮັບລົດຄືນ",
  );
  if (!confirmed) return;

  receivingCar.value = true;
  try {
    const response = await receiveBookingCar(booking.value.id);
    console.log("RECEIVE CAR RESPONSE:", response);

    if (response?.status) {
      await alertSuccess("ຮັບລົດຄືນສຳເລັດ");
      await fetchBookingDetail();
    } else {
      alertError(response?.message || "ບໍ່ສາມາດຮັບລົດຄືນໄດ້");
    }
  } catch (error) {
    console.error("Receive car error:", error);
    alertError(
      error.response?.data?.message || "ລະບົບຂັດຂ້ອງ ບໍ່ສາມາດຮັບລົດຄືນໄດ້",
    );
  } finally {
    receivingCar.value = false;
  }
};

const triggerReturnFileSelect = () => {
  returnFileInput.value?.click();
};
const triggerProblemFileSelect = () => {
  problemFileInput.value?.click();
};

// ==========================================
// OPEN RETURN MODAL
// ==========================================
const openReturnModal = () => {
  mileAfter.value = "";
  durationTime.value = "";

  returnFile.value = null;
  returnPreview.value = null;

  if (returnFileInput.value) {
    returnFileInput.value.value = "";
  }

  showReturnModal.value = true;
};
// ==========================================
// RETURN FILE
// ==========================================

const handleReturnPhotoCapture = (event) => {
  const file = event.target.files?.[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alertWarning("ກະລຸນາເລືອກຮູບພາບ");
    event.target.value = "";
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    const img = new Image();

    img.onload = () => {
      try {
        const maxSize = 1280;

        const scale = Math.min(
          1,
          maxSize / Math.max(img.width, img.height)
        );

        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));

        const ctx = canvas.getContext("2d");

        if (!ctx) {
          alertError("ບໍ່ສາມາດປະມວນຜົນຮູບພາບໄດ້");
          return;
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const compressedDataUrl = canvas.toDataURL(
          "image/jpeg",
          0.75
        );

        // Convert Base64 data URL to a JPEG File for API upload
        const base64 = compressedDataUrl.split(",")[1];
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);

        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }

        const compressedFile = new File(
          [bytes],
          `return_${Date.now()}.jpg`,
          { type: "image/jpeg" }
        );

        // Keep compressed JPEG File for API upload
        returnFile.value = compressedFile;

        // Keep Base64 for preview
        returnPreview.value = base64;

        console.log("Return image compressed:", {
          originalSize: file.size,
          compressedSize: compressedFile.size,
          width: canvas.width,
          height: canvas.height,
        });
      } catch (error) {
        console.error("Return image compression error:", error);
        alertError("ບໍ່ສາມາດຫຍໍ້ຮູບພາບໄດ້");
      }
    };

    img.onerror = () => {
      console.error("Cannot decode return image:", file.type);
      alertError(
        "ບໍ່ສາມາດເປີດຮູບພາບໄດ້ ກະລຸນາຖ່າຍຮູບໃໝ່"
      );
    };

    img.src = reader.result;
  };

  reader.onerror = (error) => {
    console.error("Return image read error:", error);
    returnFile.value = null;
    returnPreview.value = null;
    alertError("ບໍ່ສາມາດອ່ານຮູບພາບໄດ້");
  };

  reader.readAsDataURL(file);
};


// ==========================================
// SUBMIT RETURN CAR
// ==========================================

const submitReturnCar = async () => {
  if (!booking.value?.id) {
    alertWarning("ບໍ່ພົບ Booking ID");
    return;
  }

  if (
    mileAfter.value === "" ||
    mileAfter.value === null ||
    mileAfter.value === undefined
  ) {
    alertWarning("ກະລຸນາໃສ່ເລກໄມລ໌ຫຼັງເດີນທາງ");
    return;
  }
  const mileage = Number(mileAfter.value);
  if (!Number.isFinite(mileage) || mileage < 0) {
    alertWarning("ກະລຸນາກວດສອບເລກໄມລ໌");
    return;
  }

  returningCar.value = true;
  try {
    const response = await returnBookingCar(
      booking.value.id,
      mileage,
      durationTime.value,
      returnFile.value,
    );
    console.log("RETURN CAR RESPONSE:", response);

    if (response?.status === true) {
      showReturnModal.value = false;
      mileAfter.value = "";
      durationTime.value = "";
      returnFile.value = null;
      returnPreview.value = "";

      await alertSuccess("ສົ່ງລົດຄືນສຳເລັດ");
      await fetchBookingDetail();
    } else {
      console.error("Return car API rejected:", response);
      alertError(
        response?.message || response?.error || "ບໍ່ສາມາດສົ່ງລົດຄືນໄດ້",
      );
    }
  } catch (error) {
    console.error("Return car error:", error);
    console.error("HTTP status:", error.response?.status);
    console.error("Response data:", error.response?.data);

    const data = error.response?.data;
    const message =
      data?.message ||
      data?.error ||
      (typeof data === "string" ? data : null) ||
      error.message ||
      "Unknown error";

    alertError(`ສົ່ງລົດຄືນບໍ່ສຳເລັດ\n${message}`);
  } finally {
    returningCar.value = false;
  }
};

// ==========================================
// OPEN PROBLEM MODAL
// ==========================================
const openProblemModal = () => {
  problemDescription.value = "";

  problemFile.value = null;

  problemPreview.value = null;

  if (problemFileInput.value) {
    problemFileInput.value.value = "";
  }

  showProblemModal.value = true;
};
// ==========================================
// PROBLEM FILE
// ==========================================

const handleProblemPhotoCapture = (event) => {
  const file = event.target.files?.[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alertWarning("ກະລຸນາເລືອກຮູບພາບ");
    event.target.value = "";
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    const img = new Image();

    img.onload = () => {
      try {
        const maxSize = 1280;

        const scale = Math.min(
          1,
          maxSize / Math.max(img.width, img.height)
        );

        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));

        const ctx = canvas.getContext("2d");

        if (!ctx) {
          alertError("ບໍ່ສາມາດປະມວນຜົນຮູບພາບໄດ້");
          return;
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const compressedDataUrl = canvas.toDataURL(
          "image/jpeg",
          0.75
        );

        const base64 = compressedDataUrl.split(",")[1];
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);

        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }

        const compressedFile = new File(
          [bytes],
          `problem_${Date.now()}.jpg`,
          { type: "image/jpeg" }
        );

        // Keep compressed JPEG File for API upload
        problemFile.value = compressedFile;

        // Keep Base64 for preview
        problemPreview.value = base64;

        console.log("Problem image compressed:", {
          originalSize: file.size,
          compressedSize: compressedFile.size,
          width: canvas.width,
          height: canvas.height,
        });
      } catch (error) {
        console.error("Problem image compression error:", error);
        alertError("ບໍ່ສາມາດຫຍໍ້ຮູບພາບໄດ້");
      }
    };

    img.onerror = () => {
      console.error("Cannot decode problem image:", file.type);
      alertError(
        "ບໍ່ສາມາດເປີດຮູບພາບໄດ້ ກະລຸນາຖ່າຍຮູບໃໝ່"
      );
    };

    img.src = reader.result;
  };

  reader.onerror = (error) => {
    console.error("Problem image read error:", error);
    problemFile.value = null;
    problemPreview.value = null;
    alertError("ບໍ່ສາມາດອ່ານຮູບພາບໄດ້");
  };

  reader.readAsDataURL(file);
};

// ==========================================
// SUBMIT PROBLEM
// ==========================================
const submitProblem = async () => {
  if (!booking.value?.id) {
    alertWarning("ບໍ່ພົບ Booking ID");
    return;
  }
  if (!problemDescription.value.trim()) {
    alertWarning("ກະລຸນາລະບຸບັນຫາ");
    return;
  }

  reportingProblem.value = true;
  try {
    const response = await reportBookingProblem(
      booking.value.id,
      problemDescription.value.trim(),
      problemFile.value,
    );
    console.log("PROBLEM RESPONSE:", response);

    if (response?.status) {
      showProblemModal.value = false;
      problemDescription.value = "";
      problemFile.value = null;
      problemPreview.value = null;
      if (problemFileInput.value) {
        problemFileInput.value.value = "";
      }

      await alertSuccess("ສົ່ງແຈ້ງບັນຫາສຳເລັດ");
      await fetchBookingDetail();
    } else {
      alertError(response?.message || "ບໍ່ສາມາດແຈ້ງບັນຫາໄດ້");
    }
  } catch (error) {
    console.error("Report problem error:", error);
    alertError(error.response?.data?.message || "ລະບົບຂັດຂ້ອງ");
  } finally {
    reportingProblem.value = false;
  }
};

const approveBookingAction = async () => {
  if (!booking.value?.id) {
    alertWarning("ບໍ່ພົບ Booking ID");
    return;
  }
  if (booking.value.keep_driver && !booking.value.driver) {
    alertWarning("ກະລຸນາເລືອກຄົນຂັບກ່ອນ");
    return;
  }

  const confirmed = await confirmDialog(
    "ທ່ານຕ້ອງການອະນຸມັດການຈອງນີ້ບໍ?",
    "ອະນຸມັດ",
  );

  if (!confirmed) return;

  try {
    const response = await approveBooking(booking.value.id);
    console.log("APPROVE RESPONSE:", response);

    if (response?.status) {
      await alertSuccess("ອະນຸມັດການຈອງສຳເລັດ");
      await fetchBookingDetail();
    } else {
      alertError(response?.message || "ບໍ່ສາມາດອະນຸມັດການຈອງໄດ້");
    }
  } catch (error) {
    console.error("Approve booking error:", error);
    alertError(
      error.response?.data?.message || "ລະບົບຂັດຂ້ອງ ບໍ່ສາມາດອະນຸມັດການຈອງໄດ້",
    );
  }
};

const openCarModal = async () => {
  showCarModal.value = true;
  carsLoading.value = true;
  try {
    const response = await getAvailableCars();
    if (response?.status && Array.isArray(response.data)) {
      availableCars.value = response.data;
      // Current selected car
      selectedCarId.value =
        booking.value?.vehicle_id || booking.value?.booking_id || null;
    } else {
      availableCars.value = [];
      alertError(response?.message || "ບໍ່ສາມາດໂຫຼດລົດໄດ້");
    }
  } catch (error) {
    console.error("Load available cars error:", error);
    alertError(error.response?.data?.message || "ບໍ່ສາມາດໂຫຼດລາຍການລົດໄດ້");
  } finally {
    carsLoading.value = false;
  }
};

const saveBookingCar = async () => {
  if (!booking.value?.id) {
    alertWarning("ບໍ່ພົບ Booking ID");
    return;
  }
  if (!selectedCarId.value) {
    alertWarning("ກະລຸນາເລືອກລົດ");
    return;
  }
  savingCar.value = true;
  try {
    const response = await updateBookingCar(
      booking.value.id,
      selectedCarId.value,
    );
    if (response?.status) {
      showCarModal.value = false;
      await alertSuccess("ຈັດລົດສຳເລັດ");
      // Reload booking detail so vehicle_name/sign update
      await fetchBookingDetail();
    } else {
      alertError(response?.message || "ບໍ່ສາມາດຈັດລົດໄດ້");
    }
  } catch (error) {
    console.error("Save booking car error:", error);
    alertError(error.response?.data?.message || "ບໍ່ສາມາດບັນທຶກລົດໄດ້");
  } finally {
    savingCar.value = false;
  }
};

const isStatePassed = (validStatesArray) => {
  if (!booking.value || !booking.value.row_state) return false;
  return validStatesArray.includes(booking.value.row_state);
};
const fetchBookingDetail = async () => {
  loading.value = true;
  errorMessage.value = "";
  try {
    const bookingId = route.params.id;
    const response = await getEventDetail(bookingId);
    // Unpack data smoothly checking structure variants
    console.log("FETCH BOOKING DETAIL RESPONSE:", response);
    if (response && response.status) {
      booking.value = response.data;
    } else if (response && response.id) {
      booking.value = response;
    } else {
      errorMessage.value = "ບໍ່ສາມາດໂຫຼດຂໍ້ມູນການຈອງໄດ້.";
    }
  } catch (error) {
    console.error(error);
    errorMessage.value =
      error.response?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການເຂົ້າສູ່ລະບົບ.";
  } finally {
    loading.value = false;
  }
};
const startTripAction = async () => {
  if (!booking.value?.id) return;
  console.log("Starting trip for booking:", booking);

  const confirmed = await confirmDialog(
    `ທ່ານຕ້ອງການເລີ່ມຕົ້ນການເດີນທາງ ລາຍການຈອງ ${booking.value.booking_number} ບໍ?`,
    "ເລີ່ມຕົ້ນເດີນທາງ",
  );
  if (!confirmed) return;

  // Redirects directly to the new start trip checklist collection form entry layout view
  router.push(`/booking/start-trip/${booking.value.id}`);
};

// const loadCachedGroups = () => {
//   const storedGroups = localStorage.getItem("groups_id");

//   if (!storedGroups) {
//     groups_ids.value = [];
//     return;
//   }

//   try {

//     const parsedGroups = JSON.parse(storedGroups);

//     groups_ids.value = Array.isArray(parsedGroups) ? parsedGroups : [];

//     console.log("CACHED GROUPS:", groups_ids.value);
//   } catch (error) {
//     console.error("Invalid groups_id in localStorage:", error);
//     groups_ids.value = [];
//   }
// };

const syncUserGroups = async () => {
  try {
    const result = await getGroups();

    console.log("LIVE USER GROUPS:", result);

    // Odoo API failed
    if (!result || result.status !== true) {
      console.warn("Unable to validate user:", result?.message);

      // Only logout when API explicitly says invalid/expired
      if (
        result?.status === false &&
        (result.message?.toLowerCase().includes("expired") ||
          result.message?.toLowerCase().includes("invalid") ||
          result.message?.toLowerCase().includes("unauthorized"))
      ) {
        logout();
      }

      return;
    }

    // =========================
    // Update username
    // =========================
    currentUsername.value = result.username || "User";

    localStorage.setItem("username", currentUsername.value);

    // =========================
    // Update groups
    // =========================
    const liveGroups = Array.isArray(result.groups_id) ? result.groups_id : [];

    groups_ids.value = liveGroups;

    localStorage.setItem("groups_id", JSON.stringify(liveGroups));

    console.log("Updated groups:", groups_ids.value);
  } catch (error) {
    console.error("Failed to synchronize user groups:", error);

    // Keep cached groups if network/Odoo is temporarily unavailable.
  }
};

onMounted(async () => {
  fetchBookingDetail();
  await syncUserGroups();
});

</script>

<style scoped>
.text-xxs {
  font-size: 0.78rem;
}

.align-items-baseline {
  align-items: baseline !important;
}
</style>