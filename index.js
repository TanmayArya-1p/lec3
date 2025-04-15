import Player from './player.js';
import {ASH, GARY} from './consts.js';
import Pokemon from './pokemon.js';
import {Music, Pinger} from './music.js';
import initBanners from './banners.js';
import { offerReward } from './rewards.js';

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
        displayWelcomeModal(player);
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
        await offerReward(player , () => displayWelcomeModal(player));
    })
});


async function displayWelcomeModal(player,modal=true) {
    if(modal) {
        document.getElementById('pokemon-selection-modal').style.display = 'none';
        document.getElementById('nickname-modal').style.display = 'none';
        document.getElementById('character-selection-modal').style.display = 'none';
    
        document.getElementById('welcome-modal').style.display = 'flex';
        document.getElementById('welcome-header').innerText = 'Welcome ' +player.nick + '!';
    }

    document.getElementById('welcome-character').src = `/assets/${player.char.toLowerCase()}.png`;
    document.getElementById('welcome-character').alt = player.char;
    document.getElementById('character-name-welcome-modal').innerText = player.nick;
    document.getElementById('character-name-welcome-modal').innerText = player.nick + '\n' + "(XP: "+player.xp+")";


    let pokemonTeamContainer  = document.getElementById('pokemon-team-container');
    for(let i=0; i<player.team.length; i++){
        let pokemonCard = document.getElementById('pokemon-card-template').cloneNode(true);
        pokemonCard.style.display = 'block';
        pokemonCard.querySelector('img').src = player.team[i].sprites.front_default;
        pokemonCard.querySelector('img').alt = player.team[i].name;
        pokemonCard.querySelector('#pokemon-name').innerText = player.team[i].name;
        pokemonCard.querySelector('#pokemon-type').innerText = player.team[i].types.map(type => type.name).join(', ');
        pokemonCard.querySelector('#pokemon-hp').innerText = player.team[i].stats.hp;
        pokemonTeamContainer.appendChild(pokemonCard);
    }
}