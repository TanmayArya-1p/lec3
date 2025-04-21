import { BattleSimulator } from "./battle.js";
import Player from '../player.js';

class RTCPlayer {
    constructor(homePlayer,music,pinger,moveMakeCallback=null) {
        this.peerConnection = new RTCPeerConnection({
            iceServers: [
                { urls: "stun:stun.3clogic.com:3478" },
                {
                    urls: "turn:167.71.226.217:3478",
                    username: "tcan",
                    credential: "lmao"
                }
            ]
        });
        
        this.BSAddChatMessage = null
        this.homePlayer = homePlayer;
        this.player = null
        this.sentLocalHomePlayer = false
        this.music = music
        this.moveMakeCallback = moveMakeCallback;
        this.dataChannel = null;
        this.isOfferer = true;
        this.iceCandidates = [];

        this.pinger = pinger
        this.peerConnection.loading = true;
        this.peerConnection.onicecandidate = (event) => {
            if(event.candidate) {
                this.iceCandidates.push(event.candidate);
                console.log('New ICE candidate:', event.candidate.candidate);

            }
        };

        this.dataChannel = this.peerConnection.createDataChannel('game');
        this.setupDataChannel();
        this.createOffer().then((offer) => {
            document.getElementById('local-sdp').value = btoa(offer.sdp);
            document.getElementById('rtc-loader').style.display = "none";
            document.getElementById('rtc-connect').style.display = "flex";
        });



        this.peerConnection.ondatachannel = (event) => {
            this.dataChannel = event.channel;
            this.setupDataChannel();
        };

        this.peerConnection.onconnectionstatechange = () => {
            console.log('Connection state:', this.peerConnection.connectionState);
        };


        this.setupDOMListeners();
    }

    setupDOMListeners() {
        // document.getElementById('create-offer').addEventListener('click', async () => {
        //     this.isOfferer = true;
        //     this.dataChannel = this.peerConnection.createDataChannel('game');
        //     this.setupDataChannel();
            
        //     const offer = await this.createOffer();
        //     document.getElementById('local-sdp').value = (offer.sdp);
        // });

        document.getElementById('set-remote').addEventListener('click', async () => {
            const remoteSdp = atob(document.getElementById('remote-sdp').value);
            await this.setRemoteDescription({
                type: 'offer',
                sdp: this.sanitizeSdp(remoteSdp)
            });
            
            const answer = await this.createAnswer();
            document.getElementById('local-sdp').value = btoa(answer.sdp);
        });

        document.getElementById('set-answer').addEventListener('click', async () => {
            const answerSdp = atob(document.getElementById('remote-sdp').value.trim());
            await this.setRemoteDescription({
                type: 'answer',
                sdp: this.sanitizeSdp(answerSdp)
            });
        });
    }

    async createOffer() {
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);
        
        await new Promise(resolve => {
            if (this.peerConnection.iceGatheringState === 'complete') {
                resolve();
            } else {
                this.peerConnection.addEventListener('icegatheringstatechange', () => {
                    if (this.peerConnection.iceGatheringState === 'complete') resolve();
                });
            }
        });
        this.peerConnection.loading = false;
        return this.peerConnection.localDescription;
    }

    async createAnswer() {
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);
        
        await new Promise(resolve => {
            if (this.peerConnection.iceGatheringState === 'complete') {
                resolve();
            } else {
                this.peerConnection.addEventListener('icegatheringstatechange', () => {
                    if (this.peerConnection.iceGatheringState === 'complete') resolve();
                }); 
            }
        });
        alert('Remote Description set and answer generated');
        
        return this.peerConnection.localDescription;

    }

    async setRemoteDescription(description) {
        if (description.type === 'offer') {
            this.isOfferer = false;
        }
        await this.peerConnection.setRemoteDescription(
            new RTCSessionDescription({
                type: description.type,
                sdp: this.sanitizeSdp(description.sdp)
            })
        );
    }

    sanitizeSdp(sdp) {
        sdp = sdp.trim();
        return sdp.replace(/a=msid-semantic: WMS/g, 'a=msid-semantic:WMS').replace(/\r\n/g, '\n').replace(/\n/g, '\r\n').replace(/a=candidate:.* (raddr|rport) 0(\r\n|\n)/g, '');
    }
    setupDataChannel() {
        this.dataChannel.onopen = () =>{
            console.log('DATA CHANNEL OPEN')
            if(this.sentLocalHomePlayer) return;

            let occludedPlayer = Player.playerOcclusion(this.homePlayer);
            this.send(JSON.stringify(occludedPlayer));

            this.sentLocalHomePlayer = true;
        };  
        this.dataChannel.onmessage = (e) => {
            console.log('RECV:', e)
            if (!this.player) {
                this.player = JSON.parse(e.data);
                console.log("SYNCING" , this.isOfferer, this.player.arenaIDX);
                if(this.isOfferer) {
                    switch (this.player.arenaIDX) {
                        case 0:
                            console.log("ARENA 0")
                            document.getElementById('battle-bg').src = "../assets/battle.gif";
                            break;
                        case 1:
                            console.log("ARENA 1")
                            document.getElementById('battle-bg').src = "../assets/battle-2.png";
                            break;
                    }
                    this.player.arenaIDX= -1
                }
                console.log('Player data received:', this.player);
                this.player.isRTC = true
                this.player.rtcSend = (data => this.send(data));
                initiateRTCBattle(this,this.music,this.pinger)
            } else {
                let ms = e.data.split("|");
                if(ms[0] === "chat"){
                    if(this.BSAddChatMessage) {
                        this.BSAddChatMessage(ms[1]);
                    }
                } else{
                    this.moveMakeCallback(parseInt(ms[0], 10),parseInt(ms[1], 10));
                }
            }
        };
        this.dataChannel.onclose = () => console.log('DATA CHANNEL CLOSED');
    }

    send(data) {
        if (this.dataChannel?.readyState === 'open') {
            this.dataChannel.send(data);
        }
    }


    reset() {
        window.location.reload();
    }
}

async function initiateRTCBattle(rtcplayer,music,pinger){
    let bs = new BattleSimulator([rtcplayer.homePlayer.team[0]], [rtcplayer.player.team[0]], "battle-arena", music,pinger,null,null,(movestring)=>rtcplayer.send(`${movestring}`),()=>window.location.reload() );
    bs.setOpponent(rtcplayer.player)
    
    bs.setPlayer(rtcplayer.homePlayer)
    rtcplayer.BSAddChatMessage = (message) => bs.addChatMessage(message , "away");
    await bs.draw()
    if(!rtcplayer.isOfferer) {
        bs.toggleTurn()
    }
    await bs.initMoves()

    rtcplayer.moveMakeCallback = (idx,damage) => {
        bs.attackHome(idx,damage);
    }
}


export  {RTCPlayer ,initiateRTCBattle};