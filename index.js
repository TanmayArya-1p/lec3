import Player from './player.js';
import {ASH, GARY} from './consts.js';
import Pokemon from './pokemon.js';
import {Music, Pinger} from './music.js';
import initBanners from './banners.js';
import { offerReward } from './rewards.js';
import { displaySummaryModal } from './utils.js';

initBanners()

const music = new Music('assets/music.mp3', ["assets/happy.mp3"])
new Pinger('assets/bubble.mp3', 'ping');          
// music.player.play();
document.getElementById('music-control').addEventListener('click', music.togglePlayer);
document.getElementById('start-game-button').addEventListener('click', () => startGameHandler());

function startGameHandler() {
    document.getElementById('start-game-button').style.display = 'none';
    music.playNonDefault(0)
    setTimeout(() => {
        window.location.href = '/duel/';
    },5500)
}


let playerNickname = ""
let playerCharacter = ""


function checkAuth() {
    if(!Player.isNew()) {
        let player = Player.loadState()
        playerNickname = player.nick;
        playerCharacter = player.char;
        displaySummaryModal(player);
    }
}


await checkAuth()


document.getElementById('nickname-submit').addEventListener('click', function () {
    playerNickname = document.getElementById('nickname-input').value.trim();
    if (playerNickname) {
        document.getElementById('nickname-modal').style.display = 'none';
        document.getElementById('character-selection-modal').style.display = 'flex';
    }
});

document.querySelectorAll(`.character-option`).forEach(option => {
    option.addEventListener('click', async function () {
        playerCharacter = this.getAttribute('data-character-name');
        document.getElementById('character-selection-modal').style.display = 'none';
        document.getElementById('pokemon-selection-modal').style.display = 'flex';
        let player = new Player(playerNickname, playerCharacter, []);
        player.saveState();
        await offerReward(player , () => displaySummaryModal(player));
    })
});