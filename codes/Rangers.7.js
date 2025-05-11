var pc = false
const HP_POT = 'hpot1'
const MP_POT = 'mpot1'

const DO_NOT_SEND_ITEMS = [ 'elixirdex2', 'elixirluck', 'luckbooster']
const ELIXIRS = ['elixirluck' ]

const JACKO = {name: 'jacko', level: 1}
const PERSONAL_ITEMS = [JACKO]

initialize_character();

async function initialize_character() {
    
    await load_module('Basics')
    // await load_module('PotionUse')
    await load_module('State')
    await load_module('MainBehavior')
    // await load_module('MerchantItems')
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
    setInterval(saveSelfAss, 1000)
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


async function usePiercing(target)
{
    if(!is_on_cooldown('piercingshot') && character.mp > G.skills['piercingshot'].mp)
    {
        use_skill('piercingshot', target).then(function(data){ reduce_cooldown("piercingshot", character.ping)})
    }
}

setIntervak(kite,200)
function kite()
{
    target = get_targeted_monster()
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

myAttack()
function myAttack(){
    
	try{

        if(is_on_cooldown('scare')) return
        target = parent.ctarget;
        useSkills(target);
        let canMassAttack = (char_action == 'farm' && current_farm_pos.massFarm && (!current_farm_pos.coop || parent.entities.Archealer))
        let monsters_in_range = Object.values(parent.entities).filter( e => current_farm_pos.mobs.includes(e.mtype))
        console.log('Monsters: '+monsters_in_range.length)
        if(!is_in_range(target))
        {
            move(
                character.x+(target.x-character.x)/4,
                character.y+(target.y-character.y)/4
                );
        }
        else if(canMassAttack && monsters_in_range.length > 3 && character.mp > G.skills['5shot'].mp)
        {
            // set_message("Attacking");
            use_skill('5shot', monsters_in_range).catch(() => {});
        }
        else if(canMassAttack && monsters_in_range.length > 2 && character.mp > G.skills['3shot'].mp)
        {
            //if(get_target_of(target) == character && getDistance(target, character) < character.range) circleMove(target)
            // set_message("Attacking");
            use_skill('3shot', monsters_in_range).catch(() => {});
        }
        else if(can_attack(target) && target.armor && target.armor > 400)
        {
            usePiercing(target)
        }
        else if(can_attack(target) )
        {
            //if(get_target_of(target) == character && getDistance(target, character) < character.range) circleMove(target)
            // set_message("Attacking");
            attack(target).catch(() => {});        
        }
        reduce_cooldown("attack", Math.min(...parent.pings));
    }
    catch(ex)
    {
        console.warn('Error while attacking\n'+ex)
    }
    finally
    {
        setTimeout(myAttack, Math.max(1, ms_to_next_skill('attack')));
    }
}
