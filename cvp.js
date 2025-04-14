
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
let nextRightID, nextWrongID, lastSeekedTime = null;
let visitedTimes = [];






// 2. YouTube Player Control Elements

const optionA= document.getElementById('option-a');
const optionB= document.getElementById('option-b');
const optionC= document.getElementById('option-c');
const optionD= document.getElementById('option-d');
const option3A= document.getElementById('option3-a');
const option3B= document.getElementById('option3-b');
const option3C= document.getElementById('option3-c');
const option2A= document.getElementById('option2-a');
const option2B= document.getElementById('option2-b');

const clearButton= document.getElementById('option-clear');
const notClearButon= document.getElementById('option-notClear');
const yesButton= document.getElementById('option-yes');
const notButton= document.getElementById('option-not');




const container = document.querySelector(".container"),
playPauseBtn = container.querySelector(".play-pause i"),
mainVideo = container.querySelector("video"),
videoTimeline = container.querySelector(".video-timeline"),
progressBar = container.querySelector(".progress-bar"),
currentVidTime = container.querySelector(".current-time"),
videoDuration = container.querySelector(".video-duration"),
rewindButton = container.querySelector(".skip-backward i"),
forwardButton = container.querySelector(".skip-forward i"),
speedBtn = container.querySelector(".playback-speed span"),
speedOptions = container.querySelector(".speed-options");
let timer;



const hideControls = () => {
    if(mainVideo.paused) return;
    timer = setTimeout(() => {
        container.classList.remove("show-controls");
    }, 3000);
}
hideControls();
container.addEventListener("mousemove", () => {
    container.classList.add("show-controls");
    clearTimeout(timer);
    hideControls();   
});



videoTimeline.addEventListener("mousemove", e => {
    
});
videoTimeline.addEventListener("click", e => {
    
});
mainVideo.addEventListener("timeupdate", e => {
    let {currentTime, duration} = e.target;
    let percent = (currentTime / duration) * 100;
    progressBar.style.width = `${percent}%`;
    currentVidTime.innerText = formatTime(currentTime);
});
mainVideo.addEventListener("loadeddata", () => {
    videoDuration.innerText = formatTime(mainVideo.duration);
});
const draggableProgressBar = e => {
    let timelineWidth = videoTimeline.clientWidth;
    progressBar.style.width = `${e.offsetX}px`;
    mainVideo.currentTime = (e.offsetX / timelineWidth) * mainVideo.duration;
    currentVidTime.innerText = formatTime(mainVideo.currentTime);
}

speedOptions.querySelectorAll("li").forEach(option => {
    option.addEventListener("click", () => {
        mainVideo.playbackRate = option.dataset.speed;
        speedOptions.querySelector(".active").classList.remove("active");
        option.classList.add("active");
    });
});
document.addEventListener("click", e => {
    if(e.target.tagName !== "SPAN" || e.target.className !== "material-symbols-rounded") {
        speedOptions.classList.remove("show");
    }
});


rewindButton.addEventListener("click", () => mainVideo.currentTime -= 5);
forwardButton.addEventListener("click", () => mainVideo.currentTime += 5);
mainVideo.addEventListener("play", () => playPauseBtn.classList.replace("fa-play", "fa-pause"));
mainVideo.addEventListener("pause", () => playPauseBtn.classList.replace("fa-pause", "fa-play"));




       


