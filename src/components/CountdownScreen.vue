<template>
  <div class="countdown-container" :class="{ 'fade-out': isComplete }">
    <!-- AstraZeneca Logo -->
    <div class="logo-container">
      <img src="/AZLOGO.png" alt="AstraZeneca" class="az-logo">
    </div>
    
    <!-- Main Text -->
    <div class="countdown-text">
      {{ currentWord }}
    </div>
    
    <!-- Animated Skewed Containers -->
    <div class="skewed-containers-viewport">
      <div 
        class="skewed-containers-marquee" 
        :style="{ transform: `translateX(${100 - (currentStep * 100)}vw)` }"
      >
        <!-- Container 1 -->
        <div class="skewed-container">
          <span class="number">1</span>
        </div>
        <!-- Container 2 -->
        <div class="skewed-container">
          <span class="number">2</span>
        </div>
        <!-- Container 3 -->
        <div class="skewed-container">
          <span class="number">3</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';

const words = ['Ready,', 'Set,', 'WIN!'];
const currentWord = ref('');
const currentStep = ref(0);
const isComplete = ref(false);
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
  }, 1500);
  
  // Step 3: Container 3 slides in + "WIN!"
  setTimeout(() => {
    currentStep.value = 3;
    currentWord.value = words[2]; // "WIN!"
  }, 2500);
  
  // Start fade out after brief pause
  setTimeout(() => {
    isComplete.value = true;
    // Emit complete after fade out finishes
    setTimeout(() => {
      emit('complete');
    }, 500); // Wait for fade-out animation to complete
  }, 4000);
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
  font-family: "Bebas Neue Pro", sans-serif;
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.countdown-container.fade-out {
  animation: fadeOut 0.5s ease-out forwards;
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
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

.skewed-containers-viewport {
  position: relative;
  height: 584.461px;
  width: 100vw;
  overflow: hidden;
}

.skewed-containers-marquee {
  display: flex;
  width: 3600px;
  height: 584.461px;
  transition: transform 2.5s ease-out;
  transform: translateX(100vw);
  gap: 20px;
}

.skewed-container {
  background: #003B45;
  width: 1168.175px;
  height: 584.461px;
  flex-shrink: 0;
  transform: skewX(-32deg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.number {
  transform: skewX(32deg);
  font-size: 200px;
  font-weight: 700;
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