<template>
  <div class="result-screen">
    <!-- Home button overlay -->
    <div class="home-button" @click="$emit('playAgain')"></div>
    
    <!-- Score display in the box -->
    <div class="score-box">
      {{ score }}
    </div>
    
    <!-- See Where You Rank button -->
    <div class="rank-button" @click="$emit('viewLeaderboard')"></div>
    
    <!-- Play Again button -->
    <div class="play-again-button" @click="$emit('playAgain')"></div>
  </div>
</template>

<script setup>
const props = defineProps({
  playerInitials: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  playerType: {
    type: String,
    required: true
  },
  correctAnswers: {
    type: Number,
    required: true,
    default: 0
  },
  bonusTimeScore: {
    type: Number,
    default: 0
  }
});

defineEmits(['viewLeaderboard', 'playAgain']);
</script>

<style scoped>
.result-screen {
  width: 100vw;
  height: 100vh;
  background-image: url('/end-screen.png');
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
  z-index: 10;
}

.home-button:hover {
  opacity: 0.8;
}

/* Score display positioned in the dark box */
.score-box {
  position: absolute;
  top: 140px;
  left: 530px;
  width: 400px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFC130;
  font-family: 'PF Fuel Grime', sans-serif;
  font-size: 72px;
  font-weight: 400;
  text-align: center;
}

/* See Where You Rank button - positioned over the orange button */
.rank-button {
  position: absolute;
  top: 115px;
  right: 80px;
  width: 320px;
  height: 50px;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.rank-button:hover {
  opacity: 0.8;
}

/* Play Again button - positioned over the orange button */
.play-again-button {
  position: absolute;
  top: 175px;
  right: 80px;
  width: 240px;
  height: 50px;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.play-again-button:hover {
  opacity: 0.8;
}
</style>