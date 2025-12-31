const MY_CHARACTERS = ['arMAGEdon', 'aRanDonDon', 'Archealer','MerchanDiser', 'aRogDonDon','RangerOver', 'Warious', 'RogerThat']

const SERVERS = ['EU I', 'EU II', 'US I', 'US II', 'US III', 'ASIA I']

const sp = "DenMX_Super_Secret_Key"

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
    "frog",
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

const PARTY_LEADER = "Flamme"

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

function characterMoving()
{
    if(character.moving || character.c.town) return true
    return false
}

function generateRandomPointClockwise(reference, target ) {

    let distance = character.range/2
    let maxAngle = 90
    // Вычисляем базовый угол от reference к target
    const baseAngle = Math.atan2(target.y - reference.y, target.x - reference.x);
    
    // Добавляем случайное отклонение от 0 до maxAngle градусов ПО ЧАСОВОЙ СТРЕЛКЕ
    // В математике положительный угол - против часовой, поэтому используем отрицательные значения
    const maxAngleRad = maxAngle * Math.PI / 180;
    const randomDeviation = -Math.random() * maxAngleRad; // Отрицательное = по часовой
    
    // Итоговый угол
    const finalAngle = baseAngle + randomDeviation;
    
    // Вычисляем координаты
    const x = target.x + Math.cos(finalAngle) * distance;
    const y = target.y + Math.sin(finalAngle) * distance;
    
    return { x, y };
}

function getBoundingBoxCenter(points) {
    if (!points || points.length === 0) {
        return null;
    }
    
    let minX = points[0].x;
    let maxX = points[0].x;
    let minY = points[0].y;
    let maxY = points[0].y;
    
    for (let i = 1; i < points.length; i++) {
        const point = points[i];
        minX = Math.min(minX, point.x);
        maxX = Math.max(maxX, point.x);
        minY = Math.min(minY, point.y);
        maxY = Math.max(maxY, point.y);
    }
    
    return {
        x: (minX + maxX) / 2,
        y: (minY + maxY) / 2
    };
}

function on_combined_damage() // When multiple characters stay in the same spot, they receive combined damage, this function gets called whenever a monster deals combined damage
{
	move(
				character.x + (-30 +(Math.random()*30)),
				character.y + (-30 +(Math.random()*30))
			)
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
    setInterval(() => parent.socket.emit("send_updates", {}), 30000);
}

function getItemSlotByType(itemName) {
    switch(G.items[itemName].type) {
        case "source":
        case "misc_offhand":
        case "shield":
            return "offhand"
        case "weapon":
            return "mainhand"
        case "earring":
            return "earring1"
        case "ring":
            return "ring1"
        default:
            return G.items[itemName].type
    }
}

character.on("new_map", function(data) {
    
    if(data.name == "bank") {
        sleep(300)
        if(character.bank){
            let url = `https://aldata.earthiverse.ca/bank/${character.owner}/${sp}`
            let settings = {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(character.bank)
            }
            fetch(url, settings).then((response) => console.log(response.status));
        }
        else {
            console.warn("Not enough time to load bank")
        }
    }
    if(data.name == "jail") leave()
    
})

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
    setTimeout(async()=> {
        respawn()
        // if( character.gold>3200000) buy_with_gold("xptome").catch(ex => console.warn(`Error while buying xptome:\n ${ex}`))
    }, 15000)
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

// setInterval(on_party_invite,1000)
// Accept party from one of these sources
function on_party_invite(name) {
    if (MY_CHARACTERS.includes(name) || name == 'Flamme') {
        accept_party_invite(name);
    }
}

function on_party_request(name)
{
    if(MY_CHARACTERS.includes(name)) accept_party_request(name);
	let myCharsInParty = 0
	parent.party_list.forEach( (e) => {if(MY_CHARACTERS.includes(e)) myCharsInParty++})
	if(myCharsInParty==4 || 9-parent.party_list.length+1 > 4-myCharsInParty) accept_party_request(name);
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

setInterval(gettingParty,2000)
async function gettingParty()
{
    if(parent.party_list.length>2 
        && parent.party_list.includes(PARTY_LEADER)
    )
    {
        return 
    }
    let online_players = await getServerPlayers()
    if(online_players.filter( e=> e.name == PARTY_LEADER).length>0) {
        send_party_request(PARTY_LEADER)
    }
    else if(parent.party_list.length<2)
    {
        online_players.filter ( e => MY_CHARACTERS.includes(e.name)).forEach( e=> send_party_request(e.name))
    }
	
}

function getMsFromMinutes(minutes)
{
    return minutes*60000
}