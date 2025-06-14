let isGoingForLoot = false
let isGoingToBank = false
let isExchanging = false
// let isCombining = false

var state='Idling'

const DEFAULT_STATE = 'Idling'
const HP_POT = 'hpot1'
const MP_POT = 'mpot1'
const MINUTES_TO_RESET_STATE = 10

const BROOM = {name: 'broom', level: 7}
const BOOK = {name: 'wbookhs', level: 3}
const GUN = {name: 'dartgun', level: 3}

const PERSONAL_ITEMS = [ BROOM, BOOK, GUN ]
const ELIXIRS = []

var pc = false
var cyberland_check
var bank_check
var last_state_change
var check_bosses = true
var last_server_change
var attack_mode = false

var server_identifier

var merch_queue = []

async function load_module(module) {
    try {
        if (parent.caracAL) {
            await parent.caracAL.load_scripts([module]);
        } else {
            await load_code(module);
        }
    } catch (ex) {
        console.error(ex);
    }
}

async function runCharacter() {
    // Initialize modules
    await initChar();

}
runCharacter();

setInterval(useCourage, 10000)
async function useCourage(){
	if(character.mp > G.skills.mcourage.mp && !character.s.mcourage && character.moving){
		await use_skill('mcourage')
	}
}

async function initChar()
{
	await load_module('Basics')
	await load_module('MerBuisiness')
	// await load_module('Upgrading')

	let getState = get(character.name)
	cyberland_check = getState?.last_cyber_check
	bank_check = getState?.last_bank_check
	last_server_change = Date.now()
	setInterval(checkItemsCount, 5000)
	merch_queue.push(checkParty)
	// merch_queue.push(checkBank)
	merch_queue.push(checkCyberTime)
	//merch_queue.push(buyWeapon)
	// console.log(merch_queue)
	setTimeout(scheduler(buyPots),getMsFromMinutes(5))

	server_identifier = `${parent.server_region} ${parent.server_identifier}`
	
	setInterval(useBaff, 200)
	checkState()
	setInterval(saveState, 3000)
	setInterval(checkEvents, 1000)
	setInterval(checkElixirs, getMsFromMinutes(5))
	scheduler(checkBosses)
	setInterval(antiFreezingState,getMsFromMinutes(10))
}

function antiFreezingState()
{
	if(Date.now-last_state_change>getMsFromMinutes(MINUTES_TO_RESET_STATE))
	{
		changeState(DEFAULT_STATE)
	}
}

async function attackBoss()
{
	if(!attack_mode) return
	if(is_on_cooldown('attack')) setTimeout(attackBoss, 1000)
	let target = get_targeted_monster()
	target = target ? target : Object.values(parent.entities).filter(e => FARM_BOSSES.includes(e.mtype) && MERCHANT_SOLO_BOSSES.includes(e.mtype))[0]
	if(target)
	{
		change_target(target)
		if(!is_in_range(target))
		{
			await xmove(
				character.x + (target.x-character.x)/2,
				character.y + (target.y-character.y)/2
			)
			setTimeout(attackBoss, 1000)
		}
		else 
		{
			attack(target).catch(() => {});   
			loot()
			reduce_cooldown('attack', Math.min(...parent.pings))
			setTimeout(attackBoss, Math.min(0, getNextSkill('attack')))
		}
	}
}

setInterval(checkSlot, 1000)
async function checkSlot()
{
	if(!attack_mode && character.slots.mainhand.name != 'broom' && character.moving) equipTools('broom')
}

saveSelfAss()
async function saveSelfAss()
{
	if(is_on_cooldown('scare'))
	{
		setTimeout(saveSelfAss, 500)
		return
	}
	if(Object.values(parent.entities).filter(e => e.type == 'monster' && e.target == character.name).length>0)	await use_skill('scare')
	setTimeout(saveSelfAss, 1000)
}

function saveState()
{
	let state = 
	{
		x: character.x,
		y: character.y,
		map: character.map,
		last_cyber_check: cyberland_check,
		last_bank_check: bank_check,
		last_server_change: last_server_change
	}
	set(character.name, state)
}

async function checkEventOnOtherServers()
{
	if(!get('dragold')) return
	events = get('dragold')
	for(let i of Object.keys(events))
	{
		for(let j of Object.keys(events[i]))
		{
			if(Date.now-events[i][j]<500) {
				if(parent.caracAL) parent.caracAL.deploy(null, i+j) 
				else change_server(i,j)
			}
		}
	}
}

