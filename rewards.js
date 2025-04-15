import {ASH,GARY} from "../consts.js";
import Pokemon from "../pokemon.js";


async function offerReward(player,callback=null) {
    player.xp += 50;
    player.saveState();
    const pokemons = [];
    let offset = 0

    if(player.char===ASH) {
        offset = 0
    } else if(player.char===GARY) {
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
        document.getElementById("pokemon-selection-modal").style.display = 'flex';
        const pokemon = pokemons[i];
        const pokemonElement = document.getElementById('selectionTemplate').cloneNode(true);
        pokemonElement.id = `pokemon-${i}`;
        pokemonElement.addEventListener('click', async function () {
                player.addPokemon(pokemon);
                player.addPokemon(pokemon);

                player.addPokemon(pokemon);

                player.saveState();
                document.getElementById("pokemon-selection-modal").style.display = 'none';
                if(callback){
                    callback();
                }
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

export { offerReward }