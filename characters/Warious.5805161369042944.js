const TARGETING_BLACK_LIST = ''

const MAINHAND = {name: 'fireblade', lvl: 8}
const OFFHAND = { name: 'xmace', lvl: 6}
const BASHER = {name: 'basher', lvl: 4}
const LOLIPOP = {name: 'ololipop', lvl: 7}
const AXE = {name: 'bataxe', lvl: 5}

const HP_POT = 'hpot1'
const MP_POT = 'mpot1'


const DO_NOT_SEND_ITEMS = ['elixirstr0', 'elixirstr1', 'elixirstr2']
var pc = false


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


async function useElixir()
{
	if(!character.slots.elixir)
	{
		let elixirs = ['elixirstr0', 'elixirstr1', 'elixirstr2']
		for(let i in character.items)
		{
			if(elixirs.includes(character.items[i].name)) await equip(i)
		}
	}
	setTimeout(useElixir,getMsFromMinutes(60))
}



async function runCharacter() {
    // Initialize modules
    await initialize_character();

}
runCharacter();

async function initialize_character() {
    // await load_module('Mover')
	await load_module('Basics')
    await load_module('PotionUse')
    await load_module('State')
    await load_module('MainBehavior')
	for(let i in character.items)
    {
        if(!character.items[i]) continue;
        if(character.items[i].name == 'computer' || character.items[i].name == 'supercomputer')
        {
            pc = true
            await load_module('MerchantItems')
            await load_module('PcOwner')
        }
    }
	useElixir()
}


function kite(target)
{
	if(!attack_mode || !target) return
	
	let distance = getDistance(target, character)
	if(target.range<character.range && distance <= (character.range-target.range)/2 && get_target_of(target) == character)
    {
        move(
            character.x+(-character.range/2+(Math.random()*character.range)),
            character.y+(-character.range/2+(Math.random()*character.range))
        )
    }
}

async function useSkills(target)
{
	
	await useStomp()
	await useCleave(target)
	useShell()
	if(!current_farm_pos.isCoop && character.level>67) useMassAgr()
	
	await switchToMainWeapon();
	
}

setInterval(useDash, 1500)
async function useDash(target)
{
	target = get_targeted_monster();
	if(target && getDistance(target, character)>100 && character.mp-G.skills.dash.mp > character.max_mp*0.1)
	{
		await use_skill('dash', target)
	}
}

async function useMassAgr()
{
	if(!is_on_cooldown('agitate') && Object.values(parent.entities).filter(e => current_farm_pos.Mobs.includes(e.mtype) && (e.target!=character.name || e.target!='Archealer') && is_in_range(e, 'agitate')).length > 2 && !current_farm_pos.isCoop)
	{
		await use_skill('agitate').catch(() => {})
		reduce_cooldown("agitate", Math.min(...parent.pings));
	}
}

setInterval(useCharge, 40000)
async function useCharge()
{
	if(!is_on_cooldown('charge') && character.mp - G.skills.charge.mp > character.max_mp*0.1)
	{
		await use_skill('charge').catch(() => {})
		reduce_cooldown("charge", Math.min(...parent.pings));
	}
}

async function useShell()
{
	if(!is_on_cooldown('hardshell') && (character.hp < character.max_hp*0.3 || Object.values(parent.entities).filter(e => e.target == character.name).length>3))
	{
		await use_skill('hardshell').catch(() => {})
		reduce_cooldown("hardshell", Math.min(...parent.pings));
	}
}

async function useStomp()
{
	
	if(!is_on_cooldown('stomp') && character.mp-G.skills.stomp.mp > character.max_mp*0.1 )
	{
		let switched = await switchToBasher()
		if(switched == true)
		{
			await use_skill('stomp').catch(() => {})
			reduce_cooldown('stomp', Math.max(...parent.pings));
		}
	}
	else
	{
		await switchToMainWeapon();
	}
}

async function useCleave(target)
{
	if(!is_on_cooldown('cleave') && !FARM_BOSSES.includes(target.mtype) &&character.mp-G.skills.cleave.mp > character.max_mp*0.1)
	{
		let switched = await switchToCleave()
		if(switched == true)
		{
			await use_skill('cleave').catch(() => {})
			reduce_cooldown('cleave', Math.max(...parent.pings));
		}
	}
	else
	{
		
	}
}

async function switchToMainWeapon()
{
	let curr_main = character.slots.mainhand
	let curr_off = character.slots?.offhand
	let desired_main = MAINHAND
	let desired_off = (!current_farm_pos.isCoop && action=='farm') ? LOLIPOP : OFFHAND
	if((curr_main && curr_off) && (curr_main.name == desired_main.name && curr_main.level == desired_main.lvl) && (curr_off.name == desired_off.name && curr_off.level == desired_off.lvl)) return
	if((curr_main.name == desired_main.name && curr_main.level == desired_main.lvl) && (!curr_off || curr_off.name != desired_off.name || curr_off.level != desired_off.lvl))
	{
		for(let i in character.items)
		{
			let item = character.items[i]
			if(!item) continue
			if(item.name == desired_off.name && item.level == desired_off.lvl) 
			{
				await equip(i, 'offhand')
			}
		}
	}
	else if(!curr_main || !curr_off || (curr_main.name != desired_main.name || curr_main.level != desired_main.lvl) && (curr_off.name != desired_off.name || curr_off.level != desired_off.lvl))
	{
		let main_slot
		let off_slot
		for(let i in character.items)
		{
			item = character.items[i]
			if(item && item.name == MAINHAND.name && item.level == MAINHAND.lvl) main_slot = i
			else if(item && item.name == OFFHAND.name && item.level == OFFHAND.lvl) off_slot = i
		}
		if(main_slot && off_slot)
		{
			await equip_batch([{num: main_slot, slot: 'mainhand'},{num: off_slot, slot: 'offhand'}])
		}
	}
	
}

async function switchToCleave()
{
	if(character.slots.mainhand.name == AXE.name) return true
	for(let i in character.items)
	{
		item = character.items[i]
		if(item && item.name == AXE.name && item.level == AXE.lvl)
		{
			if(character.slots.offhand)await unequip("offhand")
			await equip(i)
			return true
		}
	}
	return false
}

async function switchToBasher()
{
	if(character.slots.mainhand.name == BASHER.name) return true
	for(let i in character.items)
	{
		item = character.items[i]
		if(item && item.name == BASHER.name && item.level == BASHER.lvl)
		{
			if(character.slots.offhand)await unequip("offhand")
			await equip(i)
			return true
		}
	}
	return false
}

function myAttack(target)
{
	if((action == 'boss' || action =='event') && getDistance(get('Archealer'), character)> 300) return
	kite(target)
	change_target(target);
	useSkills(target);


	if(!is_in_range(target))
	{
		move(
			character.x+(target.x-character.x)/2,
			character.y+(target.y-character.y)/2
			);
		// Walk half the distance
	}
	else if(can_attack(target))
	{
		attack(target).catch(() => {});
		reduce_cooldown("attack", Math.max(...parent.pings));
	}
}