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
	await unequip('mainhand')
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
	await equipTools('rod')
	changeState('Fishing...')
	while(!is_on_cooldown('fishing'))
	{
		await use_skill('fishing')
		await sleep(15000)
	}
	changeState(DEFAULT_STATE)
	await unequip('mainhand')
	scheduler(fishing)
}


async function checkBosses()
{
	changeState('Checking bosses')
	if(!check_bosses)
	{
		scheduler(checkBosses)
		return;
	}
	for(let point of BOSS_CHECK_ROUTE)
	{
		await smart_move(point)
		if(Object.values(parent.entities).filter(e=> e.mtype == point.name).length > 0)
		{
			game_log('Found: '+point.name)
			console.log('Found: '+point.name)
			await send_cm(MY_CHARACTERS,{cmd: "boss", boss: point})
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
	if(character.slots.mainhand && character.slots.mainhand.name == tool) return
	for(let i in character.items)
	{
		item = character.items[i]
		if(!item) continue;
		if( item.name == tool)
		{
			await equip(i)
		}
	}
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
		console.warn('Try to store item')
		for(i=0; i<character.items.length; i++){
			
			
			if(character.items[i] === null || ITEMS_TO_EXCHANGE_IDS.includes(G.items[character.items[i].name].id)) continue;
			let item = character.items[i]
			let gItem = G.items[character.items[i].name]
			switch(gItem.type){
				case 'material':
				case 'gem': 
				case 'quest':
				case 'pscroll':
				case 'token':
					bank_store(i) 
					break;
			}
			if(JEWELRY.includes(gItem.type) && item.level==MAX_LVL_TO_UPGRADE_JEWELRY)
			{
				bank_store(i);
			}
			
		}
		await smart_move('upgrade')
		await upgradeArmor()
		await combineItems()
	}
	catch(ex) {console.error(ex)}
	finally
	{
		shuffleItems()
		changeState(DEFAULT_STATE)
	}
    
}

function findScroll(grade)
{
	let scroll = null

	for(let i=0; i<character.items.length; i++){
		if(character.items[i] == null) continue
		if(character.items[i].name == 'scroll'+grade) 
		{
			scroll = i
			break
		}
	}
	return scroll
}

function getGrade(gItem, lvl)
{
	let grade
	for(let i=0; i<gItem.grades.length; i++)
	{
		if(gItem.grades[i] > lvl) {
			grade = i;
			break;
		}
	}
	return grade;
}

async function upgradeWeapon()
{
	changeState('Upgrading weapon..')
	for(let j=0; j<MAX_LVL_TO_UPGRADE; j++)
	{
		for(let i=0; i<character.items.length; i++)
		{
			let item = character.items[i]
			if(!item || item.level!=j) 	continue
			let gItem = G.items[item.name]
			let grade = getGrade(gItem, item.level)
			if(!UPGRADE_WEAPONS[item.name] || UPGRADE_WEAPONS[item.name].level<= item.level) continue

			if(!character.s.massproductionpp) await use_skill('massproductionpp')
			if(findScroll(grade) != null)
			{
				await upgrade(i, findScroll(grade))
			} 
			else
			{
				await buy_with_gold('scroll'+grade, 1)
				await upgrade(i, findScroll(grade))
			}
		}
	}
	changeState(DEFAULT_STATE)
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

async function upgradeArmor()
{
	changeState('Upgrading armor..')
	await smart_move('upgrade')
	if(itemsCount()==42) sellItems()
	exchangeItems()
	for(var j =0; j<MAX_LVL_TO_UPGRADE_EQUIP; j++)
	{
		for(let i=0; i<character.items.length; i++)
		{
			if(!character.items[i] || !ARMOR.includes(G.items[character.items[i].name].type) || character.items[i].level != j || !NOT_SALE_ITEMS_ID[character.items[i]] 
			|| NOT_SALE_ITEMS_ID[G.items[character.items[i].name].id].level <=j){
				continue;
			} 
			let item = character.items[i]
			let gItem = G.items[item.name]
			let grade = getGrade(gItem, item.level)

			if(!character.s.massproductionpp) await use_skill('massproductionpp')

			if(findScroll(grade) != null)
			{
				await upgrade(i, findScroll(grade))
			} 
			else
			{
				await buy_with_gold('scroll'+grade, 1)
				await upgrade(i, findScroll(grade))
			}			
		}
	}
	changeState(DEFAULT_STATE)
	upgradeWeapon()
	
}


async function combineItems()
{
	try
	{
		changeState('Compuonding..')
		for(var lvl=0; lvl<4; lvl++)
		{
			for(let slot=0; slot<character.items.length; slot++)
			{
				if(character.items[slot] == null || !JEWELRY.includes(G.items[character.items[slot].name].type) ) continue
				
				let item=character.items[slot]
				let gItem = G.items[item.name]
				if(NOT_SALE_ITEMS_ID[gItem.id] && item.level >= NOT_SALE_ITEMS_ID[gItem.id].level) continue
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
						let grade = getGrade(gItem, lvl)
						let cscrolls = await findCScroll(grade)
						if(!cscrolls) await buy_with_gold('cscroll'+grade, 1)
						if(!character.s.massproductionpp) use_skill('massproductionpp')
						await compound(items[0],items[1],items[2],findCScroll(grade))
						break;
					}
				}	
			}
		}
	}
	catch(ex) {console.error(ex)}
	finally
	{
		changeState(DEFAULT_STATE)
		sellItems()
	}
	
}

function findCScroll(grade)
{
	let scroll = null

	for(let i=0; i<character.items.length; i++){
		if(character.items[i] == null) continue
		if(character.items[i].name == 'cscroll'+grade) 
		{
			
			scroll = i
			break
		}
	}
	return scroll
}

async function sellItems()
{
	for(let i in character.items)
	{
		let item = character.items[i]
		if(item && SALE_ITEMS[G.items[item.name].id] && SALE_ITEMS[G.items[item.name].id].level <= item.level) await sell(i, item.q)
	}
}


async function exchangeItems()
{
	let exchangeItem = false
	for(let i in character.items)
	{
		if(character.items[i] && ITEMS_TO_EXCHANGE_IDS.includes(G.items[character.items[i].name].id)) 
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