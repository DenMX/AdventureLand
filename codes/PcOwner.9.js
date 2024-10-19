
checkInventory()
async function checkInventory()
{
	if(itemsCount() > 25){
		await upgradeItems()
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
			sendElixir(i.name)
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

async function sendElixir(name) {
	if(!parent.entities[name]) return
	ctype = parent.entities[name].ctype
	for(let i in character.items) {
		item = character.items[i]
		if(!item) continue
		switch (ctype) {
			case 'warrior':
				if(item.name.includes('elixirstr'))
				await send_item(name, i, item.q)
			break;
			case 'mage':
				if(!parent.entities[name].slots.elixir) {
					if(item.name.includes('elixirint'))
					await send_item(name, i, item.q/2)
				}
			break;
		}
	}
}

async function upgradeItems()
{
	if(itemsCount() == 42) sellItems()
	try
	{
		exchangeItems()
		for(var j =0; j<MAX_LVL_TO_UPGRADE_EQUIP; j++)
		{
			for(let i=0; i<character.items.length; i++)
			{
				let item = character.items[i]
				if(item && NOT_SALE_ITEMS_ID[item.name] && NOT_SALE_ITEMS_ID[item.name].level > j && item.level == j) 
				{
					let grade = 'scroll'+item_grade(item)

					if(locate_item(grade) >= 0)
					{
						try
						{
							if(character.ctype=='merchant' && !character.s.massproductionpp) await use_skill('massproductionpp')
							await upgrade(i, locate_item(grade))
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
							await buy_with_gold(grade, 1)
							if(character.ctype=='merchant' && !character.s.massproductionpp) await use_skill('massproductionpp')
							await upgrade(i, locate_item(grade))
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
						if(subsItem && item.name == subsItem.name && item.level == subsItem.level)
						{
							items.push(subSlot)
						}
						if(items.length>=3)
						{
							console.error(item)
							let grade = getGrade(gItem, lvl)
							let cscrolls = await findCScroll(grade)
							try
							{
								if(cscrolls>=0)
								{
									if(character.ctype=='merchant' && !character.s.massproductionpp) await use_skill('massproductionpp')
									await compound(items[0],items[1],items[2],findCScroll('cscroll'+grade))
									break;
								} 
								else{
									await buy_with_gold('cscroll'+grade, 1)
									if(character.ctype=='merchant' && !character.s.massproductionpp) await use_skill('massproductionpp')
									await compound(items[0],items[1],items[2],findCScroll('cscroll'+grade))
									break;
								}
								
								
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


async function sellItems()
{
	for(let i in character.items)
	{
		let item = character.items[i]
		if(!item) continue
		if(ITEMS_TO_SALE.includes(item.name)) await sell(i, item.q)
	}
}

exchangeItems()
async function exchangeItems()
{
	let exchangeItem = false
	for(let i in character.items)
	{
		let item = character.items[i]
		if(item && G.items[item.name].e && item.q >= G.items[item.name].e) 
		{
			let e  = await exchange(i).catch(()=>{})
			if(e.success == true) exchangeItem = true
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