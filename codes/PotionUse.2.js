let use_hp_flask_at_percent = 0.5
let user_mp_flask_at_percent = 0.9



const MAX_HP_POTIONS = 1000
const MAX_MP_POTIONS = 6000

const BUY_MP_POTS_AT_RATIO = 0.5
const BUY_HP_POTS_AT_RATIO = 0.5



async function mpPotsCount()
{
	let count = 0;
	inv: for(let i=0; i<character.items.length; i++)
	{
		let item= character.items[i]
		if(!item)continue
		if(item.name == MP_POT)
		{
			count = item.q
			break inv
		}
	}
	
	try{
		if(count==0 && !pc)
		{
			await smart_move('upgrade')
			await buy_with_gold(MP_POT, MAX_MP_POTIONS)
		}
			
	}
	catch{}
	finally{
		
		return count
	}
	
}

async function hpPotsCount()
{
	let count = 0;
	for(let i=0; i<character.items.length; i++)
	{
		let item= character.items[i]
		if(!item)continue
		if(item.name == HP_POT) 
		{
			count = item.q
			break;
		}
	}

	try{
		if(count==0 && !pc)
		{
			await smart_move('upgrade')
			await buy_with_gold(HP_POT, MAX_HP_POTIONS)
		}
			
	}
	catch{}
	finally{
		
		return count
	}
}



setInterval(UseFlask, 300)
function UseFlask(){

	if(character.c?.town) return
  	if (!character.rip && (character.hp < character.max_hp * use_hp_flask_at_percent) || (character.name == 'MerchanDiser' && character.hp < character.max_hp*0.9)) {
	  if (can_use("use_hp")) {
	    use_skill('use_hp');
    	}
 	}

	if (character.mp < character.max_mp * 0.8 && !character.rip) {
		if (can_use("use_mp")) {
		use_skill('use_mp');
		}
	}
}