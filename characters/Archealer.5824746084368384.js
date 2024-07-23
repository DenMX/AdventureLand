const TARGETING_BLACK_LIST = ''
const DO_NOT_SEND_ITEMS = ['elixirint0', 'elixirint1', 'elixirint2']
var pc = false

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
		if(get_target_of(target) == character && getDistance(target, character) < character.range) circleMove(target)
		set_message("Attacking");
		attack(target).catch(() => {});
		reduce_cooldown("attack", Math.max(...parent.pings));
	}

}


async function passMonsterhuntNext()
{
	await smart_move(current_farm_pos.Mobs[0])
}



async function useSkills(target)
{
	pullMobs();
	useCurse(target)
	useDarkBlessing()
}

async function pullMobsFromMember()
{
	if(action=='farm' && !current_farm_pos.isCoop)return
	if(is_on_cooldown('absorb') || character.mp-G.skills.absorb.mp<character.max_mp*0.4) return
	let tmp_target = get_target_of(get_targeted_monster())
	if(current_farm_pos.isCoop &&tmp_target && tmp_target.name != character.name)
	{
		if(!is_in_range(tmp_target, 'absorb'))
		{
			move(
				character.x+(tmp_target.x-character.x)/2,
				character.y+(tmp_target.y-character.y)/2
				);
		}
		await use_skill('absorb', tmp_target).catch(() => {})
		reduce_cooldown("absorb", Math.max(...parent.pings));
		return;
	}
	let mobs = Object.values(parent.entities).filter((e) => e.type == 'monster' && parent.party_list.includes(e.target) && e.target != character.name)
	if(mobs.length==0) return;
	for(let member of parent.party_list)
	{
		if(member == character.name) continue
		let member_entity = parent.entities[member]
		if(Object.values(parent.entities).filter((e) => e.type=='monster' && e.target == member).length > 0)
		{
			if(!is_in_range(member_entity, 'absorb'))
			{
			move(
				character.x+(member_entity.x-character.x)/2,
				character.y+(member_entity.y-character.y)/2
				);
			}
			await use_skill('absorb', member).catch(() => {})
			reduce_cooldown("absorb", Math.max(...parent.pings));
			return
		}
	}
}

async function pullMobs()
{
	if(is_on_cooldown('absorb') || character.mp-G.skills.absorb < character.max_mp*0.1 || (action=='farm' && !current_farm_pos.isCoop)) return;
	let near_members = Object.values(parent.entities).filter(e=> (MY_CHARACTERS.includes(e.name) || ADD_PARTY.includes(e.name)) && is_in_range(e, 'absorb'))
	for(let i of near_members)
	{
		if(i.ctype == 'warrior' && i.hp < i.max_hp*0.4 && Object.values(parent.entities).filter(e => e.target == i.name).length >2)
		{ 
			await use_skill('absorb', i.name).catch(() => {}) 
			return
		}
		else if(i.ctype != 'warrior' && Object.values(parent.entities).filter(e => e.target == i.name).length>0) 
		{
			await use_skill('absorb', i.name).catch(() => {})
			return
		}
	}
}

async function useDarkBlessing()
{
	if(action=='farm' && !current_farm_pos.isCoop)return
	if(!is_on_cooldown('darkblessing') && !character.s.darkblessing && character.mp> G.skills.darkblessing.mp) 
	{
		await use_skill('darkblessing').catch(() => {})
		reduce_cooldown("darkblessing", Math.max(...parent.pings));
	}
}

async function useCurse(target)
{
	if(!is_on_cooldown('curse')) return
	if( FARM_BOSSES.includes(target) && character.mp - G.skills.curse.mp> character.max_mp*0.4) await use_skill('curse', target)
	else if (current_farm_pos.isCoop) await use_skill('curse', target).catch(() => {})
}
