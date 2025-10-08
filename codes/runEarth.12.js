async function startEarthiverseCharacter(name, url = 'https://monsterhunt.earthiverse.ca/') {
        if(!parent.X) throw new Error("Couldn't find `X` data!")
        if(!parent.user_id) throw new Error("Couldn't find `parent.user_id`!")
        if(!parent.user_auth) throw new Error("Couldn't find `parent.user_auth`!")
        
        const xData = parent.X.characters.find(x => x.name == name)
        if(!xData) throw new Error(`Couldn't find a character with the name ${name}!`)
        if(xData.online) throw new Error(`It looks like ${name} is already online!`)
        
        return fetch(url, {
            "credentials": "omit",
            "headers": {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            "referrer": url,
            "body": new URLSearchParams({
                "user": parent.user_id,
                "auth": parent.user_auth,
                "char": xData.id,
                "char_type": xData.type
            }),
            "method": "POST",
            "mode": "no-cors"
        })
    }

function start()
{
	startEarthiverseCharacter("aRanDonDon")
	//startEarthiverseCharacter("Warious")
	//startEarthiverseCharacter("arMAGEdon")
	//startEarthiverseCharacter("MerchanDiser")
}
start()