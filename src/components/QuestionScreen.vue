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
        <!-- Timer Section -->
        <div class="timer-section">
          <div class="timer-bar-container">
            <!-- Segmented Timer Bars -->
            <div class="segmented-timer">
              <div 
                v-for="segment in 6" 
                :key="segment"
                class="timer-segment-container"
              >
                <div 
                  class="timer-segment-fill"
                  :style="{ 
                    backgroundColor: getSegmentColor(segment),
                    width: getSegmentFillPercentage(segment) + '%'
                  }"
                ></div>
              </div>
            </div>
            <div class="timer-text-display" :style="{ backgroundColor: getTimerDisplayColor() }">
              <span class="timer-number">{{ timeRemaining }}</span>
            </div>
            <div class="timer-sec-label">SEC</div>
          </div>
        </div>
        <div class="question-overlay">
          <div class="corner-home-button">
            <img src="/back-to-home.png" alt="Home" class="corner-home" @click="$emit('playAgain')">
          </div>

          <div :class="['question-content', 'question-' + question.id]">
            <!-- Question Number Badge -->
            <div class="question-number-badge">
              <span>Question {{ currentQuestionIndex + 1 }}</span>
            </div>
            
            <!-- Question Text -->
            <img v-if="questionImageExists" :src="'/question-' + question.id + '.png'" class="question-image" alt="Question">
            <h2 v-else class="question-proper" v-html="question.text"></h2>
            
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
                    <div v-else class="explanation-images">
                      <img src="/correct-check.png" class="correct-check">
                      <img :src="['/question-' + question.id + '-box.png']" class="question-box">
                    </div>
                  </div>
                </div>
              </div>
            </transition>
            
            <!-- Times Up Image - shows when question timed out -->
            <div v-if="showExplanation && selectedAnswer === null" class="times-up-container">
              <img src="/timesup.png" alt="Time's Up" class="times-up-image">
            </div>
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
              <img :class="['question-content', 'question-' + question.id + ' explanation-desc-img']" :src="['/question-' + question.id + '-notes.png']">
            </div>
          </div>
        </transition>
        
        <!-- Fineprint Prepend Image (visible for specific questions when explanation is NOT showing) -->
        <img v-if="shouldShowFineprintPrepend" src="/fineprint-prepend.png" class="fineprint-prepend">
        
        <transition name="fade">
          <div v-if="showExplanation && question.finePrint && question.finePrint.trim()" :class="['question-' + question.id + ' fine-print']">
            <div class="fine-print-content">
              <img :src="['/question-' + question.id + '-fineprint.png']">
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
const questionImageExists = ref(false);

// Questions that should show the fineprint prepend image
const shouldShowFineprintPrepend = computed(() => {
  const questionsWithPrepend = [3, 4, 5, 6, 7];
  return questionsWithPrepend.includes(props.question?.id) && !props.showExplanation;
});

// Function to get segment fill percentage (each segment = 5 seconds)
const getSegmentFillPercentage = (segmentNumber) => {
  const secondsPerSegment = 5;
  const secondsFromStart = 30 - props.timeRemaining;
  const segmentsCompleted = Math.floor(secondsFromStart / secondsPerSegment);
  
  if (segmentNumber <= segmentsCompleted) {
    // This segment is completely filled
    return 100;
  } else if (segmentNumber === segmentsCompleted + 1) {
    // This segment is currently filling
    const progressInCurrentSegment = secondsFromStart % secondsPerSegment;
    return (progressInCurrentSegment / secondsPerSegment) * 100;
  } else {
    // This segment hasn't started filling yet
    return 0;
  }
};

// Function to get segment color based on time remaining
const getSegmentColor = (segmentNumber) => {
  const fillPercentage = getSegmentFillPercentage(segmentNumber);
  if (fillPercentage === 0) {
    return '#999999'; // Gray for empty segments
  }
  
  // Change color based on time remaining (same logic as original timer)
  if (props.timeRemaining <= 18) {
    return '#F44336'; // Red
  } else if (props.timeRemaining <= 24) {
    return '#FF9800'; // Orange/Yellow
  } else {
    return '#8BC34A'; // Green
  }
};

