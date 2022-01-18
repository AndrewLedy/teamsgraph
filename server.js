const express= require('express');
const path  = require('path');
const bodyParser = require('body-parser');
const app =express();
const posts = require('./server/routes/posts');

//middleware
app.use(express.static(path.join(__dirname,'dist')));
app.use(bodyParser.json());
app.use('/posts', posts);
//middleware

app.get('*',(req,res)=>{
    res.sendFile(path.join(__dirname,'dist/index.html'));
});

app.post('/myNotifyClient',(req,res)=>{
    //console.log("SUBASH :" + req.body);
    if(req.query && req.query.validationToken) {
        res.set('Content-Type','application/json');
        //res.set('Content-Type','text/plain');
        res.send(req.query.validationToken);
        return;
    }
    if(!req.body) return res.sendStatus(400);
    //console.log(req.body);
    res.status(200).send(req.body.value);
});
const port = process.env.port || 4300;

app.listen(port, (req,res)=>{
 console.log(`Running on ${port}`);
});