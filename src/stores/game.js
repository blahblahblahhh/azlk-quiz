import { defineStore } from 'pinia';
import { ref, computed, onMounted, nextTick } from 'vue';
import { initDB, saveScore, getTopScores } from './db'; // Import DB functions

// Questions data
const questions = [
  {
    id: 1,
    text: "Which of the following is considered a risk factor for hyperkalemia?",
    type: "multiple",
    options: ["CKD", "Heart failure", "Diabetes", "Hypertension", "RAASi therapy", "All of the above"],
    correctAnswer: "All of the above",
    explanation: "",
    additionalInfo: "",
    finePrint: ""
  },
  {
    id: 2,
    text: "Hyperkalemia is defined as serum potassium levels greater than ______",
    type: "multiple",
    options: ["4.5 mEq/L", "5.0 mEq/L", "5.5 mEq/L", "6.0 mEq/L"],
    correctAnswer: "5.0 mEq/L",
    explanation: "",
    additionalInfo: "",
    finePrint: ""
  },
  {
    id: 3,
    text: "Serum potassium ≥5.0 mEq/L was associated with an increased risk of all-cause<br>mortality in patients with hyperkalemia, regardless of comorbidity profile.",
    type: "boolean",
    options: ["True", "False"],
    correctAnswer: "True",
    explanation: "",
    additionalInfo: "true",
    finePrint: "true"
  },
  {
    id: 4,
    text: "In a CKD subgroup analysis of a real-world evidence study of US patients<br>with Stage 3 or 4 CKD and/or HF and HK, What was the increased risk<br>of progression to ESKD<sup>*</sup> with RAASi<sup>†</sup> down-titration vs patients who<br>maintained or uptitrated their RAASi dose?",
    type: "multiple",
    options: ["27%", "45%", "60%", "83%"],
    correctAnswer: "60%",
    explanation: "",
    additionalInfo: "",
    finePrint: "true"
  },
  {
    id: 5,
    text: "In US patients with Stage 3 or 4 CKD and/or HF and HK,<br>What was the increased risk of progression to ESKD<sup>*</sup> with RAASi<sup>†</sup><br>discontinuation vs patients who maintained or uptitrated their RAASi dose?",
    type: "multiple",
    options: ["55%", "67%", "74%", "82%"],
    correctAnswer: "74%",
    explanation: "",
    additionalInfo: "",
    finePrint: "true"
  },
  {
    id: 6,
    text: "In US patients with Stage 3 or 4 CKD, What was the increased risk<br>of all-cause inpatient hospitalizations for patients with recurrent HK<br>vs those without HK?",
    type: "multiple",
    options: ["1.3x", "1.5x", "1.7x", ">2.0x"],
    correctAnswer: ">2.0x",
    explanation: "",
    additionalInfo: "",
    finePrint: "true"
  },
  {
    id: 7,
    text: "In US patients with Stage 3 or 4 CKD, What was the increased risk of all-cause mortality for patients with recurrent HK vs those without HK?",
    type: "multiple",
    options: ["18%", "24%", "29%", "35%"],
    correctAnswer: "29%",
    explanation: "",
    additionalInfo: "",
    finePrint: "true"
  },
  {
    id: 8,
    text: "What was the percentage of patients with HK<br>in the US treated with a K<sup>+</sup> binder?",
    type: "multiple",
    options: ["8%", "12%", "19%", "27%"],
    correctAnswer: "12%",
    explanation: "",
    additionalInfo: "",
    finePrint: "true"
  },
  {
    id: 9,
    text: "In a real-world evidence study, What was the percentage of patients with HK and Stage 3 or 4 CKD who experienced recurrent HK after an MNT visit within 6 months?",
    type: "multiple",
    options: ["35%", "41%", "49%", "56%"],
    correctAnswer: "56%",
    explanation: "",
    additionalInfo: "",
    finePrint: "true"
  },
  {
    id: 10,
    text: "In a real-world evidence study, How long did it take for patients with HK and Stage 3 or 4 CKD to experience their first HK recurrence after a medical nutrition visit within 6 months?",
    type: "multiple",
    options: ["~32 days", "~45 days", "~53 days", "~60 days"],
    correctAnswer: "~45 days",
    explanation: "",
    additionalInfo: "",
    finePrint: "true"
  },
  {
    id: 11,
    text: "In patients with HK and Stage 3 or 4 CKD, The percentage of patients with HK recurrence increased in those with prior recurrence while the average time between each recurrence decreased.",
    type: "boolean",
    options: ["True", "False"],
    correctAnswer: "True",
    explanation: "",
    additionalInfo: "",
    finePrint: "true"
  },
  {
    id: 12,
    text: "The KDIGO 2024 Clinical Practice Guideline for the Evaluation and Management of CKD supports the use of a K<sup>+</sup> binder rather than decreasing or discontinuing ACEi/ARB therapy.",
    type: "boolean",
    options: ["True", "False"],
    correctAnswer: "True",
    explanation: "",
    additionalInfo: "",
    finePrint: ""
  },
  {
    id: 13,
    text: "In US patients with Stage 3 or 4 CKD and/or HF and HK, What was the increased risk (%) of HF-related hospitalizations or ED visits with RAASi<sup>*</sup> down-titration vs patients who maintained or uptitrated their RAASi<sup>*</sup> dose?",
    type: "multiple",
    options: ["20%", "30%", "40%", "50%"],
    correctAnswer: "40%",
    explanation: "",
    additionalInfo: "",
    finePrint: "true"
  },
  {
    id: 14,
    text: "In US patients with Stage 3 or 4 CKD and/or HF and HK, What was the increased risk (%) of HF-related hospitalizations or ED visits with RAASi discontinuation vs patients who maintained or uptitrated their RAASi dose?",
    type: "multiple",
    options: ["22%", "29%", "36%", "43%"],
    correctAnswer: "43%",
    explanation: "",
    additionalInfo: "",
    finePrint: "true"
  },
  {
    id: 15,
    text: "In an observational study of Stockholm-based patients, What was the percentage of patients who initiated MRA and developed HK, but were not reintroduced to MRA therapy during the subsequent year after discontinuing?",
    type: "multiple",
    options: ["44%", "53%", "68%", "74%"],
    correctAnswer: "74%",
    explanation: "",
    additionalInfo: "",
    finePrint: "true"
  },
  {
    id: 16,
    text: "The 2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure supports the use of potassium binders to treat hyperkalemia in patients with HF who are taking a RAASi.",
    type: "boolean",
    options: ["True", "False"],
    correctAnswer: "True",
    explanation: "",
    additionalInfo: "",
    finePrint: "true"
  },
  {
    id: 17,
    text: "In a real-world evidence study, What was the approximate percentage of patients with heart failure and hyperkalemia to experience their first HK recurrence?",
    type: "multiple",
    options: ["18%", "25%", "31%", "37%"],
    correctAnswer: "37%",
    explanation: "",
    additionalInfo: "",
    finePrint: "true"
  },
  {
    id: 18,
    text: "In a real-world evidence study, The percentage of patients with HK and heart failure with subsequent HK recurrences increased during a 12-month follow-up period regardless of CKD<sup>*</sup> status.",
    type: "boolean",
    options: ["True", "False"],
    correctAnswer: "True",
    explanation: "",
    additionalInfo: "",
    finePrint: "true"
  }
];

