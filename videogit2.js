// 1. Firebase Configuration and Initialization
const firebaseConfig = {
  apiKey: "AIzaSyA88fPkOvcI4QA9qD3ROpk-ay-V6ibQQlc",
  authDomain: "my-application-7fd40.firebaseapp.com",
  projectId: "my-application-7fd40",
  storageBucket: "my-application-7fd40.appspot.com",
  messagingSenderId: "269589994279",
  appId: "1:269589994279:web:4c617a622c328a1224e702",
  measurementId: "G-D8MD1J28GR",
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let quizData, workingData, startTime, pauseTime, nextTime, rightOption;
let showQTime, showQ2Time, showQ3Time, showBooleanTime, showClarityTime;
let nextRightID,
  nextWrongID,
  lastSeekedTime = null;
let visitedTimes = [];

// 2. YouTube Player Control Elements

let player;
const playPauseBtn = document.getElementById("play-pause");
const optionA = document.getElementById("option-a");
const optionB = document.getElementById("option-b");
const optionC = document.getElementById("option-c");
const optionD = document.getElementById("option-d");
const option3A = document.getElementById("option3-a");
const option3B = document.getElementById("option3-b");
const option3C = document.getElementById("option3-c");
const option2A = document.getElementById("option2-a");
const option2B = document.getElementById("option2-b");

const clearButton = document.getElementById("option-clear");
const notClearButon = document.getElementById("option-notClear");
const yesButton = document.getElementById("option-yes");
const notButton = document.getElementById("option-not");

const rewindButton = document.getElementById("rewind");
const forwardButton = document.getElementById("forward");

// 3. Load the YouTube IFrame API
function onYouTubeIframeAPIReady() {
  player = new YT.Player("youtube-video", {
    events: { onReady: onPlayerReady, onStateChange: onPlayerStateChange },
  });
}

// 4. YouTube Player Ready Event
function onPlayerReady(event) {
  console.log("player ready");
  const duration = player.getDuration();

  // 5. Time Control Functions
  let checkInterval = null;

  // Start checking the player's time every 100ms
  function startCheckingPlayerTime() {
    if (checkInterval) {
      // Clear any existing interval if already running
      clearInterval(checkInterval);
    }

    // Set a new interval to check the current time every 100 milliseconds
    checkInterval = setInterval(() => {
      if (player && typeof player.getCurrentTime === "function") {
        const currentTime = player.getCurrentTime(); // Get the current time of the video

        // Check if we need to go to the next video section
        if (nextTime != 0 && currentTime >= nextTime) {
          // Load the next section of the video

          if (quizData[workingData.nextRightID]) {
            workingData = quizData[workingData.nextRightID]; // Update workingData with the next part

            // Set the new start, pause, and next times
            fetchMapValues(workingData);
            // Avoid seeking repeatedly in the interval
            if (lastSeekedTime !== startTime) {
              seekToTime(startTime); // Seek to the new start time
              lastSeekedTime = startTime; // Record the last seeked time
            }
          } else {
            player.pauseVideo(); // Pause the video
            alert("you have completed the work ");
            clearInterval(checkInterval);
          }
        }

        const showTimes = [
          { time: showQTime, container: "options-container-4" },
          { time: showQ3Time, container: "options-container-3" },
          { time: showQ2Time, container: "options-container-2" },
          { time: showBooleanTime, container: "boolean-container" },
          { time: showClarityTime, container: "clarity-container" },
        ];

        for (const { time, container } of showTimes) {
          if (time !== 0 && currentTime >= time) {
            player.pauseVideo();
            showOnlyContainer(container);
            break;
          } else {
            hideAllContainers();
          }
        }

        if (currentTime < startTime) {
          for (let i = 1; i < visitedTimes.length; i++) {
            if (
              currentTime < visitedTimes[i].start &&
              currentTime >= visitedTimes[i - 1].end
            ) {
              seekToTime(visitedTimes[i].start);
              return;
            }
          }
        }
      }
    }, 100); // Check every 100ms
  }

  rewindButton.addEventListener("click", () => {
    let currentTime = player.getCurrentTime();
    let newTime = getValidRewindTime(currentTime);
    if (newTime !== null) {
      player.seekTo(newTime, true);
      player.playVideo();
    }
  });

  function getValidRewindTime(currentTime) {
    let newTime = currentTime - 5;

    if (newTime >= startTime && newTime < pauseTime) {
      return newTime;
    }

    if (newTime < visitedTimes[0].start) {
      newTime = visitedTimes[0].start;
      return newTime;
    }

    for (let i = 0; i < visitedTimes.length; i++) {
      if (newTime > visitedTimes[i].start && newTime < visitedTimes[i].end) {
        return newTime;
      }

      if (
        i != 0 &&
        newTime < visitedTimes[i].start &&
        newTime > visitedTimes[i - 1].end
      ) {
        newTime = Math.max(
          visitedTimes[i - 1].end - 10,
          visitedTimes[i - 1].start
        );
        return newTime;
      }
    }
  }

  function getValidForwardTime(currentTime) {
    let newTime = currentTime + 5;

    if (newTime > startTime && newTime < pauseTime) {
      return newTime;
    }

    if (newTime > visitedTimes[visitedTimes.length - 1].end) {
      newTime = visitedTimes[visitedTimes.length - 1].end;
      player.pauseVideo();
      return newTime;
    }

    for (let i = 0; i < visitedTimes.length; i++) {
      if (newTime > visitedTimes[i].start && newTime < visitedTimes[i].end) {
        return newTime;
      }

      if (
        i < visitedTimes[visitedTimes.length - 1] &&
        newTime > visitedTimes[i].end &&
        newTime < visitedTimes[i + 1].start
      ) {
        newTime = Math.min(
          visitedTimes[i + 1].start + 5,
          visitedTimes[i + 1].end - 5
        );
        return newTime;
      }
    }
  }

  // Forward 10 seconds
  forwardButton.addEventListener("click", () => {
    let currentTime = event.target.getCurrentTime();
    let duration = event.target.getDuration();
    if (currentTime + 5 >= pauseTime) {
      event.target.seekTo(pauseTime, true);
      player.pauseVideo();
    } else {
      let newTime = getValidForwardTime(currentTime);
      if (newTime !== null) {
        player.seekTo(newTime, true);
        player.playVideo();
      }
    }
  });

  // Call this function whenever you want to start the check
  startCheckingPlayerTime();

  // Sync the play/pause button
  playPauseBtn.addEventListener("click", () => {
    let currentTime = event.target.getCurrentTime();

    if (currentTime < pauseTime) {
      if (player.getPlayerState() === YT.PlayerState.PLAYING) {
        player.pauseVideo();
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
      } else {
        player.playVideo();
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
      }
    }
  });

  fetchFirestoreData();
}

// When the player's state changes, update the UI
function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.PLAYING) {
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    updateProgress();
  } else {
    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
  }
}

