import { offerReward } from "../rewards.js";

class BattlePokemon {
    constructor(pokemon) {
        console.log("RECIEVED POKEMON", pokemon)
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
            if(ct==5){
                break
            }
        }
        this.pokemon.moves = temp;
        console.log("HYDRATED MOVES", this.pokemon.moves)
        this.hydrated = true;
    }


    attack(target, move) {        
        const movePower = move.power;
        const moveAccuracy = move.accuracy;

        if (Math.random() * 100 > moveAccuracy) {
            return 0;
        }

        const randomFactor = Math.random() * (1 - 0.9) + 0.2;
        const damage = Math.floor(
            (movePower * (this.pokemon.stats.attack / target.pokemon.stats.defense)) * randomFactor
        );  target.hp -= damage;
        target.hp = Math.max(target.hp, 0);

        return damage;
    }
    isFainted() {
        return this.hp <= 0;
    }
    heal(amount) {
        this.hp = Math.min(this.hp + amount, this.pokemon.stats.hp);
    }

}



class BattleSimulator {
    constructor(homePokemon, awayPokemon , canvasID,music,endGameCallback=null,enemyMoveCallback=null) {
        this.enemyMoveCallback = enemyMoveCallback;
        this.homePokemon = new BattlePokemon(homePokemon);
        this.awayPokemon = new BattlePokemon(awayPokemon);

        this.music = music;
        this.musicResetCallback = this.music.playNonDefault(1);
        
        
        this.endGameCallback = endGameCallback;

        this.homePlayer = null;
        this.awayPlayer = null;
        this.canvas = document.getElementById(canvasID);
        this.canvas.width = 1000;
        this.canvas.height = 500;   

        this.isHomeTurn = true
        this.concluded = false
        
        this.homePlayerCard = document.getElementById('player-1-card');
        this.awayPlayerCard = document.getElementById('player-2-card');

        this.battleLog = [];
        this.battleLogContainer = document.getElementById('battle-log-container');
        this.turnDisplay = document.getElementById('turn-display');
        this.turnDisplay.innerText = "Your Turn";
        this.turnDisplay.style.color = "#3b4cca";
    }
    async initMoves() {

        await this.homePokemon.hydrateMoves();
        await this.awayPokemon.hydrateMoves();

        for(let i=0; i<this.homePokemon.pokemon.moves.length; i++){
            let move = this.homePokemon.pokemon.moves[i];
            let attackButton = document.getElementById(`attack-${i+1}`)
            attackButton.innerText = move.name;
            attackButton.addEventListener('click', () => {
                this.attackAway(i);
            });
        }

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

    setPlayer(player) {
        this.homePlayer = player;
        this.homePlayerCard.querySelector('img').src = "../assets/" + player.char.toLowerCase() + ".png";
        this.homePlayerCard.querySelector('img').alt = player.char;
        this.homePlayerCard.querySelector('h2').innerText = player.nick;
    }
    setOpponent(opponent) {
        this.awayPlayer = opponent;
        this.awayPlayerCard.querySelector('img').src = "../assets/" + opponent.char.toLowerCase() + ".png";
        this.awayPlayerCard.querySelector('img').alt = opponent.char;
        this.awayPlayerCard.querySelector('h2').innerText = opponent.nick;
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
    attackAway(moveIDX) {
        if(!this.isHomeTurn || this.concluded) {
            console.error("WRONG TURN");
            return;
        }
        const damage = this.homePokemon.attack(this.awayPokemon, this.awayPokemon.pokemon.moves[moveIDX]);
        this.addBattleLog(`${this.homePokemon.pokemon.name} used ${this.awayPokemon.pokemon.moves[moveIDX].name} on ${this.awayPokemon.pokemon.name} for ${damage} damage.` , "home");
        console.log(this.battleLog)

        this.isHomeTurn = !this.isHomeTurn;

        if(this.enemyMoveCallback) {
            this.enemyMoveCallback(this);
        }
        if (this.awayPokemon.isFainted()) {
            this.addBattleLog(`${this.awayPokemon.pokemon.name} fainted!` , "away");
            console.log("home wins")
            this.draw().then(()=>this.conclude("home"))
        }
        else{
            this.draw();
        }
        this.toggleTurnDisplay();

    }
    attackHome(moveIDX) {
        if(this.isHomeTurn || this.concluded) {
            console.error("WRONG TURN");
            return;
        }
        const damage = this.awayPokemon.attack(this.homePokemon, this.homePokemon.pokemon.moves[moveIDX]);
        this.addBattleLog(`${this.homePokemon.pokemon.name} used ${this.awayPokemon.pokemon.moves[moveIDX].name} on ${this.awayPokemon.pokemon.name} for ${damage} damage.`,"away");

        this.isHomeTurn = !this.isHomeTurn;
        ;
        if (this.homePokemon.isFainted()) {
            this.addBattleLog(`${this.homePokemon.pokemon.name} fainted!` , "home");
            console.log("away wins")
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

        setTimeout(()=>{
            document.getElementById('battle-sim').style.display='none'
            this.musicResetCallback(this.music)
            offerReward(this.homePlayer)

        },7000)

    }
    async draw() {
        if(this.concluded) {
            return;
        }
        const ctx = this.canvas.getContext('2d');
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);


        const homeImg = new Image();
        homeImg.src = this.homePokemon.pokemon.sprites.back_default;
        homeImg.addEventListener('load', () => {
            if(this.concluded) {
                return;
            }
            ctx.drawImage(homeImg, 230, this.canvas.height - 240, 150, 150);
        });

        const awayImg = new Image();
        awayImg.src = this.awayPokemon.pokemon.sprites.front_default;
        awayImg.addEventListener('load', () => {
            if(this.concluded) {
                return;
            }
            ctx.drawImage(awayImg, this.canvas.width - 364, 150, 150, 150);
        }); 
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
        ctx.fillText(this.homePokemon.pokemon.name, this.canvas.width - 440 , 320);
        return 0;
    }
}

export { BattleSimulator, BattlePokemon };