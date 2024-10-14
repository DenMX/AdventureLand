const MINUTES_TO_CHECKBANK = 60
const ITEMS_COUNT_TO_STORE = 38
const MS_TO_CYBER_CHECK = 900000
const ITEMS_COUNT_TO_UPGRADE = 37

const FISHING_POS = {x: -1366, y: 210, map: 'main'}
const MINING_POS = {x: 279, y: -103, map: 'tunnel'}

const BOSS_CHECK_ROUTE = [
	{name: "phoenix", map: "main", x: -1184, y: 784},
	{name: "phoenix", map: "main", x: 641, y: 1803},
	{name: "phoenix", map: "main", x: 1188, y: -193},
	{name: "phoenix", map: "halloween", x: 8, y: 631},
	{name: "greenjr", map: "halloween", x: -569, y: -412},
	{name: "fvampire", map: "halloween", x: -406, y: -1643},
	{name: "phoenix", map: "cave", x: -181, y: -1164},
	{name: "mvampire", map: "cave", x: -181, y: -1164},
	{name: "mvampire", map: "cave", x: 1244, y: -23},
	{name: "jr", map: "spookytown", x: -784, y: -301},
	{name: "skeletor", map: "arena", x: 247, y: -558}
]

const ITEM_TYPES_TO_STORE = ['dungeon_key','material', 'gem', 'quest', 'pscroll', 'token', 'offering', 'elixir']

async function smart_exchange(npc, itemName, slot)
{
	await smart_move(npc)
	while(Object.values(character.items).filter((e) => e && e.name==itemName && e.q>19) && itemsCount()<42)
	{
		await exchange(slot)
	}
	changeState(DEFAULT_STATE)
}

scheduler(mining)
async function mining()
{
	if(itemsCount()==42 || is_on_cooldown('mining'))
	{
		scheduler(mining)
		return
	}
	changeState('Going to mining..')
	await smart_move(MINING_POS)
	await equipTools('pickaxe')
	changeState('Mining...')
	while(!is_on_cooldown('mining'))
	{
		await use_skill('mining')
		await sleep(15000)
	}
	changeState(DEFAULT_STATE)
	await equipTools('broom')
	scheduler(mining)
}

scheduler(fishing)
async function fishing()
{
	if(itemsCount()==42 || is_on_cooldown('fishing')) 
	{
		scheduler(fishing)
		return
	}
	changeState('Going to fishing')
	await smart_move(FISHING_POS)
	try {
		let rod = await equipTools('rod')
		if(rod) {
			changeState('Fishing...')
			while(!is_on_cooldown('fishing'))
			{
				await use_skill('fishing')
				await sleep(15000)
			}
		}
	}
	catch(Ex)
	{
		console.warn('Error fishing')
		console.error(Ex)
	}
	finally {
		changeState(DEFAULT_STATE)
		await equipTools('broom')
		scheduler(fishing)
	}
}


async function checkBosses()
{
	
	if(!check_bosses)
	{
		scheduler(checkBosses)
		return;
	}
	changeState('Checking bosses')
	for(let point of BOSS_CHECK_ROUTE)
	{
		await smart_move(point)
		if(Object.values(parent.entities).filter(e=> e.mtype == point.name).length > 0)
		{
			game_log('Found: '+point.name)
			console.log('Found: '+point.name)
			if(point.name == 'skeletor' && Object.values(parent.entities).filter(e => e.mtype == 'skeletor' && e.hp_level>5).length>0)continue;
			await send_cm('arMAGEdon',{cmd: "boss", boss: point})
		}
		else 
		{
			game_log(point.name+' not found')
			console.log(point.name+' not found')
		}
	}
	await smart_move('main')
	changeState(DEFAULT_STATE)
	scheduler(checkBosses)
}

async function equipTools(tool)
{
	if(character.slots.mainhand && character.slots.mainhand.name == tool) return true
	for(let i in character.items)
	{
		item = character.items[i]
		if(!item) continue;
		if( item.name == tool)
		{
			await equip(i)
			return true
		}
	}
	return false
}

