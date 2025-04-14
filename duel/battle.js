class BattlePokemon {
    constructor(pokemon) {
        this.pokemon = pokemon;
        this.hp = this.pokemon.stats.hp;
        this.type = type;
        this.hp = 100; 
    }
    attack(opponent) {
        opponent.hp -= 10;
    }

}



class BattleEmulator {
    constructor() {
        this.homePlayer = null;
        this.awayPlayer = null;

        this.homePokemon = null;
        this.awayPokemon = null;

        this.battleLog = [];
    }
    setPlayer(player) {
        this.player = player;
    }
    setOpponent(opponent) {
        this.opponent = opponent;
    }
    addBattleLog(entry) {
        this.battleLog.push(entry);
    }
}