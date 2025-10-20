<template>
  <div class="countdown-container">
    <!-- AstraZeneca Logo -->
    <div class="logo-container">
      <img src="/AZLOGO.png" alt="AstraZeneca" class="az-logo">
    </div>
    
    <!-- Main Text -->
    <div class="countdown-text">
      {{ currentWord }}
    </div>
    
    <!-- Animated Skewed Containers -->
    <div class="skewed-containers">
      <!-- Container 1 -->
      <div class="skewed-container" :class="{ 'container-visible': currentStep >= 1 }">
        1
      </div>
      <!-- Container 2 -->
      <div class="skewed-container" :class="{ 'container-visible': currentStep >= 2 }">
        2
      </div>
      <!-- Container 3 -->
      <div class="skewed-container" :class="{ 'container-visible': currentStep >= 3 }">
        3
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';

const words = ['Ready,', 'Set,', 'WIN!'];
const currentWord = ref('');
const currentStep = ref(0);
const emit = defineEmits(['complete']);
let interval = null;

onMounted(() => {
  // Step 1: Container 1 slides in + "Ready,"
  setTimeout(() => {
    currentStep.value = 1;
    currentWord.value = words[0]; // "Ready,"
  }, 0);
  
  // Step 2: Container 2 slides in + "Set,"
  setTimeout(() => {
    currentStep.value = 2;
    currentWord.value = words[1]; // "Set,"
  }, 1000);
  
  // Step 3: Container 3 slides in + "WIN!"
  setTimeout(() => {
    currentStep.value = 3;
    currentWord.value = words[2]; // "WIN!"
  }, 2000);
  
  // Complete after brief pause
  setTimeout(() => {
    emit('complete');
  }, 3000);
});

onBeforeUnmount(() => {
  if (interval) clearInterval(interval);
});
</script>

<style scoped>
.countdown-container {
  min-height: 100vh;
  background: #3F6B72;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  font-family: 'PF Fuel Grime', sans-serif;
}

.logo-container {
  position: absolute;
  bottom: 40px;
  right: 40px;
  z-index: 10;
}

.az-logo {
  height: 30px;
  width: auto;
}

.countdown-text {
  font-size: 120px;
  font-weight: 700;
  color: white;
  text-align: center;
  margin-bottom: 50px;
  z-index: 5;
  position: relative;
}

.skewed-containers {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  position: relative;
  height: 600px;
  width: 100%;
  overflow: hidden;
}

.skewed-container {
  background: #003B45;
  width: 600px;
  height: 300px;
  flex-shrink: 0;
  transform: skewX(-15deg) translateX(100vw);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 120px;
  font-weight: 700;
  color: white;
  opacity: 0;
  transition: transform 0.8s ease-out, opacity 0.8s ease-out;
}

.skewed-container.container-visible {
  opacity: 1;
  transform: skewX(-15deg) translateX(0);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .countdown-text {
    font-size: 80px;
  }
  
  .skewed-container {
    width: 180px;
    height: 120px;
    font-size: 60px;
    gap: 15px;
  }
  
  .logo-container {
    bottom: 20px;
    right: 20px;
  }
  
  .az-logo {
    height: 25px;
  }
}

@media (max-width: 480px) {
  .countdown-text {
    font-size: 60px;
  }
  
  .skewed-container {
    width: 120px;
    height: 80px;
    font-size: 40px;
    gap: 10px;
  }
}
</style>