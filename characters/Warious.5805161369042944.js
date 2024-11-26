const TARGETING_BLACK_LIST = ''

const MAINHAND = {name: 'candycanesword', level: 9}
const OFFHAND = { name: 'fireblade', level: 9}
const BASHER = {name: 'basher', level: 7}
const MASS_MAINHAND = {name: 'ololipop', level: 9}
const LOLIPOP = {name: 'ololipop', level: 9}
const AXE = {name: 'scythe', level: 5}
const SHIELD = {name: 'sshield', level: 8}

const PERSONAL_ITEMS = [MAINHAND, OFFHAND, BASHER, LOLIPOP, AXE, MASS_MAINHAND, SHIELD]

const HP_POT = 'hpot1'
const MP_POT = 'mpot1'


const DO_NOT_SEND_ITEMS = ['elixirstr0', 'elixirstr1', 'elixirstr2']
var pc = false
let desired_main
let desired_off

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
			if(elixirs.includes(character.items[i]?.name)) await equip(i)
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
	await load_module('Basics')
    await load_module('State')
    await load_module('MainBehavior')
	for(let i in character.items)
    {
        if(!character.items[i]) continue;
        if(character.items[i].name == 'computer' || character.items[i].name == 'supercomputer')
        {
            pc = true
            await load_module('PcOwner')
        }
    }
	useElixir()
	setInterval(useSkills, 1000)
	setInterval(selectMainWeapon,330)
	setInterval(selectOffWeapon,330)
}


async function useSkills()
{
	target = parent.ctarget
	if((char_action == 'boss' || char_action =='event') && (getDistance(get('Archealer'), character)> 300 || parent.entities.Archealer?.rip)) return
	await useStomp(target)
	useShell()
	useMassAgr()
	useWarcry()
	useCleave(target)
}

useWarcry()
async function useWarcry(){
	try{
		if(!is_on_cooldown('warcry') && !character.s.warcry && character.mp > G.skills.warcry.mp)
		{
			await use_skill('warcry').catch(() => {})
			// reduce_cooldown("warcry", Math.min(...parent.pings));
		}
	}
	catch {}
	finally {
			setTimeout(useWarcry, 1000)
	}
}

// setInterval(useDash, 1500)
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
	if(is_on_cooldown('agitate')|| (parent.ctarget && FARM_BOSSES.includes(parent.ctarget.mtype) && parent.ctarget.mtype!='bgoo')) return
	if( (parent.entities.Archealer?.hp<parent.entities.Archealer?.max_hp*0.5 && Object.values(parent.entities).filter(e => e.type == 'monster' && e.target=='Archealer' ).length > 0) 
		|| Object.values(parent.entities).filter(e => current_farm_pos.mobs.includes(e.mtype) && !['Archealer','Warious'].includes(e.target) && parent.party_list.includes(e.target)).length>0
		|| Object.values(parent.entities).filter(e => current_farm_pos.mobs.includes(e.mtype) && !e.target).length>2)
	{
		await use_skill('agitate').catch(() => {})
		reduce_cooldown("agitate", Math.max(...parent.pings));
	}
	else if(parent.ctarget?.mtype=='bgoo')
	{
		await use_skill('agitate').catch(() => {})
		reduce_cooldown("agitate", Math.max(...parent.pings));
	}
}

setInterval(useCharge, 40000)
async function useCharge()
{
	if(!is_on_cooldown('charge') && character.mp - G.skills.charge.mp > character.max_mp*0.4)
	{
		await use_skill('charge').catch(() => {})
		// reduce_cooldown("charge", Math.min(...parent.pings));
	}
}

async function useShell()
{
	if(!is_on_cooldown('hardshell') && (character.hp < character.max_hp*0.5 
		|| ( character.hp < character.max_hp*0.75 && Object.values(parent.entities).filter(e => e.target == character.name).length>2)))
	{
		await use_skill('hardshell').catch(() => {})
		// reduce_cooldown("hardshell", Math.min(...parent.pings));
	}
}

async function useStomp(target)
{
	if(!target) return
	if(!is_on_cooldown('stomp') && character.mp-G.skills.stomp.mp > character.max_mp*0.1 &&
	 (FARM_BOSSES.includes(target.mtype) || 
	 Object.values(parent.entities).filter(e=> e.target == character.name )))
	{
		let switched = await switchToBasher()
		if(switched == true)
		{
			await use_skill('stomp').catch(() => {})
			// reduce_cooldown('stomp', Math.max(...parent.pings));
		}
	}
}

