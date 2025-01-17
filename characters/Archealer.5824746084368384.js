const TARGETING_BLACK_LIST = ''
const DO_NOT_SEND_ITEMS = ['elixirint0', 'elixirint1', 'elixirint2', 'elixirluck', 'luckbooster', 'shadowstone']
const ELIXIRS = ['elixirint0', 'elixirint1', 'elixirint2', 'elixirluck']
var pc = false

const PERSONAL_ITEMS = [{name: 'exoarm', level: 1}, {name: 't2intamulet', level: 2}, {name: 'xgloves', level: 5},]

const TANK_ITEMS = {exoarm: {level: 1}}
const HEAL_ITEMS = {wbook0: {level: 4}}

const HP_POT = 'hpot1'
const MP_POT = 'mpot1'

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
	// 		pc = true
    //         await load_module('PcOwner')
    //     }
    // }
	useElixir()
	usePhaseOut()
	setInterval(saveSelfAss, 1000)
}


setInterval(on_party_request, 1000)
function on_party_request(name)
{

	if(MY_CHARACTERS.includes(name) || ADD_PARTY.includes(name)) accept_party_request(name);
}

setInterval(partyheal, 350)
function partyheal()
{
	if(character.mp-G.skills.partyheal.mp >= character.max_mp*0.3) {
		let count_members_on_low_hp = 0

	  	for (i=0; i<parent.party_list.length; i++){
			let partyMember = parent.party_list[i]
			if(parent.entities[partyMember] && !parent.entities[partyMember].rip &&  parent.entities[partyMember].hp <= parent.entities[partyMember].max_hp * 0.8) 
			{
				count_members_on_low_hp++;
			}
			else if(!parent.entities[partyMember] && partyMember!=character.name && MY_CHARACTERS.includes(partyMember) && get(partyMember) && get(partyMember)?.current_hp < get(partyMember)?.max_hp*0.6)
			{
				use_skill('partyheal');
			}
	   	}

	   if(character.hp <= character.max_hp * 0.8) count_members_on_low_hp++;

	   if(count_members_on_low_hp>1) 
	   {
		use_skill('partyheal');
		return;
	   }
	   
    }
}

// setInterval(checkEquippedItems, 1000)
function checkEquippedItems()
{
	let set = (Object.values(parent.entities).filter(e => e && e.target == character.name).length > 0 && character.hp<character.max_hp*0.7) ? TANK_ITEMS : HEAL_ITEMS

	for(let i in character.items)
	{
		let item = character.items[i]
		if(item && set[item.name] && set[item.name].level == item.level)
		{
			equip(i)
		}
	}
}



function attackOrHeal(target)
{
	if(character.hp < character.max_hp * 0.8) 
	{
		use_skill('heal', character) ;
		return;
	}

	for (i=0; i<parent.party_list.length; i++){
		if(parent.entities[parent.party_list[i]] == null ) continue;
		let member = parent.party_list[i]
		entity = parent.entities[member]
        if(!entity.rip && member != character.name && entity.hp <= entity.max_hp * 0.8) 
	    {
			
		   if(getDistance(character, entity)>character.range)
		   {
			move(
				character.x+(entity.x - character.x)/2,
				character.y+(entity.y - character.y)/2
			)
		   }
			use_skill('heal', parent.entities[parent.party_list[i]]);
		   return;
	    }
	}
	let players = Object.values(parent.entities).filter(e => e.player && !e.rip && is_in_range(e) && e.hp<e.max_hp*0.7 ) 
	if(players.length>0)
	{
		use_skill('heal', players[0])
		return
	}
	if(!target) return;
	change_target(target);
	useSkills(target);
	if(!is_in_range(target))
	{
		move(
			character.x+(target.x-character.x)/4,
			character.y+(target.y-character.y)/4
			);
		// Walk half the distance
	}
	else if(can_attack(target))
	{		
		attack(target).catch(() => {});
		reduce_cooldown("attack", Math.max(...parent.pings));
	}

}

async function saveSelfAss()
{
	if(is_on_cooldown('scare'))
	{
		setTimeout(saveSelfAss, 500)
		return
	}
	if(Object.values(parent.entities).filter(e => e.type == 'monster' && e.target == character.name).length>0 && character.hp<character.max_hp*0.5)	await use_skill('scare').catch(() => {})
	
}

async function usePhaseOut(){
	if(character.hp<character.max_hp*0.35 && !character.s.phasedout && locate_item('shadowstone')!= -1)
	{
		try{
			await use_skill('phaseout')
			reduce_cooldown("phaseout", Math.max(...parent.pings))
		}
		catch(exception)
		{
			console.warn('While phasing out caught exception')
			console.warn(exception)
		}
		finally {
			setTimeout(usePhaseOut, 4000)
		}
	}
	else setTimeout(usePhaseOut, 1000)
}

async function passMonsterhuntNext()
{
	await smart_move(current_farm_pos.mobs[0])
}



async function useSkills(target)
{
	useCurse(target)
	useDarkBlessing()
	pullmobsFromMember()
}

async function pullmobsFromMember()
{
	if(char_action=='farm' && !current_farm_pos.coop)return
	if(is_on_cooldown('absorb') || character.mp-G.skills.absorb.mp<character.max_mp*0.4) return
	for(member of parent.party_list)
	{
		let member_entity = parent.entities[member]
		if(!member_entity || Object.values(parent.entities).filter(e=> e.target == member).length<1) continue
		if(member_entity.ctype == 'warrior' && 
			(member_entity.hp<member_entity.max_hp*0.5 || Object.values(parent.entities).filter(e => e.target == member && e.damage_type == 'magical').length>2)) {
				await use_skill('absorb', member).catch(() => {})
				reduce_cooldown("absorb", Math.max(...parent.pings));
				break
		}
		else if(member_entity.ctype == 'paladin' && 
			(member_entity.hp<member_entity.max_hp*0.5 || Object.values(parent.entities).filter(e => e.target == member && e.damage_type == 'physical').length>2)) {
				await use_skill('absorb', member).catch(() => {})
				reduce_cooldown("absorb", Math.max(...parent.pings));
				break
		}
		else {
			await use_skill('absorb', member).catch(() => {})
			reduce_cooldown("absorb", Math.max(...parent.pings));
			break
		}
	}

}


async function useDarkBlessing()
{
	if(char_action=='farm' && !current_farm_pos.coop)return
	if(!is_on_cooldown('darkblessing') && !character.s.darkblessing && character.mp> G.skills.darkblessing.mp) 
	{
		await use_skill('darkblessing').catch(() => {})
		reduce_cooldown("darkblessing", Math.max(...parent.pings));
	}
}


async function useCurse(target)
{
	if(is_on_cooldown('curse')) return
	if( FARM_BOSSES.includes(target?.mtype) && character.mp - G.skills.curse.mp> character.max_mp*0.4 && target.hp>10000) await use_skill('curse', target)
	else if (current_farm_pos.coop) await use_skill('curse', target).catch(() => {})
}
