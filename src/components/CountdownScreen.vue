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
      <div 
        v-for="(container, index) in visibleContainers" 
        :key="`${wordIndex}-${index}`"
        class="skewed-container"
        :style="{ animationDelay: `${index * 0.2}s` }"
      >
        {{ container }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';

const words = ['Ready,', 'Set,', 'WIN!'];
const currentWord = ref('');
const wordIndex = ref(0);
const emit = defineEmits(['complete']);
let interval = null;

// Computed property for which containers to show
const visibleContainers = computed(() => {
  const containers = [];
  for (let i = 1; i <= wordIndex.value + 1; i++) {
    containers.push(i.toString());
  }
  return containers;
});

onMounted(() => {
  currentWord.value = words[0];
  
  interval = setInterval(() => {
    wordIndex.value++;
    if (wordIndex.value < words.length) {
      currentWord.value = words[wordIndex.value];
    } else {
      clearInterval(interval);
      setTimeout(() => {
        emit('complete');
      }, 1000); // Wait 1 second after final animation
    }
  }, 1500); // Increased timing to 1.5 seconds per word
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
  height: 200px;
  width: 100%;
}

.skewed-container {
  background: #003B45;
  width: 250px;
  height: 150px;
  transform: skewX(-15deg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 80px;
  font-weight: 700;
  color: white;
  animation: slideInFromRight 0.6s ease-out forwards;
  opacity: 0;
  transform: skewX(-15deg) translateX(100px);
}

@keyframes slideInFromRight {
  from {
    opacity: 0;
    transform: skewX(-15deg) translateX(100px);
  }
  to {
    opacity: 1;
    transform: skewX(-15deg) translateX(0);
  }
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