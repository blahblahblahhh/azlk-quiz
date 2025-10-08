# CountdownScreen.vue
<template>
  <div class="countdown-container">
    <div class="countdown-content">
      <transition name="fade" mode="out-in">
        <div :key="currentWord" class="countdown-word" :class="wordClasses">
          {{ currentWord }}
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';

const words = ['READY.', 'SET.', 'CONTROL.'];
const currentWord = ref('');
const emit = defineEmits(['complete']);
let wordIndex = 0;
let interval = null;

// Computed property to dynamically set the class based on current word
const wordClasses = computed(() => {
  return {
    'text-white': currentWord.value === 'READY.' || currentWord.value === 'SET.',
    'text-primary': currentWord.value === 'CONTROL.'
  }
});

onMounted(() => {
  currentWord.value = words[0];
  
  interval = setInterval(() => {
    wordIndex++;
    if (wordIndex < words.length) {
      currentWord.value = words[wordIndex];
    } else {
      clearInterval(interval);
      emit('complete');
    }
  }, 1000);
});

onBeforeUnmount(() => {
  if (interval) clearInterval(interval);
});
</script>

<style scoped>
.countdown-container {
  min-height: 100vh;
  background: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)),
              url('/countdown.png') center/cover no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  font-family: 'PF Fuel Grime';
}

.countdown-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.5) 100%);
}

.countdown-content {
  position: relative;
  z-index: 1;
}

.countdown-word {
  animation: grow 0.8s ease-in-out;
  font-size: 330px;
  font-weight: 700;
  color: var(--primary-color);
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-family: 'PF Fuel Grime';
}

/* Text color classes with higher specificity */
.countdown-word.text-white {
  color: white !important;
}

.countdown-word.text-primary {
  color: var(--primary-color) !important;
}

@keyframes grow {
  from {
    transform: scale(0.5);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>