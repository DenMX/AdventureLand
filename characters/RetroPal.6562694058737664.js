const JACKO = {name: 'jacko', level: 3}
const ORB = {name: 'talkingskull', level: 2}

const PERSONAL_ITEMS = [JACKO, ORB]

const HP_POT = 'hpot1'
const MP_POT = 'mpot1'


const DO_NOT_SEND_ITEMS = ['elixirstr0', 'elixirstr1', 'elixirstr2']
const ELIXIRS = ['elixirstr0', 'elixirstr1', 'elixirstr2']

var pc = false

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
    await initChar();

}
runCharacter();

async function initChar() {
    
    await load_module('Basics')
    await load_module('State')
    await load_module('MainBehavior')
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

function useSkills(target)
{
	usePurify(target)
	useSmash(target)
}

async function usePurify(target)
{
	if(!target || is_on_cooldown('purify') || character.mp - G.skills.purify.mp < character.max_mp * 0.3 || G.skills.purify.level > character.level) return
	let min_hp = 2000 + (Object.values(target.s).length*400)
	if(target.hp<min_hp) await use_skill('purify', target)
}

async function useSmash(target)
{
	if(!target || is_on_cooldown('smash') || character.mp - G.skills.smash.mp < character.max_mp*0.6 || !is_in_range(target, 'smash')) return
	await use_skill('smash', target)
}

useMShield()
async function useMShield()
{
	try{
		if(character.hp<character.max_hp*0.8 && !character.s.mshield) await use_skill('mshield')
		if(character.hp>=character.max_hp*0.8 && character.s.msield) await use_skill('mshield')
	}
	catch(ex)
	{
		console.warn(ex)
	}
	finally
	{
		setTimeout(useMShield, 300)
	}
	
}

setInterval(useHeal, 600)
async function useHeal() {
	if(character.hp<=character.max_hp*0.8) await use_skill('selfheal')
}

function myAttack(target)
{
	change_target(target);
	useSkills(target)

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
		await fixPromise(attack(target)).catch(() => {});
		reduce_cooldown("attack", Math.min(...parent.pings));
	}
}