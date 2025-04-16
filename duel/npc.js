import Player from '../player.js';
import {ASH,GARY,trainerList,npcNames,offsetMap} from "../consts.js";
import {BattleSimulator} from "./battle.js";
import Pokemon from '../pokemon.js';

const npcResponseStyles = {
    "pureRandomness" : (moves) => Math.floor(Math.random() * moves.length),
}

class NPC {
    constructor(wait=3000,npcResponse=npcResponseStyles.pureRandomness,name=null,pokemonCode=null) {
        if(name===null){
            name = "NPC " + npcNames[Math.floor(Math.random() * npcNames.length)];
        }
        this.wait = wait
        let char = trainerList[Math.floor(Math.random() * trainerList.length)];
        if(pokemonCode===null){
            pokemonCode = Math.floor(Math.random() * 30) + offsetMap[char]+1;
        }
        this.npcResponse = npcResponse
        this.name = name;
        this.player = new Player(name, char, [new Pokemon(pokemonCode)]);
        this.player.xp = 50;
    }

    simulatorBinding(bs,npc) {
        let npcresptemp = npc.npcResponse;
        setTimeout(() => {
            bs.attackHome(npcresptemp(bs.awayPokemon.pokemon.moves));
        }, npc.wait);
    }
}


async function startNPCBattle(player,music,pinger) {
    const npc = new NPC();
    await npc.player.getPokemon(0).hydrateData();

    let bs=new BattleSimulator(player.getPokemon(0), npc.player.getPokemon(0), "battle-arena" , music,pinger,npc,npc.simulatorBinding);
    bs.draw()
    
    bs.setPlayer(player)
    bs.setOpponent(npc.player)
    await bs.initMoves()


}

export {startNPCBattle, NPC}