async function checkParty()
{
	if(itemsCount()>37)
	{
		setTimeout(scheduler(checkParty), getMsFromMinutes(2))
		return
	}
	

	// DEPRICATED
	let charToGo = 
	{
		name: null, hp_pot: null, mp_pot: null, take_items: false
	}

	changeState('Checking party')
	for (let char of getMyCharactersOnline()) {
		if(char.name == character.name) continue
		var member = get(char.name)
		if(member)
		{
			if(member.hp_pot<MAX_HP_POTIONS*BUY_HP_POTS_AT_RATIO)
			{
				
				charToGo.name = member.name
				charToGo.hp_pot = MAX_HP_POTIONS-member.hp_pot
				if(hpPotsCount()< MAX_HP_POTIONS-member.hp_pot)
				{
					await smart_move('upgrade')
					await buy_with_gold(HP_POT, charToGo.hp_pot)
				} 
			}
			if(member.mp_pot<MAX_MP_POTIONS*BUY_MP_POTS_AT_RATIO)
			{
				charToGo.name = member.name
				charToGo.mp_pot = MAX_MP_POTIONS-member.mp_pot
				if(mpPotsCount()< MAX_MP_POTIONS- member.mp_pot) 
				{
					await smart_move('upgrade')
					await buy_with_gold(MP_POT, charToGo.mp_pot)
				}
			}
			if(member.items_count>31)
			{
				charToGo.name = member.name
				charToGo.take_items = true
			}
			if(charToGo.name)
			{	changeState(DEFAULT_STATE)
				setTimeout(scheduler(checkParty), 20000)
				goToChar(charToGo)
				return;
			}
		}
	}
	setTimeout(scheduler(checkParty), 20000)
    changeState(DEFAULT_STATE)
}

async function goToChar(charToGo)
{
	try{
		changeState('Going for loot...')
		await smart_move(get(charToGo.name));
		if(charToGo.take_items) takeLoot(charToGo.name)
		for(let i=0; i< character.items.length; i++)
		{
			item = character.items[i];
			if(!item) continue
			if(item.name == HP_POT && charToGo.hp_pot>0)
			{
				game_log('Sending HP pots to '+charToGo.name + ' '+charToGo.hp_pot, '#FF7F50')
				await send_item(charToGo.name, i, charToGo.hp_pot);
			} 
			if(item.name == MP_POT && charToGo.mp_pot>0)
			{
				game_log('Sending MP pots to '+charToGo.name + ' '+charToGo.mp_pot, '#FF7F50')
				await send_item(charToGo.name, i, charToGo.mp_pot);
			} 
		}
	}
	catch(ex)
	{
		console.error(ex)
	}
	finally
	{
		await smart_move('main')
		changeState(DEFAULT_STATE)	
		setTimeout(scheduler(checkParty), 20000)
	}	
}

async function takeLoot(char)
{
	game_log('Take loot from '+char, '#FF7F50')
    await send_cm(char, {cmd: 'giveMeLoot'})
}

async function storeUpgradeAndCombine()
{
	
	try 
	{
		console.warn('Storing items...')
		for(i=0; i<character.items.length; i++){
			
			
			if(character.items[i] === null || ITEMS_TO_EXCHANGE_IDS.includes(G.items[character.items[i].name].id)) continue;
			let item = character.items[i]
			let gItem = G.items[character.items[i].name]
			if(ITEM_TYPES_TO_STORE.includes(gItem.type)){
				bank_store(i) 
				break;
			}
			if(JEWELRY.includes(gItem.type) && item.level==MAX_LVL_TO_UPGRADE_JEWELRY)
			{
				bank_store(i);
			}
			
		}
		
	}
	catch(ex) {console.error(ex)}
	finally
	{

		await smart_move('upgrade')
		await upgradeItems()
	}
    
}

