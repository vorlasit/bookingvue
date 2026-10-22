
<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="global-image-overlay"
      @click.self="close"
    >
      <button
        class="global-image-close"
        type="button"
        aria-label="Close image"
        @click="close"
      >
        &times;
      </button>

      <img
        :src="imageUrl"
        class="global-image-content"
        alt="Image preview"
      />
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

const visible = ref(false);
const imageUrl = ref("");

const open = (src) => {
  if (!src) return;
  imageUrl.value = src;
  visible.value = true;
  document.body.style.overflow = "hidden";
};

const close = () => {
  visible.value = false;
  imageUrl.value = "";
  document.body.style.overflow = "";
};

const handleClick = (event) => {
  const target = event.target;

  if (!(target instanceof HTMLImageElement)) return;

  // Do not preview images inside the popup itself.
  if (target.closest(".global-image-overlay")) return;

  // Ignore tiny decorative icons.
  if (target.width < 40 || target.height < 40) return;

  open(target.currentSrc || target.src);
};

const handleKeydown = (event) => {
  if (event.key === "Escape") close();
};

onMounted(() => {
  document.addEventListener("click", handleClick);
  window.addEventListener("keydown", handleKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClick);
  window.removeEventListener("keydown", handleKeydown);
  document.body.style.overflow = "";
});
</script>

<style>
.global-image-overlay {
  position: fixed;
  inset: 0;
  z-index: 30000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.9);
}

.global-image-content {
  max-width: 95vw;
  max-height: 90vh;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 8px;
}

.global-image-close {
  position: absolute;
  top: 12px;
  right: 20px;
  color: white;
  background: transparent;
  border: none;
  font-size: 42px;
  cursor: pointer;
}
</style>
