const express = require('express');
const Users = require('../public/javascripts/users.js');
const User = require('../public/javascripts/user');
const Account = require('../public/javascripts/account');
const Accounts = require('../public/javascripts/accouts');
const workoutClass = require('../public/javascripts/workout');
const Workout = workoutClass.Workout;
const router = express.Router();

const users = new Users().load();
const accounts = new Accounts().load();



// PAGE DE CONNEXION
router.get('/login', (req,res) => { 
    res.render('login', { 
        title: "Login", 
        error: false,
    });
});



// LA PAGE DE CREATION DE COMPTE
router.get('/register', (req,res) => {
    res.render('register', { 
        title: "Register",
        error: false,
    });
});



// AJOUTE UN NOUVEL UTILISATEUR
router.post('/register', (req,res) => {

    const pseudo = req.body.pseudo;
    const firstname = req.body.firstname;
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const password2 = req.body.password2;

    if  (pseudo === '' || firstname === '' || name === '' || email === '' || password === '' || password2 === '') {
        res.render('register', { title: "Register", message: "Veillez renseigner tout les champs", error: true});
        return;
    };

    if (users.exist(pseudo)) {
        res.render('register', { title: "Register", message: "Pseudo déjà utilisé", error: true});
        return;
    };

    if (password != password2) {
        res.render('register', { title: "Register", message: "Mots de passe différents", error: true});
        return;
    };

    const user = new User(pseudo, name, firstname).withEmail(email).withPassword(password, true);
    const account = new Account(pseudo, 0, 0);
    const workout = new Workout(pseudo);

    users.add(user);
    users.save(user.pseudo);

    accounts.add(account);
    accounts.save();

    workout.create(pseudo);

    res.render('login', { 
        title: "Login", 
        error: false,
    });
});



// SYSTEME DE CONNEXION 
router.post('/login', (req,res) => {

    const pseudo = req.body.pseudo;
    const password = req.body.password;

    sess = req.session;
    sess.pseudo = pseudo;
    const cal = accounts.get(sess.pseudo);


    if (pseudo === '' || password === '') {
        res.render('login', { title: "Login", message: "Veillez renseigner tout les champs", error: true});
        return;
    };

    if (!users.exist(pseudo)) {
        res.render('login', { title: "Login", message: "Utilisateur introuvable", error: true});
        return;
    };

    const user = users.get(pseudo);
    if (!user.checkPassword(password)) {
        res.render('login', { title: "Login", message: "Mot de passe incorrect", error: true });
        return;
    };


    console.log(user.pseudo + " vient de se connecter");

    res.render('home', { 
        title: "Home",
        calorie: cal.calorie,
    });
});



// PAGE POUR LA SELECTION DU MAIL POUR LE MOT DE PASSE
router.get('/forgot', (req,res) => {
    res.render('forgot', { 
        title: "Forgot",
    });
});



// SYSTEME D'ENVOI D'UN MAIL SI OUBLIE DU MOT DE PASSE
router.post('/sendMail', (req,res) => {
    });



// SYSTEME DE DECONNEXION
router.post('/logout', (req,res) => {
    console.log(req.body.logoutPseudo + ' vient de se déconnecter.');
    res.render('login', { 
        title: "Login", 
        error: false,
    });
});



// SYSTEME DE CHANGEMENT DE MOT DE PASSE
router.post('/changePassword', (req,res) => {

    const oldPassword = req.body.old;
    const newPassword = req.body.new;
    const newPassword2 = req.body.new2;
    const pseudo = req.session.pseudo;
    const user = users.get(pseudo);

    if (user === undefined) {
        res.render('Profiles', { title: "Profiles", error: true, message: 'Aucun utilisateur pour le pseudo [' + pseudo + ']',pseudo: user.pseudo,name: user.name,firstname: user.firstname, email: user.email});
        return;
    };

    if (newPassword === '' || newPassword2 === '') {
        res.render('Profiles', { title: "Profiles", error: true, message: "Veillez renseigner tout les champs",pseudo: user.pseudo,name: user.name,firstname: user.firstname, email: user.email});
        return;
    };

    if (!user.checkPassword(oldPassword)) {
        res.render('Profiles', { title: "Profiles", error: true, message: "Mauvais mot de passe pour " + pseudo, pseudo: user.pseudo,name: user.name, firstname: user.firstname, email: user.email});
        return;
    };

    if (oldPassword === newPassword) {
        res.render('Profiles', { title: "Profiles", error: true, message: "Le mot de passe doit être différent de l'ancien", pseudo: user.pseudo,name: user.name, firstname: user.firstname, email: user.email});
        return;
    };

    if (newPassword != newPassword2) {
        res.render('Profiles', { title: "Profiles", error: true, message: "Confirmation de mot de passse incorrect", pseudo: user.pseudo,name: user.name, firstname: user.firstname, email: user.email});
        return;
    };

    user.withPassword(newPassword, true);
    users.save();
    res.render('profiles', { 
        title: "Profiles",
        error: false,
        pseudo: user.pseudo,
        name: user.name,
        firstname: user.firstname, 
        email: user.email,
    });
});

module.exports = router;