export const useGameStore = defineStore('game', () => {
  // Store the questions in their own ref
  const questionsList = ref([...questions]);
  
  // Added correctAnswers to track the number of correctly answered questions
  const state = ref({
    currentScreen: 'welcome',
    playerInitials: '',
    currentQuestionIndex: 0,
    score: 0,
    timeRemaining: 30,
    totalBonusTime: 0, // Track accumulated bonus time
    correctAnswers: 0, // Track number of correct answers
    selectedAnswer: null,
    showExplanation: false,
    showAdditionalInfo: false,
    showFinePrint: false,
    isFromResultsScreen: false,
    playingFinalVideo: false // Track when playing final video segment
  });

  const timer = ref(null);
  const leaderboard = ref([]);
  let dbInitialized = false;

  const playerType = computed(() => {
    const score = state.value.score;
    if (score >= 1000) return 'expert';
    if (score >= 500) return 'scholar';
    return 'explorer';
  });

  const currentQuestion = computed(() => {
    // Log current state for debugging
    console.log('Computing current question:', {
      questionsList: questionsList.value,
      index: state.value.currentQuestionIndex,
    });
  
    // Early return if questions aren't loaded
    if (!questionsList.value?.length) return null;
  
    // Ensure index is valid
    const index = state.value.currentQuestionIndex;
    if (index < 0 || index >= questionsList.value.length) {
      console.warn(`Invalid question index: ${index}`);
      return questionsList.value[0]; // Default to first question
    }
  
    const question = questionsList.value[index];
    console.log('Returning question:', question);
    return question;
  });

  // Initialize the database
  async function initializeDatabase() {
    if (!dbInitialized) {
      try {
        await initDB();
        dbInitialized = true;
        console.log('Database initialized successfully');
        await loadLeaderboard(); // Load the leaderboard after DB init
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    }
  }

  async function loadLeaderboard() {
    try {
      const scores = await getTopScores();
      leaderboard.value = scores.map((entry, index) => ({
        ...entry,
        rank: index + 1
      }));
      console.log('Leaderboard loaded:', leaderboard.value);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  }

  async function initializeQuestions() {
    console.log('Initializing questions...');

    // OG LOGIC - can just comment this in and comment out the other for testing
    // Original code that selects first 3 + random 4:
    //  const firstThree = questions.slice(0, 3);
    //  const remaining = questions.slice(3);
    //  const shuffled = remaining.sort(() => Math.random() - 0.5);
    //  const randomFour = shuffled.slice(0, 4);
    //  questionsList.value = [...firstThree, ...randomFour];
    
    // First 3 and all remaining (all questions)
    //  const firstThree = questions.slice(0, 3);
    // const remaining = questions.slice(3);
    // questionsList.value = [...firstThree, ...remaining];
    
    // Q1-3 are set for everyone
    const firstThree = questions.slice(0, 3); // Questions 1, 2, 3
    
    // Q4&5 - randomly select one or the other (not both)
    const q4and5 = questions.slice(3, 5); // Questions 4, 5
    const selectedFromQ4and5 = q4and5[Math.floor(Math.random() * 2)]; // Pick one randomly
    
    // Q13&14 - randomly select one or the other (not both)
    const q13and14 = questions.slice(12, 14); // Questions 13, 14 (indices 12, 13)
    const selectedFromQ13and14 = q13and14[Math.floor(Math.random() * 2)]; // Pick one randomly
    
    // Remaining questions (Q6-12 and Q15-18)
    const remainingQuestions = [
      ...questions.slice(5, 12), // Questions 6-12 (indices 5-11)
      ...questions.slice(14)     // Questions 15+ (indices 14+)
    ];
    
    // Shuffle remaining questions and select 2 to make total of 7
    const shuffledRemaining = remainingQuestions.sort(() => Math.random() - 0.5);
    const selectedRemaining = shuffledRemaining.slice(0, 2);
    
    // Combine all selected questions
    questionsList.value = [
      ...firstThree,
      selectedFromQ4and5,
      selectedFromQ13and14,
      ...selectedRemaining
    ];
    
    await nextTick();
    console.log('Questions initialized:', questionsList.value);
    console.log('Selected Q4 or Q5:', selectedFromQ4and5.id);
    console.log('Selected Q13 or Q14:', selectedFromQ13and14.id);
    return questionsList.value;
  }

  function startTimer() {
    stopTimer();
    state.value.timeRemaining = 30;
    timer.value = setInterval(() => {
      if (state.value.timeRemaining > 0) {
        state.value.timeRemaining--;
      } else {
        clearInterval(timer.value);
        handleAnswerSubmit(null);
      }
    }, 1000);
  }

  function stopTimer() {
    if (timer.value) {
      clearInterval(timer.value);
      timer.value = null;
    }
  }

  function handleAnswerSubmit(answer) {
    stopTimer();
    state.value.selectedAnswer = answer;
    state.value.showExplanation = true;
    
    if (answer === currentQuestion.value?.correctAnswer) {
      // Increment correct answers count
      state.value.correctAnswers++;
      
      // Calculate bonus time from this question
      const questionBonusTime = Math.max(0, state.value.timeRemaining);
      
      // Add to accumulated total bonus time
      state.value.totalBonusTime += questionBonusTime;
      
      // 150 base points for correct answer, plus bonus points based on remaining time
      state.value.score += 150 + questionBonusTime;
    }
  }

  function nextQuestion() {
    if (!questionsList.value || questionsList.value.length === 0) {
      console.error('No questions available');
      return;
    }

    // Stop current timer and reset time
    stopTimer();
    state.value.timeRemaining = 30;
    
    state.value.showExplanation = false;
    state.value.showAdditionalInfo = false;
    state.value.showFinePrint = false;
    state.value.selectedAnswer = null;
    
    if (state.value.currentQuestionIndex < questionsList.value.length - 1) {
      state.value.currentQuestionIndex++;
      // Timer will be started by the QuestionScreen component after video timing
    } else {
      // This shouldn't be reached for the last question since it's handled by the finish button
      // But just in case, we'll finish the game properly
      stopTimer();
      finishGame();
    }
  }

  function finishGame() {
    state.value.playingFinalVideo = false;
    state.value.currentScreen = 'result';
    addToLeaderboard();
  }

  // Updated to include correctAnswers in the leaderboard entry
  async function addToLeaderboard() {
    const entry = {
      initials: state.value.playerInitials || 'AAA',
      score: state.value.score,
      type: playerType.value,
      bonusTimeScore: state.value.totalBonusTime, // Use the accumulated total bonus time
      correctAnswers: state.value.correctAnswers, // Add correct answers count
      date: new Date().toISOString()
    };
    
    try {
      await saveScore(entry);
      await loadLeaderboard(); // Refresh the leaderboard after adding a new score
    } catch (error) {
      console.error('Error saving score:', error);
      // Fallback to in-memory leaderboard if database fails
      leaderboard.value.push(entry);
      leaderboard.value.sort((a, b) => b.score - a.score);
      leaderboard.value.forEach((entry, index) => {
        entry.rank = index + 1;
      });
    }
  }

  function toggleFinePrint() {
    state.value.showFinePrint = !state.value.showFinePrint;
  }

  function viewLeaderboardFromResults() {
    state.value.isFromResultsScreen = true;
    state.value.currentScreen = 'leaderboard';
  }

  function resetGame() {
    stopTimer();
    state.value = {
      currentScreen: 'welcome',
      playerInitials: '',
      currentQuestionIndex: 0,
      score: 0,
      timeRemaining: 30,
      totalBonusTime: 0, // Reset the accumulated bonus time
      correctAnswers: 0, // Reset the correct answers counter
      selectedAnswer: null,
      showExplanation: false,
      showAdditionalInfo: false,
      showFinePrint: false,
      isFromResultsScreen: false,
      playingFinalVideo: false // Reset final video state
    };
    initializeQuestions();
  }

  // Initialize database and questions when store is created
  initializeDatabase();
  initializeQuestions();

  return {
    state,
    questionsList,
    currentQuestion,
    playerType,
    leaderboard,
    initializeQuestions,
    initializeDatabase,
    loadLeaderboard,
    startTimer,
    stopTimer,
    handleAnswerSubmit,
    nextQuestion,
    finishGame,
    resetGame,
    toggleFinePrint,
    viewLeaderboardFromResults
  };
});