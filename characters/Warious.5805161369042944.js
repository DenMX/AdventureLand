const TARGETING_BLACK_LIST = ''

const MAINHAND = {name: 'fireblade', level: 9}
const OFFHAND = { name: 'candycanesword', level: 9}
const BASHER = {name: 'basher', level: 8}
const MASS_MAINHAND = {name: 'ololipop', level: 9}
const LOLIPOP = {name: 'ololipop', level: 9}
const AXE = {name: 'bataxe', level: 8}
const SHIELD = {name: 'sshield', level: 8}
const JACKO = {name: 'jacko', level: 1}
const ORB = {name: 'orbofstr', level: 3}
const FAST_WEAPON = {name: 'rapier', level: 7}

const MANA_TSHIRT = {name: 'tshirt9', level: 5}
const DMG_TSHIRT = {name: 'coat', level: 10}

const PERSONAL_ITEMS = [MAINHAND, OFFHAND, BASHER, LOLIPOP, AXE, MASS_MAINHAND, SHIELD, JACKO, ORB, FAST_WEAPON, MANA_TSHIRT, DMG_TSHIRT]

const HP_POT = 'hpot1'
const MP_POT = 'mpot1'


const DO_NOT_SEND_ITEMS = ['pumpkinspice', "xpbooster", "luckbooster", "goldbooster", 'xptome']
const ELIXIRS = ['pumpkinspice']

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

async function checkOrb()
{
	if(character.hp > character.max_hp*0.5 && character.slots.orb.name != ORB.name)
	{
		for(let i in character.items)
		{
			let item = character.items[i]
			if(!item) continue
			if(item.name == ORB.name && item.level == ORB.level) await equip(i)
		}
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
	useElixir()
	setInterval(useSkills, 1000)
	setInterval(selectMainWeapon,330)
	setInterval(selectOffWeapon,330)
	setInterval(checkOrb, 1000)
	setInterval(saveSelfAss, 1000)
	setInterval(checkTshirt, 1000)
}


async function useSkills()
{
	target = parent.ctarget
	if((char_action == 'boss' || char_action =='event') && (getDistance(get('Archealer'), character)> 300 || parent.entities.Archealer?.rip)) return
	await useStomp(target)
	useShell()
	// useMassAgr()
	// useWarcry()
	await useCleave(target)
	useTaunt(target)
}

async function checkTshirt() {
	let wantedTshirt = (character.mp>character.max_mp*0.15) ? DMG_TSHIRT : MANA_TSHIRT
	
	if(character.slots.chest.name != wantedTshirt.name || character.slots.chest.level != wantedTshirt.name) {
		for(let i in character.items) {
			let item = character.items[i]
			if(!item) continue
			if(item.name == wantedTshirt.name && item.level == wantedTshirt.level) equip(i)
		}
	}
	
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

async function useTaunt(target)
{
	if(!target) return
	if(FARM_BOSSES.includes(target.mtype) && target.damage_type == 'physical' && target.target != character.name) {
		await use_skill('taunt', target).catch(() => {})
		reduce_cooldown('taunt', Math.max(...parent.pings))
	}
}

async function useMassAgr()
{
	if(is_on_cooldown('agitate')|| !current_farm_pos.massFarm || (parent.ctarget && FARM_BOSSES.includes(parent.ctarget.mtype) && parent.ctarget.mtype!='bgoo')) return
	if( (parent.entities.Archealer?.hp<parent.entities.Archealer?.max_hp*0.5 && Object.values(parent.entities).filter(e => e.type == 'monster' && e.target=='Archealer' ).length > 1) 
		|| Object.values(parent.entities).filter(e => current_farm_pos.mobs.includes(e.mtype) && !['Archealer','Warious'].includes(e.target) && parent.party_list.includes(e.target)).length>1
		|| (Object.values(parent.entities).filter(e => current_farm_pos.mobs.includes(e.mtype) && !e.target && e.aggro<1).length>2 && (char_action == 'farm' && current_farm_pos.massFarm && (!current_farm_pos.coop || parent.entities.Archealer)))
	)
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
	if(is_on_cooldown('hardshell')) return
	if(character.hp < character.max_hp*0.5 && Object.values(parent.entities).filter(e => e.target == character.name && e.damage_type == "physical").length>2)
	{
		await use_skill('hardshell').catch(() => {})
		// reduce_cooldown("hardshell", Math.min(...parent.pings));
	}
}

async function useStomp(target)
{
	if(!target) return
	if(!is_on_cooldown('stomp') && character.mp-G.skills.stomp.mp > character.max_mp*0.1 
		&& (FARM_BOSSES.includes(target.mtype) 
			|| Object.values(parent.entities).filter(e=> parent.party_list.includes(e.target)).length>2)
	)
	{
		let is_low_hp = false
		for(let m of parent.party_list) {
			if(!parent.entities[m] || m == character.name) continue
			member = parent.entities[m]
			if(member.hp < member.max_hp * 0.5 && Object.values(parent.entities).filter( e => e.target == m).length>0) {
				is_low_hp = true
				break
			}
		}
		if(character.hp < character.max_hp * 0.5 && Object.values(parent.entities).filter( e => e.target == character.name)) is_low_hp = true
		
		if(is_low_hp){
			let switched = await switchToBasher()
			if(switched == true)
			{
				await use_skill('stomp').catch(() => {})
				reduce_cooldown('stomp', Math.max(...parent.pings));
			}
		}
	}
}

async function useCleave(target)
{
	target = parent.ctarget
	if(is_on_cooldown('cleave') || character.mp-G.skills.cleave.mp < character.max_mp*0.1 || (FARM_BOSSES.includes(target?.mtype) && target.mtype!='bgoo')) return
	let entities = Object.values(parent.entities)
	if(current_farm_pos.massFarm && (!current_farm_pos.coop || Object.values(parent.entities).filter( e=> parent.party_list.includes(e.name) && e.ctype === "priest").length>0) 
		&& entities.filter(e => current_farm_pos.mobs.includes(e.mtype)  && is_in_range(e, 'cleave')).length > 1)
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
	if(target && (current_farm_pos.mobs.includes(target?.mtype) && current_farm_pos.massFarm 
	&& (Object.values(parent.entities).filter( e=> parent.party_list.includes(e.name) && e.ctype === "priest").length>0 || !current_farm_pos.coop)) 
	|| target?.mtype == 'bgoo')
		desired_main = MASS_MAINHAND
	else if(target && target.mtype == 'snowman')
		desired_main = FAST_WEAPON
	else desired_main = MAINHAND
}

function selectOffWeapon()
{
	target = parent.ctarget
	if(target && target.mtype == 'snowman')
		desired_off == null
	// else if(character.hp <= character.max_hp*0.3) desired_off = SHIELD
	else if(target && (current_farm_pos.mobs.includes(target?.mtype) && current_farm_pos.massFarm 
	&& (Object.values(parent.entities).filter( e=> parent.party_list.includes(e.name) && e.ctype === "priest").length>0 || !current_farm_pos.coop)) 
	|| target?.mtype == 'bgoo')
		desired_off = LOLIPOP
	else desired_off = OFFHAND
}

setInterval(switchToMainWeapon, 750)
async function switchToMainWeapon()
{
	let curr_main = character.slots.mainhand
	let curr_off = character.slots?.offhand
	
	if(desired_main.name=='rapier' && curr_main.name==desired_main.name) return
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
		// swing(target)
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