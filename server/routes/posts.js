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
var msUsers;
var changed = false;

router.get('/',async (req,res)=>{
    // here we get an access token
    if(!changed)
    {
    const authResponse = await auth.getToken(auth.tokenRequest);

    var users = await getUsers(authResponse);
    this.msUsers=await getPresence(users,authResponse);
    // display result
    //return msUsers;
    res.status(200).json(this.msUsers);
    }
    else{
        res.status(200).json(this.msUsers);
    }
});

router.post('/myNotifyClient',(req,res)=>{
    if(req.query && req.query.validationToken) {
        res.set('Content-Type','application/json');
        //res.set('Content-Type','text/plain');
        res.send(req.query.validationToken);
        return;
    }
    if(!req.body) return res.sendStatus(400);
    //console.log(req.body);
    res.status(200).send(req.body.value); //has presence updated value
    
    //new work//
    if(req.body.value != null)
    {
            console.log(req.body.value);
            console.log(req.body.value[0].resourceData.id);
            let recIndex=this.msUsers.findIndex(r=>r.id==req.body.value[0].resourceData.id)
            console.log(recIndex);
            if(recIndex != -1)
            {
                this.msUsers[recIndex].availability=req.body.value[0].resourceData.availability;
                console.log(this.msUsers);
                changed = true;
            }
            else{
                changed = false;
            }
    }
    //end new work//
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
            url = auth.uriConfig.presence.replace('{0}',user.id)
            var presence = await callApi(url,token);
            msUser.availability=presence.availability;
            msUser.displayName = user.displayName;
            MsUsers.push(msUser);
            ids.push(user.id);
        }
        await createSubscription(ids.join(','));
    return MsUsers;
}

async function callApi(endpoint, accessToken) {

    const options = {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    };

    console.log('request made to web API at: ' + new Date().toString());

    try {
        const response = await axios.default.get(endpoint, options);
        return response.data;
    } catch (error) {
        console.log(error)
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
        // Use the authProvider object to create the class.
    });

    const options = {
        authProvider,
    };
    
    //const client = Client.init(options);
    
    const subscription = {
       changeType: "updated",
       notificationUrl:  "https://c262-59-92-83-250.ngrok.io/posts/myNotifyClient",
       resource: "/communications/presences?$filter=id in ('50a252ce-3dbc-4b40-9e7a-36680ddfd5a3')",
       expirationDateTime: new Date().addHours(1),
       //includeResourceData: true,
       clientState: "secretClientValue",
    };
    
    let subscriptions = await client.api('/subscriptions').get();

    if(subscriptions.value[0]!=null)
    {
        console.log(subscriptions.value[0].id);
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
    constructor(email, id,availability,displayName) {
      this.email = email;
      this.displayName=displayName;
      this.id=id;
      this.availability=availability;
    }
  }

module.exports = router;