import { offerReward } from "../rewards.js";
import { displaySummaryModal } from "../utils.js";

class BattlePokemon {
    constructor(pokemon) {
        this.pokemon = pokemon;
        this.hp = this.pokemon.stats.hp;
        this.type = "grass";
        this.hydrated = false;

    }
    async hydrateMoves() {

        if(this.hydrated || this.pokemon.moves[0].url == null) {
            return;
        }
        let ct =0
        let temp = []
        for (let i = 0; i < this.pokemon.moves.length; i++) {
            let move = this.pokemon.moves[i];
            if(!move.url){
                continue;
            }
            let moveData = await fetch(move.url).then(res => res.json());
            if(moveData.accuracy == null){
                continue
            }
            moveData.name = move.name;
            temp.push(moveData)
            ct++
            if(ct==4){
                break
            }
        }
        this.pokemon.moves = temp;
        this.hydrated = true;
    }


    attack(target, move,damage=null) {  
              
        const moveAccuracy = move.accuracy;
        if (damage!==null && Math.random() * 100 > moveAccuracy) {
            return 0;
        }

        if(damage===null){
            console.log(move)
            const stab = this.pokemon.types.map(a=>{
                return a.name
            }).includes(move.type.name) ? 1.5 : 1;
            const eff = this.getTypeEffectiveness(move, target.pokemon);
            const rf = Math.random() * (1 - 0.85) + 0.85;
            damage = Math.floor(
                (move.power * (this.pokemon.stats.attack / target.pokemon.stats.defense)) * stab * eff * rf
            );
        }
        target.hp -= damage;
        target.hp = Math.max(target.hp, 0);

        return damage;
    }
    isFainted() {
        return this.hp <= 0;
    }
    heal(amount) {
        this.hp = Math.min(this.hp + amount, this.pokemon.stats.hp);
    }
    calculateTypeEffectiveness(moveType, defenderTypes) {
        const typeEffectiveness = {
        normal: {
            rock: 0.5,
            ghost: 0,
            steel: 0.5
        },
        fire: {
            fire: 0.5,
            water: 0.5,
            grass: 2,
            ice: 2,
            bug: 2,
            rock: 0.5,
            dragon: 0.5,
            steel: 2
        },
        water: {
            fire: 2,
            water: 0.5,
            grass: 0.5,
            ground: 2,
            rock: 2,
            dragon: 0.5
        },
        electric: {
            water: 2,
            electric: 0.5,
            grass: 0.5,
            ground: 0,
            flying: 2,
            dragon: 0.5
        },
        grass: {
            fire: 0.5,
            water: 2,
            grass: 0.5,
            poison: 0.5,
            ground: 2,
            flying: 0.5,
            bug: 0.5,
            rock: 2,
            dragon: 0.5,
            steel: 0.5
        },
        ice: {
            fire: 0.5,
            water: 0.5,
            grass: 2,
            ice: 0.5,
            ground: 2,
            flying: 2,
            dragon: 2,
            steel: 0.5
        },
        fighting: {
            normal: 2,
            ice: 2,
            poison: 0.5,
            flying: 0.5,
            psychic: 0.5,
            bug: 0.5,
            rock: 2,
            ghost: 0,
            dark: 2,
            steel: 2,
            fairy: 0.5
        },
        poison: {
            grass: 2,
            poison: 0.5,
            ground: 0.5,
            rock: 0.5,
            ghost: 0.5,
            steel: 0,
            fairy: 2
        },
        ground: {
            fire: 2,
            electric: 2,
            grass: 0.5,
            poison: 2,
            flying: 0,
            bug: 0.5,
            rock: 2,
            steel: 2
        },
        flying: {
            electric: 0.5,
            grass: 2,
            fighting: 2,
            bug: 2,
            rock: 0.5,
            steel: 0.5
        },
        psychic: {
            fighting: 2,
            poison: 2,
            psychic: 0.5,
            dark: 0,
            steel: 0.5
        },
        bug: {
            fire: 0.5,
            grass: 2,
            fighting: 0.5,
            poison: 0.5,
            flying: 0.5,
            psychic: 2,
            ghost: 0.5,
            dark: 2,
            steel: 0.5,
            fairy: 0.5
        },
        rock: {
            fire: 2,
            ice: 2,
            fighting: 0.5,
            ground: 0.5,
            flying: 2,
            bug: 2,
            steel: 0.5
        },
        ghost: {
            normal: 0,
            psychic: 2,
            ghost: 2,
            dark: 0.5
        },
        dragon: {
            dragon: 2,
            steel: 0.5,
            fairy: 0
        },
        dark: {
            fighting: 0.5,
            psychic: 2,
            ghost: 2,
            dark: 0.5,
            fairy: 0.5
        },
        steel: {
            fire: 0.5,
            water: 0.5,
            electric: 0.5,
            ice: 2,
            rock: 2,
            steel: 0.5,
            fairy: 2
        },
        fairy: {
            fire: 0.5,
            fighting: 2,
            poison: 0.5,
            dragon: 2,
            dark: 2,
            steel: 0.5
        }
        };
        let eff = 1;
        for (let i of defenderTypes) {
            eff *= (typeEffectiveness[moveType]?.[i] || 1);
        }
        return eff;
    }
    getTypeEffectiveness(move, defender) {
        const moveType = move.type.name;
        console.log("DEFENDER",defender)
        const defenderTypes = defender.types.map(t => t.name);
        return this.calculateTypeEffectiveness(moveType, defenderTypes)/5;
    }


}

