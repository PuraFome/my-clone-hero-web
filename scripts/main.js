let player;
let audioContext;
let analyser;
let source;
let dataArray;
let bufferLength;

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
    }
}

function setupAudioAnalysis() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    source = audioContext.createMediaElementSource(player.getIframe());
    source.connect(analyser);
    analyser.connect(audioContext.destination);
}

function startGame() {
    setInterval(createNote, 1000); // Cria uma nova nota a cada segundo
    document.addEventListener('keydown', handleKeyPress);
}

const lines = {
    83: '11%', // S
    68: '36%', // D
    74: '61%', // J
    75: '86%'  // K
}

function createNote() {
    const note = document.createElement('div');
    note.className = 'note';
    const key = getRandomKey();
    note.dataset.ket = key;
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
        const notes = document.querySelectorAll(`.note[data-key="${key}"]`);
        let hit = false;
        notes.forEach(note => {
            const noteReact = note.getBoundingClientRect();
            const hitZoneReact = note.getBoundingClientRect();
            if(noteReact.bottom >= hitZoneReact.top && noteReact.bottom <= hitZoneReact.bottom){
                note.remove();
                hit = true;
            }
        });
        hitZone.style.backgroundColor = hit ? 'green' : 'red';
        setTimeout(()=>{
            hitZone.style.backgroundColor = '#666';
        }, 200);
    }
}