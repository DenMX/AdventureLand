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




function on_magiport(name)
{
	if(name!='arMAGEdon' || goingForQuest) return
	accept_magiport(name).then(async() => {
		await sleep(700)	
		if(smart.moving) stop('smart').catch(() => {})
		stop('teleport').catch(() => {})
		if(character.moving) stop('move').catch(() => {})
		});

	if(char_action == 'boss')
	  console.error(`MAGIPORT ACCEPTED smart.moving: ${smart.moving} action: ${char_action} current_boss: x: ${current_boss.x}, y: ${current_boss.y}, map: ${current_boss.map} boss_name: ${current_boss.name}`)
}



setInterval(checkState, 300)
async function checkState() {
	
	if(!ACTIONS.includes(char_action)) char_action = 'farm'
	current_farm_pos = current_farm_pos || FARM_LOCATIONS.bigbird
	bosses = Object.values(parent.entities).filter(e=> FARM_BOSSES.includes(e.mtype))
	if(bosses.length > 0) return
	switch(char_action){
		case 'farm':
			set_message('Farming...')
			if(Object.values(parent.entities).filter(e=> current_farm_pos.mobs.includes(e.mtype)).length>0) return
			else if(!smart.moving && Object.values(parent.entities).filter((e) => current_farm_pos.mobs.includes(e.mtype) || FARM_BOSSES.includes(e.mtype)).length==0)
				current_farm_pos?.location ? await smart_move(current_farm_pos.location) : await smart_move(current_farm_pos.mobs[0])
			break;
		case 'boss':
			set_message('Bossing...')
			if(getDistance(current_boss, character)> 500 && !smart.moving) await smart_move(current_boss)
			else if(getDistance(current_boss, character)<= 500 && Object.values(parent.entities).filter(e => FARM_BOSSES.includes(e.mtype)).length == 0) 
			{
				if(boss_schedule.length>0)
				{
					current_boss=boss_schedule.shift()
					await smart_move(current_boss)
				}
				else
				{
					console.log('Switching action '+char_action+' to farm')
					char_action = 'farm'
					current_boss = null
				}
			}
			break;
		case 'event':
			set_message('Event')
			if(getDistance(current_event.event, character)> 500 && !character.moving && !FARM_BOSSES.includes(get_targeted_moster().mtype))
				{ 
					if(['goobrawl', 'icegolem'].includes(current_event.name)) join(current_event.name)
					else await smart_move(current_event.event)
				}
			else if(getDistance(current_event.event, character)<= 500 && bosses.length == 0)
			{
				if(current_event.name == 'icegolem') await town()
				if(boss_schedule.length>0 && !current_boss)
				{
					current_boss=boss_schedule.shift()
					console.log('Switching action '+char_action+' to boss')
					char_action='boss'
					current_event = null
				}
				else if(current_boss) char_action = 'boss'
				else
				{
					console.log('Switching action '+char_action+' to farm')
					char_action = 'farm'
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

setInterval(looting, 333)
function looting(){
	if(character.name == LOOTER || !parent.entities[LOOTER] || !parent.party_list.includes(LOOTER)) loot();
}

setInterval(getTartget, 300)
//--------COMBAT SECTION--------//
async function getTartget()
{
	if(!attack_mode || character.rip || smart.moving ) return;
	
	let target = get_targeted_monster()
	

	dontStack()

	if(!target)
	{
				if(character.name != 'Warious' && parent.entities['Warious'] && current_farm_pos.isCoop)target=get_target_of(parent.entities['Warious'])
				else 
				{
					game_log('Searching target...')
					let monsters = Object.values(parent.entities).filter((e) => e.type === "monster" && (current_farm_pos.mobs.includes(e.mtype) || FARM_BOSSES.includes(e.mtype)))

					if(monsters.length>0)
					{
						monsters.sort(
							function(current, next) {
								let dist_current = getDistance(character, current);
								let dist_next = getDistance(character, next);
								if(FARM_BOSSES.includes(current.mtype)!=FARM_BOSSES.includes(next.mtype)) {
									return (FARM_BOSSES.includes(current.mtype) && !FARM_BOSSES.includes(next.mtype)) ? -1 : 1;
								}
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
						target = monsters[0]
					}
				}
					
	}		
	if(!target && character.name != 'Archealer') return;
	else if (character.name=='Archealer') attackOrHeal(target)
	else myAttack(target)
}



