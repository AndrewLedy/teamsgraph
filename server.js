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


const port = process.env.port || 4300;

app.listen(port, (req,res)=>{
 console.log(`Running on ${port}`);
});