mainVideo.addEventListener("loadedmetadata", () => {
    console.log("Video is fully loaded!");

    

    
       

 
    rewindButton.addEventListener('click', () => {
        let currentTime = mainVideo.currentTime;
        let newTime = getValidRewindTime(currentTime);
        if (newTime !== null) {
            mainVideo.currentTime=newTime;
            mainVideo.play();
        }

    });

    function getValidRewindTime(currentTime) {
        let newTime = currentTime - 5;

        if (newTime >= startTime && newTime < pauseTime) {
            console.log("rw1");
            return newTime;
        }

        if (newTime < visitedTimes[0].start) {
            newTime = visitedTimes[0].start;
            console.log(newTime + " rw4");
            return newTime;
        }
    
        for (let i = 0; i < visitedTimes.length; i++) {
            if (newTime > visitedTimes[i].start && newTime < visitedTimes[i].end) {
                console.log(newTime + " rw2");
                return newTime;
            }
    
            if (i != 0 && newTime < visitedTimes[i].start && newTime > visitedTimes[i - 1].end) {
                newTime = Math.max(visitedTimes[i - 1].end - 10, visitedTimes[i - 1].start);
                console.log(newTime + " rw3");
                return newTime;
            }
        }
    }
    
    function getValidForwardTime(currentTime) {
        let newTime = currentTime + 5;
        
        if (newTime > startTime && newTime < pauseTime) {
            console.log("fw1");
            return newTime;
        }

        if (newTime > visitedTimes[visitedTimes.length-1].end) {
            newTime = visitedTimes[visitedTimes.length-1].end;
            mainVideo.pause();
            return newTime;
        }
    
        for (let i = 0; i < visitedTimes.length; i++) {
            if (newTime > visitedTimes[i].start && newTime < visitedTimes[i].end) {
                console.log(newTime + " fw2");
                return newTime;
            }
    
            if (i < visitedTimes[visitedTimes.length-1] && newTime > visitedTimes[i].end && newTime < visitedTimes[i + 1].start) {
                newTime = Math.min(visitedTimes[i + 1].start + 5, visitedTimes[i + 1].end -5);
                console.log(newTime + " rw3");
                return newTime;
            }
        }
    }


    // Forward 10 seconds
    forwardButton.addEventListener('click', () => {
        
        let currentTime =  mainVideo.currentTime;
        let duration =  mainVideo.duration;
        if((currentTime+5) >= pauseTime){
            mainVideo.currentTime=pauseTime;
            mainVideo.pause();
            console.log("fw1")
        }
        else{
            let newTime = getValidForwardTime(currentTime);
        if (newTime !== null) {
            mainVideo.currentTime=newTime;
            mainVideo.play();
            console.log("fw2")

        }
        }
    });


  
     

  
            
    // Call this function whenever you want to start the check


    // Sync the play/pause button
    playPauseBtn.addEventListener('click', () => {

        let currentTime =  mainVideo.currentTime;

    if(currentTime < pauseTime) {   
        if (mainVideo && !mainVideo.paused && !mainVideo.ended) {
            mainVideo.pause();
                playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            } else {
                mainVideo.play();
                playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
            }
        }
    });

   

   

  

    fetchFirestoreData();

});




//new
mainVideo.addEventListener('play', () => onPlayerStateChange('playing'));
mainVideo.addEventListener('pause', () => onPlayerStateChange('paused'));
mainVideo.addEventListener('ended', () => onPlayerStateChange('ended'));
mainVideo.addEventListener('play', () => updateProgress());




function onPlayerStateChange(state) {
    console.log("Player state changed:", state);
}



//new



// When the player's state changes, update the UI

// Update the progress bar and time info
function updateProgress() {
    setInterval(() => {
        if (mainVideo && !mainVideo.paused && !mainVideo.ended) {
            const currentTime = mainVideo.currentTime;
            const duration = mainVideo.duration;
    
            console.log("Current Time:", currentTime, "Duration:", duration);
            trial();
        }
    }, 1000);
    }

// Format time in mm:ss
function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}


// Function to log visited times
function logVisitedTimes() {
    console.log("Visited times:", visitedTimes);
}

// Function to check if a time range is already in the list
function isAlreadyVisited(start, end) {
    return visitedTimes.some(time => time.start === start && time.end === end);
}

// Function to add new time range to visited list
function addVisitedTime(start, end) {
    if (!isAlreadyVisited(start, end)) {
        visitedTimes.push({ start, end });
        logVisitedTimes();  // Log the updated list
    }
}



