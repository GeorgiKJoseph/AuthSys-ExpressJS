const express = require('express');
const Joi = require('@hapi/joi');

const app = express();
app.use(express.json());

const credentials = [
    { username: 'name1', password: 'aaaaa', email:'name1.example.com'}
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
        if (user.password === req.body.password){
            res.send('Authentication successful..')
        }
    }
    res.status(400).send('Incorrect username or password..');
});

// SIGNUP page
app.post('/signup',(req,res) => {
    const validation = signUp_schema.validate(req.body);
    if (validation.error) {
        res.status(400).send(validation.error);
    }
    else{
        if (username_availability_check(req.body.username)){
            new_user= {
                username : req.body.username,
                password : req.body.password,
                email : req.body.email
            };
            credentials.push(new_user);
            res.send(credentials);
        }
        res.status(400).send('Username already taken..')
    }
});


const port = process.env.PORT || 3000;
app.listen(port,(err) => {
    if (err) console.log(err);
    console.log(`Listening to ${port}...`);
});