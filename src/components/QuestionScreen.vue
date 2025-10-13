<template>
  <!-- Wrapper div with v-if/v-else -->
  <div v-if="question">
    <!-- Video Background -->
    <video 
      ref="backgroundVideo"
      class="background-video"
      muted
      playsinline
      preload="auto"
      @canplaythrough="onVideoReady"
      @error="onVideoError"
    >
      <source src="/walking-video.mp4" type="video/mp4">
    </video>
    
    <transition name="question-fade" mode="out-in">
      <div v-if="showQuestionContent" class="quiz-screen" :class="timerBackgroundClass">
        <div class="question-overlay">
          <div class="question-header row mb-4">
            <div class="col-12">
              <!-- Timer Section -->
              <div class="timer-section">
                <div class="timer-bar-container">
                  <div class="progress">
                    <div 
                      class="progress-bar" 
                      :class="timerColorClass"
                      role="progressbar" 
                      :style="{ width: `${(timeRemaining / 30) * 100}%` }"
                    ></div>
                  </div>
                  <div class="timer-text-display">
                    {{ timeRemaining }} SECOND{{ timeRemaining !== 1 ? 'S' : '' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="corner-home-button">
            <img src="/back-to-home.png" alt="Home" class="corner-home" @click="$emit('playAgain')">
          </div>

          <div :class="['question-content', 'question-' + question.id]">
            <!-- Question Number Badge -->
            <div class="question-number-badge">
              <span>Question {{ currentQuestionIndex + 1 }}</span>
            </div>
            
            <!-- Question Text -->
            <h2 class="question-proper" v-html="question.text"></h2>
            
            <!-- Answer Options Grid -->
            <div class="answer-options-grid" :class="{ 'four-options': question.options.length === 4 }">
              <!-- Four options in one row -->
              <div v-if="question.options.length === 4" class="answer-option-row-four">
                <div
                  v-for="(option, index) in question.options"
                  :key="index"
                  class="answer-option-skewed"
                  :class="{
                    'selected': selectedAnswer === option,
                    'correct': showExplanation && option === question.correctAnswer,
                    'incorrect': showExplanation && selectedAnswer === option && option !== question.correctAnswer,
                    'faded': (selectedAnswer || timeRemaining === 0) && selectedAnswer !== option && option !== question.correctAnswer
                  }"
                  @click="!showExplanation && handleAnswer(option)"
                >
                  <div class="option-text-with-icon">
                    <div class="option-text" v-html="option"></div>
                    <img v-if="showExplanation && option === question.correctAnswer" src="/correct-check.png" alt="Correct" class="answer-icon">
                    <img v-if="showExplanation && selectedAnswer === option && option !== question.correctAnswer" src="/incorrect-x.png" alt="Incorrect" class="answer-icon">
                  </div>
                </div>
              </div>
              
              <!-- Six options in two rows -->
              <template v-else>
                <!-- First row - left aligned -->
                <div class="answer-option-row-1">
                  <div
                    v-for="(option, index) in question.options.slice(0, 3)"
                    :key="index"
                    class="answer-option-skewed"
                    :class="{
                      'selected': selectedAnswer === option,
                      'correct': showExplanation && option === question.correctAnswer,
                      'incorrect': showExplanation && selectedAnswer === option && option !== question.correctAnswer,
                      'faded': (selectedAnswer || timeRemaining === 0) && selectedAnswer !== option && option !== question.correctAnswer
                    }"
                    @click="!showExplanation && handleAnswer(option)"
                  >
                    <div class="option-text-with-icon">
                      <div class="option-text" v-html="option"></div>
                      <img v-if="showExplanation && option === question.correctAnswer" src="/correct-check.png" alt="Correct" class="answer-icon">
                      <img v-if="showExplanation && selectedAnswer === option && option !== question.correctAnswer" src="/incorrect-x.png" alt="Incorrect" class="answer-icon">
                    </div>
                  </div>
                </div>
                
                <!-- Second row - right aligned -->
                <div class="answer-option-row-2" v-if="question.options.length > 3">
                  <div
                    v-for="(option, index) in question.options.slice(3)"
                    :key="index + 3"
                    class="answer-option-skewed"
                    :class="{
                      'selected': selectedAnswer === option,
                      'correct': showExplanation && option === question.correctAnswer,
                      'incorrect': showExplanation && selectedAnswer === option && option !== question.correctAnswer,
                      'faded': (selectedAnswer || timeRemaining === 0) && selectedAnswer !== option && option !== question.correctAnswer
                    }"
                    @click="!showExplanation && handleAnswer(option)"
                  >
                    <div class="option-text-with-icon">
                      <div class="option-text" v-html="option"></div>
                      <img v-if="showExplanation && option === question.correctAnswer" src="/correct-check.png" alt="Correct" class="answer-icon">
                      <img v-if="showExplanation && selectedAnswer === option && option !== question.correctAnswer" src="/incorrect-x.png" alt="Incorrect" class="answer-icon">
                    </div>
                  </div>
                </div>
              </template>
            </div>
            
            <!-- Explanation Banner - positioned below questions -->
            <transition name="explanation-slide-up">
              <div v-if="showExplanation && question.hasOwnProperty('explanation')" class="explanation-banner-container">
                <div class="explanation-banner-skewed">
                  <div class="explanation-content">
                    <div v-if="question.explanation && question.explanation.trim()" class="explanation-text" v-html="question.explanation"></div>
                    <img v-else :src="['/question-' + question.id + '-box.png']">
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </div>
        
        <!-- Additional Info Container - Fixed to bottom -->
        <transition name="explanation-fade">
          <div v-if="showExplanation" class="addl-info-container" :class="{ active: showAdditionalInfo }">
            <button 
              class="addl-info-btn"
              @click="toggleAdditionalInfo"
            >
              <span>Abbreviations & References</span>
            </button>
            <div v-if="showAdditionalInfo" class="explanation-desc">
              <img :src="['/question-' + question.id + '-notes.png']">
            </div>
          </div>
        </transition>
        
        <transition name="fade">
          <div v-if="showExplanation && question.hasOwnProperty('finePrint')" :class="['question-' + question.id + ' fine-print']">
            <div class="fine-print-content">
              <div v-if="question.finePrint && question.finePrint.trim()" class="fine-print-text" v-html="question.finePrint"></div>
              <img v-else :src="['/question-' + question.id + '-fineprint.png']">
            </div>
          </div>
        </transition>
        <div class="button-container text-center mt-4">
          <button 
            class="btn btn-primary btn-lg"
            @click="$emit('next')"
            :disabled="!selectedAnswer && timeRemaining > 0"
          >
            <span>{{ isLastQuestion ? 'Finish' : 'Next Question' }}</span>
            <img src="/next-q.png">
          </button>
        </div>
      </div>
    </transition>
  </div>
  <div v-else class="container py-4">
    <div class="alert alert-warning">
      Loading question... 
      <button class="btn btn-sm btn-outline-warning ms-3" @click="reloadQuestion">Retry Loading</button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, onMounted, watch, computed, ref } from 'vue';