// Update the progress bar and time info
function updateProgress() {
  setInterval(() => {
    if (player && player.getPlayerState() === YT.PlayerState.PLAYING) {
    }
  }, 1000);
}

// Format time in mm:ss
function formatTime(time) {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

// Function to log visited times
function logVisitedTimes() {
  console.log("Visited times:", visitedTimes);
}

// Function to check if a time range is already in the list
function isAlreadyVisited(start, end) {
  return visitedTimes.some((time) => time.start === start && time.end === end);
}

// Function to add new time range to visited list
function addVisitedTime(start, end) {
  if (!isAlreadyVisited(start, end)) {
    visitedTimes.push({ start, end });
    logVisitedTimes(); // Log the updated list
  }
}

function seekToTime(timeInSeconds) {
  if (player && typeof timeInSeconds === "number") {
    addVisitedTime(startTime, pauseTime);

    player.seekTo(timeInSeconds, true); // The second argument (true) ensures accurate seeking
    player.playVideo();
  }
}

function fetchFirestoreData() {
  // Check if the DOM is already loaded or not
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", async function () {
      fetchDataFromFirestore();
    });
  } else {
    // DOM is already loaded, fetch Firestore data directly
    fetchDataFromFirestore();
  }
}

async function fetchDataFromFirestore() {
  try {
    const quizDoc = await db.collection("quizz").doc("ab").get();

    if (quizDoc.exists) {
      const data = quizDoc.data();

      quizData = data.mapsData; // Assuming "quizData" holds the array of maps
      workingData = quizData[0];
      fetchMapValues(workingData);

      // Check if startTime is valid, then seek to it
      seekToTime(startTime); // Seek and start the video after startTime is fetched
      hideLoadingScreen();
    } else {
      console.error("No  data found!");
    }
  } catch (error) {
    console.error("Error getting data", error);
  }
}

