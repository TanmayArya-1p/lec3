

class BattlePokemon {
    constructor(pokemon) {
        console.log("RECIEVED POKEMON", pokemon)
        this.pokemon = pokemon;
        this.hp = this.pokemon.stats.hp;
        this.type = "grass";
        this.hp = 100; 
    }
    attack(target, move) {        
        const movePower = move.power;
        const moveAccuracy = move.accuracy;

        if (Math.random() * 100 > moveAccuracy) {
            return 0;
        }

        const level = this.pokemon.level || 50;
        const randomFactor = Math.random() * (1 - 0.85) + 0.85;
        const damage = Math.floor(
            (((2 * level / 5 + 2) * movePower * (this.pokemon.stats.attack / target.pokemon.stats.defense)) / 50 + 2) * randomFactor
        );

        target.hp -= damage;

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
    constructor(homePokemon, awayPokemon , canvasID) {
        this.homePokemon = new BattlePokemon(homePokemon);
        this.awayPokemon = new BattlePokemon(awayPokemon);

        this.homePlayer = null;
        this.awayPlayer = null;
        this.canvas = document.getElementById(canvasID);
        this.canvas.width = 1000;
        this.canvas.height = 500;   

        this.isHomeTurn = true
        
        this.homePlayerCard = document.getElementById('player-1-card');
        this.awayPlayerCard = document.getElementById('player-2-card');

        this.battleLog = [];
    }
    setPlayer(player) {
        this.player = player;
        this.homePlayerCard.querySelector('img').src = "../assets/" + player.char.toLowerCase() + ".png";
        this.homePlayerCard.querySelector('img').alt = player.char;
        this.homePlayerCard.querySelector('h2').innerText = player.nick;
    }
    setOpponent(opponent) {
        this.opponent = opponent;
        this.awayPlayerCard.querySelector('img').src = "../assets/" + opponent.char.toLowerCase() + ".png";
        this.awayPlayerCard.querySelector('img').alt = opponent.char;
        this.awayPlayerCard.querySelector('h2').innerText = opponent.nick;
    }
    addBattleLog(entry) {
        this.battleLog.push(entry);
    }
    clearBattleLog() {
        this.battleLog = [];
    }
    attackAway(moveIDX) {
        if(!this.isHomeTurn) {
            console.error("WRONG TURN");
            return;
        }
        const damage = this.homePokemon.attack(this.awayPokemon, this.awayPokemon.pokemon.moves[moveIDX]);
        this.addBattleLog(`${this.homePokemon.pokemon.name} used ${move.name} on ${this.awayPokemon.pokemon.name} for ${damage} damage.`);
        if (this.awayPokemon.isFainted()) {
            this.addBattleLog(`${this.awayPokemon.pokemon.name} fainted!`);
            console.log("home wins")
        }
        this.isHomeTurn = !this.isHomeTurn;
        this.draw();
    }
    attackHome(moveIDX) {
        if(this.isHomeTurn) {
            console.error("WRONG TURN");
            return;
        }
        const damage = this.awayPokemon.attack(this.homePokemon, this.homePokemon.pokemon.moves[moveIDX]);
        this.addBattleLog(`${this.awayPokemon.pokemon.name} used ${move.name} on ${this.homePokemon.pokemon.name} for ${damage} damage.`);
        if (this.homePokemon.isFainted()) {
            this.addBattleLog(`${this.homePokemon.pokemon.name} fainted!`);
            console.log("away wins")
        }
        this.isHomeTurn = !this.isHomeTurn;
        this.draw();
    }
    draw() {
        const ctx = this.canvas.getContext('2d');
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);


        const homeImg = new Image();
        homeImg.src = this.homePokemon.pokemon.sprites.back_default;
        homeImg.addEventListener('load', () => {
            ctx.drawImage(homeImg, 230, this.canvas.height - 220, 150, 150);
        });

        const awayImg = new Image();
        awayImg.src = this.awayPokemon.pokemon.sprites.front_default;
        awayImg.addEventListener('load', () => {
            ctx.drawImage(awayImg, this.canvas.width - 364, 150, 150, 150);
        });

        ctx.fillStyle = 'red';
        ctx.fillRect(50, this.canvas.height - 150, 50,0.1);
        ctx.fillStyle = 'green';
        ctx.fillRect(50, this.canvas.height - 150, (this.homePokemon.hp / this.homePokemon.pokemon.stats.hp) * 200, 5);

        ctx.fillStyle = 'red';
        ctx.fillRect(this.canvas.width - 250, 20, 200, 1);
        ctx.fillStyle = 'green';
        ctx.fillRect(this.canvas.width - 250, 20, (this.awayPokemon.hp / this.awayPokemon.pokemon.stats.hp) * 200, 20);


        // ctx.fillStyle = 'black';
        // ctx.font = '20px Arial';
        // ctx.fillText(this.homePokemon.pokemon.name + " HP: " + this.homePokemon.hp, 50, this.canvas.height - 170);
        // ctx.fillText(this.awayPokemon.pokemon.name + " HP: " + this.awayPokemon.hp, this.canvas.width - 250, 40);
    }
}

export { BattleSimulator, BattlePokemon };