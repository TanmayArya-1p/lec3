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
            team: [
                {
                    name: player.team[0].name,
                    code: player.team[0].code,
                    sprites: {
                        front_default: player.team[0].sprites.front_default,
                        other: {
                            showdown : {
                                front_default: player.team[0].sprites.other.showdown.front_default,
                                back_default: player.team[0].sprites.other.showdown.back_default
                            }
                        }
                    },
                    power: player.team[0].power,
                    types: player.team[0].types,
                    stats: player.team[0].stats,
                    arenaIDX: player.arenaIDX,
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


}



export default Player;