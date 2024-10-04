const ARMOR = ['shoes', 'chest', 'helmet', 'pants','gloves','shield', 'quiver', 'cape']
const JEWELRY = ['amulet', 'ring', 'belt', 'earring', 'source']

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

const ITEMS_TO_EXCHANGE_IDS = [
	'gem0',
	'gem1',
	'armorbox',
	'weaponbox',
	'bugbountybox',
	'candycane',
	'candy0',
	'candy1'
]

const UPGRADE_WEAPONS = {
	firestaff: {level: 9},
	firebow: {level: 7},
	sword: {level: 9},
	bow: {level: 9},
	staff: {level:9},
	fireblade: {level: 9},
	t2bow: {level: 9},
	hbow: {level:8},
	basher: {level: 6},
	ololipop: {level: 8},
	glolipop: {level: 8},
	candycanesword: {level: 8},
	ornamentstaff: {level: 8},
	pmace: {level: 8},
	merry: {level:9},
	warmscarf: {level: 9},
	bataxe: {level: 5},
	xmace: {level: 6},
	oozingterror: {level: 7},
	harbringer: {level: 7},
	spearofthedead: {level: 7},
	t3bow: {level: 7},
	crossbow: {level: 7}
}

const NOT_SALE_ITEM_TYPES = ['cape']
const ITEMS_TO_SALE = [
	//materials
	'frogt', 
	'xmashat',
	'pstem', 
	'carrot', 
	'crabclaw',
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

	//Jewelery
	'hpamulet',
	'hpbelt',
	'vitearring',
	'vitring',
	'dexring',
	'dexearring',
	'dexbelt',
	'dexamulet',
	'ringsj',

	//scrolls
	'vitscroll',
	'forscroll',

	//begginers shit
	'cclaw',
	'stinger',
	'slimestaff',
	'helmet',
	'wcap',
	'coat',
	'wattire',
	'pants',
	'wbreeches',
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
	'maceofthedead'
	
]

const CHARACTERS_PROGRESS_TIERS = ['start', 'mid', 'top', 'god']

const CHARACTERS_PROGRESS = 
{
	aRanDonDon:{
		god:{ 
			helmet: 'xhelmet',
			chest: 'xarmor',
			pants: 'xpants',
			gloves: 'xgloves',
			shoes: 'xboots',
			weapon: 'crossbow',
			rings: 'suckerpunch',
			earrings: 'molesteeth',
			offhand: 't2quiver',
			amulet: 'bfangamulet',
			belt: 'mbelt'
		},
		top:{
			helmet: 'hhelmet',
			chest: 'harmor',
			pants: 'hpants',
			gloves: 'hgloves',
			shoes: 'hboots',
			weapon: 'crossbow',
			rings: 'ctristone',
			earrings: 'molesteeth',
			offhand: 't2quiver'
		},
		mid:{
			helmet: 'helmet1',
			chest: 'coat1',
			pants: 'pants1',
			gloves: 'gloves1',
			shoes: 'shoes1',
			weapon: 'firebow',
			rings: 'ctristone',
			earrings: 'dexearring',
			offhand: 'quiver'
		},
		start:{
			helmet: 'helmet1',
			chest: 'coat1',
			pants: 'pants1',
			gloves: 'gloves1',
			shoes: 'shoes1',
			weapon: 'bow',
			rings: 'dexring',
			earrings: 'dexearring',
			offhand: 'quiver'
		}
	}
}

const SALE_ITEMS = {

}

const NOT_SALE_ITEMS_ID = 
{
	hhelmet: {level: 6},
	xhelmet: {level: 5},
	harmor: {level: 6},
	xarmor: {level: 5},
	hpants: {level: 6},
	xpants: {level: 5},
	wingedboots: {level: 8},
	hboots: {level: 6},
	xboots: {level: 5},
	intearring: {level: 3},
	strearring: {level: 3},
	intring: {level: 4},
	hgloves: {level: 5},
	strring: {level: 4},
	jacko: {level: 3},
	intamulet: {level: 3},
	stramulet: {level: 3},
	strbelt: {level: 3},
	dexbelt: {level: 3},
	intbelt: {level: 3},
	quiver: {level: 7},
	firebow: {level: 7},
	fireblade: {level: 0},
	firestaff: {level: 0},
	glolipop: {level: 5},
	tigershield: {level: 7},
	wbook0: {level: 4},
	mcape: {level: 7},
	bataxe: {level: 5},
	cape: {level: 7},
	bcape: {level: 7},
	mittens: {level: 6}
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