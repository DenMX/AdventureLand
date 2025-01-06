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
var pc = false
const DO_NOT_SEND_ITEMS = ['elixirint0', 'elixirint1', 'elixirint2']
const ELIXIRS = ['elixirint0', 'elixirint1', 'elixirint2']

const MASS_WEAPON = {name: 'gstaff', level: 6}
const SOLO_WEAPON = {name: 'firestaff', level: 9}
const BOOK = {name: 'exoarm', level: 1}

const PERSONAL_ITEMS = [MASS_WEAPON, SOLO_WEAPON, BOOK]

let desired_main
let desired_off

const HP_POT = 'hpot1'
const MP_POT = 'mpot1'

initialize_character()

async function initialize_character() {
	await load_module('Basics')
    await load_module('State')
    await load_module('MainBehavior')
    // for(let i in character.items)
    // {
    //     if(!character.items[i]) continue;
    //     if(character.items[i].name == 'computer' || character.items[i].name == 'supercomputer')
    //     {
    //         pc = true
    //         await load_module('PcOwner')
    //     }
    // }
	useElixir()

    setInterval(saveSelfAss, 1000)
	checkWeapon()
	summonMates()
    //checkQuest()
}

const TARGETING_BLACK_LIST = ''

var quest_check_at

async function useSkills(target)
{
    //burst(target)
    energize()
    useCMB()
}


async function useElixir()
{
	if(!character.slots.elixir)
	{
		for(let i in character.items)
		{
			if(character.items[i] && DO_NOT_SEND_ITEMS.includes(character.items[i].name)) await equip(i)
		}
	}
	setTimeout(useElixir,getMsFromMinutes(60))
}

async function saveSelfAss()
{
	if(is_on_cooldown('scare'))
	{
		// setTimeout(saveSelfAss, 500)
		return
	}
	if(Object.values(parent.entities).filter(e => e.type == 'monster' && e.target == character.name).length>0)	await use_skill('scare').catch(() => {})
	
}


function checkWeapon() {
	let target = parent.ctarget
	if(!target) {
		setTimeout(checkWeapon, 250)
		return
	}
	if((current_farm_pos.mobs.includes(target.mtype) && current_farm_pos.massFarm && (parent.entities.Archealer || !current_farm_pos.coop))
		|| target.mtype == 'bgoo')
	{
		desired_main = MASS_WEAPON
	}
	else {
		desired_main = SOLO_WEAPON
		desired_off = BOOK
	}
	changeWeapon()
}

async function changeWeapon() {
	if(desired_main.name != character.slots.mainhand.name)
	{
		if(desired_main == MASS_WEAPON)
		{
			for(let i in character.items)
			{
				let item = character.items[i]
				if(item && item.name == desired_main.name && item.level == desired_main.level)
				{
					try{
						if(character.slots.offhand) await unequip("offhand")
						await equip(i)
					}
					catch(e) {
						console.error('something goes wrong while changing weapon\n'+ e.data)
					}
				}
			}
		}
		else if(desired_main == SOLO_WEAPON)
		{
			let main = -1
			let off = -1
			for(let i in character.items)
			{
				let item = character.items[i]
				if(!item) continue
				if(item.name == desired_main.name && item.level==desired_main.level) main = i
				else if(item.name == desired_off.name && item.level == desired_off.level) off = i
				if(main >=0 && off >= 0) await equip_batch([{ num: main, slot: "mainhand" }, { num: off, slot: "offhand" }]).catch(()=> {console.error('Failed to equip batch')})
			}
		}
	}
	setTimeout(checkWeapon, 300)
}

async function burst(target)
{
    if(character.mp > character.max_mp*0.9 && target.hp > character.mp*1.5) await use_skill('burst', target).catch(() => {})
}

async function energize()
{
    if(is_on_cooldown('energize')) return

    if(parent.entities.Archealer && parent.entities.Archealer.mp < parent.entities.Archealer.max_mp*0.3) 
        use_skill('energize', 'Archealer').catch(() => {})
    else if(parent.entities.Warious && is_in_range('energize', parent.entities.Warious)) 
        use_skill('energize', 'Warious', 1).catch(() => {})
}

