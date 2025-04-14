import Player from "../player.js"
import { initNavbar } from "./navbar.js";
import {Music, Pinger} from '../music.js';

const music = new Music('../assets/music.mp3', ["assets/happy.mp3"])
const ping = new Pinger('../assets/bubble.mp3', 'ping');          
// music.player.play();

let player = Player.loadState()
if(!player){
    window.localtion.href="/"
}
initNavbar(player)
document.getElementById('player-name').innerText = player.nickname;