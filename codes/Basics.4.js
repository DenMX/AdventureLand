const MY_CHARACTERS = ['arMAGEdon', 'aRanDonDon', 'Archealer','MerchanDiser', 'aRogDonDon','RangerOver']


const ADD_PARTY = ['man1', 'men2', 'men3']

//load_module('Mover')

function scheduler(func)
{
    merch_queue.push(func)
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
    if(!a) return null
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

setInterval(shuffleItems, 60000)
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
	if(parent.party_list.length>0) return
	let myChars = getMyCharactersOnline()
	console.log(myChars)
	if(myChars.length>0)
	{
		for(let char of myChars)
		{
			console.warn(char)
			send_party_request(char.name)
			
		}
	}
	setTimeout(gettingParty, 1000)
}

function getMsFromMinutes(minutes)
{
    return minutes*60000
}