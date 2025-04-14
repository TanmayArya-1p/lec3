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

let bs=new BattleSimulator(player.getPokemon(0), player.getPokemon(0), "battle-arena" , music);


bs.draw()
bs.setPlayer(player)
bs.setOpponent(player)
await bs.initMoves()


async function performAttacks() {
    for (let i = 0; i < 8; i++) {
        bs.attackHome(0);
        await new Promise(resolve => setTimeout(resolve, 1000));
        bs.attackAway(0);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}




initNavbar(player)
document.getElementById('player-name').innerText = player.nickname;

await performAttacks();