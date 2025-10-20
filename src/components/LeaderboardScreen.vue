<template>
  <div class="leaderboard-screen">
    <!-- Home button overlay -->
    <div class="home-button" @click="$emit('playAgain')"></div>
    
    <!-- Leaderboard Grid -->
    <div class="leaderboard-grid">
      <!-- Row 1 -->
      <div class="grid-rank" :class="{ 'current-player-text': isCurrentPlayer(1) }">1</div>
      <div class="grid-points" :class="{ 'current-player-text': isCurrentPlayer(1) }">{{ getPlayerByRank(1)?.score ?? 'XXXX' }}</div>
      <div class="grid-name" :class="{ 'current-player-text': isCurrentPlayer(1) }">{{ getPlayerByRank(1)?.initials || 'JVG' }}</div>
      <div class="grid-answers" :class="{ 'current-player-text': isCurrentPlayer(1) }">{{ getPlayerByRank(1)?.correctAnswers || '6' }}</div>
      <div class="grid-time" :class="{ 'current-player-text': isCurrentPlayer(1) }">{{ formatTime(getPlayerByRank(1)) }}</div>
      <div class="grid-arrow">
        <div v-if="isCurrentPlayer(1)" class="current-player-arrow"></div>
      </div>

      <!-- Row 2 -->
      <div class="grid-rank" :class="{ 'current-player-text': isCurrentPlayer(2) }">2</div>
      <div class="grid-points" :class="{ 'current-player-text': isCurrentPlayer(2) }">{{ getPlayerByRank(2)?.score ?? 'XXXX' }}</div>
      <div class="grid-name" :class="{ 'current-player-text': isCurrentPlayer(2) }">{{ getPlayerByRank(2)?.initials || 'JVG' }}</div>
      <div class="grid-answers" :class="{ 'current-player-text': isCurrentPlayer(2) }">{{ getPlayerByRank(2)?.correctAnswers || '6' }}</div>
      <div class="grid-time" :class="{ 'current-player-text': isCurrentPlayer(2) }">{{ formatTime(getPlayerByRank(2)) }}</div>
      <div class="grid-arrow">
        <div v-if="isCurrentPlayer(2)" class="current-player-arrow"></div>
      </div>

      <!-- Row 3 -->
      <div class="grid-rank" :class="{ 'current-player-text': isCurrentPlayer(3) }">3</div>
      <div class="grid-points" :class="{ 'current-player-text': isCurrentPlayer(3) }">{{ getPlayerByRank(3)?.score ?? 'XXXX' }}</div>
      <div class="grid-name" :class="{ 'current-player-text': isCurrentPlayer(3) }">{{ getPlayerByRank(3)?.initials || 'JVG' }}</div>
      <div class="grid-answers" :class="{ 'current-player-text': isCurrentPlayer(3) }">{{ getPlayerByRank(3)?.correctAnswers || '6' }}</div>
      <div class="grid-time" :class="{ 'current-player-text': isCurrentPlayer(3) }">{{ formatTime(getPlayerByRank(3)) }}</div>
      <div class="grid-arrow">
        <div v-if="isCurrentPlayer(3)" class="current-player-arrow"></div>
      </div>

      <!-- Row 4 -->
      <div class="grid-rank" :class="{ 'current-player-text': isCurrentPlayer(4) }">4</div>
      <div class="grid-points" :class="{ 'current-player-text': isCurrentPlayer(4) }">{{ getPlayerByRank(4)?.score ?? 'XXXX' }}</div>
      <div class="grid-name" :class="{ 'current-player-text': isCurrentPlayer(4) }">{{ getPlayerByRank(4)?.initials || 'JVG' }}</div>
      <div class="grid-answers" :class="{ 'current-player-text': isCurrentPlayer(4) }">{{ getPlayerByRank(4)?.correctAnswers || '5' }}</div>
      <div class="grid-time" :class="{ 'current-player-text': isCurrentPlayer(4) }">{{ formatTime(getPlayerByRank(4)) }}</div>
      <div class="grid-arrow">
        <div v-if="isCurrentPlayer(4)" class="current-player-arrow"></div>
      </div>

      <!-- Row 5 -->
      <div class="grid-rank" :class="{ 'current-player-text': isCurrentPlayer(5) }">5</div>
      <div class="grid-points" :class="{ 'current-player-text': isCurrentPlayer(5) }">{{ getPlayerByRank(5)?.score ?? 'XXXX' }}</div>
      <div class="grid-name" :class="{ 'current-player-text': isCurrentPlayer(5) }">{{ getPlayerByRank(5)?.initials || 'JVG' }}</div>
      <div class="grid-answers" :class="{ 'current-player-text': isCurrentPlayer(5) }">{{ getPlayerByRank(5)?.correctAnswers || '5' }}</div>
      <div class="grid-time" :class="{ 'current-player-text': isCurrentPlayer(5) }">{{ formatTime(getPlayerByRank(5)) }}</div>
      <div class="grid-arrow">
        <div v-if="isCurrentPlayer(5)" class="current-player-arrow"></div>
      </div>
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
  // Use the database leaderboard data
  let allEntries = [...gameStore.leaderboard];
  
  // If coming from results screen, mark the current player in the existing leaderboard
  if (props.isFromResultsScreen && props.currentPlayer?.initials) {
    // Find and mark the current player's entry in the leaderboard instead of adding a duplicate
    allEntries = allEntries.map(entry => {
      // Match by initials, score, and recent timestamp (within last few seconds)
      const isRecentEntry = entry.date && new Date() - new Date(entry.date) < 5000; // 5 seconds
      const isCurrentPlayer = entry.initials === props.currentPlayer.initials && 
                             entry.score === props.currentPlayer.score && 
                             isRecentEntry;
      return isCurrentPlayer ? { ...entry, isCurrentPlayer: true } : entry;
    });
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

/* CSS Grid Leaderboard */
.leaderboard-grid {
  position: absolute;
  top: 338px;
  left: 433px;
  display: grid;
  grid-template-columns: 182px 227px 200px 248px 128px 435px; /* rank points name answers time arrow */
  grid-template-rows: repeat(5, 114px); /* 5 rows with spacing between them */
  gap: 0;
  align-items: center;
}

/* Grid cell styles */
.grid-rank,
.grid-points,
.grid-name, 
.grid-answers,
.grid-time {
  color: #FFF;
  font-family: 'PF Fuel Grime', sans-serif;
  font-size: 48px;
  font-weight: 400;
  text-align: center;
  align-self: flex-start;
  justify-content: flex-start;
  display: flex;
}

.grid-arrow {
  position: relative;
  align-self: center;
}

/* Current player highlighting */
.current-player-text {
  color: #FFC130 !important;
}

/* Current player arrow */
.current-player-arrow {
  width: 0;
  height: 0;
  border-right: 98px solid #FFC130;
  border-top: 49px solid transparent;
  border-bottom: 49px solid transparent;
  margin: 0 auto;
  margin-top: -45px;
}
</style>