async function useCleave(target)
{
	target = parent.ctarget
	if(is_on_cooldown('cleave') || character.mp-G.skills.cleave.mp < character.max_mp*0.1 || (FARM_BOSSES.includes(target?.mtype) && target.mtype!='bgoo')) return
	let entities = Object.values(parent.entities)
	if(current_farm_pos.massFarm && (!current_farm_pos.coop || parent.entities.Archealer) && entities.filter(e => current_farm_pos.mobs.includes(e.mtype)  && is_in_range(e, 'cleave')).length > 2)
	{
		let switched = await switchToCleave()
		if(switched == true)
		{
			await use_skill('cleave').catch(() => {})
			reduce_cooldown('cleave', Math.max(...parent.pings));
		}
	}
	else if(entities.filter( e => e.mtype == 'bgoo' && is_in_range(e, 'cleave')).length>1)
	{
		await use_skill('cleave').catch(() => {})
		reduce_cooldown('cleave', Math.max(...parent.pings));
	}
}

function selectMainWeapon()
{
	target = parent.ctarget
	if(target && (current_farm_pos.mobs.includes(target.mtype) && current_farm_pos.massFarm && (parent.entities.Archealer || !current_farm_pos.coop)) || target.mtype == 'bgoo')
		desired_main = MASS_MAINHAND
	else desired_main = MAINHAND
}

function selectOffWeapon()
{
	target = parent.ctarget
	if(character.hp <= character.max_hp*0.55) desired_off = SHIELD
	else if(target && (current_farm_pos.mobs.includes(target.mtype) && current_farm_pos.massFarm && (parent.entities.Archealer || !current_farm_pos.coop)) || target.mtype == 'bgoo')
		desired_off = LOLIPOP
	else desired_off = OFFHAND
}

setInterval(switchToMainWeapon, 750)
async function switchToMainWeapon()
{
	let curr_main = character.slots.mainhand
	let curr_off = character.slots?.offhand
	
	if((curr_main && curr_off) && (curr_main.name == desired_main?.name && curr_main.level == desired_main?.level) && (curr_off.name == desired_off?.name && curr_off.level == desired_off?.level)) return
	if((curr_main.name == desired_main?.name && curr_main.level == desired_main?.level) && (!curr_off || curr_off.name != desired_off?.name || curr_off.level != desired_off?.level))
	{
		for(let i in character.items)
		{
			let item = character.items[i]
			if(!item) continue
			if(item.name == desired_off.name && item.level == desired_off.level) 
			{
				await equip(i, 'offhand').catch(()=>{})
			}
		}
	}
	else 
	{
		let main_slot
		let off_slot
		for(let i in character.items)
		{
			item = character.items[i]
			if(item && item.name == desired_main.name && item.level == desired_main.level && !main_slot) {
				main_slot = i
				if(off_slot) break;
			}
			else if(item && item.name == desired_off.name && item.level == desired_off.level && i != main_slot) {
				off_slot = i
				if(main_slot>=0 && off_slot>=0) break
			}
		}
		await equip_batch([{num: main_slot, slot: "mainhand"}, {num: off_slot, slot: "offhand"}])
	}
}

async function switchToCleave()
{
	if(character.slots.mainhand.name == AXE.name) return true
	for(let i in character.items)
	{
		item = character.items[i]
		if(item && item.name == AXE.name && item.level == AXE.level)
		{
			if(character.slots.offhand)await unequip("offhand")
			await equip(i).catch(()=>{})
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
		if(item && item.name == BASHER.name && item.level == BASHER.level)
		{
			if(character.slots.offhand)await unequip("offhand")
			await equip(i).catch(()=>{})
			return true
		}
	}
	return false
}

function myAttack(target)
{
	if((char_action == 'boss' || char_action =='event') && (!parent.entities.Archealer || (getDistance(parent.entities.Archealer, character)> 300 || parent.entities.Archealer.rip))) return
	change_target(target);


	if(!is_in_range(target))
	{
		xmove(
			character.x+(target.x-character.x)/2,
			character.y+(target.y-character.y)/2
			);
		// Walk half the distance
	}
	else if(can_attack(target))
	{
		attack(target).catch(() => {});
		reduce_cooldown("attack", Math.max(...parent.pings));
		swing(target)
	}
}

async function swing(target)
{
	if(!character.s.hardshell && Object.values(parent.entities).filter(e => e.target == character.name).length>2)
	{
		move(
			character.x+(target.x-character.x)+10,
			character.y+(target.y-character.y)+10
		)
	}
}