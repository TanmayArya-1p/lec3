const player = document.createElement('audio');
const mute = document.getElementById('mute');
const unmute = document.getElementById('unmute');

player.setAttribute('src', 'assets/music.mp3');
player.setAttribute('loop', 'loop');

mute.style.display = "";
unmute.style.display ="none";

function updateUI(isPlaying) {
    mute.style.display = isPlaying ? "" : "none";
    unmute.style.display = isPlaying ? "none" : "";
}

function togglePlayer() {
    if (player.paused) {
        player.play();
        updateUI(true);
    } else {
        player.pause();
        updateUI(false);
    }
}

document.getElementById('music-control').addEventListener('click', togglePlayer);
// player.play();
