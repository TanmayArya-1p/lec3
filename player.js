import { teamBattleCount } from './consts.js';

class Player {
    constructor(nick, char, pokemons) {
        this.nick = nick;
        this.char = char;
        this.team = pokemons;
        this.xp = 50;
        this.arenaIDX = Math.floor(Math.random() * 2);
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
    static playerOcclusion(player) {
        player = {
            nick: player.nick,
            xp: player.xp,
            char: player.char,
            arenaIDX: player.arenaIDX,
            team: player.team.slice(0, teamBattleCount).map((pokemon) => {
            return {
                name: pokemon.name,
                code: pokemon.code,
                sprites: {
                front_default: pokemon.sprites.front_default,
                other: {
                    showdown: {
                    front_default: pokemon.sprites.other.showdown.front_default,
                    back_default: pokemon.sprites.other.showdown.back_default
                    }
                }
                },
                power: pokemon.power,
                types: pokemon.types,
                stats: pokemon.stats,
                moves: pokemon.moves.map((move) => {
                return {
                    name: move.name,
                    power: move.power,
                    type: move.type,
                    accuracy: move.accuracy,
                    pp: move.pp,
                    priority: move.priority
                }
                })
            }
            })
        };
        return player
    }


}



export default Player;