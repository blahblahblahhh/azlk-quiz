<template>
  <div class="leaderboard-screen">
    <!-- Home button overlay -->
    <div class="home-button" @click="$emit('playAgain')"></div>
    
    <!-- Row 1 -->
    <div class="leaderboard-row row-1" :class="{ 'current-player': isCurrentPlayer(1) }">
      <!-- Rank -->
      <div class="rank">1</div>
      <!-- Points -->
      <div class="points">{{ getPlayerByRank(1)?.score || 'XXXX' }}</div>
      <!-- Name -->
      <div class="name">{{ getPlayerByRank(1)?.initials || 'JVG' }}</div>
      <!-- Answers -->
      <div class="answers">{{ getPlayerByRank(1)?.correctAnswers || '6' }}</div>
      <!-- Time -->
      <div class="time">{{ formatTime(getPlayerByRank(1)) }}</div>
      <!-- Current player arrow -->
      <div v-if="isCurrentPlayer(1)" class="current-player-arrow"></div>
    </div>

    <!-- Row 2 -->
    <div class="leaderboard-row row-2" :class="{ 'current-player': isCurrentPlayer(2) }">
      <!-- Rank -->
      <div class="rank">2</div>
      <!-- Points -->
      <div class="points">{{ getPlayerByRank(2)?.score || 'XXXX' }}</div>
      <!-- Name -->
      <div class="name">{{ getPlayerByRank(2)?.initials || 'JVG' }}</div>
      <!-- Answers -->
      <div class="answers">{{ getPlayerByRank(2)?.correctAnswers || '6' }}</div>
      <!-- Time -->
      <div class="time">{{ formatTime(getPlayerByRank(2)) }}</div>
      <!-- Current player arrow -->
      <div v-if="isCurrentPlayer(2)" class="current-player-arrow"></div>
    </div>

    <!-- Row 3 -->
    <div class="leaderboard-row row-3" :class="{ 'current-player': isCurrentPlayer(3) }">
      <!-- Rank -->
      <div class="rank">3</div>
      <!-- Points -->
      <div class="points">{{ getPlayerByRank(3)?.score || 'XXXX' }}</div>
      <!-- Name -->
      <div class="name">{{ getPlayerByRank(3)?.initials || 'JVG' }}</div>
      <!-- Answers -->
      <div class="answers">{{ getPlayerByRank(3)?.correctAnswers || '6' }}</div>
      <!-- Time -->
      <div class="time">{{ formatTime(getPlayerByRank(3)) }}</div>
      <!-- Current player arrow -->
      <div v-if="isCurrentPlayer(3)" class="current-player-arrow"></div>
    </div>

    <!-- Row 4 -->
    <div class="leaderboard-row row-4" :class="{ 'current-player': isCurrentPlayer(4) }">
      <!-- Rank -->
      <div class="rank">4</div>
      <!-- Points -->
      <div class="points">{{ getPlayerByRank(4)?.score || 'XXXX' }}</div>
      <!-- Name -->
      <div class="name">{{ getPlayerByRank(4)?.initials || 'JVG' }}</div>
      <!-- Answers -->
      <div class="answers">{{ getPlayerByRank(4)?.correctAnswers || '5' }}</div>
      <!-- Time -->
      <div class="time">{{ formatTime(getPlayerByRank(4)) }}</div>
      <!-- Current player arrow -->
      <div v-if="isCurrentPlayer(4)" class="current-player-arrow"></div>
    </div>

    <!-- Row 5 -->
    <div class="leaderboard-row row-5" :class="{ 'current-player': isCurrentPlayer(5) }">
      <!-- Rank -->
      <div class="rank">5</div>
      <!-- Points -->
      <div class="points">{{ getPlayerByRank(5)?.score || 'XXXX' }}</div>
      <!-- Name -->
      <div class="name">{{ getPlayerByRank(5)?.initials || 'JVG' }}</div>
      <!-- Answers -->
      <div class="answers">{{ getPlayerByRank(5)?.correctAnswers || '5' }}</div>
      <!-- Time -->
      <div class="time">{{ formatTime(getPlayerByRank(5)) }}</div>
      <!-- Current player arrow -->
      <div v-if="isCurrentPlayer(5)" class="current-player-arrow"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useGameStore } from '../stores/game';

