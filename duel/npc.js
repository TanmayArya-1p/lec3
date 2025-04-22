import Player from '../player.js';
import {ASH,GARY,trainerList,npcNames,offsetMap,teamBattleCount} from "../consts.js";
import {BattleSimulator} from "./battle.js";
import Pokemon from '../pokemon.js';

const npcResponseStyles = {
    "pureRandomness" : (moves) => Math.floor(Math.random() * moves.length),
}

class NPC {
    constructor(wait=3000,npcResponse=npcResponseStyles.pureRandomness,name=null,pokemonCodes=null) {
        if(name===null){
            name = "NPC " + npcNames[Math.floor(Math.random() * npcNames.length)];
        }
        this.pokemonCodes = []
        this.wait = wait
        let char = trainerList[Math.floor(Math.random() * trainerList.length)];
        if(pokemonCodes===null){
            for(let i=0;i<teamBattleCount;i++){
                let pokemonCode = Math.floor(Math.random() * 30) + offsetMap[char]+1;
                while(this.pokemonCodes.includes(pokemonCode)){
                    pokemonCode = Math.floor(Math.random() * 30) + offsetMap[char]+1;
                }
                this.pokemonCodes.push(pokemonCode);
            }
        } else{
            this.pokemonCodes = pokemonCodes;
        }
        this.npcResponse = npcResponse
        this.name = name;
        this.player = new Player(name, char, this.pokemonCodes.map(code => new Pokemon(code)));
        this.player.xp = 50;
    }

    simulatorBinding(bs,npc,faintflag) {
        if(faintflag){
            setTimeout(() => {
                bs.attackHome((bs.enemyActiveIdx+1)%teamBattleCount,null,true);
                npc.simulatorBinding(bs,npc,false);
            }, npc.wait);
            return;
        }
        let npcresptemp = npc.npcResponse;
        setTimeout(() => {
            bs.attackHome(npcresptemp(bs.awayPokemons[bs.enemyActiveIdx].pokemon.moves));
        }, npc.wait);
    }
}


async function startNPCBattle(player,music,pinger) {
    const npc = new NPC();

    for(let i=0;i<teamBattleCount;i++){

        await npc.player.getPokemon(i).hydrateData();
    }

    let playerTeam = []
    for(let i=0;i<teamBattleCount;i++){
        let curr = player.getPokemon(i);
        if(curr===undefined){
            break;
        }
        console.log("ADDING " , curr)
        if(!curr.hydrated) await curr.hydrateData()
        playerTeam.push(player.getPokemon(i));
    }


    const npcTeam = Array.from({length: teamBattleCount}, (_, i) => npc.player.getPokemon(i));
    let bs = new BattleSimulator(playerTeam, npcTeam, "battle-arena", music, pinger, npc, npc.simulatorBinding,null,()=>window.location.reload());
    bs.draw()
    bs.setOpponent(npc.player)
    window.npcbs = bs;
    bs.setPlayer(player)
    await bs.initMoves()


}

export {startNPCBattle, NPC}