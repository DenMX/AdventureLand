const FARM_LOCATIONS = 
	{
		bitch: {
			location: {x: -1262, y: 490, map: 'main'},
			Mobs: ["squigtoad", "squig"],
			isCoop: false
		},
		bees: {
			location: {x:377, y:1350, map: 'main'},
			Mobs: ["bee"],
			isCoop: false
		},
		nearMines: {
			location: {x:627, y:1725, map: 'main'},
			Mobs: ["armadillo", "croc"],
			isCoop: false
		},
		spiders: {
			location: {x:750, y:-160, map: 'main'},
			Mobs: ["spider"],
			isCoop: true
		},
		snakes: {
			location: {x:-124, y:1876, map: 'main'},
			Mobs: ["snake"],
			isCoop: false
		}
	}


const FARM_BOSSES = [
	"mvampire",
	"fvampire",
	"phoenix",
	"snowman",
	"goldenbat",
	"cutebee",
	"grinch",
	"dragold",
	"franky",
	"icegolem",
	//"crabxx",
	"jr",
	"greenjr",
	"pinkgoo",
	"bgoo",
	"wabbit",

	// Crypt bosses
	"a7",
	"a3"
];

const LOOTER = 'arMAGEdon'

var last_farm_pos
var current_farm_pos
var attack_mode=true
var curState



getState();
function getState()
{
	if(!curState && get(character.name)!=null)
	{ 
		curState = get(character.name)
		current_farm_pos = curState.farm_location
	}
}

setInterval(saveState, 2500)
async function saveState()
{
	let items = await itemsCount()
	let hpot = await hpPotsCount()
	let mpot = await mpPotsCount()
	curState = 		{
		name: character.name,
		is_farming: attack_mode,
		last_farm_location: last_farm_pos,
		farm_location: current_farm_pos,
		items_count: items,
		x: character.x,
		y: character.y,
		map: character.map,
		hp_pot: hpot,
		mp_pot: mpot,
		hpot_grade: HP_POT,
		mpot_grade: MP_POT,
		current_hp: character.hp,
		current_mp: character.mp,
		max_hp: character.max_hp,
		max_mp: character.max_mp,
		equip: character.slots,
		have_pc: pc,
		s: character.s
	}

	set(
		character.name,
		curState
	)
}



setInterval(checkState, 3000)
async function checkState() {
	

	if(attack_mode && !is_moving(character) && current_farm_pos==null)
	{
		current_farm_pos=FARM_LOCATIONS.nearMines
		await smart_move(current_farm_pos.location)
	}
	else if(attack_mode && !is_moving(character) && !Object.values(parent.entities).filter((e) => e.type == 'monster' && e.id == current_farm_pos.Mobs[0]))
	{
		await smart_move(current_farm_pos.Mobs[0])
	}
	
}