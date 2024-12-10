let player;
let noteInterval;
let isPlaying = false;

function onYouTubeIframeAPIReady() {
    const urlParams = new URLSearchParams(window.location.search);
    const videoId = urlParams.get('videoId');
    player = new YT.Player('youtube-player', {
        height: '390',
        width: '640',
        videoId: videoId,
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    event.target.playVideo();
    setupAudioAnalysis();
}

function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING) {
        startGame();
        resumeNotes();
    } else if (event.data == YT.PlayerState.PAUSED || event.data == YT.PlayerState.ENDED) {
        stopGame();
    }
}

function setupAudioAnalysis() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    const videoElement = document.querySelector('iframe');
    const mediaElement = new Audio(videoElement.src);
    source = audioContext.createMediaElementSource(mediaElement);
    source.connect(analyser);
    analyser.connect(audioContext.destination);
}

function startGame() {
    isPlaying = true;
    noteInterval = setInterval(createNote, 1000); // Ajuste o intervalo conforme necessário
    document.addEventListener('keydown', handleKeyPress);
}

function stopGame() {
    isPlaying = false;
    clearInterval(noteInterval);
    pauseNotes();
}

const lines = {
    83: '11%', // S
    68: '36%', // D
    74: '61%', // J
    75: '86%'  // K
}

function createNote() {
    if (!isPlaying) return;
    const note = document.createElement('div');
    note.className = 'note';
    const key = getRandomKey();
    note.dataset.key = key;
    note.style.left = lines[key];
    document.getElementById('notes').appendChild(note);
}

function getRandomKey() {
    const keys = Object.keys(lines)
    return keys[Math.floor(Math.random() * keys.length)];
}

function handleKeyPress(event) {
    const key = event.keyCode;
    const hitZone = document.querySelector(`.hit-zone[data-key="${key}"]`);
    if (hitZone) {
        const notes = document.getElementsByClassName('note');
        let hit = false;
        Array.from(notes).forEach(note => {
            if (note.dataset.key == key) {
                const noteReact = note.getBoundingClientRect();
                const hitZoneReact = hitZone.getBoundingClientRect();
                if(noteReact.bottom >= hitZoneReact.top && noteReact.bottom <= hitZoneReact.bottom){
                    note.remove();
                    hit = true;
                }
            }
        });
        hitZone.style.backgroundColor = hit ? 'green' : 'red';
        setTimeout(()=>{
            hitZone.style.backgroundColor = '#666';
        }, 200);
    }
}

function pauseNotes() {
    const notes = document.getElementsByClassName('note');
    Array.from(notes).forEach(note => {
        note.style.animationPlayState = 'paused';
    });
}

function resumeNotes() {
    const notes = document.getElementsByClassName('note');
    Array.from(notes).forEach(note => {
        note.style.animationPlayState = 'running';
    });
}