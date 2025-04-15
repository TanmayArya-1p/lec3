class Player {
    constructor(nick, char, pokemons) {
        this.nick = nick;
        this.char = char;
        this.team = pokemons;
        this.xp = 50;
    }
    getPokemon(index) {
        return this.team[index];
    }
    getPokemonCount() {
        return this.team.length;
    }
    addPokemon(pokemon) {
        this.team.push(pokemon);
    }
    saveState() {
        localStorage.setItem('player', JSON.stringify(this));
    }
    static loadState() {
        const data = localStorage.getItem('player');
        if (data) {
            const { nick, char, team } = JSON.parse(data);
            return new Player(nick, char, team);
        }
        return null;
    }
    static isNew() {
        return !localStorage.getItem('player');
    }
    static clearState() {
        localStorage.removeItem('player');
        window.location.href = '/';
    }


}


export default Player;