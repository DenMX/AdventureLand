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

const PERSONAL_ITEMS = []

const HP_POT = 'hpot1'
const MP_POT = 'mpot1'

initialize_character()

async function initialize_character() {
    await load_module('Mover')
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

    setInterval(saveSelfAss, 1000)
	summonMates()
    //checkQuest()
}

const TARGETING_BLACK_LIST = ''

var quest_check_at

async function useSkills(target)
{
    //burst(target)
    energize()
    
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
		setTimeout(saveSelfAss, 500)
		return
	}
	if(Object.values(parent.entities).filter(e => e.type == 'monster' && e.target == character.name).length>0)	await use_skill('scare').catch(() => {})
	
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
		move(
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
	char_action = 'boss'
	current_boss = boss
	smart_move(boss)
}

function bossReceived(boss)
{
	for(let b of boss_schedule) {
		if(b.name==boss.name) return true
	}
	return false
}

async function summonMates()
{
	if(is_on_cooldown('magiport') || character.mp<900 || is_moving(character) || goingForQuest) 
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
			let distance = getDistance(curState, character)
			
			if(char_action == 'boss' && distance>250)
			{
				await use_skill('magiport', member).catch(() => {})
				await send_cm(member, {cmd: 'boss', boss: current_boss})
				return
			}
			else if(curState.current_action == char_action && char_action == 'farm' && curState.farm_location.mobs[0] == current_farm_pos.mobs[0] && distance > 500)
			{
				await use_skill('magiport', member).catch(() => {})
				return
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

