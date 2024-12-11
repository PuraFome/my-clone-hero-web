let player, noteInterval, isPlaying = false, score = 0, multiplier = 1;

function onYouTubeIframeAPIReady() {
    const videoId = sessionStorage.getItem('videoId');
    if (videoId) {
        player = new YT.Player('youtube-player', {
            height: '390',
            width: '640',
            videoId: videoId,
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });
    } else {
        alert('Nenhum vídeo foi selecionado. Por favor, volte e escolha uma música.');
        window.location.href = 'index.html';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (typeof YT === 'undefined' || typeof YT.Player === 'undefined') {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    } else {
        onYouTubeIframeAPIReady();
    }
});

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
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const videoElement = document.querySelector('iframe');
    const mediaElement = new Audio(videoElement.src);
    const source = audioContext.createMediaElementSource(mediaElement);
    source.connect(analyser);
    analyser.connect(audioContext.destination);
}

function startGame() {
    isPlaying = true;
    score = 0;
    multiplier = 1;
    updateScore();
    updateMultiplier();
    noteInterval = setInterval(createNote, 1000);
    document.addEventListener('keydown', handleKeyPress);
}

function stopGame() {
    isPlaying = false;
    clearInterval(noteInterval);
    pauseNotes();
}

const lines = { 83: '11%', 68: '36%', 74: '61%', 75: '86%' };

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
    const keys = Object.keys(lines);
    return keys[Math.floor(Math.random() * keys.length)];
}

function handleKeyPress(event) {
    const key = event.keyCode;
    const hitZone = document.querySelector(`.hit-zone[data-key="${key}"]`);
    const hitSphere = document.querySelector(`.hit-sphere[data-key="${key}"]`);
    if (hitZone && hitSphere) {
        const notes = document.getElementsByClassName('note');
        let hit = false;
        Array.from(notes).forEach(note => {
            if (note.dataset.key == key) {
                const noteRect = note.getBoundingClientRect();
                const hitSphereRect = hitSphere.getBoundingClientRect();
                if (noteRect.bottom >= hitSphereRect.top && noteRect.bottom <= hitSphereRect.bottom) {
                    note.remove();
                    hit = true;
                    score += Math.floor(multiplier);
                    multiplier = Math.min(multiplier + (multiplier < 2 ? 0.2 : 0.1), 3);
                    updateScore();
                    updateMultiplier();
                }
            }
        });
        hitZone.style.backgroundColor = hit ? 'green' : 'red';
        if (!hit) {
            multiplier = 1;
            updateMultiplier();
        }
        setTimeout(() => { hitZone.style.backgroundColor = '#666'; }, 200);
    }
}

function updateScore() {
    document.getElementById('score').innerText = `Score: ${score}`;
}

function updateMultiplier() {
    document.getElementById('multiplier-bar').style.height = `${(multiplier - 1) * 50}%`;
}

function pauseNotes() {
    Array.from(document.getElementsByClassName('note')).forEach(note => {
        note.style.animationPlayState = 'paused';
    });
}

function resumeNotes() {
    Array.from(document.getElementsByClassName('note')).forEach(note => {
        note.style.animationPlayState = 'running';
    });
}