async function buyWeapon()
{
	if(character.gold > 100000000 && itemsCount()<= 37)
	{
		changeState('Buying weapon..')
		cnt = itemsCount()
		for(let i =0; i<42-cnt-1; i++)
		{
			await buy_with_gold('bow')
		}
	}
	upgradeWeapon()
	changeState(DEFAULT_STATE)
	setTimeout(scheduler(buyWeapon), getMsFromMinutes(5))
}

async function upgradeItems()
{
	changeState('Upgrading armor..')
	try
	{
		await smart_move('upgrade')
		exchangeItems()
		for(var j =0; j<MAX_LVL_TO_UPGRADE_EQUIP; j++)
		{
			for(let i=0; i<character.items.length; i++)
			{
				let item = character.items[i]
				if(item && NOT_SALE_ITEMS_ID[item.name] && NOT_SALE_ITEMS_ID[item.name].level > j && item.level == j) 
				{
					let grade = item_grade(item)

					if(!character.s.massproductionpp) await use_skill('massproductionpp')
	
					if(locate_item('scroll'+grade) != -1)
					{
						try
						{
							await upgrade(i, findScroll(grade))
						}
						catch(ex)
						{
							console.warn(ex)
						}
					} 
					else
					{
						try
						{
							await buy_with_gold('scroll'+grade, 1)
							await upgrade(i, locate_item('scroll'+grade))
						}
						catch(ex)
						{
							console.warn(ex)
						}
					}
				}
				
			}
		}
	}
	catch(Ex) { console.error(Ex)}
	finally
	{
		changeState(DEFAULT_STATE)
	}
	
}


async function combineItems()
{
	try
	{
		for(var lvl=0; lvl<4; lvl++)
		{
			for(let slot=0; slot<character.items.length; slot++)
			{
				let item=character.items[slot]
				if(item && JEWELRY_TO_UPGRADE[item.name] && item.level >= JEWELRY_TO_UPGRADE[item.name].level)
				{
					var items = []
					items.push(slot)
	
					for(let subSlot=0; subSlot<character.items.length; subSlot++)
					{
						if(!character.items[subSlot] || slot==subSlot) continue
						let subsItem = character.items[subSlot]
						if(item.name == subsItem.name && item.level == subsItem.level)
						{
							items.push(subSlot)
						}
						if(items.length>=3)
						{
							let grade = item_grade(item)
							let cscrolls = await locate_item('cscroll'+grade)
							try
							{
								if(cscrolls<0) await buy_with_gold('cscroll'+grade, 1)
								if(!character.s.massproductionpp) await use_skill('massproductionpp')
								await compound(items[0],items[1],items[2],locate_item('cscroll'+grade))
								break;
							}
							catch(ex)
							{
								console.warn(ex)
							}
						}
					}
				}
			}
		}
	}
	catch(ex) {console.error(ex)}
	finally
	{
		changeState(DEFAULT_STATE)
	}
	
}


async function sellItems()
{
	changeState('Selling items...')
	for(let i in character.items)
	{
		let item = character.items[i]
		if(!item) continue
		if(ITEMS_TO_SALE.includes(item.name)) await sell(i, item.q)
	}
	shuffleItems()
	if(itemsCount() == 42)
	{
		await smart_move('bank').then(storeUpgradeAndCombine)
	}
	else
	{
		upgradeItems()
	}
}


async function exchangeItems()
{
	let exchangeItem = false
	for(let i in character.items)
	{
		let item = character.items[i]
		if(item && G.items[item.name].e && G.items[item.name].e< item.q) 
		{
			let e  = await exchange(i)
			if(e.success = true) exchangeItem = true
		}
	}
	if(exchangeItem) exchangeItems()
}

async function checkCyberlandCommand() {
	try {
		await smart_move("main");
		await smart_move("cyberland");
		// Wait for transport
		await sleep(500);

		cyberland_check = Date.now();
		parent.socket.emit("eval", {command: "give spares"});
		await sleep(2000);
	} catch (ex) {
		console.error(ex);
	} finally {
		while (character.map === "cyberland") {
			await leave();
			await sleep(1000);
		}
	}
	setTimeout(scheduler(checkCyberTime), MS_TO_CYBER_CHECK)
}