function seekToTime(timeInSeconds) {
    if (mainVideo && typeof timeInSeconds === 'number') {
        addVisitedTime(startTime, pauseTime);

        mainVideo.currentTime=timeInSeconds;  // The second argument (true) ensures accurate seeking
        mainVideo.play().then(() => {
            console.log("Seeked and playback started at", timeInSeconds);
        }).catch(err => {
            console.warn("Seeked to", timeInSeconds, "but playback failed:", err.message);
            
        });


        
    }
}






function fetchFirestoreData() {
    console.log("fetch ready");

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
            console.log(quizData[0]); // Log the entire data to the console
            workingData = quizData[0];
            fetchMapValues(workingData);

           

                // Check if startTime is valid, then seek to it
        seekToTime(startTime); // Seek and start the video after startTime is fetched
            hideLoadingScreen();

        } else {
            console.error("No quiz data found!");
        }
    } catch (error) {
        console.error("Error fetching data from Firestore:", error);
    }
}
        
function fetchMapValues(workingData){
    if(workingData){
        startTime = parseFloat(workingData.start);
        console.log('startTime:', startTime);
        
        workingData.showQTime ? showQTime = parseFloat(workingData.showQTime) : showQTime = 0;
        console.log('showQTime:', showQTime);
        
        workingData.showQ3Time ? showQ3Time = parseFloat(workingData.showQ3Time) : showQ3Time = 0;
        console.log('showQ3Time:', showQ3Time);
        
        workingData.showQ2Time ? showQ2Time = parseFloat(workingData.showQ2Time) : showQ2Time = 0;
        console.log('showQ2Time:', showQ2Time);
        
        workingData.showBooleanTime ? showBooleanTime = parseFloat(workingData.showBooleanTime) : showBooleanTime = 0;
        console.log('showBooleanTime:', showBooleanTime);
        
        workingData.showClarityTime ? showClarityTime = parseFloat(workingData.showClarityTime) : showClarityTime = 0;
        console.log('showClarityTime:', showClarityTime);
        
        workingData.rightOption ? rightOption = workingData.rightOption : rightOption = '0';
        console.log('rightOption:', rightOption);
        
        workingData.nextRightID ? nextRightID = workingData.nextRightID : nextRightID = '0';
        console.log('nextRightID:', nextRightID);
        
        workingData.nextWrongID ? nextWrongID = workingData.nextWrongID : nextWrongID = '0';
        console.log('nextWrongID:', nextWrongID);
        
        workingData.nextTime ? nextTime = workingData.nextTime : nextTime = '0';
        console.log('nextTime:', nextTime);
        
        if (showQTime != 0) pauseTime = showQTime;
        if (showQ3Time != 0) pauseTime = showQ3Time;
        if (showQ2Time != 0) pauseTime = showQ2Time;
        if (showBooleanTime != 0) pauseTime = showBooleanTime;
        if (showClarityTime != 0) pauseTime = showClarityTime;
        if (nextTime != 0) pauseTime = nextTime + 5;
        
        console.log('pauseTime:', pauseTime);
        









    //console.log("working Data",workingData);

    }
    else {
        alert("no data");
        mainVideo.currentTime = visitedTimes[0].start;
        mainVideo.pause();

    }

    hideAllContainers();

}






        



// 9. Show Specific Containers

function showOnlyContainer(containerToShow) {
    
    const containers = [
        document.querySelector('.options-container-4'),
        document.querySelector('.options-container-3'),
        document.querySelector('.options-container-2'),
        document.querySelector('.clarity-container'),
        document.querySelector('.boolean-container')
    ];

    // Hide all containers
    containers.forEach(container => {
        container.style.display = 'none';
    });

    // Show the specified container
    if (containerToShow) {
        const container = document.querySelector(`.${containerToShow}`);
        if (container) {
            container.style.display = 'flex';
        }
    }
}