let bsInUse = false;

class BattleSimulator {
    constructor(homePokemon, awayPokemon , canvasID,music,pinger,npc=null,enemyMoveCallback=null,homeMoveHook=null,endGameCallback=null) {
        if(bsInUse) {
            console.error("BATTLE SIMULATOR ALREADY IN USE");
            return;
        }
        bsInUse = true;
        this.pinger = pinger;
        this.homeMoveHook = homeMoveHook;

        this.enemyMoveCallback = enemyMoveCallback;
        this.homePokemon = new BattlePokemon(homePokemon);
        this.awayPokemon = new BattlePokemon(awayPokemon);
        this.npc = npc;
        this.battleSimBox = document.getElementById('battle-sim');
        this.battleSimBox.style.display = 'flex';

        this.music = music;
        this.musicResetCallback = this.music.playNonDefault(1);
        
        
        this.endGameCallback = endGameCallback;

        document.getElementById('duel-main-page').style.display = 'none';

        this.homePlayer = null;
        this.awayPlayer = null;
        this.canvas = document.getElementById(canvasID);
        this.canvas.width = 1000;
        this.canvas.height = 500;   

        this.chatLog = []

        this.homePokemonImage = document.getElementById('home-pokemon-img')
        this.awayPokemonImage = document.getElementById('away-pokemon-img');

        this.isHomeTurn = true
        this.concluded = false
        
        this.homePlayerCard = document.getElementById('player-1-card');
        this.awayPlayerCard = document.getElementById('player-2-card');

        this.battleLog = [];
        this.battleLogContainer = document.getElementById('battle-log-container');
        this.chatLogContainer = document.getElementById('chat-log-container');
        this.turnDisplay = document.getElementById('turn-display');
        this.turnDisplay.innerText = "Your Turn";
        this.turnDisplay.style.color = "#3b4cca";
        this.homePokemonImage.src = this.homePokemon.pokemon.sprites.other.showdown.back_default;
        this.awayPokemonImage.src = this.awayPokemon.pokemon.sprites.other.showdown.front_default;



    }
    async initMoves() {

        await this.homePokemon.hydrateMoves();
        await this.awayPokemon.hydrateMoves();
        for(let i=0; i<this.homePokemon.pokemon.moves.length; i++){
            let move = this.homePokemon.pokemon.moves[i];
            let attackButton = document.getElementById(`attack-${i+1}`) 
            
            if(!move.reduced){
                move.pp = Math.floor(move.pp/2);
                move.reduced = true
            }
            move.currPP = move.pp;
            document.getElementById(`attack-${i+1}-text`).innerText = move.name;
            document.getElementById(`attack-${i+1}-pp`).innerText = "PP: "+move.currPP + " / "+ move.pp;
            document.getElementById(`attack-${i+1}-type`).innerText = move.type.name;


            attackButton.addEventListener('click', () => {
                this.attackAway(i);

            });
        }
        document.getElementById('attack-loader').style.display = "none";
        document.getElementById('attack-buttons-container').style.display = "flex";

    }
    toggleTurnDisplay() {
        if(this.isHomeTurn) {
            this.turnDisplay.innerText = "Your Turn";
            this.turnDisplay.style.color = "#3b4cca";
        } else {
            this.turnDisplay.innerText = `Opponent's Turn`;
            this.turnDisplay.style.color = "#ff0000";
        }
    }

