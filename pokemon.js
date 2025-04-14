class Pokemon{
    constructor(code) {
        this.code = code;
        this.hp = this.getHp(code);
        this.atk = this.getAtk(code);
        this.def = this.getDef(code);
        this.spd = this.getSpd(code);
        this.spAtk = this.getSpAtk(code);
        this.spDef = this.getSpDef(code);
        this.hydrated=false
        this.hydrateData()
    }

    async hydrateData() {
        let res = await fetch("https://pokeapi.co/api/v2/pokemon/"+this.code)
        let json = await res.json()
        this.name = json.name;
        this.moves = json.moves.map(move => move.move);
        this.types = json.types.map(type => type.type);
        this.sprites = json.sprites;
        this.abilities = json.abilities.map(ability => ability.ability);
        this.stats = json.stats.reduce((acc, stat) => {
            acc[stat.stat.name] = stat.base_stat;
            return acc;
        }, {});
        console.log(this)
        this.hydrated=true
    }
}

export default Pokemon;