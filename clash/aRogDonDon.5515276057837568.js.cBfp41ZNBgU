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


const TARGETING_BLACK_LIST = null


async function passMonsterhuntNext()
{
	await send_cm('Archealer', {cmd: 'monsterhunt', coop:true})
    console.warn('Send CM to heal')
}

async function useSkills(target)
{
    
}

function myAttack(target){
	let distance = getDistance(target, character)
	if(target.range<character.range && distance <= (character.range-target.range)/2 && get_target_of(target) == character)
    {
        move(
            character.x+(-20+(Math.random()*40)),
            character.y+(-20+(Math.random()*40))
        )
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