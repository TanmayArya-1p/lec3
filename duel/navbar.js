function initNavbar(playerState) {
    document.getElementById('player-name').innerText = playerState.nick
    document.getElementById('player-character').src = `/assets/${playerState.char.toLowerCase()}.png`;
    document.getElementById('player-character').alt = playerState.char;
    document.getElementById('player-team').innerText = "Team :"+playerState.pokemons.map(pokemon => pokemon.name).join(', ');
}

export {initNavbar};