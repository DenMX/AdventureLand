
checkInventory()
async function checkInventory()
{
	try{
		if(itemsCount() > 15){
			await sellItems()
			await upgradeItems()
			await combineItems()
		}
	}
	catch{}
	finally
	{
		setTimeout(checkInventory, 10000)
	}
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

exchangeItems()


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