    toggleTurn() {
        this.isHomeTurn = !this.isHomeTurn;
        this.toggleTurnDisplay();
    }
    addChatMessage(message,issuer) {
        this.pinger.play()
        let newNode = null;
        let nameMap = {
            "home": this.homePlayer.nick,
            "away": this.awayPlayer.nick
        }
        if(issuer == "home"){
            newNode = document.getElementById('player-log-template').cloneNode(true);
        }
        else if(issuer == "away"){
            newNode = document.getElementById('opponent-log-template').cloneNode(true);
        }
        newNode.style.display = "block";
        newNode.innerHTML = `<strong>${nameMap[issuer]}:</strong> ${message}`;  
        this.chatLogContainer.appendChild(newNode);
        this.chatLogContainer.scrollTo(0, this.chatLogContainer.scrollHeight);
        this.chatLog.push(message);
    }
    setPlayer(player) {
        this.homePlayer = player;
        this.homePlayerCard.querySelector('img').src = "../assets/" + player.char.toLowerCase() + ".png";
        this.homePlayerCard.querySelector('img').alt = player.char;
        this.homePlayerCard.querySelector('h2').innerText = player.nick;
        if(this.awayPlayer.isRTC && this.awayPlayer.arenaIDX === -1) {
            console.log("SKIPPED LOCAL ARENA SYNC")
            return;
        }

        switch(this.homePlayer.arenaIDX) {
            case 0:
                document.getElementById("battle-bg").src = "../assets/battle.gif"
                break;
            case 1:
                document.getElementById("battle-bg").src = "../assets/battle-2.png" 
                break;
        }
    }

