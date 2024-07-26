
const MAX_MOB_ATTACK = 200
const COMMON_DONT_SEND_ITEMS =[MP_POT, HP_POT, 'tracker', 'Ancient Computer']
const DONT_SEND_ITEMS = COMMON_DONT_SEND_ITEMS.concat(DO_NOT_SEND_ITEMS)

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
	
	if(!MY_CHARACTERS.includes(data.name)) return
	console.log(data.message)
	if(data.message.cmd)
	{
		game_log(data.message.cmd)
		switch (data.message.cmd){
			case 'giveMeLoot':
				if(character.name == 'Warious')
				{
					let weapons = [MAINHAND, OFFHAND, LOLIPOP, BASHER, AXE]
					main: for(let i in character.items)
					{
						item = character.items[i]
						if(item && !DONT_SEND_ITEMS.includes(item.name))
						{
							for(let weapon of weapons)
							{
								if(weapon.name == item.name && weapon.lvl == item.level) continue main
							}
							send_item('MerchanDiser', i, item.q)
						}
					}
				}
				else
				{
					for(let i=0; i<character.items.length; i++)
					{
						item = character.items[i]
						if(!item || DONT_SEND_ITEMS.includes(item.name)) continue;
						send_item('MerchanDiser', i, item.q)
					}
				}
				
				send_gold('MerchanDiser', character.gold-5000000);
				shuffleItems();
				break;
			case 'monsterhunt':
				checkQuest();
				break;
			case 'getBack':
				let temp = current_farm_pos
				current_farm_pos = last_farm_pos
				last_farm_pos = temp
				smart_move(current_farm_pos.Mobs[0])
				break;
			case 'farm':
				action = 'farm'
				smart_move(current_farm_pos.Mobs[0])
				break;
			case 'boss':
				character.name == 'arMAGEdon' ? mageHandleBoss(data.message.boss) : handleBoss(data.message.boss)
				break;
			case 'event':
				handleEvent(data.message.name, data.message.event)
				break;
			default:
				console.warn('Unknown command:' + data.message.cmd)
				break;
		}
		
	}
	else if(data.message.mob)
	{
		if(FARM_LOCATIONS[data.message.mob]) 
		{
			last_farm_pos = current_farm_pos
			current_farm_pos=FARM_LOCATIONS[data.message.mob]
			if(action='farm' && !smart.moving) smart_move(current_farm_pos.location)
		}
		else
		{
			let mob = data.message.mob
			let map = null
			last_farm_pos = current_farm_pos
			current_farm_pos =
			{
					location: {x:0, y: 0, map: map},
					Mobs: [mob],
					isCoop: data.message.coop

			}
			attack_mode=true
			if(action='farm')smart_move(mob)
		}
	}
	else console.warn('Unknown command')
})

function on_magiport(name)
{
	if(name!='arMAGEdon' || goingForQuest) return
	accept_magiport(name).then(async() => {
		await sleep(700)	
		if(smart.moving) stop('smart').catch(() => {})
		stop('teleport').catch(() => {})
		if(character.moving) stop('move').catch(() => {})
		});

	console.error(`MAGIPORT ACCEPTED smart.moving: ${smart.moving} action: ${action} current_boss: x: ${current_boss.x}, y: ${current_boss.y}, map: ${current_boss.map} boss_name: ${current_boss.name}`)
}


async function handleBoss(boss)
{
	console.log('Get a boss: '+boss.name+' current action:'+action+'\nBosses in progress: '+boss_schedule.length)
	action = 'boss'
	current_boss = boss	
}

async function handleEvent(name, event)
{
	console.log('Got an event: '+name)
	current_event = { name: name, event: event }	
	if(Object.values(parent.entities).filter(e=> FARM_BOSSES.includes(e.mtype)) && !character.moving) await smart_move(name)
}