function fetchMapValues(workingData) {
  if (workingData) {
    startTime = parseFloat(workingData.start);
    workingData.showQTime
      ? (showQTime = parseFloat(workingData.showQTime))
      : (showQTime = 0);
    workingData.showQ3Time
      ? (showQ3Time = parseFloat(workingData.showQ3Time))
      : (showQ3Time = 0);
    workingData.showQ2Time
      ? (showQ2Time = parseFloat(workingData.showQ2Time))
      : (showQ2Time = 0);
    workingData.showBooleanTime
      ? (showBooleanTime = parseFloat(workingData.showBooleanTime))
      : (showBooleanTime = 0);
    workingData.showClarityTime
      ? (showClarityTime = parseFloat(workingData.showClarityTime))
      : (showClarityTime = 0);
    workingData.rightOption
      ? (rightOption = workingData.rightOption)
      : (rightOption = "0");
    workingData.nextRightID
      ? (nextRightID = workingData.nextRightID)
      : (nextRightID = "0");
    workingData.nextWrongID
      ? (nextWrongID = workingData.nextWrongID)
      : (nextWrongID = "0");
    workingData.nextTime ? (nextTime = workingData.nextTime) : (nextTime = "0");

    if (showQTime != 0) pauseTime = showQTime;
    if (showQ3Time != 0) pauseTime = showQ3Time;
    if (showQ2Time != 0) pauseTime = showQ2Time;
    if (showBooleanTime != 0) pauseTime = showBooleanTime;
    if (showClarityTime != 0) pauseTime = showClarityTime;
    if (nextTime != 0) pauseTime = nextTime + 5;
  } else {
    alert("no data");
    player.seekTo(visitedTimes[0].start);
    player.pauseVideo();
  }

  hideAllContainers();
}

// 9. Show Specific Containers

function showOnlyContainer(containerToShow) {
  const containers = [
    document.querySelector(".options-container-4"),
    document.querySelector(".options-container-3"),
    document.querySelector(".options-container-2"),
    document.querySelector(".clarity-container"),
    document.querySelector(".boolean-container"),
  ];

  // Hide all containers
  containers.forEach((container) => {
    container.style.display = "none";
  });

  // Show the specified container
  if (containerToShow) {
    const container = document.querySelector(`.${containerToShow}`);
    if (container) {
      container.style.display = "flex";
    }
  }
}

function hideAllContainers() {
  const containers = [
    document.querySelector(".options-container-4"),
    document.querySelector(".options-container-3"),
    document.querySelector(".options-container-2"),
    document.querySelector(".clarity-container"),
    document.querySelector(".boolean-container"),
  ];

  // Hide all containers
  containers.forEach((container) => {
    container.style.display = "none";
  });
}

[optionA, optionB, optionC, optionD].forEach((option, index) => {
  const optionLetter = ["a", "b", "c", "d"][index];
  option.addEventListener("click", () => handleOptionClick(optionLetter));
});

[option3A, option3B, option3C].forEach((option, index) => {
  const optionLetter = ["a", "b", "c"][index];
  option.addEventListener("click", () => handleOptionClick(optionLetter));
});

[option2A, option2B].forEach((option, index) => {
  const optionLetter = ["a", "b"][index];
  option.addEventListener("click", () => handleOptionClick(optionLetter));
});

[clearButton, notClearButon].forEach((option, index) => {
  const optionLetter = ["clear", "notClear"][index];
  option.addEventListener("click", () => handleClarityClick(optionLetter));
});

[yesButton, notButton].forEach((option, index) => {
  const optionLetter = ["yes", "not"][index];
  option.addEventListener("click", () => handleBooleanClick(optionLetter));
});

function handleBooleanClick(option) {
  workingData =
    quizData[
      option === "yes" ? workingData.nextRightID : workingData.nextWrongID
    ];
  hideAllContainers();

  fetchMapValues(workingData);
  if (lastSeekedTime !== startTime) {
    seekToTime(startTime);
    lastSeekedTime = startTime;
  }
}

function handleClarityClick(option) {
  workingData =
    quizData[
      option === "Clear" ? workingData.nextRightID : workingData.nextWrongID
    ];
  hideAllContainers();

  fetchMapValues(workingData);
  if (lastSeekedTime !== startTime) {
    seekToTime(startTime);
    lastSeekedTime = startTime;
  }
}

function handleOptionClick(option) {
  workingData =
    quizData[
      rightOption === option ? workingData.nextRightID : workingData.nextWrongID
    ];
  hideAllContainers();

  fetchMapValues(workingData);
  addVisitedTime(startTime, pauseTime); // Track new range

  if (lastSeekedTime !== startTime) {
    seekToTime(startTime);
    lastSeekedTime = startTime;
  }
}

function hideLoadingScreen() {
  document.getElementById("loading-screen").style.display = "none";
  document.getElementById("container").style.display = "flex";
}

// Load YouTube Iframe API dynamically
const tag = document.createElement("script");
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName("script")[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