import { useGameStore } from '../stores/game';
import GaugeTimer from './GaugeTimerComponent.vue';

const gameStore = useGameStore();
const showNotes = ref(false);
const backgroundVideo = ref(null);
const videoReady = ref(false);
const showQuestionContent = ref(false);

const props = defineProps({
  question: {
    type: Object,
    required: true,
    validator(value) {
      if (!value) return false;
      return typeof value.text === 'string' && 
             Array.isArray(value.options) &&
             typeof value.correctAnswer !== 'undefined' &&
             typeof value.explanation === 'string';
    }
  },
  currentQuestionIndex: {
    type: Number,
    required: true
  },
  timeRemaining: {
    type: Number,
    required: true
  },
  selectedAnswer: {
    type: String,
    default: null
  },
  showExplanation: {
    type: Boolean,
    default: false
  },
  showAdditionalInfo: {
    type: Boolean,
    default: false
  },
  showFinePrint: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['answer', 'next', 'playAgain']);

onMounted(() => {
  validateQuestion();
});

watch(() => props.question, () => {
  validateQuestion();
}, { deep: true });

function validateQuestion() {
  if (!props.question) {
    console.error('Question is undefined in QuestionScreen');
    return;
  }
  
  if (!props.question.text) {
    console.error('Question text is missing:', props.question);
    return;
  }
  
  if (!Array.isArray(props.question.options) || props.question.options.length === 0) {
    console.error('Question options are invalid:', props.question);
    return;
  }
}

function handleAnswer(answer) {
  if (!props.question) {
    console.error('Cannot handle answer: question is undefined');
    return;
  }
  emit('answer', answer);
}

function toggleAdditionalInfo() {
  gameStore.state.showAdditionalInfo = !gameStore.state.showAdditionalInfo;
}

function toggleFinePrint() {
  gameStore.toggleFinePrint();
}

function reloadQuestion() {
  console.log('Attempting to reload question...');
  gameStore.initializeQuestions();
  gameStore.state.currentQuestionIndex = 0;
}

function getTextStyle() {
  if (!props.question || !props.question.options) return {};
  
  const maxLength = Math.max(...props.question.options.map(opt => {
    const plainText = opt.replace(/<[^>]*>/g, '');
    return plainText.length;
  }));
  
  if (maxLength <= 20) {
    return { fontSize: '38px' };
  }
  
  let fontSize = '38px';
  
  // if (maxLength > 60) {
  //   fontSize = '22px';
  // } else if (maxLength > 40) {
  //   fontSize = '28px';
  // } else if (maxLength > 30) {
  //   fontSize = '32px';
  // }
  
  return { fontSize: fontSize };
}

const isLastQuestion = computed(() => 
  props.currentQuestionIndex === gameStore.questionsList.length - 1
);

const timerColorClass = computed(() => {
  if (props.timeRemaining <= 18) {
    return 'bg-danger timer-red';
  } else if (props.timeRemaining <= 24) {
    return 'bg-warning timer-orange';
  } else {
    return 'bg-success timer-green';
  }
});

const timerBackgroundClass = computed(() => {
  if (props.timeRemaining <= 6) {
    return 'bg-red-xtra';
  } else if (props.timeRemaining <= 18) {
    return 'bg-red';
  } else if (props.timeRemaining <= 24) {
    return 'bg-yellow';
  } else {
    return 'bg-green';
  }
});

const valveImage = computed(() => {
  if (props.timeRemaining <= 18) {
    return 'RED_VALVE';
  } else if (props.timeRemaining <= 24) {
    return 'YELLOW_VALVE';
  } else {
    return 'GREEN_VALVE';
  }
});

const valveShakeAnimation = computed(() => {
  if (props.timeRemaining <= 18) {
    return 'intense-shake';
  } else if (props.timeRemaining <= 24) {
    return 'medium-shake';
  } else {
    return 'gentle-shake';
  }
});

const valveShakeDuration = computed(() => {
  if (props.timeRemaining <= 18) {
    return 1;
  } else if (props.timeRemaining <= 24) {
    return 2;
  } else {
    return 3;
  }
});

// Simple video event handlers
function onVideoReady() {
  console.log('Video ready to play');
  videoReady.value = true;
  if (backgroundVideo.value && backgroundVideo.value.currentTime === 0) {
    startVideoFromBeginning();
  }
}

function onVideoError(event) {
  console.error('Video loading error:', event);
  // Skip video and show content immediately
  showQuestionContent.value = true;
  setTimeout(() => {
    gameStore.startTimer();
  }, 100);
}

// Video segment durations for each question (in seconds)
function getVideoDuration(questionIndex) {
  const durations = [
    5, // Question 1: 5 seconds (0:00 to 0:05)
    6, // Question 2: 6 seconds (0:05 to 0:11)  
    4, // Question 3: 4 seconds (0:11 to 0:15)
    6, // Question 4: 6 seconds (0:15 to 0:21)
    5, // Question 5: 5 seconds (0:21 to 0:26)
    5, // Question 6: 5 seconds (0:26 to 0:31)
    10 // Question 7: 10 seconds (0:31 to end, or reasonable duration)
  ];
  
  return durations[questionIndex] || 5;
}

function startVideoFromBeginning() {
  if (!backgroundVideo.value || !videoReady.value) return;
  
  const duration = getVideoDuration(0) * 1000; // Convert to milliseconds
  console.log(`Starting video from beginning - will play for ${duration/1000} seconds`);
  showQuestionContent.value = false;
  
  backgroundVideo.value.play().then(() => {
    setTimeout(() => {
      if (backgroundVideo.value) {
        backgroundVideo.value.pause();
      }
      showQuestionContent.value = true;
      gameStore.startTimer();
    }, duration);
  }).catch(() => {
    showQuestionContent.value = true;
    gameStore.startTimer();
  });
}

function continueVideo() {
  if (!backgroundVideo.value || !videoReady.value) {
    showQuestionContent.value = true;
    gameStore.startTimer();
    return;
  }
  
  const duration = getVideoDuration(props.currentQuestionIndex) * 1000; // Convert to milliseconds
  console.log(`Continuing video from current position - will play for ${duration/1000} seconds`);
  showQuestionContent.value = false;
  
  backgroundVideo.value.play().then(() => {
    setTimeout(() => {
      if (backgroundVideo.value) {
        backgroundVideo.value.pause();
      }
      showQuestionContent.value = true;
      gameStore.startTimer();
    }, duration);
  }).catch(() => {
    showQuestionContent.value = true;
    gameStore.startTimer();
  });
}

function stopVideo() {
  if (backgroundVideo.value) {
    console.log('Pausing video...');
    backgroundVideo.value.pause();
  }
}

// Watch for when question changes
watch(() => props.currentQuestionIndex, (newIndex, oldIndex) => {
  if (newIndex !== oldIndex) {
    console.log('New question detected, index:', newIndex);
    
    if (newIndex === 0 && oldIndex === undefined) {
      // First question of the game - start from beginning
      showQuestionContent.value = false;
      if (videoReady.value) {
        startVideoFromBeginning();
      } else {
        // If video not ready, wait for it or fallback
        setTimeout(() => {
          if (videoReady.value) {
            startVideoFromBeginning();
          } else {
            showQuestionContent.value = true;
            gameStore.startTimer();
          }
        }, 500);
      }
    } else if (oldIndex !== undefined) {
      // Transitioning between questions - continue video
      showQuestionContent.value = false;
      setTimeout(() => {
        continueVideo();
      }, 300);
    }
  }
}, { immediate: true });

// Watch for timer changes
watch(() => props.timeRemaining, (newTime, oldTime) => {
  if (newTime === 0 || (oldTime > 0 && newTime === 0)) {
    stopVideo();
  }
});

// Watch for when an answer is selected to stop video
watch(() => props.selectedAnswer, (selectedAnswer) => {
  if (selectedAnswer) {
    stopVideo();
  }
});

// Watch for explanation showing to stop video
watch(() => props.showExplanation, (showExplanation) => {
  if (showExplanation) {
    stopVideo();
  }
});
</script>

<style scoped>
/* Background Video */
.background-video {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  object-fit: cover;
  z-index: -1;
  pointer-events: none;
}

.quiz-screen {
  height: 100vh;
  width: 100vw;
  position: relative;
  overflow: hidden;
  transition: background 0.5s ease;
}

/* Background images replaced with video background */
.quiz-screen.bg-green,
.quiz-screen.bg-yellow,
.quiz-screen.bg-red,
.quiz-screen.bg-red-xtra {
  /* Video background will be used instead of static images */
}

.question-overlay {
  height: 100%;
  width: 100%;
  padding: 0;
  color: white;
}

.question-header {
    position: absolute;
    top: 128px;
    right: 200px;
}

.question-number {
  background: #F3BE00;
  text-transform: uppercase;
  margin: 0 auto;
  padding: 10px 15px;
  position: absolute;
  margin: 0 auto;
  left: 0;
  right: 0;
  top: -25px;
  width: 161px;
  color: var(--Background-color-alternate, #0D161F);
  text-align: center;
  font-family: 'PF Fuel Grime';
  font-size: 35px;
  font-style: normal;
  font-weight: 400;
  line-height: 92%;
  letter-spacing: -0.35px;
}

h2 {
  color: white;
  font-size: 2.5rem;
  font-weight: 600;
}

.question-proper {
  padding-top: 3rem;
  color: var(--Color-Brand-white, #FFF);
  text-align: center;
  font-family: "Bebas Neue Pro";
  font-size: 50px;
  font-style: normal;
  font-weight: 700;
  line-height: 108%;
  letter-spacing: -1px;
}

/* Question Number Badge */
.question-number-badge {
  position: absolute;
  top: 0px;
  right: 838px;
  padding: 5px;
  color: #003B45;
  text-align: center;
  font-family: "Bebas Neue Pro";
  font-size: 35px;
  font-style: normal;
  font-weight: 400;
  line-height: 92%; /* 32.2px */
  letter-spacing: -0.35px;
  z-index: 10;
  text-transform: uppercase;
  background: #FCB515;
  width: 218.83px;
  height: 39.94px;
  flex-shrink: 0; 
  transform: skew(-15deg);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Counter-skew the text inside the badge */
.question-number-badge span {
  transform: skew(15deg);
}

/* Question Text */
.question-proper {
  color: #003B45;
  text-align: center;
  font-size: 70px;
  font-style: normal;
  font-weight: 700;
  line-height: 108%; /* 75.6px */
  letter-spacing: -1.4px;
  margin: 0;
  width: 100%;
  max-width: 100%;
  padding-top: 93px;
}

/* Answer Options Grid */
.answer-options-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin: 0 auto;
  padding-top: 20px;
}

/* Four options in one row - centered */
.answer-options-grid .answer-option-row-four {
  display: flex;
  justify-content: center;
  gap: 20px;
}

/* First row - left aligned */
.answer-options-grid .answer-option-row-1 {
  display: flex;
  justify-content: flex-start;
  gap: 20px;
}

/* Second row - right aligned */
.answer-options-grid .answer-option-row-2 {
  display: flex;
  justify-content: flex-end;
  gap: 20px;
}

/* Skewed Answer Options */
.answer-option-skewed {
  width: 492.751px;
  height: 98px;
  background: rgba(255, 255, 255, 0.70);
  border: 2px solid #25575F;
  transform: skew(-15deg);
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  margin: 10px 0;
}

/* Four options layout - smaller width */
.answer-options-grid.four-options .answer-option-skewed {
  width: 366.751px;
}

.answer-option-skewed:hover {
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transform: skew(-15deg) translateY(-2px);
}

.answer-option-skewed .option-text-with-icon {
  transform: skew(15deg);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 0 20px;
  width: 100%;
}

.answer-option-skewed .option-text {
  color: #25575F;
  text-align: center;
  font-family: Inter;
  font-size: 30px;
  font-style: normal;
  font-weight: 600;
  line-height: 150%; /* 45px */
  letter-spacing: -0.6px;
}

/* Correct answer icon - appears at front */
.answer-icon[src="/correct-check.png"] {
  width: 39px;
  height: 37px;
  flex-shrink: 0;
  order: -1; /* Places icon before text */
}

/* Wrong answer icon - appears at front */
.answer-icon[src="/incorrect-x.png"] {
  width: 35px;
  height: 35px;
  flex-shrink: 0;
  aspect-ratio: 1/1;
  order: -1; /* Places icon before text */
}

.answer-option-skewed.selected {
  background: rgba(37, 87, 95, 0.1);
  border-color: #25575F;
  box-shadow: 0 0 15px rgba(37, 87, 95, 0.3);
}

.answer-option-skewed.correct {
  background: #00917D !important;
  border-color: #00917D !important;
}

.answer-option-skewed.correct .option-text {
  color: white !important;
}

.answer-option-skewed.incorrect {
  background: #FCB514 !important;
  border-color: #FCB514 !important;
}

.answer-option-skewed.incorrect .option-text {
  color: #25575F !important;
}

.answer-option-skewed.faded {
  opacity: 0.5;
  cursor: not-allowed;
}


.question-content {
  max-width: 100%;
  padding: 0;
  margin: 0;
}

/* Explanation Banner */
.explanation-banner-container {
  margin-top: 60px;
  display: flex;
  justify-content: center;
  width: 100%;
}

.explanation-banner-skewed {
  width: 1781.886px;
  height: 132px;
  background-color: #00917D;
  transform: skew(-15deg);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.explanation-banner-skewed .explanation-content {
  transform: skew(15deg);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.explanation-banner-skewed .explanation-content .explanation-text {
  color: #FFF;
  font-size: 25px;
  font-style: normal;
  font-weight: 500;
  line-height: 27px; /* 108% */
  letter-spacing: -0.5px;
  text-align: center;
  padding: 0;
  margin: 0;
  font-family: "Inter";
}

.explanation-banner-skewed .explanation-content img {
  max-width: 90%;
  max-height: 80%;
  object-fit: contain;
}

/* Explanation slide-up transition */
.explanation-slide-up-enter-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.explanation-slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.explanation-slide-up-enter-from {
  opacity: 0;
  transform: translateY(50px);
}

.explanation-slide-up-leave-to {
  opacity: 0;
  transform: translateY(30px);
}


.gentle-shake {
  animation: gentle-shake 3s infinite;
}

.medium-shake {
  animation: medium-shake 2s infinite;
}

.intense-shake {
  animation: intense-shake 1s infinite;
}

@keyframes gentle-shake {
  0% { transform: rotate(0deg); }
  25% { transform: rotate(2deg); }
  50% { transform: rotate(0deg); }
  75% { transform: rotate(-2deg); }
  100% { transform: rotate(0deg); }
}

@keyframes medium-shake {
  0% { transform: rotate(0deg); }
  25% { transform: rotate(5deg); }
  50% { transform: rotate(0deg); }
  75% { transform: rotate(-5deg); }
  100% { transform: rotate(0deg); }
}

@keyframes intense-shake {
  0% { transform: rotate(0deg); }
  25% { transform: rotate(10deg); }
  50% { transform: rotate(0deg); }
  75% { transform: rotate(-10deg); }
  100% { transform: rotate(0deg); }
}

/* FIXED-WIDTH QUESTION OPTIONS STYLING */
.options {
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: flex-start;
}

.question-option-wrapper {
  position: relative;
  margin-bottom: 25px;
  display: flex;
  align-items: center;
}

.indicator-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 85px;
}

.light-indicator {
  position: absolute;
  width: 102.298px;
  height: 102.298px;
  z-index: 2;
  border-radius: 50%;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.check-icon, .x-icon {
  position: absolute;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.check-icon img {
  width: 60.65px;
  height: 62.375px;
  flex-shrink: 0;
}

.x-icon img {
  width: 102.298px;
  height: 102.298px;
  flex-shrink: 0;
}

.faded-option {
  background: linear-gradient(180deg, rgba(54, 103, 127, 0.60) 0%, rgba(87, 123, 154, 0.60) 100%) !important;
  opacity: 0.7;
}

.faded-option .option-text {
  opacity: 0.5;
}

.faded-option-img {
  filter: grayscale(50%) blur(0.5px);
}

/* IMPORTANT: Fixed width for all options */
.question-option {
  /* width: 677px !important;
  min-width: 677px !important;
  max-width: 677px !important; */
  position: relative;
  cursor: pointer;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: 82.131px;
  max-height: 82.131px;
  color: white;
  padding: 0 30px;
  border: 2.5px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  margin-left: -15px;
  box-sizing: border-box !important;
  /* Only transition these properties, NOT width */
  transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease !important;
}

.option-content {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.option-orange {
  background-color: rgba(0, 0, 0, 0.6);
  border: 2px solid #FFA114;
}

.option-teal {
  background-color: rgba(0, 0, 0, 0.6);
  border: 2px solid #29CBD5;
}

.option-purple {
  background-color: rgba(0, 0, 0, 0.6);
  border: 2px solid #E44AFF;
}

.option-blue {
  background-color: rgba(0, 0, 0, 0.6);
  border: 2px solid #2554D8;
}

.correct-orange {
  border-radius: 8.842px;
  border: 2.618px solid #FFA114 !important;
  background: linear-gradient(180deg, rgba(54, 103, 127, 0.60) 0%, rgba(87, 123, 154, 0.60) 100%) !important;
}

.correct-teal {
  border-radius: 8.842px;
  border: 2.618px solid #29CBD5 !important;
  background: linear-gradient(180deg, rgba(54, 103, 127, 0.60) 0%, rgba(87, 123, 154, 0.60) 100%) !important;
}

.correct-purple {
  border-radius: 8.842px;
  border: 2.618px solid #E44AFF !important;
  background: linear-gradient(180deg, rgba(54, 103, 127, 0.60) 0%, rgba(87, 123, 154, 0.60) 100%) !important;
}

.correct-blue {
  border-radius: 8.842px;
  border: 2.618px solid #2554D8 !important;
  background: linear-gradient(180deg, rgba(54, 103, 127, 0.60) 0%, rgba(87, 123, 154, 0.60) 100%) !important;
}

.option-text {
  color: var(--Color-Brand-white, #FFF);
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.76px;
  margin-left: 15px;
  display: block;
  white-space: normal;
  overflow-wrap: break-word;
}

.question-option:hover:not(.selected):not(.correct-orange):not(.correct-teal):not(.correct-purple):not(.correct-blue):not(.incorrect) {
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.question-option.selected {
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
}

.question-option.incorrect {
  border-color: #dc3545;
  background-color: rgba(220, 53, 69, 0.3);
}

.question-option.show-correct {
  animation: pulse 2s infinite;
}

/* TIMER STYLES */
.timer-section {
  width: 400px;
  margin-left: auto;
}

.timer-bar-container {
  display: flex;
  align-items: center;
  gap: 15px;
}

.progress {
  height: 12px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  position: relative;
  overflow: hidden;
  flex: 1;
  border: 1px solid rgba(255, 255, 255, 0.5);
  display: flex;
  justify-content: flex-end;
}

.progress-bar {
  height: 100%;
  border-radius: 6px;
  position: relative;
  transition: all 1s linear;
}

.timer-green {
  background-color: #4CAF50 !important;
}

.timer-orange {
  background-color: #FF9800 !important;
}

.timer-red {
  background-color: #F44336 !important;
}

.timer-text-display {
  color: white;
  font-weight: bold;
  font-size: 16px;
  text-transform: uppercase;
  white-space: nowrap;
  min-width: 80px;
  text-align: right;
}

/* IMPROVED QUESTION WRAPPER TRANSITIONS */
.question-wrapper {
  display: flex;
  flex-direction: row;
  width: 100%;
  margin-top: 50px;
  justify-content: center;
  position: relative;
  transition: all 0.5s ease;
}

.question-with-answers {
  max-width: 100%;
  transition: all 0.5s ease;
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
}

.question-wrapper.show-explanation {
  gap: 30px;
  justify-content: flex-start;
}

.question-wrapper.show-explanation .question-with-answers {
  flex: 0 0 50%;
  max-width: 50%;
  transition: all 0.5s ease;
}

.question-wrapper:not(.show-explanation) .question-with-answers {
  max-width: 100%;
  flex: 0 0 100%;
  transition: all 0.5s ease;
}

/* EXPLANATION CONTAINER STYLING */
.explanation-container {
  flex: 0 0 45%;
  max-width: 45%;
  margin-top: 0;
  z-index: 10;
  position: absolute;
  right: 0px;
  top: 0;
  transform: translateX(0);
  transition: all 0.5s ease;
  visibility: visible;
}

.centered-wrapper .question-with-answers {
  justify-content: center;
}

.question-wrapper.show-explanation .question-with-answers {
  justify-content: flex-start;
}

/* New transition group for explanation fade with transform */
.explanation-fade-enter-active,
.explanation-fade-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.explanation-fade-enter-from {
  opacity: 0;
  transform: translateX(50px);
}

.explanation-fade-leave-to {
  opacity: 0;
  transform: translateX(50px);
}

.explanation-card {
  padding: 30px;
  margin-left: 30px;
  transition: all 0.3s ease;
  width: 421px;
  min-height: 466px;
  margin-top: -50px;
}

.explanation-card.correct-answer {
  background-image: url('/correct-bg.png');
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat; 
  height: 500px;
  margin-top: -75px;
}

.explanation-card.incorrect-answer {
  border-color: #dc3545;
  background-image: url('/incorrect-bg.png');
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat; 
  height: 422px;
}

.explanation-title {
  font-weight: bold;
  margin-bottom: 20px;
  font-size: 2.25rem;
}

.explanation-card.correct-answer .explanation-title {
  color: #28a745;
}

.explanation-card.incorrect-answer .explanation-title {
  color: #dc3545;
}

.explanation-card p {
  font-size: 1.8rem;
  line-height: 1.5;
  padding: 75px 10px;
  color: #FFF;
  text-align: center;
  text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  font-family: Inter;
  font-size: 27px;
  font-style: normal;
  font-weight: 700;
  line-height: 136%; /* 36.72px */
}

.explanation-text img {
    width: 100%;
}

.explanation-card {
    display: flex;
    justify-content: center;
    align-items: center;
    padding-bottom: 10px;
}

/* Regular fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-in-enter-active {
  transition: opacity 0.8s ease;
}

.fade-in-leave-active {
  transition: opacity 0.3s ease;
}

.fade-in-enter-from,
.fade-in-appear-from {
  opacity: 0;
}

.fade-in-leave-to {
  opacity: 0;
}

/* Question content fade transition */
.question-fade-enter-active,
.question-fade-leave-active {
  transition: opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.question-fade-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(20px);
}

.question-fade-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-20px);
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
  }
}

.centered-options .options {
  display: flex;
  flex-direction: column;
  justify-content: center;
  transition: all 0.5s ease;
}

.question-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  transition: all 0.5s ease;
  align-items: center;
}

.question-container.centered-container {
  justify-content: center;
}

.question-with-answers {
  max-width: 100%;
  transition: all 0.5s ease;
}

/* Regular transition for other elements */
@media (max-width: 1200px) {
  .question-wrapper.show-explanation {
    flex-direction: column;
  }
  
  .question-wrapper.show-explanation .question-with-answers,
  .explanation-container {
    flex: 0 0 100%;
    max-width: 100%;
  }
  
  .explanation-container {
    position: relative;
    margin-top: 20px;
  }
}

.addl-info-container {
  position: fixed;
  right: -50px;
  bottom: 0px;
  z-index: 100;
  transition: transform 0.4s ease;
  text-align: left;
}

.addl-info-btn {
  width: 439.321px;
  height: 60px;
  flex-shrink: 0;
  color: #FFF;
  text-align: center;
  font-family: "Bebas Neue Pro";
  font-size: 30px;
  font-style: normal;
  font-weight: 400;
  line-height: 92%; /* 27.6px */
  letter-spacing: -0.3px;
  text-transform: uppercase;
  background: rgba(0, 59, 69, 0.90);
  transform: skew(-15deg);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.addl-info-btn span {
  transform: skew(15deg) !important;
  display: inline-block;
}

.addl-info-btn::after {
  content: "";
  height: 34px;
  width: 34px;
  background-image: url('/drawer.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  transform: skew(15deg);
  transition: transform 0.3s ease;
}

.active .addl-info-btn::after {
  transform: skew(15deg) rotate(180deg);
}

.addl-info-btn:hover {
  background-color: #ffd966;
}

.explanation-desc {
  background-color: #25575F;
  padding: 20px 150px 0px 50px;
  overflow-y: auto;
  width: 100%;
  min-width: 1143.236px;
  min-height: 154px;
  flex-shrink: 0;
  color: #000;
  font-family: 'Inter';
  font-size: 12px;
  font-style: normal;
  font-weight: 700;
  line-height: 17px;
  transform: skew(-15deg);
}

.explanation-desc img {
  transform: skew(15deg);
  width: 100%;
}

.explanation-desc img {
  width: 100%;
}

.fine-print {
  margin-top: 20px;
  position: absolute;
  bottom: 100px;
  left: 64px;
}

.fine-print-content {
  color: #fff;
  font-family: 'Inter';
  font-size: 11px;
  font-style: normal;
  font-weight: 400;
  line-height: 13px;
}

@media (max-width: 768px) {
  .addl-info-container {
    width: 220px;
    left: 20px;
    bottom: 20px;
  }
  
  .addl-info-btn {
    font-size: 12px;
    padding: 8px 15px;
  }
  
  .explanation-desc, .fine-print-content {
    padding: 15px;
    font-size: 0.85rem;
  }
}

.button-container {
    position: absolute;
    right: 0px;
    bottom: 92px;
}

.button-container button.btn.btn-primary.btn-lg {
    height: 68px;
    width: 253px;
    border-radius: 0;
    transform: skew(-15deg);
    display: flex;
    align-items: center;
    justify-content: center;
}

.button-container button.btn.btn-primary.btn-lg span {
    color: #003B45;
    text-align: center;
    font-size: 30px;
    font-style: normal;
    font-weight: 400;
    line-height: 92%; /* 27.6px */
    letter-spacing: -0.3px;
    text-transform: uppercase;
    font-family: 'PF Fuel Grime';
}

.button-container button.btn.btn-primary.btn-lg span,
.button-container button.btn.btn-primary.btn-lg img {
    transform: skew(15deg);
}

.question-text {
    border-radius: 10.615px;
    background: rgba(0, 0, 0, .20);
    backdrop-filter: blur(2.122950792312622px);
    padding: 10px;
    text-align: center;
    display: flex;
    flex-direction: column;
    margin: 0 auto;
}

.centered-wrapper .options {
    align-items: center;
}

.fine-print img {
  width: 100%;
}

/**** FIGMA */
.question-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
}

/* General question styles */
.question-text {
  width: 826px;
}

.question-option {
  min-width: 467.4px !important;
}

.question-wrapper.show-explanation {
  max-width: 900px;
}

.explanation-text {
  padding-top: 45px;
}

/* Fine-print styles */
.fine-print {
  width: 852px;
}

/* Explanation text width and padding overrides */
.question-1 .explanation-text {
  padding-top: 60px;
}

.question-2 .explanation-text {
  padding-top: 35px;
}

.question-6 .explanation-text {
  padding-top: 55px;
  width: 305.821px;
  height: 333.608px;
  flex-shrink: 0;
}

.question-9 .explanation-text,
.question-8 .explanation-text,
.question-11 .explanation-text,
.question-12 .explanation-text,
.question-13 .explanation-text,
.question-16 .explanation-text,
.question-17 .explanation-text,
.question-18 .explanation-text {
  padding-top: 45px;
}

.question-10 .explanation-text,
.question-13 .explanation-text,
.question-14 .explanation-text,
.question-15 .explanation-text,
.question-19 .explanation-text {
  padding-top: 37px;
  width: 320.052px;
}

.question-2 .explanation-text img {
  width: 324px;
}

.question-9 .explanation-text,
.question-8 .explanation-text {
  width: 320.052px;
}

.question-11 .explanation-text {
  width: 352.679px;
}

/* Specific styles for individual questions */

/* Question 1 */
.question-1.fine-print {
  width: 852px;
}

.question-1 .explanation-text img {
  height: 248px;
  width: 320px;
}

.question-1 .question-option {
  width: 467.4px !important;
}

.question-1 .question-text {
  width: 900px;
}

/* Question 2 */
.question-2.fine-print {
  width: 904.405px;
  height: 126px;
  flex-shrink: 0;
}

.question-2 .explanation-container {
  right: -235px;
}

.question-2 .question-option {
  width: 824px !important;
}

.question-2 .question-text {
  width: 826px;
}

.question-2 .show-explanation {
  max-width: unset;
}

/* Question 3 */
.question-3 .question-text {
  width: 892px;
}

.question-3 .question-option {
  width: 467.4px;
}

/* Question 4 */
.question-4 .question-option {
  width: 729px;
}

.question-4 .question-wrapper.show-explanation {
  max-width: unset;
  width: 1230px;
}

/* Question 5 */
.question-5 .question-option {
  width: 220px;
}

.question-5 .question-wrapper.show-explanation {
  /* display: flex; */
  max-width: 900px;
  margin: 50px auto;
  /* justify-content: center;
  align-items: center; */
}

/* Question 6 */
.question-6 .question-wrapper.show-explanation {
  display: flex;
  max-width: 900px;
  margin: 50px auto;
}

.question-6 .question-option {
  width: 467.4px;
}

/* Question 7 */
.question-7 .question-wrapper.show-explanation {
  max-width: unset;
  width: 1130px;
}

.question-7 .question-option {
  width: 618px;
}

/* Question 8 */
.question-8 .question-wrapper.show-explanation {
  display: flex;
  min-width: 1130px;
  margin: 50px auto;
}

.question-8 .question-option {
  width: 618px;
}

.question-8.fine-print {
  width: 651px;
}

/* Question 9 */
.question-9 .question-wrapper.show-explanation {
  display: flex;
  min-width: 1120px;
  margin: 50px auto;
}

.question-9 .question-option {
  width: 618px;
}

/* Q 10 */
.question-10.fine-print {
  width: 252px;
}

/* Question 11 */
.question-11 .option-text {
  font-size: 28px !important; 
}

.question-11 .question-wrapper.show-explanation {
  display: flex;
  min-width: 1120px;
  margin: 50px auto;
}

.question-11 .question-option {
  width: 618px;
}

/* Question 15 */
.question-15 .question-wrapper.show-explanation {
  display: flex;
  min-width: 1120px;
  margin: 50px auto;
}

.question-15 .question-option {
  width: 618px;
}

/* Question 18 */
.question-18 .question-wrapper.show-explanation {
  display: flex;
  min-width: 1050px;
  margin: 50px auto;
}

.question-18 .question-option {
  width: 541px;
}

/* Question 19 */
.question-19.fine-print {
  width: 770px;
}

.corner-home-button {
  position: absolute;
  left: 0px;
  top: 0px;
  
}

.question-3 h2.question-proper,
.question-6 h2.question-proper,
.question-16 h2.question-proper{
    font-size: 47px;
}

.question-12 h2.question-proper,
.question-13 h2.question-proper,
.question-14 h2.question-proper {
    font-size: 42px;
}

.option-content img {
    margin-left: 15px;
}

.question-1 .option-content img {
    width: 351px;
}

.question-2 .option-content img {
    width: 318px;
}

.question-3 .option-content img {
    width: 113px;
}

.question-5 .option-content img {
    width: 111px;
}

.question-7 .option-content img {
    width: 503px;
}

.question-8 .option-content img {
    width: 292px;
}

.question-14 .option-content img,
.question-19 .option-content img {
    width: 151px;
}
</style>
