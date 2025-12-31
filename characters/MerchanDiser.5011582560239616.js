let isGoingForLoot = false
let isGoingToBank = false
let isExchanging = false
// let isCombining = false s

var state='Idling'

const DEFAULT_STATE = 'Idling'
const HP_POT = 'hpot1'
const MP_POT = 'mpot1'
const MINUTES_TO_RESET_STATE = 10

const BROOM = {name: 'broom', level: 8}
const BOOK = {name: 'wbookhs', level: 3}

const PERSONAL_ITEMS = [ BROOM, BOOK ]
const ELIXIRS = []

var pc = false
var cyberland_check
var bank_check
var last_state_change
var check_bosses = true
var last_server_change
smart.use_town = false

var server_identifier

var merch_queue = []

var last_pool_mechagnomes

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
	// setInterval(checkItemsCount, 5000)
	merch_queue.push(checkParty)
	// merch_queue.push(checkBank)
	merch_queue.push(checkCyberTime)
	merch_queue.push(pullMechaGnomes)
	//merch_queue.push(buyWeapon)
	// console.log(merch_queue)
	setTimeout(() => {scheduler(buyPots)},getMsFromMinutes(5))

	server_identifier = `${parent.server_region} ${parent.server_identifier}`
	
	setInterval(useBaff, 200)
	checkState()
	setInterval(saveState, 3000)
	setInterval(checkEvents, 1000)
	setInterval(checkElixirs, getMsFromMinutes(5))
	scheduler(checkBosses)
	setInterval(antiFreezingState,getMsFromMinutes(10))

	// setInterval(() => {
	// 	if(character.esize>2 && locate_item("coat")==-1 && character.gold > 2000000000) {
	// 		let size = character.esize
	// 		for(let i=0; i<size-2; i++){
	// 			buy_with_gold("coat")
	// 		}
	// 	}
	// 	else if (state=="Idling") {
	// 		for(let i of character.items) {
	// 		if(!i)continue;
	// 		if(i.name == "coat" && i.level == 8) storeUpgradeAndCombine()
	// 	}
	// 	}}, 5000)
}


async function pullMechaGnomes() {
	if(!parent.party_list.includes("arMAGEdon") || Date.now() - last_pool_mechagnomes < G.monsters.mechagnome.respawn * 1000) return merch_queue.push(pullMechaGnomes)
	changeState("pulling")
	try {
		await smart_move("mechagnome").then(async() => { 
			if(Object.values(parent.entities).filter(e => e.mtype == "mechagnome").length>=4) {
				parent.socket.emit("eval", {command: "loh"});
				send_cm("arMAGEdon", "Summon")
				await sleep(3000)
				if(character.map=="Cyberland") leave()
				else last_pool_mechagnomes = Date.now()
			}
			else {
				leave()
			}
		})
	}
	catch(ex) {
		console.warn(`Error while pulling gnomes\n ${ex}`)
	}
	merch_queue.push(pullMechaGnomes)
	
	changeState(DEFAULT_STATE)
}

function antiFreezingState()
{
	if(Date.now-last_state_change>getMsFromMinutes(MINUTES_TO_RESET_STATE))
	{
		changeState(DEFAULT_STATE)
	}
}

saveSelfAss()
async function saveSelfAss()
{
	if(is_on_cooldown('scare'))
	{
		setTimeout(saveSelfAss, 500)
		return
	}
	if(Object.values(parent.entities).filter(e => e.type == 'monster' && e.target == character.name).length>0 && character.hp< character.max_hp*0.5)	await use_skill('scare')
	setTimeout(saveSelfAss, 1000)
}

function on_magiport(name) 
{
	if(name == "arMAGEdon") {
		accept_magiport(name).then(async() => {
			await sleep(700)	
			if(smart.moving) stop('smart').catch(() => {});
			stop('teleport').catch(() => {})
			change_target(null)
			if(character.moving) stop('move').catch(() => {})
		});
	}
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
			if((parent.S[e.name].live && parent.S[e.name].live == true) || parent.S[e.name].live == null)
			{
				if(e.name == "grinch" && parent.s[e.name].hp > 5000000) continue
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
	changeState('Pots...')
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
		changeState('Pray...')
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
