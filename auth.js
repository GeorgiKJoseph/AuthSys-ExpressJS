const express = require('express');
const Joi = require('@hapi/joi');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());

const credentials = [
    {
        username: "name1",
        salt: "$2b$10$xvfKfBoI5Qk0uvzF9YBxce",
        hash: "$2b$10$xvfKfBoI5Qk0uvzF9YBxceuq6KQAlzN.1STzkcvQALFQJyitQu7Ha",
        email: "name1@gmail.com"
    },
    {
        username: "name2",
        salt: "$2b$10$U4LK91HgINhjhJUXg2xrEe",
        hash: "$2b$10$U4LK91HgINhjhJUXg2xrEem.dJDD51C7K9tMOPASKqV5lVZyRa0XO",
        email: "fdsfsj@gmail.com"
    }
]
const logIn_schema = Joi.object({
    username : Joi.string().alphanum().min(4).max(20).required(),
    password : Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{5,30}$')).required()
});

const signUp_schema = Joi.object({
    username : Joi.string().alphanum().min(4).max(20).required(),
    password : Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{5,30}$')).required(),
    repeat_password : Joi.ref('password'),
    email : Joi.string().email().required()
});

function username_availability_check(usrname){
    const user = credentials.find(n => n.username === usrname);
    if(user){ return false; }
    return true;
}

// LOGIN page
    app.post('/login', (req, res) => {
        const validation = logIn_schema.validate(req.body);
        if (validation.error) {
            res.status(400).send('Invalid input..');
        }
        const user = credentials.find(u => u.username === req.body.username);
        if (user) {
            bcrypt.hash(req.body.password,user.salt, (err,hash) => {
                if (hash === user.hash) {
                    res.send('Authentication successful..');
                }
                else{
                    res.status(400).send('Incorrect username or password..');
                }
            });
        }
        else { res.status(400).send('Incorrect username or password..'); }
    });

// SIGNUP page
app.post('/signup',(req,res) => {
    const validation = signUp_schema.validate(req.body);
    if (validation.error) {
        res.status(400).send('Invalid input..');
    }
    else{
        if (username_availability_check(req.body.username)){
            const s = 10;
            bcrypt.genSalt(s, (err,salt) => {
                if (err) {
                    res.status(400).send('error in salt..')
                }
                bcrypt.hash(req.body.password,salt, (err_hash, hash) => {
                    if (err) {
                        res.status(400).send('error in hash..')
                    }
                    new_user= {
                        username : req.body.username,
                        salt: String(salt),
                        hash: String(hash),
                        email: req.body.email
                    };
                    credentials.push(new_user);
                });
            });
            res.send(credentials);
        }
        res.status(400).send('Username already taken..');
    }
});


const port = process.env.PORT || 3000;
app.listen(port,(err) => {
    if (err) console.log(err);
    console.log(`Listening to ${port}...`);
});