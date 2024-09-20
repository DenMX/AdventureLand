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




setInterval(checkState, 1000)
async function checkState() {
	
	if(!ACTIONS.includes(action)) action = 'farm'

	switch(action){
		case 'farm':
			if(attack_mode && !is_moving(character) && current_farm_pos==null)
			{
				current_farm_pos=FARM_LOCATIONS.nearMines
				await smart_move(current_farm_pos.location)
			}
			else if(attack_mode && !is_moving(character) && !Object.values(parent.entities).filter((e) => e.type == 'monster' && e.id == current_farm_pos.mobs[0]) && !smart.moving)
				await smart_move(current_farm_pos.mobs[0])
			break;
		case 'boss':
			if(getDistance(current_boss, character)> 250 && !is_moving(character) && !smart.moving) await smart_move(current_boss)
			else if(getDistance(current_boss, character)< 250 && Object.values(parent.entities).filter(e => FARM_BOSSES.includes(e.mtype)).length == 0) 
			{
				if(boss_schedule.length>0)
				{
					current_boss=boss_schedule.shift()
					await smart_move(current_boss)
				}
				else
				{
					console.log('Switching action '+action+' to farm')
					action = 'farm'
					current_boss = null
				}
			}
			break;
		case 'event':
			if(getDistance(current_event.event, character)> 250 && !smart.moving && !FARM_BOSSES.includes(get_targeted_moster().mtype))
				{ 
					if(['goobrawl', 'icegolem'].includes(current_event.name)) join(current_event.name)
					else await smart_move(current_event.event)
				}
			else if(getDistance(current_boss, character)< 250 && Object.values(parent.entities).filter(e => FARM_BOSSES.includes(e.mtype)).length == 0)
			{
				if(current_event.name == 'icegolem') await town()
				if(boss_schedule.length>0 && !current_boss)
				{
					current_boss=boss_schedule.shift()
					console.log('Switching action '+action+' to boss')
					action='boss'
					current_event = null
				}
				else if(current_boss) action = 'boss'
				else
				{
					console.log('Switching action '+action+' to farm')
					action = 'farm'
					current_event = null
				}
			} 
			break;

	}
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
					let monsters_in_range = Object.values(parent.entities).filter((e) => e.type === "monster" && is_in_range(e) && (current_farm_pos.mobs.includes(e.mtype)) || FARM_BOSSES.includes(e.mtype))
					let bosses = Object.values(parent.entities).filter((e) => FARM_BOSSES.includes(e.mtype))
					let monsters = Object.values(parent.entities).filter((e) => e.type === "monster" && (current_farm_pos.mobs.includes(e.mtype) || FARM_BOSSES.includes(e.mtype))).sort()

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
						await smart_move(current_farm_pos.mobs[0])
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