const gameStore = useGameStore();

const props = defineProps({
  leaderboard: {
    type: Array,
    required: true
  },
  currentPlayer: {
    type: Object,
    default: () => ({ initials: 'TSD', score: 560 })
  },
  isFromResultsScreen: {
    type: Boolean,
    default: false
  }
});

const displayLeaderboard = ref([]);

// Watch for changes in the leaderboard data
watch(() => gameStore.leaderboard, (newLeaderboard) => {
  if (newLeaderboard.length > 0) {
    processLeaderboard();
  }
}, { deep: true });

onMounted(async () => {
  // Ensure the database is initialized
  await gameStore.initializeDatabase();
  
  // If the leaderboard is empty, try to load it
  if (gameStore.leaderboard.length === 0) {
    await gameStore.loadLeaderboard();
  }
  
  processLeaderboard();
});

function processLeaderboard() {
  // Create a copy of the current player with the isCurrentPlayer flag
  const currentPlayerEntry = props.currentPlayer?.initials 
    ? { ...props.currentPlayer, isCurrentPlayer: true } 
    : { initials: 'TSD', score: 560, isCurrentPlayer: true };
  
  // Use the database leaderboard data
  let allEntries = [...gameStore.leaderboard];
  
  // If coming from results screen, include the current player in the leaderboard
  if (props.isFromResultsScreen) {
    // Add current player
    allEntries.push(currentPlayerEntry);
  }
  
  // Sort by score (descending)
  allEntries.sort((a, b) => {
    // Primary sort by score
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    // Secondary sort by bonusTimeScore if scores are equal
    if (b.bonusTimeScore !== undefined && a.bonusTimeScore !== undefined && b.bonusTimeScore !== a.bonusTimeScore) {
      return b.bonusTimeScore - a.bonusTimeScore;
    }
    // Tertiary sort by date (more recent first) if both scores are equal
    if (b.date && a.date) {
      return new Date(b.date) - new Date(a.date);
    }
    return 0;
  });
  
  // Display only top 5
  displayLeaderboard.value = allEntries.slice(0, 5);
}

function getPlayerByRank(rank) {
  // Guard against out-of-bounds access
  if (rank < 1 || rank > displayLeaderboard.value.length) {
    return null;
  }
  
  // Get player at specific index in display leaderboard
  return displayLeaderboard.value[rank - 1];
}

function isCurrentPlayer(rank) {
  const player = getPlayerByRank(rank);
  return player && player.isCurrentPlayer === true && props.isFromResultsScreen;
}

function formatTime(player) {
  if (!player || !player.bonusTimeScore) {
    return '2:00';
  }
  
  // Calculate time taken (30 seconds max per question * 7 questions = 210 seconds total)
  // Subtract bonus time to get actual time taken
  const totalTime = 210; // 7 questions * 30 seconds
  const timeTaken = totalTime - player.bonusTimeScore;
  
  const minutes = Math.floor(timeTaken / 60);
  const seconds = timeTaken % 60;
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

defineEmits(['playAgain']);
</script>

<style scoped>
.leaderboard-screen {
  width: 100vw;
  height: 100vh;
  background-image: url('/leaderboard-screen.png');
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

/* Base leaderboard row styles */
.leaderboard-row {
  position: absolute;
  min-width: 700px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  left: 382px;
  /* padding: 0 200px; */
}

/* Row positioning based on background image */
.row-1 {
  top: 341px;
  left: 382px;
}

.row-2 {
  top: 455px;
}

.row-3 {
  top: 572px;
}

.row-4 {
  top: 686px;
}

.row-5 {
  top: 802px;
}

/* Text elements - evenly spaced within rows */
.rank,
.points,
.name,
.answers,
.time {
  color: #FFF;
  font-family: 'PF Fuel Grime', sans-serif;
  font-size: 48px;
  font-weight: 400;
  text-align: center;
  flex: 1;
}

/* Current player highlighting */
.current-player .rank,
.current-player .points,
.current-player .name,
.current-player .answers,
.current-player .time {
  color: #FFC130 !important;
}

/* Current player arrow */
.current-player-arrow {
  position: absolute;
  right: 180px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 30px solid #FFC130;
  border-top: 15px solid transparent;
  border-bottom: 15px solid transparent;
}
</style>