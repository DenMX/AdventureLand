const FARM_LOCATIONS = 
	{
		bitch: {
			location: {x: -1262, y: 490, map: 'main'},
			mobs: ["squigtoad", "squig"],
			coop: false,
			massFarm : true,
			canSolo: true
		},
		bee: {
			location: {x:377, y:1350, map: 'main'},
			mobs: ["bee"],
			coop: false,
			massFarm: true,
			canSolo: true
		},
		nearMines: {
			location: {x:627, y:1725, map: 'main'},
			mobs: ["armadillo", "croc"],
			coop: false,
			massFarm: true,
			canSolo: true
		},
		spider: {
			location: {x:1287, y:-130, map: 'main'},
			mobs: ["spider", "bigbird", "scorpion"],
			coop: true,
			massFarm: true,
			canSolo: false,
			radius: 15
		},
		snake: {
			location: {x:-124, y:1876, map: 'main'},
			mobs: ["snake"],
			coop: false,
			massFarm: true,
			canSolo: true
		},
		bat: {
			location: {x: 316, y: -1179, map: 'cave'},
			mobs: ['bat'],
			coop: true,
			massFarm: true,
			canSolo: true
		},
		bigbird: {
			location: {x: 1341, y: 342, map: 'main'},
			mobs: ['bigbird'],
			coop: true,
			massFarm: true,
			canSolo: false
		},
		boar: {
			location: {x: 153, y: -910, map: 'winterland'},
			mobs: ['boar'],
			coop: true,
			massFarm: true,
			canSolo: false
		},
		stoneworm: {
			location: {x:850, y:-80, map: 'spookytown'},
			mobs: ['stoneworm'],
			coop: true,
			massFarm: false,
			canSolo: false
		},
		goo: {
			location: {x:-34, y:810, map: 'main'}, 
			mobs: ['goo'],
			coop: false, 
			massFarm: true,
			canSolo: true
		},
		crab:  {
			location: {x: -1215, y: -9, map: 'main'}, 
			mobs: ['crab'],
			coop: false, 
			massFarm: true,
			canSolo: true
		},
		arcticbee:  {
			location: {x: 1000, y: -873, map: 'winterland'},
			mobs: ['arcticbee'],
			coop: false,
			massFarm: true,
			canSolo: true
		},
		osnake:  
		{
			location: {x: -590, y: -335, map: 'spookyforest'},
			mobs: ['osnake'],
			coop: false,
			massFarm: true,
			canSolo: true
		},
		// squig:  {coop: false},
		// armadillo:  {coop: false},
		rat:  {
			location: {x: -53, y: -284, map: 'mansion'},
			mobs: ['rat'],
			coop: true,
			massFarm: true,
			canSolo: true
		},
		// croc:  {coop: false},
		iceroamer:  {
			location: {x: 1100, y: -3, map: 'winterland'},
			mobs: ['iceroamer'],
			coop: true,
			massFarm: true,
			canSolo: false
		},
		// squigtoad:  {coop: false},
		poisio:  {
			location: {x: -121, y: 1360, map: 'main'},
			mobs: ['poisio'],
			coop: true,
			massFarm: true,
			canSolo: false
		},
		scorpion:  {
			location: {x: 1491, y: -187, map: 'main'},
			mobs: ['scorpion'],
			coop: true,
			massFarm: true,
			canSolo: false
		},
		gscorpion:  {
			location: {x: 391, y: -1422, map: 'desertland'},
			mobs: ['gscorpion'],
			coop: true,
			massFarm: true,
			canSolo: false
		},
		porcupine:  {
			location: {x: -829, y: 135, map: 'desertland'},
			mobs: ['porcupine'],
			coop: true,
			massFarm: true,
			canSolo: true
		},
		mole: {
			location: {x: -60, y: -1060, map: 'tunnel'},
			mobs: ['mole'],
			coop: true,
			massFarm: true,
			canSolo: false
		},
		crabx: {
			location: {x: -1045, y: 1575, map: 'main'},
			mobs: ['crabx'],
			coop: true,
			massFarm: true,
			canSolo: true
		}
	}

cave = "IO9irSdIv5JNd6HtgKLS97dW"

var boss_schedule = []
var event_schedule = []


const LOOTER = 'Warious'
const ACTIONS = ['farm', 'boss', 'event', 'quest']

const COMMON_DONT_SEND_ITEMS =[MP_POT, HP_POT, 'tracker', 'computer', 'supercomputer']
const DONT_SEND_ITEMS = COMMON_DONT_SEND_ITEMS.concat(DO_NOT_SEND_ITEMS)

var last_farm_pos
var current_farm_pos
var current_boss
var current_event
var attack_mode=true
var curState
var char_action

async function useElixir()
{
	if(!character.slots.elixir)
	{
		for(let i in character.items)
		{
			if(character.items[i] && ELIXIRS.includes(character.items[i].name)) await equip(i)
		}
	}
	setTimeout(useElixir,getMsFromMinutes(60))
}

getState();
function getState()
{
	if(!curState && get(character.name)!=null)
	{ 
		curState = get(character.name)
		current_farm_pos = curState.farm_location
		char_action = (ACTIONS.includes(curState.current_action)) ? curState.current_action : 'farm'
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
		current_action: char_action,
		current_boss: current_boss,
		bosses: boss_schedule,
		current_event: current_event
	}

	set(
		character.name,
		curState
	)
}


