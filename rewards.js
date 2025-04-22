import {ASH,GARY,offsetMap} from "../consts.js";
import Pokemon from "../pokemon.js";

async function offerReward(player,callback=null) {
    player.xp += 50;
    player.saveState();
    const pokemons = [];
    let offset = offsetMap[player.char]

    for (let i = 1; i <= 3; i++) {
        let pokemonCode;
        do {
            pokemonCode = Math.floor(Math.random() * 30) + offset+1;
        } while (pokemons.some(pokemon => pokemon.code === pokemonCode) || player.team.some(pokemon => pokemon.code === pokemonCode));      
        pokemons.push(new Pokemon(pokemonCode));
        await pokemons[i-1].hydrateData();
    }


    const pokemonSelectionContainer = document.getElementById('pokemon-starter-selector');
    let pokemonRewardContainers = []
    for (let i = 0; i < pokemons.length; i++) {
        document.getElementById("pokemon-selection-modal").style.display = 'flex';
        const pokemon = pokemons[i];
        const pokemonElement = document.getElementById('selectionTemplate').cloneNode(true);
        pokemonElement.id = `pokemon-${i}`;
        pokemonElement.addEventListener('click', async function () {
                player.addPokemon(pokemon);
                player.saveState();
                document.getElementById("pokemon-selection-modal").style.display = 'none';
                if(callback){
                    callback();
                }
                let tempTemplate = document.getElementById('selectionTemplate').cloneNode(true);
                pokemonSelectionContainer.innerHTML = '';
                pokemonSelectionContainer.appendChild(tempTemplate);
            }
            
        );
        pokemonElement.style.display= 'none';
        const pokemonImage = pokemonElement.querySelector('img');
        pokemonImage.src = pokemon.sprites.front_default;
        await new Promise(resolve => {
            pokemonImage.onload = resolve;
        });
        pokemonImage.alt = pokemon.name;
        pokemonElement.querySelector("h2").innerText = pokemon.name;

        pokemonSelectionContainer.appendChild(pokemonElement);
        pokemonRewardContainers.push(pokemonElement);
    }   
    for (let i = 0; i < pokemons.length; i++) {
        pokemonRewardContainers[i].style.display = 'block';
    }
    document.getElementById('pokemon-selector-loader').style.display = "none";

}

export { offerReward }