sendItems()
async function sendItems()
{
	if(pc) return;
	try{
		if(character.items.length>8)
		{
			for(let i of getMyCharactersOnline())
			{
				char_state = get(i.name)
				if(i.name == character.name) continue
				if(i.name == 'MerchanDiser')
				{
					if(getDistance(get(i.name), character)< 500) 
					{
						send(char_state.name) 
					}
				}
				else if(char_state.have_pc && getDistance(char_state, character)<500)
				{
					if(char_state.items_count < 40)
					{
						send(char_state.name)
					}
				}
				
			}
			
		}
	}
	catch(ex)
	{
		console.warn('Error while sending items')
		console.warn(ex)
	}
	finally
	{
		setTimeout(sendItems, 30000)
	}
	
}

async function send(name)
{
	if(character.name == 'Warious')
	{
		let weapons = [MAINHAND, OFFHAND, LOLIPOP, BASHER, AXE]
		main: for(let j in character.items)
		{
			item = character.items[j]
			if(item && !DONT_SEND_ITEMS.includes(item.name))
			{
				for(let weapon of weapons)
				{
					if(weapon.name == item.name && weapon.lvl == item.level) 
					continue main
				}
				await send_item(name, j, item.q)
			}
		}
	}
	else
	{
		for(let j in character.items)
		{
			item = character.items[j]
			if(!item || DONT_SEND_ITEMS.includes(item.name)) continue;
			await send_item(name, j, item.q)
		}
	}
	await send_gold(name, character.gold)
	shuffleItems()
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


async function dontStack()
{
	let near_players =Object.values(parent.entities).filter(e => e.player)
	for(let i in near_players)
	{
		let player = near_players[i]
		if(getDistance(character, player) < 15)
		{
			move(
				character.x + (-50 +(Math.random()*50)),
				character.y + (-50 +(Math.random()*50))
			)
		}
	}
}

//--------COMBAT SECTION--------//
setInterval(getTartget, 300);
async function getTartget()
{
	if(!attack_mode || character.rip || is_moving(character) || !current_farm_pos ) return;
	if(character.name == LOOTER || !parent.entities[LOOTER] || !parent.party_list.includes(LOOTER)) loot();
	let target = get_targeted_monster()
	

	dontStack()

	if(!target)
	{
		switch(action)
		{
			case 'farm':
				if(parent.entities['Archealer'] && current_farm_pos.isCoop)target=get_target_of(parent.entities['Archealer'])
				else 
				{
					game_log('Searching target...')
					let monsters_in_range = Object.values(parent.entities).filter((e) => e.type === "monster" && is_in_range(e) && (current_farm_pos.Mobs.includes(e.mtype)) || FARM_BOSSES.includes(e.mtype))
					let bosses = Object.values(parent.entities).filter((e) => FARM_BOSSES.includes(e.mtype))
					let monsters = Object.values(parent.entities).filter((e) => e.type === "monster" && (current_farm_pos.Mobs.includes(e.mtype) || FARM_BOSSES.includes(e.mtype))).sort()

					let all_monsters = monsters_in_range.concat(monsters)

					if(monsters.length>0)
					{
						if(bosses.length>0) target = bosses[0]
						else
						{
							all_monsters.sort(
								function(current, next) {
									let dist_current = getDistance(character, current);
									let dist_next = getDistance(character, next);

									if(parent.party_list.includes(current.target) != parent.party_list.includes(next.target))
									{
										return (parent.party_list.includes(current.target) && !parent.party_list.includes(next.target)) ? -1 : 1;
									}

									if(dist_current != dist_next){
										return (dist_current< dist_next) ? -1 : 1;
									}
									
									return 0;
								}
							)
							target = all_monsters[0]
						}
					}
					else if(!smart.moving)
					{
						await smart_move(current_farm_pos.Mobs[0])
					}
				}
				break;
			case 'boss':
				let near_boss = Object.values(parent.entities).filter(e => FARM_BOSSES.includes(e.mtype))
				if(near_boss.length>0)
				{
					target = near_boss[0]
				}
				else if(getDistance(character, current_boss)>500 && !character.moving)
				{
					await smart_move(current_boss)
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


