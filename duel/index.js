import Player from "../player.js"
import { initNavbar } from "./navbar.js";
import {Music, Pinger} from '../music.js';
import { BattleSimulator } from "./battle.js";


const music = new Music('../assets/music.mp3', ["../assets/happy.mp3", "../assets/battle-music.mp3","../assets/defeat.mp3"])
const ping = new Pinger('../assets/bubble.mp3', 'ping');          
// music.player.play();

let player = Player.loadState()

if(!player){
    window.location.href="/"
}


document.getElementById('logout-button').addEventListener('click', async function () {
    if (confirm("Are you sure you want to log out?. All your data will get wiped out with this account if you logout")) {
        await Player.clearState();
        window.location.href = "/";
    }
})

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
    document.getElementById('character-name-welcome-modal').innerText = player.nick + '\n' + "(XP: "+player.xp+")";
    

    let pokemonTeamContainer  = document.getElementById('pokemon-team-container');
    let tempTemplate = document.getElementById('pokemon-card-template').cloneNode(true);
    for(let i=0; i<player.team.length; i++){
        let pokemonCard = document.getElementById('pokemon-card-template').cloneNode(true);
        pokemonCard.style.display = 'block';
        pokemonCard.querySelector('img').src = player.team[i].sprites.front_default;
        pokemonCard.querySelector('img').alt = player.team[i].name;
        pokemonCard.querySelector('#pokemon-name').innerText = player.team[i].name;
        pokemonCard.querySelector('#pokemon-type').innerText = player.team[i].types.map(type => type.name).join(', ');
        pokemonCard.querySelector('#pokemon-hp').innerText = player.team[i].stats.hp;
        let pokemonIsMain = pokemonCard.querySelector('#pokemon-ismain');
        if(!modal) {
            if(i==0) {
                pokemonIsMain.innerText = "[MAIN]";
                pokemonIsMain.classList.add('blue-white-header');
            }
            else{   
                    pokemonIsMain.classList.add("click-to-add")
                    pokemonIsMain.classList.add("ping")

                    pokemonIsMain.addEventListener('click', function () {
                        let mainPokemon = player.getPokemon(0);
                        player.team[0] = player.getPokemon(i);
                        player.team[i] = mainPokemon;
                        player.saveState();
                        console.log("MAINED POKEMON: ", player.getPokemon(0));
                        pokemonTeamContainer.innerHTML = '';
                        pokemonTeamContainer.appendChild(tempTemplate);
                        displayWelcomeModal(player,false);
                    }
                )
            }
        }
        pokemonTeamContainer.appendChild(pokemonCard);
    }
}

displayWelcomeModal(player,false)

// let bs=new BattleSimulator(player.getPokemon(0), player.getPokemon(0), "battle-arena" , music);


// bs.draw()
// bs.setPlayer(player)
// bs.setOpponent(player)
// await bs.initMoves()



initNavbar(player)
document.getElementById('player-name').innerText = player.nickname;
