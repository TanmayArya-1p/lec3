async function initNavbar(playerState) {
    document.getElementById('player-name').innerText = await playerState.nick
    document.getElementById('player-character').src = `/assets/${playerState.char.toLowerCase()}.png`;
    document.getElementById('player-character').alt = playerState.char;
}

export {initNavbar};