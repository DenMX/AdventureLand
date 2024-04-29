
const MAX_MOB_ATTACK = 200

const DONT_SEND_ITEMS = [MP_POT, HP_POT, 'tracker']

const WHITE_LIST_FOR_QUEST = {
	goo: {coop: false},
	bee:  {coop: false},
	crab:  {coop: false},
	arcticbee:  {coop: false},
	snake:  {coop: false},
	osnake:  {coop: false},
	squig:  {coop: false},
	armadillo:  {coop: false},
	rat:  {coop: true},
	nerfedbat:  {coop: true},
	croc:  {coop: false},
	iceroamer:  {coop: true},
	squigtoad:  {coop: false},
	poisio:  {coop: false},
	boar:  {coop: true},
	spider:  {coop: true},
	scorpion:  {coop: true},
	gscorpion:  {coop: true},
	porcupine:  {coop: true}
}


//-------------CREATE PARTY---------------//

setInterval(followHealer, 500)
function followHealer(){
	let healer = parent.entities['Archealer']
	if(!character.rip && healer && distance(healer, character) >= character.range/2 && attack_mode && distance(character.position, current_farm_pos.position) < character.range*2)
	{
		move(
			character.x+(healer.x-character.x)/2,
			character.y+(healer.y-character.y)/2
			);
	}
}

//----------ON EVENTS---------//
character.on("cm", function(data){
	console.warn(data.name)
	console.log(data)
	if(!MY_CHARACTERS.includes(data.name)) return
	if(data.message.cmd)
	{
		if(data.message.cmd == 'giveMeLoot')
		{
			for(let i=0; i<character.items.length; i++)
			{
				console.log('Searching items')
				item = character.items[i]
				if(!item || DONT_SEND_ITEMS.includes(item.name)) continue;
				send_item('MerchanDiser', i, item.q)
			}
			send_gold('MerchanDiser', character.gold)
			shuffleItems()
		}
		else if(data.message.cmd == 'monsterhunt')
		{
			checkQuest()
		}
		else if(data.message.cmd == 'getBack')
		{
			let temp = current_farm_pos
			current_farm_pos = last_farm_pos
			last_farm_pos = temp
			smart_move(current_farm_pos.Mobs[0])
		}
	}
	else if(data.message.mob)
	{
		if(FARM_LOCATIONS[data.message.mob]) 
		{
			last_farm_pos = current_farm_pos
			current_farm_pos=FARM_LOCATIONS[data.message.mob]
			smart_move(current_farm_pos.location)
		}
		else
		{
			let mob = data.message.mob
			let map = getMapOfMonster(data.message.mob)
			last_farm_pos = current_farm_pos
			current_farm_pos =
			{
					location: {x:getXYOfMonster(mob, map).x, y: getXYOfMonster(mob, map).y, map: map.name},
					Mobs: [mob],
					isCoop: data.message.coop

			}
			attack_mode=true
			smart_move(mob)
		}
	}
	else console.warn('Unknown command')
})

function on_magiport(name)
{
	if(name!='arMAGEdon' || goingForQuest) return
	if(smart.moving) stop('smart')
	stop('teleport')
	stop('move')

	accept_magiport(name)
}


//-------------MONSTERHUNT LOGIC-------------------//

var goingForQuest = false

async function checkQuest()
{
	if(!character.s.monsterhunt)
	{
		attack_mode=false
		goingForQuest = true
		game_log('try going to monsterhunt')
		await smart_move({x:108, y: -374, map: 'main'}).then(function(param) { parent.socket.emit('monsterhunt') })
		if(!character.s.monsterhunt) await sleep(500)
		let monster = character.s.monsterhunt?.id
		if(WHITE_LIST_FOR_QUEST[monster])
		{
			await send_cm(parent.party_list, {mob: character.s.monsterhunt.id, coop: WHITE_LIST_FOR_QUEST[monster].coop})
			setTimeout(checkQuest, getMsFromMinutes(3))
		}
		else  await	passMonsterhuntNext()
		goingForQuest = false
		attack_mode=true
	}
	else if(character.s.monsterhunt?.c == 0)
	{
		goingForQuest=true
		await send_cm(parent.party_list, {cmd:'getBack'})
		await smart_move({x:108, y: -374, map: 'main'}).then(function(param) { parent.socket.emit('monsterhunt') }).then(checkQuest)
	}
	else if(character.s.monsterhunt && character.s.monsterhunt.c>0) setTimeout(checkQuest, 5000)
}




function getMapOfMonster(monster)
{
	for(let i in G.maps)
	{
		if(!G.maps[i].ignore && !G.maps[i].pvp && Object.values(G.maps[i].monsters).filter((e) => e.type == monster).length>0) return G.maps[i]
	}
	return
}

function getXYOfMonster(monster, map)
{
	for(let i of map.monsters)
	{
		if(i.type == monster) return {x: i.boundary[2]- i.boundary[0], y: i.boundary[3]- i.boundary[1]}
	}
	return
}


//--------COMBAT SECTION--------//
setInterval(getTartget, 200);
function getTartget()
{
	if(!attack_mode || character.rip || is_moving(character) || !current_farm_pos ) return;
	if(character.name == LOOTER || !parent.entities[LOOTER] || !parent.party_list.includes(LOOTER)) loot();
	let target = get_targeted_monster()
	for(let i in parent.party_list)
	{
		let member = parent.party_list[i]
		if(parent.entities[member] && getDistance(character, parent.entities[member]) < 30)
		{
			move(
				character.x + (-50 +(Math.random()*125)),
				character.y + (-50 +(Math.random()*125))
			)
		}
	}
	if(!target)
	{
		
		if(parent.entities['Archealer'] && current_farm_pos.isCoop)target=get_target_of(parent.entities['Archealer'])
		else 
		{
			game_log('Searching target...')
			let monsters_in_range = Object.values(parent.entities).filter((e) => e.type === "monster" && is_in_range(e) && (current_farm_pos.Mobs.includes(e.mtype)) || FARM_BOSSES.includes(e.mtype))
			let monsters = Object.values(parent.entities).filter((e) => e.type === "monster" && (current_farm_pos.Mobs.includes(e.mtype) || FARM_BOSSES.includes(e.mtype)))

			let all_monsters = [monsters_in_range, monsters]

			if(monsters.length>0)
			{
				outer: for(let i=0; i<all_monsters.length; i++)
				{
					for(let monster of all_monsters[i])
					{
						if(TARGETING_BLACK_LIST && monster[TARGETING_BLACK_LIST]) continue
						if(FARM_BOSSES.includes(monster.mtype))
						{
							target=monster
							break outer;
						}
						if(current_farm_pos.Mobs.includes(monster.mtype) && monster.visible) 
						{
							target = monster
							break outer;
						}
					}
				}
			}
			else{
				smart_move(current_farm_pos.Mobs[0])
			}
		}				
	}
		
	
	if(!target)
	{
		set_message("No Monsters");
		return;
	}
	else if (character.name=='Archealer') attackOrHeal(target)
	else myAttack(target)
	
}




function circleMove(target)
{
	// move(
	// 	character.x+((character.range/3) + (target.y-character.y)),
	// 	character.y+((character.range/3)+(target.x-character.x))
	// 	// character.x-(character.range/4/(target.x-character.x)*(character.range/4/(target.x-character.x))),
	// 	// character.y-(character.range/4/(target.y-character.y)*(character.range/4/(target.y-character.y)))
	// )
}


