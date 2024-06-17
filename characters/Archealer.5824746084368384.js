const TARGETING_BLACK_LIST = ''

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
}


setInterval(on_party_request, 1000)
function on_party_request(name)
{
	console.log(name)
	if(MY_CHARACTERS.includes(name) || ADD_PARTY.includes(name)) accept_party_request(name);
}

setInterval(partyheal, 350)
function partyheal()
{
	if(character.mp-G.skills.partyheal.mp >= character.max_mp*0.3) {
		let count_members_on_low_hp = 0

	  	for (i=0; i<parent.party_list.length; i++){
			let partyMember = parent.party_list[i]
			if(parent.entities[partyMember] && parent.entities[partyMember].hp <= parent.entities[partyMember].max_hp * 0.8) 
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

function attackOrHeal(target)
{
	if(character.hp < character.max_hp * 0.8) 
	{
		use_skill('heal', character) ;
		return;
	}

	for (i=0; i<parent.party_list.length; i++){
		if(parent.entities[parent.party_list[i]] == null ) continue;
        if(parent.party_list[i] != character.name && parent.entities[parent.party_list[i]].hp <= parent.entities[parent.party_list[i]].max_hp * 0.8) 
	    {
			entity = parent.entities[parent.party_list[i]]
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
		else if (parent.party_list[i] == character.name && character.hp <= character.max_hp * 0.8) {
			use_skill('heal', character);
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
		reduce_cooldown("attack", Math.min(...parent.pings));
	}

}


async function passMonsterhuntNext()
{
	await smart_move(current_farm_pos.Mobs[0])
}



async function useSkills(target)
{
	pullMobsFromMember();
	useCurse(target)
}

async function pullMobsFromMember()
{
	if(is_on_cooldown('absorb') || character.mp-G.skills.absorb.mp<character.max_mp*0.4) return
	if(current_farm_pos.isCoop && get_targeted_monster().target && get_targeted_monster().target != character.name)
	{
		await use_skill('absorb', get_target_of(get_targeted_monster()))
		return;
	}
	let mobs = Object.values(parent.entities).filter((e) => e.type == 'monster')
	if(mobs.length==0) return;
	for(let mob of mobs)
	{
		let mobsTarget = get_target_of(mob)
		if(FARM_BOSSES.includes(mob.mtype) && mobsTarget != character.name && character.mp - G.skills.absorb.mp > character.max_mp*0.6 && mobsTarget.type == 'character') {
			await use_skill('absorb', mobsTarget)
			return
		}
		
	}
	for(let member of parent.party_list)
	{
		if(member == character.name) continue
		if(Object.values(parent.entities).filter((e) => e.type=='monster' && e.target == member).length > 1)
		{
			await use_skill('absorb', member)
			await sleep(500)
		}
	}
}

async function useCurse(target)
{
	if(!is_on_cooldown('curse')) return
	if( FARM_BOSSES.includes(target) && character.mp - G.skills.curse.mp> character.max_mp*0.4) await use_skill('curse', target)
	else if (current_farm_pos.isCoop) await use_skill('curse', target)
}
