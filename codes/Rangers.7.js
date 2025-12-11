var pc = false
const HP_POT = 'hpot1'
const MP_POT = 'mpot1'

const DO_NOT_SEND_ITEMS = [ 'elixirdex2', 'elixirluck', 'luckbooster',"xpbooster", "pumpkinspice", 'xptome']
const ELIXIRS = ['elixirluck', 'pumpkinspice' ]

const JACKO = {name: 'jacko', level: 1}
const ORB = {name: "orbofdex", level: 2}
const PERSONAL_ITEMS = [JACKO, ORB]

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
    setInterval(checkOrb, 1000)
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
    // await useSupershot(target)
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
        await use_skill('huntersmark').then(() => { reduce_cooldown("huntersmark",character.ping); });
    }
    else if(!is_on_cooldown('huntersmark') && character.mp > G.skills.huntersmark.mp) {
        let entities = Object.values(parent.entities).filter( e => !e.s.marked && parent.party_list.includes(e.target) && distance(character,e)<character.range)
        for(let mob of entities) {
            return use_skill('huntersmark', mob.id)
        }
    }
}


async function usePiercing(target)
{
    if(!is_on_cooldown('piercingshot') && character.mp > G.skills['piercingshot'].mp)
    {
        use_skill('piercingshot', target).then(function(data){ reduce_cooldown("piercingshot", character.ping)})
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
    let canMassAttack = (char_action == 'farm' && current_farm_pos.massFarm && (!current_farm_pos.coop || Object.values(parent.entities).filter( e=> parent.party_list.includes(e.name) && e.ctype === "priest").length>0))
    let monsters_in_range = Object.values(parent.entities).filter( e => current_farm_pos.mobs.includes(e.mtype) && e.target)
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
	else if(canMassAttack && monsters_in_range.length > 1 && character.mp > G.skills['3shot'].mp)
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
