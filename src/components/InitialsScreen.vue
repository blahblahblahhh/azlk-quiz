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
      <div class="input-container">
        <span v-if="!initials" class="blinking-cursor">⎸</span>
        <input
          ref="initialsInput"
          type="text"
          v-model="initials"
          maxlength="3"
          placeholder="XXX"
          class="initials-input"
          @input="formatInitials"
          autofocus
        />
      </div>
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
import { ref, onMounted, nextTick } from 'vue';

const initials = ref('');
const showTOS = ref(false);
const initialsInput = ref(null);
const emit = defineEmits(['continue', 'back', 'home']);

onMounted(async () => {
  await nextTick();
  if (initialsInput.value) {
    initialsInput.value.focus();
  }
});

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
  caret-color: transparent;
}

.initials-input:focus {
  caret-color: transparent;
}

.input-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.blinking-cursor {
  position: absolute;
  color: #25575F;
  font-size: 149.233px;
  font-weight: 700;
  font-family: 'PF Fuel Grime', sans-serif;
  animation: blink 1s infinite;
  pointer-events: none;
  z-index: 1;
  left: 55%;
  transform: translateX(-130px);
  line-height: 82%;
  height: 122.371px;
  overflow: hidden;
}

@keyframes blink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0;
  }
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