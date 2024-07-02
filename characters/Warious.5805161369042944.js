const TARGETING_BLACK_LIST = ''

const MAINHAND = { name: 'xmace', lvl: 6}
const OFFHAND = {name: 'fireblade', lvl: 7}

const HP_POT = 'hpot1'
const MP_POT = 'mpot1'


const DO_NOT_SEND_ITEMS = []
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

async function runCharacter() {
    // Initialize modules
    await initialize_character();

}
runCharacter();

async function initialize_character() {
    
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
	useStomp()
	useShell()
	if(!current_farm_pos.isCoop && character.level>67) useMassAgr()
}

async function useMassAgr()
{
	if(!is_on_cooldown('agitate') && Object.values(parent.entities).filter(e => current_farm_pos.Mobs.includes(e.mtype)).length > 2)
	{
		await use_skill('agitate')
		reduce_cooldown("agitate", Math.min(...parent.pings));
	}
}

setInterval(useCharge, 40000)
async function useCharge()
{
	if(!is_on_cooldown('charge'))
	{
		await use_skill('charge')
		reduce_cooldown("charge", Math.min(...parent.pings));
	}
}

async function useShell()
{
	if(!is_on_cooldown('hardshell') && character.hp < character.max_hp/2)
	{
		await use_skill('hardshell')
		reduce_cooldown("hardshell", Math.min(...parent.pings));
	}
}

async function useStomp()
{
	
	if(!is_on_cooldown('stomp') )
	{
		let switched = await switchToBasher()
		if(switched == true)
		{
			await use_skill('stomp');
			reduce_cooldown('stomp', Math.min(...parent.pings));
			
	}
	}
	else
	{
		await switchToMainWeapon();
	}
}

async function switchToMainWeapon()
{
	let main
	let off
	for(let i in character.items)
	{
		item = character.items[i]
		if(item && item.name == MAINHAND.name && item.level == MAINHAND.lvl) main = i
		else if(item && item.name == OFFHAND.name && item.level == OFFHAND.lvl) off = i
	}
	if(main && off)
	{
		await equip_batch([{num: main, slot: 'mainhand'},{num: off, slot: 'offhand'}])
	}
}

async function switchToBasher()
{
	if(character.slots.mainhand.name == 'basher') return true
	for(let i in character.items)
	{
		item = character.items[i]
		if(item && item.name == 'basher')
		{
			await unequip("offhand")
			await equip(i)
			return true
		}
	}
	return false
}

function myAttack(target)
{
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
		set_message("Attacking");
		attack(target).catch(() => {});
		reduce_cooldown("attack", Math.min(...parent.pings));
	}
}