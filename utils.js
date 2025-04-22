import { teamBattleCount } from './consts.js';

async function displaySummaryModal(player,modal=true) {
    let tempTemplate = document.getElementById('pokemon-card-template').cloneNode(true);
    let pokemonTeamContainer  = document.getElementById('pokemon-team-container');

    pokemonTeamContainer.innerHTML = '';
    pokemonTeamContainer.appendChild(tempTemplate);
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
            if(i<teamBattleCount) {
                pokemonIsMain.innerText = "[MAIN]";
                pokemonIsMain.classList.add('blue-white-header');

            }

            pokemonIsMain.classList.add("click-to-add")
            pokemonIsMain.classList.add("ping")

            pokemonIsMain.addEventListener('click', function () {
                let movedPokemon = player.team.splice(i, 1)[0];
                player.team.unshift(movedPokemon);
                player.saveState();

                displaySummaryModal(player,false);
            }
        )

        }
        pokemonTeamContainer.appendChild(pokemonCard);
    }
}

export { displaySummaryModal }