// Function to get timer display background color
const getTimerDisplayColor = () => {
  if (props.timeRemaining <= 18) {
    return '#F44336'; // Red
  } else if (props.timeRemaining <= 24) {
    return '#FF9800'; // Orange/Yellow
  } else {
    return '#8BC34A'; // Green
  }
};

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

// Check if question image exists
function checkQuestionImage() {
  if (!props.question?.id) {
    questionImageExists.value = false;
    return;
  }
  
  const img = new Image();
  img.onload = () => {
    questionImageExists.value = true;
  };
  img.onerror = () => {
    questionImageExists.value = false;
  };
  img.src = `/question-${props.question.id}.png`;
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
    
    // Check if question image exists
    checkQuestionImage();
    
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
  /* padding-top: 3rem; */
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
  /* padding-top: 93px; */
}

/* Answer Options Grid */
.answer-options-grid {
  display: flex;
  flex-direction: column;
  gap: 5px;
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
  width: 342px;
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
  padding-top: 20px;
  margin: 0;
}

/* Explanation Banner */
.explanation-banner-container {
  /* margin-top: 19px; */
  display: flex;
  justify-content: center;
  width: 100%;
}

/* Times Up Image */
.times-up-container {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-top: 20px;
}

.times-up-image {
  width: 1492.168px;
  height: 155px;
}

.explanation-banner-skewed {
  width: 1781.886px;
  min-height: 132px;
  padding: 35px;
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
  text-align: center;
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
  position: absolute;
  top: 39px;
  right: 53px;
  width: 400px;
}

.timer-bar-container {
  display: flex;
  align-items: flex-end;
  gap: 15px;
}

/* Segmented Timer Styles */
.segmented-timer {
  display: flex;
  gap: 4px;
  flex: 1;
}

.timer-segment-container {
  height: 12px;
  flex: 1;
  background-color: #999999;
  transform: skewX(-15deg);
  position: relative;
  overflow: hidden;
}

.timer-segment-fill {
  height: 100%;
  transition: width 1s linear, background-color 0.3s ease;
  transform: skewX(15deg);
  transform-origin: left;
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
  background-color: #8BC34A;
  color: white;
  font-weight: bold;
  font-size: 16px;
  text-transform: uppercase;
  white-space: nowrap;
  min-width: 60px;
  text-align: center;
  padding: 2px;
  transform: skewX(-15deg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.timer-sec-label {
  color: white;
  font-weight: bold;
  font-size: 16px;
  text-transform: uppercase;
  margin-left: 5px;
}

.timer-number {
  transform: skewX(15deg);
  width: 30px;
  height: 35px;
  font-size: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
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
  background-color: rgba(0, 59, 69, 0.90);
}

.addl-info-btn:active,
.addl-info-btn:focus {
  background-color: rgba(0, 59, 69, 0.90);
  outline: none;
}

.explanation-desc {
  background-color: #25575F;
  padding: 20px 150px 20px 50px;
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
  bottom: 28px;
  left: 39px;
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
  max-width: 1555px;
}

/* Explanation images container */
.explanation-images {
  display: flex;
  align-items: center;
  gap: 21px;
  text-align: center;
  justify-content: center;
}

.explanation-images .correct-check {
  width: 39px;
  height: 37px;
  flex-shrink: 0;
}

.explanation-images .question-box {
  flex-shrink: 0;
}

/* Question Image */
.question-image {
  max-width: 100%;
  height: auto;
  /* margin-bottom: 20px; */
}

/* Fineprint Prepend Images */
.fineprint-prepend {
  position: absolute;
  bottom: 26px;
  left: 39px;
  z-index: 10;
  display: block;
  max-width: 100%;
  height: auto;
  margin: 0;
  padding: 0;
}


/* individual question resizing */

.question-1 .question-image {
  max-width: 78%;
  margin: 0 auto;
}

.question-2 .question-box {
  width: 936px;
  height: 39px;
  flex-shrink: 0;
}

.question-4 .explanation-banner-skewed {
  width: 1586.886px;
  height: 132px;
  flex-shrink: 0;
}

.question-5 .explanation-banner-container {
  width: 1485.886px;
  flex-shrink: 0;
  margin: 0 auto;
}

.question-7 .explanation-banner-skewed {
  width: 1492px;
  height: 103px;
  flex-shrink: 0;
}
</style>
