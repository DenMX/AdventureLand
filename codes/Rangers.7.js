var controller = undefined;
async function runCharacter() {
    // Initialize modules
    await initialize_character();

    // Restore state
    restoreCharacterState();
    // Send character info
    updateCharacterInfoLoop();
    // Respawn if dead
    respawnLoop();

    // Character behaviour
    let currStrat = new WarriorBehaviour(false, FARM_AREAS.moles);

    // Character controller
    controller = new CharacterController({
        do_quests: false
    }, currStrat);
    
    controller.enable();
    currStrat.enable();

    }
runCharacter();

async function initialize_character() {
    
    await load_module('Basics')
    await load_module('PotionUse')
    await load_module('State')
    await load_module('Mover')
    await load_module('MainBehavior')
}

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

async function init()
{

}


const TARGETING_BLACK_LIST = null

setInterval(on_party_request, 1000)
function on_party_request(name)
{
	console.log(name)
	if(name == 'Archealer') accept_party_request(name);
}


async function passMonsterhuntNext()
{
	await send_cm('Archealer', {cmd: 'monsterhunt', coop:true})
    console.warn('Send CM to heal')
}

async function useSkills(target)
{
    await useMark(target)
    await useSupershot(target)
}

async function useSupershot(target)
{
    let distance = getDistance(target, character)
    if(!is_on_cooldown('supershot')&& distance<=character.range*3+20 && target.hp>=character.attack && character.mp > G.skills.supershot.mp)
    {
        try{
            await use_skill('supershot', target).then(function(data){ reduce_cooldown("supershot",character.ping); });
        }
        catch(ex)
        {
            console.warn(ex)
        }
    } 
}

async function useMark(target)
{
    if(!is_on_cooldown('huntersmark') && distance(target, character)<=character.range && !target.s.marked && (FARM_BOSSES.includes(target.mtype) || target.hp> character.attack*3)
        && character.mp> G.skills.huntersmark.mp)
    {
        await use_skill('huntersmark').then(function(data){ reduce_cooldown("huntersmark",character.ping); });
    }
}

async function useTriplShot(target)
{
	
    if(!is_on_cooldown('3shot') && character.mp> G.skills['3shot'].mp)
    {
	    let tartgeted_mobs = Object.values(parent.entities).filter((e) => e.type==='monster' && current_farm_pos.Mobs.includes(e.mtype) 
        && is_in_range(e) && e!== target)
        await use_skill('3shot', [target, tartgeted_mobs[0], tartgeted_mobs[1]]).then(function(data){ reduce_cooldown("3shot", character.ping)})
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
	useSkills(target);
	if(!is_in_range(target))
	{
		move(
			character.x+(target.x-character.x)/4,
			character.y+(target.y-character.y)/4
			);
		// Walk half the distance
	}
	else if(character.level >= G.skills['3shot'].level && can_attack(target) && !current_farm_pos.isCoop && !is_on_cooldown('3shot') && character.mp > 200 
    && Object.values(parent.entities).filter((e) => e.type == 'monster' && is_in_range(e)).length > 2)
	{
		//if(get_target_of(target) == character && getDistance(target, character) < character.range) circleMove(target)
		set_message("Attacking");
		useTriplShot(target).catch(() => {});
		reduce_cooldown("3shot", Math.min(...parent.pings));
	}
    else if(can_attack(target) )
    {
        //if(get_target_of(target) == character && getDistance(target, character) < character.range) circleMove(target)
		set_message("Attacking");
		attack(target).catch(() => {});
		reduce_cooldown("attack", Math.min(...parent.pings));
        
    }
}