function hideAllContainers() {
    const containers = [
        document.querySelector('.options-container-4'),
        document.querySelector('.options-container-3'),
        document.querySelector('.options-container-2'),
        document.querySelector('.clarity-container'),
        document.querySelector('.boolean-container')
    ];

    // Hide all containers
    containers.forEach(container => {
        container.style.display = 'none';
    });

    
    
}




[optionA, optionB, optionC, optionD].forEach((option, index) => {
    const optionLetter = ['a', 'b', 'c', 'd'][index];
    option.addEventListener('click', () => handleOptionClick(optionLetter));
});

[option3A, option3B, option3C].forEach((option, index) => {
    const optionLetter = ['a', 'b', 'c'][index];
    option.addEventListener('click', () => handleOptionClick(optionLetter));
});

[option2A, option2B].forEach((option, index) => {
    const optionLetter = ['a', 'b'][index];
    option.addEventListener('click', () => handleOptionClick(optionLetter));
});

[clearButton, notClearButon].forEach((option, index) => {
    const optionLetter = ['clear', 'notClear'][index];
    option.addEventListener('click', () => handleClarityClick(optionLetter));
});

[yesButton, notButton].forEach((option, index) => {
    const optionLetter = ['yes', 'not'][index];
    option.addEventListener('click', () => handleBooleanClick(optionLetter));
});


function handleBooleanClick(option){
    workingData = quizData[option === "yes" ? workingData.nextRightID : workingData.nextWrongID];
    hideAllContainers();


    fetchMapValues(workingData);
    if (lastSeekedTime !== startTime) {
        seekToTime(startTime);
        lastSeekedTime = startTime;
    }

} 

function handleClarityClick(option){
    workingData = quizData[option === "Clear" ? workingData.nextRightID : workingData.nextWrongID];
    hideAllContainers();


    fetchMapValues(workingData);
    if (lastSeekedTime !== startTime) {
        seekToTime(startTime);
        lastSeekedTime = startTime;
    }

} 



function handleOptionClick(option) {
    console.log("Right option:", rightOption, "clicked option:", option);

    workingData = quizData[rightOption === option ? workingData.nextRightID : workingData.nextWrongID];
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


function trial(){
    console.log("run 1");
    if (mainVideo && !isNaN(mainVideo.currentTime)) {
        const currentTime = mainVideo.currentTime; // Get the current time of the video

        console.log("run 2");

        // Check if we need to go to the next video section
        if ( nextTime != 0 && currentTime >= nextTime) {
            // Load the next section of the video

            if(quizData[workingData.nextRightID]){
                workingData = quizData[workingData.nextRightID];  // Update workingData with the next part
                console.log(workingData);

                
                // Set the new start, pause, and next times
                fetchMapValues(workingData);
                // Avoid seeking repeatedly in the interval
                if (lastSeekedTime !== startTime) {
                    seekToTime(startTime);  // Seek to the new start time
                    lastSeekedTime = startTime; // Record the last seeked time
                }
            }
            else {
                mainVideo.pause(); // Pause the video
                alert("you have completed the work ");
                clearInterval(checkInterval);
            }
        }

        




        const showTimes = [
            { time: showQTime, container: 'options-container-4' },
            { time: showQ3Time, container: 'options-container-3' },
            { time: showQ2Time, container: 'options-container-2' },
            { time: showBooleanTime, container: 'boolean-container' },
            { time: showClarityTime, container: 'clarity-container' }
          ];
          
          for (const { time, container } of showTimes) {
            if (time !== 0 && currentTime >= time) {
                mainVideo.pause();
                                      showOnlyContainer(container);
              break;
            } else {
              hideAllContainers();
            }
          }
          
            
console.log(currentTime);

if (currentTime < startTime) {
for (let i = 1; i < visitedTimes.length; i++) {
if (currentTime < visitedTimes[i].start && currentTime >= visitedTimes[i-1].end) {
    console.log("Skipping to next start time...");
    seekToTime(visitedTimes[i].start); 
    return;
}
}
}



    }

}


  






 




