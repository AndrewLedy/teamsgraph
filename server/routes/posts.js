const express = require('express');
const router = express.Router();
const auth = require('./auth');
const axios =require('axios');
const {Client} = require("@microsoft/microsoft-graph-client");
const {TokenCredentialAuthenticationProvider} = require("@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials");
const {UsernamePasswordCredential} = require("@azure/identity");
require('isomorphic-fetch');

require('rxjs/operators');

//GET POST
var changed = false;

router.get('/',async (req,res)=>{
    // here we get an access token
    if(changed)
    {
        res.status(200).json(this.msUsers);
    }
    else{
        changed=false;
        const authResponse = await auth.getToken(auth.tokenRequest);
        var users = await getUsers(authResponse);
        //var profileUsers = await getProfilePicture(users,authResponse);
        //this.msUsers=await getPresence(profileUsers,authResponse);
        this.msUsers=await getPresence(users,authResponse);
        res.status(200).json(this.msUsers);
    }
});

router.post('/myNotifyClient',(req,res)=>{
    if(req.query && req.query.validationToken) {
        res.set('Content-Type','application/json');
        res.send(req.query.validationToken);
        return;
    }
    if(!req.body) return res.sendStatus(400);
    res.status(200).send(req.body.value); //has presence updated value
        //console.log(req.body.value);
        if(req.body.value != null)
        {
            let recIndex=this.msUsers.findIndex(r=>r.id==req.body.value[0].resourceData.id)
            if(recIndex != -1)
            {
                this.msUsers[recIndex].availability=req.body.value[0].resourceData.availability;
                changed = true;
            }
            else{
                changed = false;
            }
    }
});

async function getUsers(token)
{
     // call the web API with the access token
     const users = await callApi(auth.uriConfig.users, token);
     return users;
}

async function getPresence(users,token)
{
    var MsUsers=new Array();
    var ids=new Array();
        for(const user of users.value)
        {
            var msUser = new MsUser();
            msUser.id=user.id;
            msUser.email=user.mail;
            msUser.displayName=user.displayName;
            url = auth.uriConfig.presence.replace('{0}',user.id)
            var presence = await callApi(url,token);
            msUser.availability=presence.availability;
            //msUser.url = user.url;
            MsUsers.push(msUser);
            ids.push("'"+user.id+"'");
        }
        //console.log(ids.join(','));
        await createSubscription(ids.join(','));
    return MsUsers;
}

async function getProfilePicture(users,token)
{
    var profileUsers=new Array();
        var i=1;
        for(const user of users.value)
        {
            var msUser = new MsUser();
            msUser.id=user.id;
            msUser.email=user.mail;
            msUser.displayName=user.displayName;
            url = auth.uriConfig.profile.replace('{0}',user.id)
            var profile = await callApi(url,token);
            //profile.replace(/^data:image\/\w+;base64,/, '');
            const avatar = new Buffer.from(profile, 'binary').toString('base64');
            var img = 'data:image/png;base64,' + avatar;
            msUser.url=decodeBase64Image(img);
            profileUsers.push(msUser);            
            //ids.push(user.id);
        }
    return profileUsers;
}

function decodeBase64Image(dataString) {
    var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
      response = {};
  
    if (matches.length !== 3) {
      return new Error('Invalid input string');
    }
  
    response.type = matches[1];
    response.data = new Buffer(matches[2], 'base64');
  
    return response;
  }

async function callApi(endpoint, accessToken) {

    const options = {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    };

    try {
        const response = await axios.default.get(endpoint, options);
        return response.data;
    } catch (error) {
        return error;
    }
};

async function createSubscription(ids)
{
    const credential = new UsernamePasswordCredential('bec2a7a8-9358-4565-b1b5-6c6e0ba6da9b','e2a3b3f9-7e41-4e25-8514-4a6ad51ba807',
    'subashandrew@zb136.onmicrosoft.com','aspire@123') // DeviceCodeCredential('bec2a7a8-9358-4565-b1b5-6c6e0ba6da9b', 'e2a3b3f9-7e41-4e25-8514-4a6ad51ba807', 'Cy77Q~b-vrx0U~aCmtWDTDXZ-dCLYM5BbRmAW');
    const authProvider = new TokenCredentialAuthenticationProvider(credential, {
        scopes: ["user.read","user.read.all","presence.read","presence.read.all"]
    });
    
    const client = Client.initWithMiddleware({
        debugLogging: true,
        authProvider
    });

    const options = {
        authProvider,
    };
     
    const subscription = {
       changeType: "updated",
       notificationUrl:  "https://9cea-2405-201-e010-f807-95ac-9589-a6ae-c1de.ngrok.io/posts/myNotifyClient",
       resource: "/communications/presences?$filter=id in ("+ids+")",
       expirationDateTime: new Date().addHours(1),
       //includeResourceData: true,
       clientState: "secretClientValue",
    };
    
    let subscriptions = await client.api('/subscriptions').get();

    if(subscriptions.value[0]!=null)
    {
        await client.api('/subscriptions/'+subscriptions.value[0].id).delete();
    }

    await client.api('/subscriptions')
        .post(subscription);
    
}

Date.prototype.addHours = function(h) {
    this.setTime(this.getTime() + (h*60*60*1000));
    return this;
  }

class MsUser {
    constructor(email, id,availability,displayName,url) {
      this.email = email;
      this.displayName=displayName;
      this.id=id;
      this.availability=availability;
      this.allowMessage=false;
      this.url=url;
    }
  }

module.exports = router;