    setOpponent(opponent) {
        this.awayPlayer = opponent;
        this.awayPlayerCard.querySelector('img').src = "../assets/" + opponent.char.toLowerCase() + ".png";
        this.awayPlayerCard.querySelector('img').alt = opponent.char;
        this.awayPlayerCard.querySelector('h2').innerText = opponent.nick;

        if(opponent.isRTC === true) {
            document.getElementById('chat-log').style.display = "flex";
            document.getElementById('chat-input').addEventListener('keypress', (event) => {
                if (event.key === 'Enter') {
                    let message = document.getElementById('chat-input').value;
                    this.addChatMessage(message, "home");
                    this.chatLogContainer.scrollTo(0, this.chatLogContainer.scrollHeight);
                    this.chatLog.push(message);
                    document.getElementById('chat-input').value = "";
                    opponent.rtcSend("chat|" + message);
                }
            });
        }

    }
    addBattleLog(entry,issuer="home") {

        let newNode = null;
        let nameMap = {
            "home": this.homePlayer.nick,
            "away": this.awayPlayer.nick
        }
        if(issuer == "home"){
            newNode = document.getElementById('player-log-template').cloneNode(true);
        }
        else if(issuer == "away"){
            newNode = document.getElementById('opponent-log-template').cloneNode(true);
        }
        newNode.style.display = "block";
        newNode.innerHTML = `<strong>${nameMap[issuer]}:</strong> ${entry}`;  this.battleLogContainer.appendChild(newNode);
        this.battleLogContainer.scrollTo(0, this.battleLogContainer.scrollHeight);
        this.battleLog.push(entry);
    }
    clearBattleLog() {
        this.battleLog = [];
    }
    clearChatLog() {
        this.chatLog = [];
    }
    attackAway(moveIDX) {
        if(!this.isHomeTurn || this.concluded) {
            console.error("WRONG TURN");
            return;
        }
        const damage = this.homePokemon.attack(this.awayPokemon, this.homePokemon.pokemon.moves[moveIDX]);
        this.addBattleLog(`${this.homePokemon.pokemon.name} used ${this.homePokemon.pokemon.moves[moveIDX].name} on ${this.awayPokemon.pokemon.name} for ${damage} damage.` , "home");

        if(this.homeMoveHook) this.homeMoveHook(moveIDX+"|"+damage)

        this.homePokemon.pokemon.moves[moveIDX].currPP = this.homePokemon.pokemon.moves[moveIDX].currPP - 1
        document.getElementById(`attack-${moveIDX+1}-pp`).innerText = "PP: " + this.homePokemon.pokemon.moves[moveIDX].currPP+ " / "+ this.homePokemon.pokemon.moves[moveIDX].pp;



        if(this.homePokemon.pokemon.moves[moveIDX].currPP === 0) {
            const attackButton = document.getElementById(`attack-${moveIDX+1}`);
            attackButton.disabled = true;
            attackButton.style.opacity = 0.5;
            attackButton.style.cursor = "not-allowed";
        }


        this.isHomeTurn = !this.isHomeTurn;

        if(this.enemyMoveCallback) {
            this.enemyMoveCallback(this,this.npc);
        }
        if (this.awayPokemon.isFainted()) {
            this.addBattleLog(`${this.awayPokemon.pokemon.name} fainted!` , "away");
            this.draw().then(()=>this.conclude("home"))
        }
        else{
            this.draw();
        }
        this.toggleTurnDisplay();

    }
    attackHome(moveIDX,damage=null) {
        if(this.isHomeTurn || this.concluded) {
            console.error("WRONG TURN");
            return;
        }

        damage = this.awayPokemon.attack(this.homePokemon, this.awayPokemon.pokemon.moves[moveIDX],damage);
        this.addBattleLog(`${this.awayPokemon.pokemon.name} used ${this.awayPokemon.pokemon.moves[moveIDX].name} on ${this.homePokemon.pokemon.name} for ${damage} damage.`,"away");

        this.isHomeTurn = !this.isHomeTurn;
        ;
        if (this.homePokemon.isFainted()) {
            this.addBattleLog(`${this.homePokemon.pokemon.name} fainted!` , "home");
            this.draw().then(()=>this.conclude("away"))
        } else{
            this.draw();
        }
        this.toggleTurnDisplay();

    }
    conclude(winner){
        this.concluded = true;
        if(winner == "home") {
            this.addBattleLog(`${this.homePlayer.nick} wins!`, "home");
            this.music.playNonDefault(0)
        } else {
            this.addBattleLog(`${this.awayPlayer.nick} wins!`, "away");
        }
        let ctx = this.canvas.getContext('2d');

        ctx.font = 'bold 100px Pixelify Sans';        
        ctx.fillStyle = winner === "home" ? "blue" : "red";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const message = winner === "home" ? "You Win!" : "You Lose!";
        ctx.fillText(message, this.canvas.width / 2, this.canvas.height / 2);

        this.awayPokemonImage.style.display = "none"
        this.homePokemonImage.style.display = "none"

        this.homePlayer.arenaIDX = Math.floor(Math.random() * 2);

        setTimeout(()=>{
            this.battleSimBox.style.display='none'
            document.getElementById('duel-main-page').style.display = 'flex';
            this.musicResetCallback(this.music)
            offerReward(this.homePlayer,()=>{
                displaySummaryModal(this.homePlayer,false)
                if(this.endGameCallback) {
                    this.endGameCallback();
                }
            })
            while (this.battleLogContainer.children.length > 2) {
                this.battleLogContainer.removeChild(this.battleLogContainer.lastChild);
            }
            bsInUse = false;
            document.getElementById('attack-loader').style.display = "block";
            document.getElementById('attack-buttons-container').style.display = "flex";
            document.getElementById('chat-log').style.display = "none";
            
            this.awayPokemonImage.src = ""
            this.homePokemonImage.src = ""
            this.awayPokemonImage.style.display = "block"
            this.homePokemonImage.style.display = "block"
            
            for(let i=0; i<this.homePokemon.pokemon.moves.length; i++){
                let attackButton = document.getElementById(`attack-${i+1}`);
                attackButton.disabled = false;
                attackButton.style.opacity = 1;
                attackButton.style.cursor = "hand";
            }

        },7000)




    }
    async draw() {
        if(this.concluded) {
            return;
        }
        const ctx = this.canvas.getContext('2d');
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);



