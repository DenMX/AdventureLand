
checkInventory()
async function checkInventory()
{
	if(character.items.length > 25){
		await upgradeArmor()
		await combineItems()
	}
	setTimeout(checkInventory, getMsFromMinutes(1))
}

checkPots()
async function checkPots()
{
	for(let i of getMyCharactersOnline())
	{
		if(character.name == i.name || i.name == 'MerchanDiser') continue;
		let char_state = await get(i.name)
		if(!char_state.have_pc && getDistance(char_state, character) < 650)
		{
			let hp_pots_count = MAX_HP_POTIONS - char_state.hp_pot
			let mp_pots_count = MAX_MP_POTIONS - char_state.mp_pot
			if(char_state.hp_pot < MAX_HP_POTIONS*BUY_HP_POTS_AT_RATIO)
			{
				await buy_with_gold(char_state.hpot_grade, hp_pots_count)
				sendPots(char_state.name, char_state.hpot_grade, hp_pots_count)
			}
			if(char_state.mp_pot < MAX_MP_POTIONS*BUY_MP_POTS_AT_RATIO)
			{
				await buy_with_gold(char_state.mpot_grade, mp_pots_count)
				sendPots(char_state.name, char_state.mpot_grade, mp_pots_count)
			}
		}
	}
	setTimeout(checkPots, getMsFromMinutes(1))
}

async function sendPots(char, pot, count)
{
	for(let i in character.items)
	{
		let item = character.items[i];
		if(!item) continue;
		if(item.name==pot) 
		{
			await send_item(char, i, count);
			return;
		}
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
	
	for(let j=0; j<MAX_LVL_TO_UPGRADE; j++)
	{
		for(let i=0; i<character.items.length; i++)
		{
			let item = character.items[i]
			if(!item || item.level!=j) 	continue
			let gItem = G.items[item.name]
			let grade = getGrade(gItem, item.level)
			if(!UPGRADE_WEAPONS[item.name] || UPGRADE_WEAPONS[item.name].level<= item.level) continue

			if(findScroll(grade) != null)
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
					await upgrade(i, findScroll(grade))
				}
				catch(ex)
				{
					console.warn(ex)
				}
			}
		}
	}
}

async function upgradeArmor()
{	
	if(itemsCount()==42) sellItems()
	for(var j =0; j<MAX_LVL_TO_UPGRADE_EQUIP; j++)
	{
		for(let i=0; i<character.items.length; i++)
		{
			if(!character.items[i] || !ARMOR.includes(G.items[character.items[i].name].type) || character.items[i].level != j || !NOT_SALE_ITEMS_ID[G.items[character.items[i].name].id] ||
				(NOT_SALE_ITEMS_ID[G.items[character.items[i].name].id] && NOT_SALE_ITEMS_ID[G.items[character.items[i].name].id].level <=j)){
				continue;
			} 
			let item = character.items[i]
			let gItem = G.items[item.name]
			let grade = getGrade(gItem, item.level)


			if(findScroll(grade) != null)
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
					await upgrade(i, findScroll(grade))
				}
				catch(ex)
				{
					console.warn(ex)
				}
			}			
		}
	}
	upgradeWeapon()
}


async function combineItems()
{
	try
	{
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
						try
						{
							if(!cscrolls) await buy_with_gold('cscroll'+grade, 1)
							await compound(items[0],items[1],items[2],findCScroll(grade))
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
	catch(ex) {console.error(ex)}
	finally
	{
		sellItems()
	}
	
}

checkCraft()
async function checkCraft()
{
	for(let i in character.items)
	{
		let item = character.items[i]
		if(!item) continue
		if(item.name == 'feather0' && item.q>20)
		{
			for(let j=0; j< item.q/20; j++)
			{
				await buy_with_gold('shoes')
				await auto_craft('wingedboots')
			}
		}
		else if(item.name == 'feather0' && item.q<20) break
	}
	setTimeout(checkCraft, getMsFromMinutes(5))
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
		if(!item) continue
		if((SALE_ITEMS[item.name] && SALE_ITEMS[item.name].level <= item.level) || ITEMS_TO_SALE.includes(item.name)) await sell(i, item.q)
	}
}

exchangeItems()
async function exchangeItems()
{
	let exchangeItem = false
	for(let i in character.items)
	{
		if(character.items[i] && ['box','gem','quest'].includes(G.items[character.items[i].name].type) 
			&& character.items[i].q >= G.items[character.items[i].name].e) 
		{
			let e  = await exchange(i)
			if(e.success = true) exchangeItem = true
		}
	}
	if(exchangeItem) exchangeItems()
	else setTimeout(exchangeItems, getMsFromMinutes(2))
}

buyPots()
async function buyPots()
{
	if(mpPotsCount()< MAX_MP_POTIONS*BUY_MP_POTS_AT_RATIO) 
	{
		await buy_with_gold(MP_POT, MAX_MP_POTIONS-mpPotsCount());
	}
	if(hpPotsCount()< MAX_HP_POTIONS*BUY_HP_POTS_AT_RATIO)
	{
		await buy_with_gold(HP_POT, MAX_HP_POTIONS-hpPotsCount())
	} 
	setTimeout(buyPots,getMsFromMinutes(5))
}