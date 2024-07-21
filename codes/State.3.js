const FARM_LOCATIONS = 
	{
		bitch: {
			location: {x: -1262, y: 490, map: 'main'},
			Mobs: ["squigtoad", "squig"],
			isCoop: false
		},
		bees: {
			location: {x:377, y:1350, map: 'main'},
			Mobs: ["bee"],
			isCoop: false
		},
		nearMines: {
			location: {x:627, y:1725, map: 'main'},
			Mobs: ["armadillo", "croc"],
			isCoop: false
		},
		spiders: {
			location: {x:750, y:-160, map: 'main'},
			Mobs: ["spider"],
			isCoop: true
		},
		snakes: {
			location: {x:-124, y:1876, map: 'main'},
			Mobs: ["snake"],
			isCoop: false
		}
	}

var boss_schedule = []


const LOOTER = 'RangerOver'
const ACTIONS = ['farm', 'boss', 'event']

var last_farm_pos
var current_farm_pos
var current_boss
var current_event
var attack_mode=true
var curState
var action



getState();
function getState()
{
	if(!curState && get(character.name)!=null)
	{ 
		curState = get(character.name)
		current_farm_pos = curState.farm_location
		action = (ACTIONS.includes(curState.current_action)) ? curState.current_action : 'farm'
		current_boss = curState.current_boss ? curState.current_boss : null
		boss_schedule = curState.bosses ? curState.bosses : []
	}
}

setInterval(saveState, 2500)
async function saveState()
{
	let items = await itemsCount()
	let hpot = await hpPotsCount()
	let mpot = await mpPotsCount()
	curState = 		{
		name: character.name,
		is_farming: attack_mode,
		last_farm_location: last_farm_pos,
		farm_location: current_farm_pos,
		items_count: items,
		x: character.x,
		y: character.y,
		map: character.map,
		hp_pot: hpot,
		mp_pot: mpot,
		hpot_grade: HP_POT,
		mpot_grade: MP_POT,
		current_hp: character.hp,
		current_mp: character.mp,
		max_hp: character.max_hp,
		max_mp: character.max_mp,
		equip: character.slots,
		have_pc: pc,
		s: character.s,
		current_action: action,
		current_boss: current_boss,
		bosses: boss_schedule,
		current_event: current_event
	}

	set(
		character.name,
		curState
	)
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
			else if(attack_mode && !is_moving(character) && !Object.values(parent.entities).filter((e) => e.type == 'monster' && e.id == current_farm_pos.Mobs[0]) && !smart.moving)
				await smart_move(current_farm_pos.Mobs[0])
			break;
		case 'boss':
			if(getDistance(current_boss, character)> 250 && !is_moving(character) && !smart.moving) await smart_move(current_boss)
			else if(getDistance(current_boss, character)< 250 && Object.values(parent.entities).filter(e => FARM_BOSSES.includes(e.mtype)).length == 0) 
			{
				if(boss_schedule.length>0)
				{
					current_boss=boss_schedule.shift()
					smart_move(current_boss)
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
				if(boss_schedule.length>0 && !current_boss)
				{
					current_boss=boss_schedule.shift()
					console.log('Switching action '+action+' to boss')
					action='boss'
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