        // const homeImg = new Image();
        // homeImg.src = this.homePokemon.pokemon.sprites.back_default;
        // homeImg.addEventListener('load', () => {
        //     if(this.concluded) {
        //         return;
        //     }
        //     ctx.drawImage(homeImg, 230, this.canvas.height - 240, 150, 150);
        // });

        // const awayImg = new Image();
        // awayImg.src = this.awayPokemon.pokemon.sprites.front_default;
        // awayImg.addEventListener('load', () => {
        //     if(this.concluded) {
        //         return;
        //     }
        //     ctx.drawImage(awayImg, this.canvas.width - 364, 150, 150, 150);
        // }); 
        if (this.battleLog.length > 0) {
            ctx.fillStyle = 'black';
            ctx.font = 'bold 24px Pixelify Sans';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.battleLog[this.battleLog.length - 1], this.canvas.width / 2, 60);
        }



        ctx.fillStyle = 'red';
        ctx.fillRect(270, this.canvas.height - 100, 80, 5);
        ctx.fillStyle = 'green';
        ctx.fillRect(270, this.canvas.height - 100, (this.homePokemon.hp / this.homePokemon.pokemon.stats.hp) * 80, 5);

        ctx.fillStyle = 'black';
        ctx.font = '20px Pixelify Sans';
        ctx.fillText(`HP (${this.homePokemon.hp} / ${this.homePokemon.pokemon.stats.hp})`, 150, this.canvas.height - 92);
        
        ctx.fillStyle = 'black';
        ctx.font = '20px Pixelify Sans';
        ctx.fillText(this.homePokemon.pokemon.name, 150, this.canvas.height - 60);


        ctx.fillStyle = 'red';
        ctx.fillRect(this.canvas.width - 324, 280, 80, 5);
        ctx.fillStyle = 'green';
        ctx.fillRect(this.canvas.width - 324, 280, (this.awayPokemon.hp / this.awayPokemon.pokemon.stats.hp) * 80, 5);

        ctx.fillStyle = 'black';    
        ctx.font = '20px Pixelify Sans';
        ctx.fillText(`HP (${this.awayPokemon.hp} / ${this.awayPokemon.pokemon.stats.hp})`, this.canvas.width - 440  , 288);  

        ctx.fillStyle = 'black';
        ctx.font = '20px Pixelify Sans';
        ctx.fillText(this.awayPokemon.pokemon.name, this.canvas.width - 440 , 320);
        return 0;
    }
}

export { BattleSimulator, BattlePokemon };