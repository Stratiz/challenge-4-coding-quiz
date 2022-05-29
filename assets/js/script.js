// Harrison 5/28/2022

// Define questions to be used in quiz.
questions = [
  {
    question: "Which of the following is not a primitive value?",
    correctIndex: 3,
    answers: [
      "Boolean",
      "String",
      "Number",
      "Float"
    ]
  },
  {
    question: "Which of the following is used to check strict equality?",
    correctIndex: 2,
    answers: [
      "==",
      "||",
      "===",
      "&&",
      "!=="
    ]
  },
  {
      question: "A number is a 'truthy' value.",
      correctIndex: 0,
      answers: [
        "True",
        "False"
      ]
  },
  {
    question: "What symbol is used to access jQuery?",
    correctIndex: 1,
    answers: [
      "%",
      "$",
      "#",
      "*"
    ]
  },
  {
    question: "What is the difference between null and undefined?",
    correctIndex: 1,
    answers: [
      "null and undefined are the same thing and are ambigious terms.",
      "null is equal to nothing and undefined is a declaration without defintion",
      "null is an alias to describe falsey values such as 0 or NaN",
      "null is not a valid value in JavaScript."
    ]
  },
];

// Define constants
const TIME_LIMIT = 75;

// General helper functions
function getTick() { 
  const d = new Date();
  return d.getTime()/1000;
}

// Fetch global HTML elements
var leaderboard = $('#leaderboard');
var main = $('#main');

var answersList = $('#answers');
var leaderboardList = $('#leaderboard-list');

// Question helper functions
var currentCorrectIndex = 0;
var currentQuestionIndex = 0;

function populateNewQuestion() { // Populates the UI with the current question data.
  var questionData = questions[currentQuestionIndex] 
  answersList.empty();
  var questionIndex = 0
  $('#question').text(questionData.question)
  for (var answer of questionData.answers) {
    answersList.append('<li><button type="button" class="rounded mb-2" data-index='+ questionIndex +'>' + answer + '</button></li>')
    questionIndex += 1;
  }
  currentCorrectIndex = questionData.correctIndex
}

// Leaderboard helper functions

function getLeaderboardData() { // Fetches the leaderboard data from localStorage
  let leaderboardStorage = JSON.parse(localStorage.getItem("leaderboard"));
  if (!leaderboardStorage) {
    leaderboardStorage = [];
  }
  leaderboardStorage.sort(function(a, b) {
    return b.score - a.score;
  })
  return leaderboardStorage
}

function refreshLeaderboard() { // Reloads leaderboard UI
  let leaderboardStorage = getLeaderboardData();
  leaderboardList.empty();
  for (var entry of leaderboardStorage) {
    leaderboardList.append('<li><p class="leaderboard-entry">' + entry.initials.toUpperCase() + " - " + entry.score + '</p></li>')
  }
}

function addToLeaderboard(initials, score) { //Adds a user to the leaderboard
  let leaderboardStorage = getLeaderboardData();
  leaderboardStorage.push({initials: initials, score: score})
  localStorage.setItem("leaderboard", JSON.stringify(leaderboardStorage));
  refreshLeaderboard();
}

function showLeaderboard() { // Shows the leaderboard page
  refreshLeaderboard();
  leaderboard.show();
  main.hide();
}

// Main init function.
$(function() {
  // Get elements
  var startButton = $('#start-btn');
  var startSection = $('#start-section');
  var endSection = $('#end-section')
  var quizSection = $('#quiz-section');
  var response = $('#response');
  var submitButton = $('#submit-btn');
  var initialsBox = $('#initials-box');
  var finalScoreLabel = $('#final-score');

  // Other vars
  var lastAnswerPickTime = 0

  // Timer functions
  let timerElement = $("#timer")
  let currentTime = 0;
  let currentTimerObject = undefined;

  function endCurrentTimer() { // Ends timer
    if (currentTimerObject) {
      clearTimeout(currentTimerObject);
    }
    if (currentTime < 0) {
      currentTime = 0;
    }
    finalScoreLabel.text("Your final score is " + currentTime + ".");
    timerElement.text("Time: " + currentTime)
    return currentTime;
  }

  function startTimer() { // Starts timer
    endCurrentTimer();
    currentTime = TIME_LIMIT;
    timerElement.text("Time: " + currentTime)
    currentTimerObject = setInterval(function() {
      currentTime -= 1;
      timerElement.text("Time: " + currentTime)
      if (currentTime <= 0) {
        endCurrentTimer();
        quizSection.hide();
        endSection.show();
      }
    }, 1000);
  }
  
  // Quiz related button binds
  startButton.on('click', function () { // When click start button, initialize UI and vars.
    startSection.hide();
    quizSection.show();
    initialsBox.val("")
    currentQuestionIndex = 0;
    populateNewQuestion()
    startTimer();
  });

  answersList.on('click', "button", function (element) { // When you click a button which is a decendant of the answers list, see if its the right answer
    let index = element.currentTarget.getAttribute("data-index"); // Fetch custom attribute
    if (index) {
      if (index == currentCorrectIndex) {
        response.text("Correct!");
      } else {
        response.text("Wrong!");
        currentTime -= 10;
      }
      lastAnswerPickTime = getTick();
      response.show();
      currentQuestionIndex += 1;
      if (questions[currentQuestionIndex]) {
        populateNewQuestion()
      } else {
        // Showing end section stuff
        endCurrentTimer();
        quizSection.hide();
        endSection.show();
        response.show();
        
      }
      
    } else {
      console.error("No index found?")
    }
  }) 

  function inputDangerState(state) { // Helper function to change the state of the initials box for input validation
    if (state == true) {
      initialsBox.addClass("border-danger")
    } else {
      initialsBox.removeClass("border-danger")
    }
  }
  submitButton.on('click', function () { // When submit button is clicked, validate input and update UI.
    
    var initials = initialsBox.val()
    if (initials && initials.length <= 4) {
      inputDangerState(false);
      addToLeaderboard(initials, currentTime);
      
      timerElement.text("Time: 0");
      startSection.show();
      quizSection.hide();
      endSection.hide();
      //
      showLeaderboard();
    } else {
      inputDangerState(true);
    }
  });

  main.on("mouseover", "button", function () { // On mouseover of any button, if its been more than 0.5 seconds since user picked an answer, hide the response.
    if (getTick() - lastAnswerPickTime > 0.5) {
      response.hide();
    }
  })

  // Handling leaderboard

  var leaderboardBack = $("#back-btn");
  var leaderboardClear = $("#clear-btn");
  var showLeaderboardBtn = $('#show-leaderboard');

  leaderboardBack.on('click', function () { // When you press the back button on the leaderboard, return to the main page.
    leaderboard.hide();
    main.show();
  });

  leaderboardClear.on('click', function () { // When you click clear button, purge the leaderboard data from localStorage
    localStorage.removeItem('leaderboard');
    refreshLeaderboard();
  });

  showLeaderboardBtn.on('click', showLeaderboard) // When you click the top left button, show the leaderboard.
})