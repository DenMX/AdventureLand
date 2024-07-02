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
const DO_NOT_SEND_ITEMS = []

const HP_POT = 'hpot1'
const MP_POT = 'mpot1'

initialize_character()

async function initialize_character() {
    
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
}

const TARGETING_BLACK_LIST = ''

var quest_check_at

async function useSkills(target)
{
    burst(target)
    energize()
    
}

async function burst(target)
{
    if(character.mp > character.max_mp*0.9 && target.hp > character.mp*1.5) await use_skill('burst', target)
}

async function energize()
{
    if(is_on_cooldown('energize')) return

    if(parent.entities.Archealer && parent.entities.Archealer.mp < parent.entities.Archealer.max_mp*0.3) 
        use_skill('energize', 'Archealer');
    else if(parent.entities.aRanDonDon && parent.entities.aRanDonDon.mp> parent.entities.aRanDonDon.max_mp*0.85) 
        use_skill('energize', 'aRanDonDon');
}

function myAttack(target){

	
	
}

checkQuest()
async function passMonsterhuntNext()
{
	await send_cm('aRanDonDon', {cmd: 'monsterhunt', coop:true})
	setTimeout(checkQuest, character.s.monsterhunt.ms)
	console.log('Send CM to ranger')
}


setInterval(summonMates,2000)
async function summonMates()
{
	if(is_on_cooldown('magiport') || character.mp<900 || is_moving(character) || goingForQuest) return
	
	for(let member of parent.party_list)
	{
		if(member == 'MerchanDiser' ||  member == character.name  || !MY_CHARACTERS.includes(member) || !get(member).farm_location) continue
		if(get(member).farm_location.Mobs[0] == current_farm_pos.Mobs[0] && 
			getDistance(get(member), character)>799)
		{
			console.log(member)
			console.log('Trying summon')
			await use_skill('magiport', member)
			return
		}
	}
}

