<!-- InitialsScreen.vue with TOS step -->
<template>
  <!-- TOS Screen -->
  <div v-if="showTOS" class="tos-screen">
    <!-- Home button overlay -->
    <div class="home-button" @click="$emit('back')"></div>
    
    <!-- Go Back button overlay -->
    <div class="go-back-button" @click="goBackFromTOS"></div>
    
    <!-- Continue button overlay -->
    <div 
      class="continue-button continue-button--active"
      @click="$emit('continue', initials)"
    ></div>
  </div>
  
  <!-- Initial Initials Screen -->
  <div v-else class="initials-screen">
    <!-- Home button overlay -->
    <div class="home-button" @click="$emit('back')"></div>
    
    <!-- Go Back button overlay -->
    <div class="go-back-button" @click="$emit('back')"></div>
    
    <!-- Initials input area -->
    <div class="initials-input-area">
      <input
        type="text"
        v-model="initials"
        maxlength="3"
        placeholder="XXX"
        class="initials-input"
        @input="formatInitials"
      />
    </div>
    
    <!-- Continue button overlay -->
    <div 
      class="continue-button" 
      :class="{ 'continue-button--active': initials }"
      @click="initials && showTOSScreen()"
    ></div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const initials = ref('');
const showTOS = ref(false);
const emit = defineEmits(['continue', 'back', 'home']);

function formatInitials(event) {
  initials.value = event.target.value.toUpperCase().replace(/[^A-Z]/g, '');
}

function showTOSScreen() {
  showTOS.value = true;
}

function goBackFromTOS() {
  showTOS.value = false;
}
</script>

<style scoped>
.initials-screen {
  width: 100vw;
  height: 100vh;
  background-image: url('/initials.png');
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
}

.tos-screen {
  width: 100vw;
  height: 100vh;
  background-image: url('/tos.png');
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
}

/* Home button - top left */
.home-button {
  position: absolute;
  top: 5px;
  left: 30px;
  width: 65px;
  height: 65px;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.home-button:hover {
  opacity: 0.8;
}

/* Go Back button - top right */
.go-back-button {
  position: absolute;
  top: 45px;
  right: 120px;
  width: 180px;
  height: 60px;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.go-back-button:hover {
  opacity: 0.8;
}

/* Initials input area - center left */
.initials-input-area {
  position: absolute;
  top: 462px;
  left: 127px;
  width: 410px;
  height: 157px;
}

.initials-input {
  background: transparent;
  border: none;
  color: #25575F;
  font-size: 149.233px;
  font-style: normal;
  font-weight: 700;
  line-height: 82%; /* 122.371px */
  letter-spacing: -2.985px;
  text-align: center;
  font-family: 'PF Fuel Grime', sans-serif;
  width: 100%;
  height: 100%;
  outline: none;
}

.initials-input::placeholder {
  color: #AA8306;
  font-size: 149.233px;
  font-style: normal;
  font-weight: 700;
  line-height: 82%; /* 122.371px */
  letter-spacing: -2.985px;
  font-family: 'PF Fuel Grime', sans-serif;
}

/* Continue button - bottom right */
.continue-button {
  position: absolute;
  bottom: 133px;
  right: 320px;
  width: 591px;
  height: 116px;
  cursor: not-allowed;
  transition: opacity 0.2s ease, transform 0.2s ease;
  opacity: 0.5;
}

/* TOS continue button - smaller and different position */
.tos-screen .continue-button {
  bottom: 62px;
  right: 321px;
  width: 326px;
  height: 70px;
  aspect-ratio: 163/32;
  flex-shrink: 0;
}

.continue-button--active {
  cursor: pointer;
  opacity: 1;
}

.continue-button--active:hover {
  transform: scale(1.02);
  opacity: 0.9;
}
</style>