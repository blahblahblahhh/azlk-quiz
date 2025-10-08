<template>
  <div class="welcome-screen">
    <!-- Leaderboard button overlay -->
    <div 
      class="button-overlay leaderboard-button" 
      @click="$emit('viewLeaderboard')"
    ></div>
    
    <!-- Play Game button overlay -->
    <div 
      class="button-overlay play-game-button" 
      @click="$emit('start')"
    ></div>
  </div>
</template>

<script setup>
defineEmits(['start', 'viewLeaderboard']);
</script>

<style scoped>
.welcome-screen {
  width: 100vw;
  height: 100vh;
  background-image: url('/start-screen.png');
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
}

.button-overlay {
  position: absolute;
  cursor: pointer;
  transition: opacity 0.2s ease;
  /* border: 1px solid red; */
}

.button-overlay:hover {
  opacity: 0.8;
}

/* Leaderboard button - top right */
.leaderboard-button {
  top: 51px;
  right: 42px;
  width: 364.174px;
  height: 62px;
}

/* Play Game button - bottom right */
.play-game-button {
  bottom: 231px;
  right: 225px;
  width: 591px;
  height: 116px;
  background-image: url('/start-button.png');
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
  transition: transform 0.2s ease, filter 0.2s ease;
}

.play-game-button:hover,
.play-game-button:active {
  transform: scale(1.05);
  filter: brightness(1.1);
}

/* Optional: Add a subtle background for debugging/visibility */
.button-overlay:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}
</style>