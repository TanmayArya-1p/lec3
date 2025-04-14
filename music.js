class Music {
    constructor(src) {
        this.player = document.createElement("audio");
        this.mute = document.getElementById("mute");
        this.unmute = document.getElementById("unmute");
        this.control = document.getElementById("music-control");
        this.player.setAttribute('src', src);
        this.player.setAttribute('loop', 'loop');

        this.mute.style.display = "";
        this.unmute.style.display = "none";

        this.control.addEventListener('click', () => this.togglePlayer());
    }

    updateUI(isPlaying) {
        this.mute.style.display = isPlaying ? "" : "none";
        this.unmute.style.display = isPlaying ? "none" : "";
    }

    togglePlayer() {
        if (this.player.paused) {
            this.player.play();
            this.updateUI(true);
        } else {
            this.player.pause();
            this.updateUI(false);
        }
    }
}

class Pinger {
    constructor(pingSrc,className) {
        this.pingSrc = pingSrc;
        this.className = className;
        this.player = document.createElement("audio");
        this.player.setAttribute('src', pingSrc);
        this.setupListeners()
    }
    setupListeners() {
        const elements = Array.from(document.querySelectorAll(`.${this.className}`));
        for (let i = 0; i < elements.length; i++) {
            elements[i].addEventListener('mouseenter', () => {
                this.play();
            });
        }
    }
    play() {
        this.player.currentTime = 0;
        this.player.play();
    }

}

const music = new Music('assets/music.mp3', 'mute', 'unmute', 'music-control');
const ping = new Pinger('assets/bubble.mp3', 'ping');          
// music.player.play();
document.getElementById('music-control').addEventListener('click', music.togglePlayer);

