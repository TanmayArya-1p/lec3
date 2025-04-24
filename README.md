# PokéLAN
A Pokémon Showdown esque game with p2p Multiplayer using WebRTC.

Hosted at [pokelan.vercel.app](https://pokelan.vercel.app)



## Self-Hosting:

Assuming you have `docker` just run the below command to build and run the image 

```bash
docker compose up -d
```

## RTC Battle

Uses the standard API that the browser exposes for WebRTC.
Users are required to share their SDPs on their own since this project does not have a backend for signalling

Apart from this, for Self-Hosting feel free to configure your own `STUN` servers and `TURN` servers for NAT traversal in the `rtc.js` file

## How It Works

- `battle.js` contains a `BattleSimulator` class that handles all the rendering of the duel canvas, animations, etc. 

- It exposes functions for `AttackHome`,`AttackAway`,`HomeSwitchPokemon`,`AwaySwitchPokemon`. 
- It also accepts hooks to handle player moves:
    - `enemyMoveCallback` - called by BattleSimulator when its the enemy player's turn.
    - `homeMoveCallback` - called everytime the home player makes a move (useful for syncing moves between remote clients).
    - `endGameCallback` - called when the game concludes and can be used for cleanup functionalities.

This allows you to inject custom logic for the AwayPlayer. For example, to implement an NPC, simply provide a `enemyMoveCallback` function to the BattleSimulator that will be invoked at each of its turns to decide the move. Similarly, `RTCPlayer` can be directly integrated into `BattleSimulator` by supplying its move function as a hook.
 

