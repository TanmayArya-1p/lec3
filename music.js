class Music {
    constructor(src,nonDefaults) {
        this.player = document.createElement("audio");
        this.mute = document.getElementById("mute");
        this.unmute = document.getElementById("unmute");
        this.control = document.getElementById("music-control");
        this.player.setAttribute('src', src);
        this.player.setAttribute('loop', 'loop');
        this.player.volume = 0.1;
        this.nonDefaults = nonDefaults;
        this.mute.style.display = "";
        this.unmute.style.display = "none";

        this.control.addEventListener('click', () => this.togglePlayer());
    }

    updateUI(isPlaying) {
        this.mute.style.display = isPlaying ? "" : "none";
        this.unmute.style.display = isPlaying ? "none" : "";
    }

    playNonDefault(idx) {
        if(this.mute.style.display == "none") {
            return;
        }
        console.log("HERE")
        let tmp = this.player.src;
        this.player.setAttribute('src', this.nonDefaults[idx]);
        this.player.loop = false;
        this.player.currentTime = 0;
        this.player.play();
        return function (musicPlayer) {
            musicPlayer.player.setAttribute('src', tmp);
            musicPlayer.player.currentTime = 0;
            musicPlayer.player.play();
        }
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
        this.player.volume = 0.1;
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
        const observer = new MutationObserver(() => {
            const newElements = Array.from(document.querySelectorAll(`.${this.className}`));
            for (let i = 0; i < newElements.length; i++) {
                if (!newElements[i].hasListener) {
                    newElements[i].addEventListener('mouseenter', () => {
                        this.play();
                    });
                    newElements[i].hasListener = true;
                }
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }
    play() {
        this.player.currentTime = 0;
        this.player.play();
    }

}

export {Music, Pinger};