async function reflection()
{
    if(is_on_cooldown('reflection') || character.mp < G.skills.reflection.mp) return
    for(member of parent.party_list)
    {
        if(Object.values(parent.entities).filter(e => e.type == 'monster' && e.target == member).length > 3) 
        {
            await use_skill('reflection', member).catch(() => {})
			return
        }
		else if(parent.entities[member] &&parent.entities[member].hp < parent.entities[member].max_hp * 0.6)
		{
			await use_skill('reflection', member).catch(() => {})
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
            character.x+(-60+(Math.random()*120)),
            character.y+(-60+(Math.random()*120))
        )
    }
}


function myAttack(target){

    kite(target)
	
	change_target(target);
	if(FARM_BOSSES.includes(target.mtype) && (!target.target || target.target == character.name)) return
	useSkills(target);
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
		reduce_cooldown("attack", Math.min(...parent.pings));
	}
	
}

async function useCMB()
{
	if(is_on_cooldown('cburst')) return
	if( (current_farm_pos.massFarm && current_farm_pos.coop && parent.entities.Archealer) )
	{
		targets = Object.values(parent.entities).filter( e=> current_farm_pos.mobs.includes(e.mtype) && !e.target && is_in_range(e)).map(e=> [e.id, 1])
		if (targets.length>1) await use_skill('cburst', targets)
	}
	else if( current_farm_pos.massFarm && !current_farm_pos.coop)
	{
		targets = Object.values(paren.entities).filter( e=> current_farm_pos.mobs.includes(e.mtype) && e.max_hp < 500 && is_in_range(e)).map(e => [e.id, e.hp+e.max_hp*0.1])
		if(targets.length>2) await use_skill('cburst', targets, targets[0].max_hp*1.1)
	}
}

async function passMonsterhuntNext()
{
	await send_cm('aRanDonDon', {cmd: 'monsterhunt', coop:true})
	setTimeout(checkQuest, character.s.monsterhunt.ms)
	console.log('Send monsterhunt to ranger')
}

async function mageHandleBoss(boss)
{
	console.log('Get a boss: '+boss.name+' current action:'+char_action+'\nBosses in progress: '+boss_schedule.length)
	if((char_action == 'boss' || char_action == 'event') && !bossReceived(boss))
	{
		boss_schedule.push(boss)
		return;
	}
	else if(parent.ctarget && !FARM_BOSSES.includes(parent.ctarget?.mtype) && char_action != 'event' && char_action != 'boss' && !bossReceived(boss))
	{
		char_action = 'boss'
		current_boss = boss
		smart_move(boss)
	}
	else {
		if(!bossReceived(boss)) boss_schedule.push(boss)
	}
	
}


async function summonMates()
{
	if(is_on_cooldown('magiport') || character.mp<900 || characterMoving() || goingForQuest || (['boss','event'].includes(char_action) && Object.values(parent.entities).filter(e=> FARM_BOSSES.includes(e.mtype)).length<1)) 
	{
		setTimeout(summonMates, 2000)
		return
	}
	try
	{
		for(let member of parent.party_list)
		{
			if(member == 'MerchanDiser' ||  member == character.name  || !MY_CHARACTERS.includes(member) || !get(member).farm_location || parent.entities[member]) continue
			let curState = get(member)
			let distance = getDistance(parent.party[member], character)
			let entities = Object.values(parent.entities)
			
			if(char_action == 'boss' && distance>250 && entities.filter(e => FARM_BOSSES.includes(e.mtype)).length>0)
			{
				await use_skill('magiport', member).catch(() => {})
				// await send_cm(member, {cmd: 'boss', boss: current_boss})
			}
			else if(char_action == 'event' && current_event && distance>250 && entities.filter(e => FARM_BOSSES.includes(e.mtype)).length>0)
			{
				await use_skill('magiport', member).catch(() => {})
				
			}
			else if(curState.current_action == char_action && char_action == 'farm' && curState.farm_location.mobs[0] == current_farm_pos.mobs[0] 
				&& distance > 500 && entities.filter(e => current_farm_pos.mobs.includes(e.mtype)).length>0)
			{
				await use_skill('magiport', member).catch(() => {})
			}
		}
	}
	catch(ex)
	{
		console.error('Error while summoning')
		console.error(ex)
	}
	finally
	{
		change_target(null)
		setTimeout(summonMates, 2000)
	}
}

