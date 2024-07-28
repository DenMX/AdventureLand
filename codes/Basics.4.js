const MY_CHARACTERS = ['arMAGEdon', 'aRanDonDon', 'Archealer','MerchanDiser', 'aRogDonDon','RangerOver', 'Warious']

const FARM_BOSSES = [
	"mvampire",
	"fvampire",
	"phoenix",
	"snowman",
	"goldenbat",
	"cutebee",
	"grinch",
	"dragold",
	//"franky",
	"icegolem",
	//"crabxx",
	"jr",
	"greenjr",
	"pinkgoo",
    "skeletor",
	"bgoo",
	"wabbit",

	// Crypt bosses
	"a7",
	"a3"
];

const EVENTS = [
    {name: 'snowman', useSkills: false, massFarm: false, targets: ['snowman']}, 
    {name: 'dragold', useSkills:true, massFarm: true, targets: []},
    {name: 'goobrawl', useSkills: true, massFarm: true, targets: ['bgoo']}, 
    {name: 'icegolem', useSkills: true, massFarm: false, targets: ['icegolem']}
]

const ADD_PARTY = ['man1', 'men2', 'men3']

var death = false

setInterval(isIDead, 5000)
function isIDead()
{
    if(!death && character.rip)
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
    if (MY_CHARACTERS.includes(name)) {
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
function gettingParty()
{
	if(parent.party_list.length>0) 
    {
        setTimeout(gettingParty, 1000)
        return
    }
	let myChars = getMyCharactersOnline()
	
	if(myChars.length>0)
	{
		for(let char of myChars)
		{
			send_party_request(char.name)
			
		}
	}
	setTimeout(gettingParty, 400)
}

function getMsFromMinutes(minutes)
{
    return minutes*60000
}