const MY_CHARACTERS = ['arMAGEdon', 'aRanDonDon', 'Archealer','MerchanDiser', 'aRogDonDon','RangerOver', 'Warious', 'RetroPal']

const SERVERS = ['EU I', 'EU II', 'US I', 'US II', 'US III', 'ASIA I']

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
    "skeletor",
	"bgoo",
	"wabbit",
    "mrpumpkin",
    "mrgreen",
    "stompy",


	// Crypt bosses
	"a7",
	"a3"
];

const FRANKY_POSITION = {x: -30, y: 4}

const EVENTS = [
    // {name: 'snowman', useSkills: false, massFarm: false, targets: ['snowman']}, 
    {name: 'dragold', useSkills:true, massFarm: true, targets: ['dragold']},
    {name: 'goobrawl', useSkills: true, massFarm: true, targets: ['bgoo']}, 
    {name: 'icegolem', useSkills: true, massFarm: false, targets: ['icegolem']},
    {name: 'mrgreen', useSkills: true, massFarm: false, targets: ['mrgreen']},
    {name: 'mrpumpkin', useSkills: true, massFarm: false, targets: ['mrpumpkin']},
    {name: 'grinch', useSkills: true, massFarm: false, targets: ['grinch']}
]

const ADD_PARTY = ['man1', 'men2', 'men3', 'frostyRogue', 'frostyRogue2', 'frostyHeal']

const ITEM_TYPES_TO_STORE = ['dungeon_key','material', 'pscroll', 'token', 'offering', 'elixir', 'quest']

var death = false

initialize_character()

async function checkApi(callback) {
    let xhr = new XMLHttpRequest()
    
    xhr.onload = function(){
        if(xhr.status>= 200 && xhr.status < 500 ) {
            callback(true)
        }
    }

    xhr.onerror = function() {
        callback(true)
    }

    xhr.open('GET', 'https://almapper.zinals.tech/FindPath/')
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer ' + '776167b3d96c6ab2abff40a99175092c3c34e673f4d126a8335e778b04b00422');
    xhr.send()
}

function getNextSkill(skill)
{
    if(!parent.next_skill[skill]) return 0
    if(parent.next_skill[skill] - Date.now() <= 0) return 0
    else return parent.next_skill[skill] - Date.now()
}

function characterMoving()
{
    if(character.moving || character.c.town) return true
    return false
}

async function initialize_character() {
    await load_module('Mover')
    await load_module('PotionUse')
    await load_module('MerchantItems')
    await load_module('Upgrading')
    for(let i in character.items)
    {
        if(!character.items[i]) continue;
        if(character.items[i].name == 'computer' || character.items[i].name == 'supercomputer')
        {
            pc = true
            await load_module('PcOwner')
        }
    }

    if(parent.S.holidayseason)checkEventBuff()
}

function getNextSkill(skill)
{
    if(parent.next_skill- new Date()<=0) return 0
    return parent.next_skill - new Date()
}

async function checkEventBuff()
{
    if(!character.s.holidayspirit)
    {   
        stop('moving')
        await smart_move('main')
        await parent.socket.emit("interaction",{type:"newyear_tree"});
        setTimeout(checkEventBuff, character.s.holidayspirit.ms)
    }
    else setTimeout(checkEventBuff, character.s.holidayspirit.ms)

}

setInterval(isIDead, 5000)
function isIDead()
{
    if(character.rip)
    {
        try{
            respawn()
        }
        catch(ex){
            game_log('Error while respawning: \r\n'+ex)
        }
    }
}

function scheduler(func)
{
    if(!merch_queue.includes(func))merch_queue.push(func)
}

function handle_death()
{
    death = true
    setTimeout(respawn, 15000)
}

function getMyCharactersOnline()
{
	const myCharacters = get_characters();
    let selfCharacter = myCharacters.find(
        (c) => c.name === character.name
    );

    if (!selfCharacter) {
        return;
    }

    let onlineOnServer = myCharacters.filter(
        (c) => c.name !== character.name && c.online > 0 && c.server === selfCharacter.server
    )
	return onlineOnServer
}

async function sleep(ms)
{
    return new Promise(resolve => setTimeout(resolve, ms))
}

function getDistance(a, b)
{
    if(!a || !b || (a.map && b.map && a.map!=b.map)) return 9999999
    let x =a.x-b.x;
    let y = a.y-b.y;

    return(Math.sqrt((x*x)+(y*y)))
}

function itemsCount()
{
	let count = 0
	for(let i=0; i<character.items.length; i++)
	{
		if(character.items[i]) count++
	}
	return count
}

setInterval(on_party_invite,1000)
// Accept party from one of these sources
function on_party_invite(name) {
    if (MY_CHARACTERS.includes(name) || name == 'Flamme') {
        accept_party_invite(name);
    }
}

function on_party_request(name)
{
    if (MY_CHARACTERS.includes(name) || ADD_PARTY.includes(name))
        accept_party_request(name);
}


function shuffleItems()
{
    for(let i in character.items)
    {
        let slot = character.items[i]
        if(!slot)
        {
            for(let j = character.items.length-1; j>0; j--)
            {
                let slot2 = character.items[j]
                if(slot2 && j>i) 
                {
                    swap(j, i)
                    //break
                }
            }
        }
    }
}

function getServerPlayers() {
    const playersData = new Promise((resolve, reject) => {
        const dataCheck = (data) => {
            resolve(data);
        };

        setTimeout(() => {
            parent.socket.off("players", dataCheck);
            reject("getServerPlayers timeout (2500ms)");
        }, 2500);

        parent.socket.once("players", dataCheck);
    });

    parent.socket.emit("players");
    return playersData;
}

gettingParty()
async function gettingParty()
{

    if(parent.party_list.length>0 && parent.party_list.includes('Flamme')) 
    {
        setTimeout(gettingParty, 1000)
        return
    }
    else 
    {
        if(parent.party_list<2)
        {   let myChars = getMyCharactersOnline()
            if(myChars.length>0)
            {
                for(let char of myChars)
                {
                    send_party_request(char.name)
                    break
                }
            }
        }
        if(Object.values(getServerPlayers()).filter(c => c.name == 'Flamme') && !parent.party_list.includes('Flamme'))
        {
            
            send_party_request('Flamme')
        }

    }
	setTimeout(gettingParty, 400)
}

function getMsFromMinutes(minutes)
{
    return minutes*60000
}