async function checkEvents()
{
	return;
	if(parent.S.lunarnewyear)
	{
		checkEventOnOtherServers()
		if(!parent.S.dragold.live) {
			dragold = get('dragold') || { EU:{} , US: {}, ASIA: {} }
			dragold[parent.server_region][parent.server_identifier] = parent.S.dragold.spawn
			set('dragold', dragold)
			if(!last_server_change || Date.now() - last_server_change > 60000) {
				let srv_indx = SERVERS.indexOf(server_identifier)
				if(srv_indx+1 == SERVERS.length) srv_indx = 0 
				else srv_indx+=1
				last_server_change = Date.now()
				saveState()
				if(parent.caracAL) parent.caracAL.deploy(null, `${SERVERS[srv_indx].split(' ')[0]}${SERVERS[srv_indx].split(' ')[1]}`) 
				else  change_server(SERVERS[srv_indx].split(' ')[0], SERVERS[srv_indx].split(' ')[1])
			}
		}
	}
		

	for(e of EVENTS)
	{
		if(parent.S[e.name])
		{
			if(parent.S[e.name].live && parent.S[e.name].live == true)
			{
				send_cm(MY_CHARACTERS, {cmd: 'event', name: e.name, server: `${parent.server_region} ${parent.server_identifier}`})
				
			}
			else if(parent.S[e.name].live === 'undefined')
			{
				send_cm(MY_CHARACTERS, {cmd: 'event', name: e.name, server: `${parent.server_region} ${parent.server_identifier}`})
				check_bosses = false
				waitEventEnds(e.name)
			}
		}
	}
}

async function waitEventEnds(name)
{
	while(parent.S[name])
	{
		await sleep(1000)
	}
	check_bosses = true
}


async function changeState(newState)
{
	if(state!=newState)
	{
		state=newState
		last_state_change = Date.now()
	}
	set_message(state)
	game_log(state, '#FF7F50')
}


async function checkState()
{
	if(state==DEFAULT_STATE )
	{

		console.log(merch_queue)
		try
		{
			for(let i in merch_queue)
			{
				let fu = merch_queue.shift()
				if(fu)
				{
					await fu()
					break
				}
			}
		}
		catch(ex)
		{
			console.error(ex)
		}
	}
	setTimeout(checkState, 1000)
}



async function checkElixirs()
{
	if(!character.slots.elixir)
	{
		for(let i in character.items)
		{
			if(character.items[i] && character.items[i].name == 'bunnyelixir') await equip(i)
		}
	}
}

async function checkBank()
{
	
	if(Date.now()-bank_check<getMsFromMinutes(MINUTES_TO_CHECKBANK))
	{
		setTimeout(scheduler(checkBank), getMsFromMinutes(5))
		return
	}
	changeState('Checking bank..')
	await smart_move('bank')
	bank_check = Date.now()
	for(let items in character.bank)
	{
		let tmpItems = character.bank[items]
		for(let item in tmpItems)
		{
			let tmpItem = tmpItems[item]
			if(!tmpItem) continue
			if(ITEMS_TO_EXCHANGE.includes(tmpItem.name) && tmpItem.q>=1000)
			{
				await bank_retrieve(items, item)
			}
		}
	}

	
	for(let i in character.items)
	{

		if(!character.items[i]) continue

		if(character.items[i].name=='seashell') 
		{
			changeState('Going to fisherman..')
			await smart_exchange('fisherman', 'seashell', i)
			
		}
		else if(character.items[i].name == 'leather')
		{
			changeState('Going to leather..')
			await smart_exchange('leathermerchant', 'leather', i)
		}
	}
	changeState(DEFAULT_STATE)
	scheduler(checkBank)
}

async function buyPots()
{
	changeState('Going for pots...')
	if(mpPotsCount()< MAX_MP_POTIONS/3) 
	{
		await smart_move('upgrade');
		await buy_with_gold(MP_POT, MAX_MP_POTIONS-mpPotsCount());
	}
	if(hpPotsCount()< MAX_HP_POTIONS/3)
	{
		await smart_move('upgrade');
		await buy_with_gold(HP_POT, MAX_HP_POTIONS-hpPotsCount())
	} 
	changeState(DEFAULT_STATE)
	scheduler(buyPots)
}


async function checkCyberTime()
{
	if(Date.now()-cyberland_check<MS_TO_CYBER_CHECK || state != DEFAULT_STATE) {
		scheduler(checkCyberTime)
		return
	}
	else if(!is_moving(character) && (Date.now()-cyberland_check>MS_TO_CYBER_CHECK || !cyberland_check) && state == DEFAULT_STATE) 
	{
		changeState('Going to pray...')
		await checkCyberlandCommand()
	}
	changeState(DEFAULT_STATE)
	scheduler(checkCyberTime)
}


async function checkItemsCount()
{
	
	if(itemsCount()>=42) 
	{
		sellItems()
		
	}
	else if(itemsCount()< 42)
	{
		await upgradeItems()
		await combineItems()
		await exchangeItems()
	}
	
}


async function useBaff()
{
	let players =Object.values(parent.entities).filter((e) => e.type=='character' && (!e.s.mluck || e.s.mluck<=900000))

	for(let p of players)
	{
		while(is_on_cooldown('mluck') || !is_in_range(p, 'mluck')) await sleep(50);
		try
		{
			await use_skill('mluck', p.name)
		}
		catch(ex)
		{
			console.warn('Error while buffing')
			console.warn(ex)
		}
	}
}
