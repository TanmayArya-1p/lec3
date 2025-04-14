import Player from "../player.js"
import { initNavbar } from "./navbar.js";
import {Music, Pinger} from '../music.js';
import { BattleSimulator } from "./battle.js";


const music = new Music('../assets/music.mp3', ["assets/happy.mp3"])
const ping = new Pinger('../assets/bubble.mp3', 'ping');          
// music.player.play();

let player = Player.loadState()

if(!player){
    window.location.href="/"
}

let bs=new BattleSimulator(player.getPokemon(0), player.getPokemon(0), "battle-arena");
bs.draw()
bs.setPlayer(player)
bs.setOpponent(player)

initNavbar(player)
document.getElementById('player-name').innerText = player.nickname;