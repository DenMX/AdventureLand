async function upgradeItems()
{
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
							console.warn(item)
							if(character.ctype == 'merchant' && !character?.s['massproductionpp'] && character.mp - G.skills.massproductionpp.mp>0) await use_skill('massproductionpp')
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
							if(character.ctype == 'merchant' && !character.s['massproductionpp'] && character.mp - G.skills.massproductionpp.mp>0) await use_skill('massproductionpp')
							console.warn(item)
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
				if(!item || !JEWELRY_TO_UPGRADE[item.name] || JEWELRY_TO_UPGRADE[item.name].level <= item.level) continue
				let gItem = G.items[item.name]
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
							if(character.ctype == 'merchant' && !character.s.massproductionpp && character.mp - G.skills.massproductionpp.mp>0) await use_skill('massproductionpp')
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
	if(itemsCount()>=42 && character.ctype=='merchant') scheduler(storeUpgradeAndCombine)
	else if (itemsCount()>= 42 && character.ctype != 'merchant') await storeUpgradeAndCombine()
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
	else setTimeout(exchangeItems, getMsFromMinutes(1))
}

async function storeUpgradeAndCombine()
{
	if(character.type=='merchant')changeState('Banking...')
	await smart_move('bank')
	try 
	{
		console.warn('Storing items...')
		out: for(i=0; i<character.items.length; i++){
			
			
			if(character.items[i] === null) continue;
			let item = character.items[i]
			for (let j of PERSONAL_ITEMS)
			{
				if(item.name == j.name && item.level == j.level) continue out
			}
			let gItem = G.items[character.items[i].name]
			if(ITEM_TYPES_TO_STORE.includes(gItem.type)){
				bank_store(i) 
				break;
			}
			if((JEWELRY_TO_UPGRADE[item.name] && item.level==JEWELRY_TO_UPGRADE[item.name].level) || (NOT_SALE_ITEMS_ID[item.name] && item.level == NOT_SALE_ITEMS_ID[item.name].level))
			{
				bank_store(i);
			}
			
		}
		
	}
	catch(ex) {console.error(ex)}
	finally
	{

		await smart_move('main')
		upgradeItems()
		combineItems()
		exchangeItems()
		if(character.type=='merchant')changeState(DEFAULT_STATE)
	}
    
}