import { BattleSimulator } from "./battle.js";

class RTCPlayer {
    constructor(homePlayer,music,moveMakeCallback=null) {
        this.peerConnection = new RTCPeerConnection({
            iceServers : [
                { urls: "stun:stun.3clogic.com:3478" }
            ]
        });
        this.homePlayer = homePlayer;
        this.player = null

        this.music = music

        this.moveMakeCallback = moveMakeCallback;
        this.dataChannel = null;
        this.isOfferer = true;
        this.iceCandidates = [];
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


        this.sentLocalHomePlayer = false

        this.peerConnection.ondatachannel = (event) => {
            this.dataChannel = event.channel;
            this.setupDataChannel();
            console.log('DATA CHANNEL REC');
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
            const answerSdp = atob(document.getElementById('remote-sdp').value);
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
        console.log('ICE gathering complete, answer ready');
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
        console.log('Remote description set');
    }

    sanitizeSdp(sdp) {
        return sdp.replace(/a=msid-semantic: WMS/g, 'a=msid-semantic:WMS').replace(/\r\n/g, '\n').replace(/\n/g, '\r\n').replace(/a=candidate:.* (raddr|rport) 0(\r\n|\n)/g, '');
    }

    playerOcclusion(player) {
        player = {
            nick: player.nick,
            xp: player.xp,
            char: player.char,
            team: [
                {
                    name: player.team[0].name,
                    code: player.team[0].code,
                    sprites: {
                        front_default: player.team[0].sprites.front_default,
                    },
                    power: player.team[0].power,
                    types: player.team[0].types,
                    stats: player.team[0].stats,
                    moves: player.team[0].moves.map((move) => {
                        return {
                            name: move.name,
                            power: move.power,
                            type: move.type,
                            accuracy: move.accuracy,
                            pp: move.pp,
                            priority: move.priority
                        }
                    }
                    )
                }
            ]
        };
        return player
    }

    setupDataChannel() {
        this.dataChannel.onopen = () =>{
            console.log('DATA CHANNEL OPEN')
            if(this.sentLocalHomePlayer) return;
            setTimeout(() => {
                let occludedPlayer = this.playerOcclusion(this.homePlayer);
                this.send(JSON.stringify(occludedPlayer));
            }, 1000);
            this.sentLocalHomePlayer = true;
        };  
        this.dataChannel.onmessage = (e) => {
            console.log('RECV:', e)
            if (!this.player) {
                this.player = JSON.parse(e.data);
                console.log('Player data received:', this.player);
                initiateRTCBattle(this,this.music)
            } else {
                let ms = e.data.split("|");
                this.moveMakeCallback(parseInt(ms[0], 10),parseInt(ms[1], 10));
            }
        };
        this.dataChannel.onclose = () => console.log('DATA CHANNEL CLOSED');
    }

    send(data) {
        if (this.dataChannel?.readyState === 'open') {
            console.log('Sending data:', data);
            this.dataChannel.send(data);
        }
    }
}

async function initiateRTCBattle(rtcplayer,music){
    let bs = new BattleSimulator(rtcplayer.homePlayer.team[0], rtcplayer.player.team[0], "battle-arena", music,null,null,(movestring)=>rtcplayer.send(`${movestring}`));
    bs.setPlayer(rtcplayer.homePlayer)
    bs.setOpponent(rtcplayer.player)

    await bs.draw()
    if(!rtcplayer.isOfferer) {
        console.log("TOGGLED NOT OFFERER")
        bs.toggleTurn()
    }
    await bs.initMoves()

    rtcplayer.moveMakeCallback = (idx,damage) => {
        console.log("REMOTE OPPONENT MADE MOVE" ,idx,damage)
        bs.attackHome(idx,damage);
    }
}


export  {RTCPlayer ,initiateRTCBattle};