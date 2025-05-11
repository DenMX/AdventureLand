const WHITE_LIST_FOR_QUEST = {
	goo: {name: 'goo', coop: false, mass_farm: true},
	bee:  {name: 'bee', coop: false, mass_farm: true},
	crab:  {name: 'crab', coop: false, mass_farm: true},
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
		change_target(null)
		if(character.moving) stop('move').catch(() => {})
		});

	if(char_action == 'boss')
	  console.error(`MAGIPORT ACCEPTED smart.moving: ${smart.moving} action: ${char_action} current_boss: x: ${current_boss.x}, y: ${current_boss.y}, map: ${current_boss.map} boss_name: ${current_boss.name}`)
}



setInterval(checkState, 5000)
async function checkState() {
	
	if(!ACTIONS.includes(char_action)) char_action = 'farm'
	current_farm_pos = current_farm_pos || FARM_LOCATIONS.bitch
	radius = current_farm_pos.radius || 30
	bosses = Object.values(parent.entities).filter(e=> FARM_BOSSES.includes(e.mtype))
	if(bosses.length > 0 || characterMoving()) 
	{
		// setTimeout(checkAction, 2000)
		return
	}
	try {
		switch(char_action){
			case 'farm':
				set_message('Farming...')
				if(!characterMoving() && Object.values(parent.entities).filter((e) => current_farm_pos.mobs.includes(e.mtype) || FARM_BOSSES.includes(e.mtype)).length<1)
				{
					current_farm_pos?.location ? await smart_move(current_farm_pos.location) : await smart_move(current_farm_pos.mobs[0])
					console.log('Farm smart_move')
					setTimeout(checkState, 2000)
				}
				else if(Object.values(parent.entitites).filter(e=>current_farm_pos.mobs.includes(e.mtype))>0 && getDistance(character, current_farm_pos?.location)>radius &&
					!FARM_BOSSES.includes(parent.ctarget.mtype) && !character.moving)
				{
					await smart_move(current_farm_pos.location)
				}
				break;
			case 'boss':
				set_message('Bossing...')
				checkAction('boss', current_boss, boss_schedule)
				break;
			case 'event':
				set_message('Event')
				checkAction('event', current_event, event_schedule)
				break;
	
		}
	}
	catch(e){
		console.warn('Error while checking state\n'+e)
	}
	finally {
		// setTimeout(checkState, 3000)
	}
	
}


async function checkAction(action, cur_point, schedule) {

	if(characterMoving()) {
		setTimeout(checkState, 2000)	
		return
	}
	let bosses = Object.values(parent.entities).filter(e=> FARM_BOSSES.includes(e.mtype))
	switch (action) {
		case 'boss':
			if(cur_point)
			{ 
				if( getDistance(character, cur_point)<500 && bosses.length<1)
				{
					schedule.length>0 ? current_boss=schedule.shift().then(smart_move(current_boss)) : current_boss = null, char_action = 'farm'
				}
				else if( getDistance(character, cur_point)>500) await smart_move(cur_point)
			}
			else schedule.length>0 ? current_boss=schedule.shift() : char_action = 'farm'
			break;
		case 'event':
			if(!cur_point)
			{
				schedule.length > 0 ? cur_point = current_event = schedule.shift() : char_action = 'boss'
				return
			}
			// check if event not active
			if (parent.S[cur_point] == 'indefined' || parent.S[cur_point]?.live == false) {
				schedule.length > 0 ? current_event = schedule.shift() : current_event = null, char_action = 'boss'
			}
			//check if we need to go for event. Checking bosses count because not every event has coordinates and we can meet boss before event.
			else if (parent.S[cur_point]?.live || parent.S[cur_point]?.live == 'undefined' && bosses.length<1) await smart_move (parent.S[cur_point])
			
	}



	// if(cur_point && getDistance(character, parent.S[cur_point] || cur_point)>500 && !character.moving)  {
	// 	(action=='boss') ? await smart_move(cur_point) : await smart_move(parent.S[cur_point])
	// }
	// else if(!cur_point || (cur_point && (getDistance(character, cur_point) <= 500 || getDistance(character, parent.S[cur_point])<=500) && Object.values(parent.entities).filter(e => FARM_BOSSES.includes(e.mtype)).length<1))
	// {
	// 	if(schedule.length>0) {
	// 		cur_point = schedule.shift()
	// 		(action=='boss') ? await smart_move(cur_point) : await smart_move(parent.S[cur_point])
	// 	}
	// 	else {
	// 		if(action == 'boss') { 
	// 			char_action = 'farm' 
	// 			current_boss = null
	// 		}
	// 		else if(action == 'event'){
	// 			char_action = 'boss'
	// 			current_event = null
	// 			checkAction('boss', current_boss, boss_schedule)
	// 		}
	// 	}
	// }
		

}

//-------------MONSTERHUNT LOGIC-------------------//

var goingForQuest = false

async function checkQuest()
{
	if(!character.s.monsterhunt)
	{
		// attack_mode=false
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
		// attack_mode=true
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
	for(let player of near_players)
	{
		if(getDistance(character, player) < 10 && character.speed>55)
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
	
	if(target && target.map != character.map || getDistance(target, character) > 500) change_target(null)
	dontStack()

	if(!target)
	{
				if(character.name != 'Warious' && parent.entities['Warious'] && !parent.entities['Warious'].rip && current_farm_pos.coop)target=get_target_of(parent.entities['Warious'])
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
	if(is_on_cooldown('scare')) return;
	else if (character.name=='Archealer') attackOrHeal(target)
	else myAttack(target)
}

async function getSpotForAggro() {
	let monsters = Object.values(parent.entities).filter(e => current_farm_pos.mobs.includes(e.mtype) && !e.target)
	monsters.sort(
		function(current, next){
			let dist_current = getDistance(character, current);
			let dist_next = getDistance(character, next);
			
			if(dist_current != dist_next){
				return (dist_current< dist_next) ? 1 : -1;
			}
			
			return 0;
		}
	)

	let monster_count = 0;
	let current_monster
	for(monster of monsters)
	{
		curr_count = Object.values(parent.entities).filter(e => current_farm_pos.mobs.includes(e.mtype) && !e.target && getDistance(monster, e) <= 400).length
		if(curr_count> monster_count)
		{
			monster_count = curr_count
			current_monster = monster
		}
	}

	return { monster: current_monster, count: monster_count }
}

async function saveSelfAss()
{
	if(character.hp>character.max_hp*0.45 || is_on_cooldown('scare')) return
	if(character.hp<=character.max_hp*0.45 && Object.values(parent.entities).filter(e => e.target == character.name).length>0) {
		if(character.slots.orb.name != 'jacko' )
		{
			var current_orb = character.slots.orb
			for(let i in character.items)
			{
				let item = character.items[i]
				if(item && item.name == JACKO.name && item.level == JACKO.level) await equip(i)
			}
		}
		await use_skill('scare')

		if(current_orb)
		{
			for(let j in character.items)
			{
				let itm = character.items[j]
				if(itm && itm.name == current_orb.name && itm.level == current_orb.level) await equip(j)
			}
		}
	}

}

