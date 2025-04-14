class Player {
    constructor(nick, char, pokemons) {
        this.nick = nick;
        this.char = char;
        this.team = pokemons;
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

}


export default Player;