//----------ON EVENTS---------//

// ---------{cmd: 'giveMeLoot'}
// ---------{cmd: "boss", 
//     			boss: {name: "phoenix", map: "main", x: -1184, y: 784}}
// ---------{cmd: 'event', 
//     			name: 'snowman', 
//     			event: {live: true, map: "winterland", hp: 1200, 
//         		max_hp: 1200, x: 996, y: -840}}
// ---------{mob: 'bee', coop: false}

character.on("cm", function(data){
	
	if(!MY_CHARACTERS.includes(data.name)) return
	console.log(data.message)
	if(data.message.cmd)
	{
		game_log(data.message.cmd)
		switch (data.message.cmd){
			case 'giveMeLoot':
				outer: for(i in character.items)
				{
					item = character.items[i]
					if(!item) continue
					if(!DONT_SEND_ITEMS.includes(item.name)){
						for(let pi of PERSONAL_ITEMS)
						{
							if(item.name == pi.name && item.level == pi.level) continue outer
						}
						send_item(data.name, i, item.q)
					}
				}
				send_gold(data.name, character.gold-10000000)
				break;
			case 'monsterhunt':
				checkQuest();
				break;
			case 'getBack':
				let temp = current_farm_pos
				current_farm_pos = last_farm_pos
				last_farm_pos = temp
				smart_move(current_farm_pos.location)
				break;
			case 'farm':
				char_action = 'farm'
				smart_move(current_farm_pos.location)
				break;
			case 'boss':
				character.name == 'arMAGEdon' ? mageHandleBoss(data.message.boss) : handleBoss(data.message.boss)
				break;
			case 'event':
				handleEvent(data.message.name, data.message.server)
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
			if(char_action=='farm' && !smart.moving && getDistance(character, current_farm_pos.location)> 500) smart_move(current_farm_pos.location)
		}
		else
		{
			last_farm_pos = current_farm_pos
			current_farm_pos =
			{
					mobs: [data.message.mob],
					coop: data.message.coop || true,
					massFarm: data.message.massFarm || false,
					canSolo: data.message.canSolo || false

			}
			attack_mode=true
			if(char_action=='farm')smart_move(mob)
		}
	}
	else console.warn('Unknown command')
})

//function for faster command from browser
function farm(pos) {
	send_cm(parent.party_list, pos)
}

async function handleBoss(boss)
{
	console.log('Get a boss: '+boss.name+' current action:'+char_action+'\nBosses in progress: '+boss_schedule.length)
	if(char_action == 'farm')
	{
		char_action == 'boss'
		current_boss = boss
		if(getDistance(character, current_boss)>500 && !characterMoving() ) await smart_move(current_boss)
	}
	else if(!bossReceived(boss)){
		boss_schedule.push(boss)
	}
	
}

function bossReceived(boss)
{
	for(let b of boss_schedule) {
		if(b.name==boss.name) return true
	}
	return false
}

setInterval(checkEvents, 1000)
async function checkEvents()
{
	if(!get('dragold')) return
	
	events = get('dragold')

	if(events[parent.server_region][parent.server_identifier]<Date.now() && parent.S.dragold.alive)
	{
		char_action = 'event'
		current_event = 'dragold'
		return
	}

	for(let i of Object.keys(events))
	{
		for(let j of Object.keys(events[i]))
		{
			if(parent.server_region!= i && parent.server_identifier != j && Date.now-events[i][j]<500) {
				if(parent.caracAL) parent.caracAL.deploy(null, i+j) 
				else change_server(i,j)
			}
		}
	}
}

async function handleEvent(eventName, server)
{
	console.log('Got an event: '+eventName)
	if(server && server != `${parent.server_region} ${parent.server_identifier}`)
	{
		current_event = eventName
		char_action = 'event'
		//await saveState()
		if(parent.caracAL) parent.caracAL.deploy(null, server.split(' ')[0]+server.split(' ')[1]) 
		else change_server(server.split(' ')[0], server.split(' ')[1])
	}
	if(char_action != 'event' && !FARM_BOSSES.includes(parent.ctarget?.mtype))
	{
		// current_event = { name: eventName, event: gevent }
		current_event = eventName
		char_action = 'event'
	}
	else if(!event_schedule.includes(eventName)){
		event_schedule.push(eventName)
	}
	
	if(Object.values(parent.entities).filter(e=> FARM_BOSSES.includes(e.mtype)).length<1 && !character.moving) await smart_move(parent.S[eventName])
}


async function goFarm(mob)
{
	if(FARM_LOCATIONS[mob])
	{
		current_farm_pos = FARM_LOCATIONS[mob]
	}
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
				if((i.name == 'MerchanDiser' && getDistance(get(i.name), character)< 500)  ||
				  (char_state.have_pc && getDistance(char_state, character)<500))
				{
					outer: for(it in character.items)
						{
							item = character.items[it]
							if(!item) continue
							if(!DONT_SEND_ITEMS.includes(item.name)){
								for(let pi of PERSONAL_ITEMS)
								{
									if(item.name == pi.name && item.level == pi.level) continue outer
								}
								await send_item(i.name, it, item.q).catch(() => {})
							}
						}
					await send_gold(i.name, character.gold-1000000)
					shuffleItems()
					if(itemsCount()>=42)await storeUpgradeAndCombine()
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


