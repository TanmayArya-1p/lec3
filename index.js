import Player from './player.js';
import {ASH, GARY} from './consts.js';
import Pokemon from './pokemon.js';
import {Music, Pinger} from './music.js';


initBanners()

const music = new Music('assets/music.mp3', ["assets/happy.mp3"])
const ping = new Pinger('assets/bubble.mp3', 'ping');          
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
        await loadPokemons()
    })
});

async function loadPokemons() {
    const pokemons = [];
    let offset = 0

    if(playerCharacter===ASH) {
        offset = 0
    } else if(playerCharacter===GARY) {
        offset = 30
    }

    for (let i = 1; i <= 3; i++) {
        let pokemonCode;
        do {
            pokemonCode = Math.floor(Math.random() * 30) + offset+1;
        } while (pokemons.some(pokemon => pokemon.code === pokemonCode));
        pokemons.push(new Pokemon(pokemonCode));
        await pokemons[i-1].hydrateData();
    }


    const pokemonSelectionContainer = document.getElementById('pokemon-starter-selector');
    for (let i = 0; i < pokemons.length; i++) {
        const pokemon = pokemons[i];
        const pokemonElement = document.getElementById('selectionTemplate').cloneNode(true);
        pokemonElement.id = `pokemon-${i}`;
        pokemonElement.addEventListener('click', async function () {
                const player = new Player(playerNickname, playerCharacter, []);
                player.addPokemon(pokemon);
                player.saveState();
                document.getElementById('pokemon-selection-modal').style.display = 'none';
                document.getElementById('welcome-modal').style.display = 'flex';
                document.getElementById('welcome-header').innerText = 'Welcome ' +playerNickname + '!';
                document.getElementById('welcome-character').src = `/assets/${playerCharacter.toLowerCase()}.png`;
                document.getElementById('welcome-character').alt = playerCharacter;
                
                let pokemonCard = document.getElementById('pokemon-card-template')
                pokemonCard.style.display = 'block';
                pokemonCard.querySelector('img').src = pokemon.sprites.front_default;
                pokemonCard.querySelector('img').alt = pokemon.name;

                pokemonCard.querySelector('#pokemon-name').innerText = pokemon.name;
                pokemonCard.querySelector('#pokemon-type').innerText = pokemon.types.map(type => type.name).join(', ');
                pokemonCard.querySelector('#pokemon-hp').innerText = pokemon.stats.hp;  

            }
        );
        pokemonElement.style.display= 'block';
        const pokemonImage = pokemonElement.querySelector('img');
        pokemonImage.src = pokemon.sprites.front_default;
        pokemonImage.alt = pokemon.name;
        pokemonElement.querySelector("h2").innerText = pokemon.name;

        pokemonSelectionContainer.appendChild(pokemonElement);
    }   
    document.getElementById('pokemon-selector-loader').style.display = "none";
}




function initBanners() {
    const bannerCount = 10;
    const imageCount = 12;
    const bannerContainer = document.getElementById('poke-banners-container')
    
    const bannerTemplate = document.createElement('div');
    bannerTemplate.className = 'poke-banner';
    const bannerInnerTemplate = document.createElement('div');
    bannerInnerTemplate.className = 'poke-banner-inner';
    const logoTemplate = document.createElement('img');
    logoTemplate.src = '/assets/pokemon-logo.svg';
    logoTemplate.alt = 'PokeLAN Logo';
    logoTemplate.className = 'poke-logo';
    
    for(let i = 0; i < 2*imageCount; i++) {
        bannerInnerTemplate.appendChild(logoTemplate.cloneNode(true));
    }
    
    bannerTemplate.appendChild(bannerInnerTemplate);
    
    
    for(let i = 0; i < bannerCount; i++) {
        const banner = bannerTemplate.cloneNode(true);
        
        if(i % 2 == 0) {
            banner.style.backgroundColor = '#ff0000';
            banner.classList.add('right-scroll');
        } else {
            banner.style.backgroundColor = '#cc0000';
            banner.classList.add('left-scroll');
        }
        bannerContainer.appendChild(banner);
    }    
}



