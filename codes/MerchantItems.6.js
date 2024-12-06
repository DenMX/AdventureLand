const ARMOR = ['shoes', 'chest', 'helmet', 'pants','gloves','shield', 'quiver', 'cape']
const JEWELRY = ['amulet', 'ring', 'belt', 'earring', 'source', 'orb']

const ARMOR_SLOT_LIB = 
{
	shoes: 'shoes',
	chest: 'chest', 
	helmet: 'helmet', 
	pants: 'pants',
	gloves: 'gloves',
	shield: 'offhand'
}

const DISMANTLE_POSITION = {x: -4, y: 443}

const MAX_LVL_TO_UPGRADE=9

const MAX_LVL_TO_UPGRADE_EQUIP=9

const MAX_LVL_TO_UPGRADE_JEWELRY=4

const ITEMS_TO_EXCHANGE = [
	'seashell',
	'leather'
]


const NOT_SALE_ITEM_TYPES = ['cape']
const ITEMS_TO_SALE = [
	//materials
	'frogt', 
	'xmashat',
	'pstem', 
	'carrot',
	'poison', 
	'smush',
	// 'crabclaw',
	'smoke', 
	'ink',
	'snowball',
	'dstones',

	//Elexirs
	'elixirvit0', 
	'elixirvit1', 
	'elixirvit2', 
	'elixirvit3',

	//xmass set
	'rednose',
	'iceskates',
	'xmasshoes',
	'xmassweater',
	'xmaspants',
	'warmscarf',
	'merry',

	//Jewelery
	'hpamulet',
	'hpbelt',
	'vitearring',
	'vitring',
	// 'dexring',
	// 'dexearring',
	// 'dexbelt',
	'dexamulet',
	'ringsj',

	//scrolls
	'vitscroll',
	'forscroll',

	//begginers shit
	// 'cclaw',
	'stinger',
	'slimestaff',
	'gloves',
	'wgloves',
	'shoes',
	'wshoes',

	//Rugged set
	'helmet1',
	'pants1',
	'gloves1',
	'shoes1',
	'coat1',

	//useless weapons
	'dagger',
	'hotchocolate',
	'throwingstars',
	'rapier',
	'spear',
	'swifty',
	'phelmet',

	//halloween
	'gphelmet',
	'skullamulet',
	'lantern',

	//weapon of dead
	'pmaceofthedead',
	'swordofthedead',
	'staffofthedead',
	'daggerofthedead',
	'maceofthedead',
	'bowofthedead',

	//shields
	'mshield'
	
]


const NOT_SALE_ITEMS_ID = 
{
	//begginers shit
	helmet: {level: 9},
	wcap: {level: 9},
	coat: {level: 9},
	wattire: {level: 9},
	pants: {level: 9},
	wbreeches: {level: 9},


	//
	hhelmet: {level: 7},
	xhelmet: {level: 5},
	harmor: {level: 7},
	xarmor: {level: 5},
	hpants: {level: 7},
	xpants: {level: 5},
	wingedboots: {level: 9},
	hboots: {level: 7},
	xboots: {level: 5},
	hgloves: {level: 7},
	quiver: {level: 7},
	glolipop: {level: 5},
	tigershield: {level: 7},
	mcape: {level: 7},
	cape: {level: 7},
	bcape: {level: 7},
	mittens: {level: 8},
	frankypants: {level: 6},
	gcape: {level: 7},
	sweaterhs: {level: 7},

	//WEAPON
	firestaff: {level: 9},
	firebow: {level: 7},
	sword: {level: 9},
	bow: {level: 9},
	staff: {level:9},
	fireblade: {level: 9},
	t2bow: {level: 9},
	hbow: {level:8},
	basher: {level: 7},
	ololipop: {level: 8},
	glolipop: {level: 8},
	candycanesword: {level: 9},
	ornamentstaff: {level: 8},
	pmace: {level: 8},
	merry: {level:9},
	warmscarf: {level: 9},
	bataxe: {level: 7},
	xmace: {level: 6},
	oozingterror: {level: 7},
	harbringer: {level: 7},
	spearofthedead: {level: 7},
	t3bow: {level: 7},
	crossbow: {level: 7},
	broom: {level: 7},
	cclaw: {level: 8},
	sshield: {level: 7},
	mushroomstaff: {level: 8},
	snowflakes: {level: 7},
	t2quiver: {level: 6},
	angelwings: {level: 4}
}

const JEWELRY_TO_UPGRADE =
{
	strbelt: {level: 3},
	dexbelt: {level: 3},
	intbelt: {level: 3},
	strring: {level: 4},
	jacko: {level: 3},
	talkingskull: {level: 2},
	intamulet: {level: 3},
	stramulet: {level: 3},
	intearring: {level: 3},
	strearring: {level: 3},
	intring: {level: 4},
	wbook0: {level: 3},
	t2intamulet: {level: 3},
	t2stramulet: {level: 3},
	t2dexamulet: {level: 3},
	wbookhs: {level: 2},
	santasbelt: {level: 2},
	dexring: {level: 3},
	dexearring: {level: 3},
	dexbelt: {level: 4}
}

const ITEMS_TO_BUY_PONTY =
{
	hhelmet: {level: 6},
	xhelmet: {level: 5},
	harmor: {level: 6},
	xarmor: {level: 5},
	hpants: {level: 6},
	xpants: {level: 5},
	wingedboots: {level: 5},
	hboots: {level: 6},
	xboots: {level: 5},
	quiver: {level: 7},
	firebow: {level: 7},
	fireblade: {level: 0},
	firestaff: {level: 0},
	glolipop: {level: 7},
	ololipop: {level: 7},
	tigershield: {level: 7},
	wbook0: {level: 2},
	mcape: {level: 5}
}