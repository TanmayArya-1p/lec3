class Pokemon{
    constructor(code) {
        this.code = code;
        this.hydrated=false
    }   

    async hydrateData() {
        let res = await fetch("https://pokeapi.co/api/v2/pokemon/"+this.code)
        let json = await res.json()
        this.name = json.name;
        this.moves = json.moves.map(move => move.move);
        this.height = json.height;
        this.types = json.types.map(type => type.type);
        this.sprites = json.sprites;
        this.abilities = json.abilities.map(ability => ability.ability);
        this.stats = json.stats.reduce((acc, stat) => {
            acc[stat.stat.name] = stat.base_stat;
            return acc;
        }, {});
        this.hydrated=true
    }
}

export default Pokemon;