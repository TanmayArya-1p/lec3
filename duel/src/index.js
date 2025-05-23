import Player from "../../src/player.js"
import { initNavbar } from "./navbar.js";
import {Music, Pinger} from '../../src/music.js';
import { startNPCBattle } from "./npc.js";
import { displaySummaryModal ,dimensionCheck} from "../../src/utils.js";
import {RTCPlayer, initiateRTCBattle} from "./rtc.js";

dimensionCheck("/duel")
window.addEventListener('resize' ,() => dimensionCheck("/duel"))

const music = new Music('../assets/music.mp3', ["../assets/happy.mp3", "../assets/battle-music.mp3"])
const ping = new Pinger('../assets/bubble.mp3', 'ping');          
music.player.play();

let player = Player.loadState()
if(!player) window.location.href="/"

document.getElementById('logout-button').addEventListener('click', async function () {
    if (confirm("Are you sure you want to log out?. All your data will get wiped out with this account if you logout")) {
        await Player.clearState();
        window.location.href = "/";
    }
})
document.getElementById('copy-sdp').addEventListener('click', async function () {
    let sdp = document.getElementById('local-sdp').value;
    navigator.clipboard.writeText(sdp)
})
document.getElementById('npc-battle-start').addEventListener('click', async function () {
    await startNPCBattle(player,music,ping);
})
document.getElementById('player-name').innerText = player.nickname;


document.getElementById('battle-bg').src            

displaySummaryModal(player,false)
initNavbar(player)
let rtcPlayer = new RTCPlayer(player,music,ping);
window.rtc = rtcPlayer