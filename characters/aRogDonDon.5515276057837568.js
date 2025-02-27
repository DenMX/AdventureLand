const JACKO = {name: 'jacko', level: 1}
const ORB = {name: 'talkingskull', level: 3}

const MAINHAND = {name: 'cclaw', level: 8}
const OFFHAND = {name: 'cclaw', level: 8}
const FAST_WEAPON = {name: 'rapier', level: 5}

const PERSONAL_ITEMS = [JACKO, ORB, FAST_WEAPON]

const DO_NOT_SEND_ITEMS = ['elixirdex0', 'elixirdex1', 'elixirdex2','pumpkinspice']
const ELIXIRS = ['elixirdex0', 'elixirdex1', 'elixirdex2','pumpkinspice']

const HP_POT = 'hpot1'
const MP_POT = 'mpot1'

let pc = false

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
    // useElixir()
    setInterval(saveSelfAss, 1000)
}


const TARGETING_BLACK_LIST = null

setInterval(selectWeapon, 1000)
async function selectWeapon()
{
    fast_weapon = (parent.ctarget && parent.ctarget.name == 'snowman')
    if(fast_weapon && character.slots.mainhand.name == FAST_WEAPON.name) return
    if(!fast_weapon && character.slots.offhand?.name == OFFHAND.name) return
    if(fast_weapon )
    {
        if(character.slots.offhand) await unequip('offhand')
        widx = findWeapon(FAST_WEAPON)
        await equip(widx)
    }
    else if(!fast_weapon)
    {
        w1idx = findWeapon(MAINHAND)
        w2idx = findWeapon(OFFHAND)
        await equip(w1idx,'mainhand')
        await equip(w2idx,'offhand')
    }
}

async function findWeapon(fitem)
{
    for(let i in character.items)
    {
        let item = character.items[i]
        if(!item) continue
        if(fitem.name == item.name && fitem.level == item.level) return i
    }
    return -1
}

async function passMonsterhuntNext()
{
	await send_cm('Archealer', {cmd: 'monsterhunt', coop:true})
    console.warn('Send CM to heal')
}

async function useSkills(target)
{
    useStab(target)    
}

async function useInvis()
{
    if(character.hp<character.max_hp*0.5 && Object.values(parent.entities).filter(e => e.target == character.name).length>0) await use_skill('invis')
}

async function useStab(target)
{
    if(character.slots.mainhand.name == 'rapier') return
    let stab = G.items[character.slots.mainhand.name].wtype == 'fist' ? 'quickpunch' : 'quickstab'

    if(!target || character.mp < G.skills[stab].mp || is_on_cooldown(stab) || target.hp < character.attack || !is_in_range(target, stab)) return
    await use_skill(stab, target)
}

setInterval(useRspeed, 500)
async function useRspeed()
{
    if(character.mp < G.skills.rspeed.mp) return
    if(!character.s.rspeed) 
    {
        await use_skill('rspeed', character)
        return
    }
    for(let char of Object.values(parent.entities).filter(e=> e.player))
    {
        if(!char.s.rspeed) 
        {
            await use_skill('rspeed', char)
            return
        }
    }
}

function myAttack(target){
	let distance = getDistance(target, character)
	
    if(character.s.invis && character.hp < character.max_hp*0.7 && !target.target) return
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
		reduce_cooldown("attack", Math.min(...parent.pings));
	}
}