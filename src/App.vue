
<script setup>
import { onMounted, onBeforeUnmount } from "vue";
import GlobalImagePreview from "./components/GlobalImagePreview.vue";

let dateCheckInterval = null;

function getTodayInLaos() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Vientiane",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, value])
  );

  return `${values.year}-${values.month}-${values.day}`;
}

function logout() {
  [
    "user-token",
    "user",
    "company_name",
    "username",
    "groups_id",
    "image",
    "login-date",
  ].forEach((key) => localStorage.removeItem(key));

  window.location.replace("/");
}

function checkLoginDate() {
  const token = localStorage.getItem("user-token");

  if (!token) return;

  const today = getTodayInLaos();
  const loginDate = localStorage.getItem("login-date");

  console.log("loginDate:", loginDate, "today:", today);

  if (!loginDate || loginDate !== today) {
    logout();
  }
}

function checkVisibility() {
  if (document.visibilityState === "visible") {
    checkLoginDate();
  }
}

onMounted(() => {
  checkLoginDate();

  dateCheckInterval = window.setInterval(
    checkLoginDate,
    10000
  );

  document.addEventListener(
    "visibilitychange",
    checkVisibility
  );
});

onBeforeUnmount(() => {
  if (dateCheckInterval !== null) {
    window.clearInterval(dateCheckInterval);
  }

  document.removeEventListener(
    "visibilitychange",
    checkVisibility
  );
});
</script>


<template>    
<router-view />
  <GlobalImagePreview /> 
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
</style>
