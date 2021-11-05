const express = require('express');
const router = express.Router();
const Accounts = require('../public/javascripts/accouts');
const Account = require('../public/javascripts/account');
const workoutClass = require('../public/javascripts/workout');
const Seance = workoutClass.Seance;
const Job = workoutClass.Job;
const Workout = workoutClass.Workout;
const Users = require('../public/javascripts/users');

const users = new Users().load();
const accounts = new Accounts().load();



// FONCTION POUR LA SECURISATION DES SESSIONS
function sessionSecure (req, res) {
    if (req.session.pseudo == null ) {
        res.redirect('login', { 
            title: "Login", 
            error: false,
        });
    };
};



// LA PAGE DE CONNEXION
router.get('/login', (req,res) => { 
    res.render('login', { 
        title: "Login", 
        error: false,
    });
});



// LA PAGE D4ENTRAINEMENT
router.get('/training', (req,res) => {
    sessionSecure(req, res);
    const pseudo = req.session.pseudo;

    res.render('training', { 
        title: "Training",
        data: require('../data/' + pseudo + '.json').seances,
        exMuscu: require('../data/musculationExercice.json').exercice,
    });
});



// LA PAGE D'ALIMENTATION 
router.get('/meal', (req,res) => {
    sessionSecure(req, res);

    const pseudo = req.session.pseudo;
    const calorie = accounts.get(pseudo);

    res.render('meal', { 
        title: "Meal", 
        calorie: calorie.calorie,
    });
});



// L'AJOUT DE CALORIE SUR LA PAGE D'ALIMENTATION
router.post('/addCal', (req,res) => {
    sessionSecure(req,res);

    const pseudo = accounts.get(req.session.pseudo);

    if (req.body.cal === ""){
        res.render('Meal', { 
            title: "Meal", 
            calorie: pseudo.calorie, 
        });
        return;
    };

    const calorie = pseudo.calorie + parseInt(req.body.cal);
    const account = new Account(pseudo.pseudo, calorie, pseudo.sleep);
    pseudo.calorie = calorie;

    accounts.add(account);
    accounts.save();

    res.render('meal', { 
        title: "Meal", 
        calorie: calorie,
    });
});



// AJOUT DES CALORIES SUR LA PAGE D'ACCUEIL
router.post('/homeAddCal', (req,res) => {
    sessionSecure(req,res);

    const pseudo = accounts.get(req.session.pseudo);

    if (req.body.cal === ""){
        res.render('home', { 
            title: "Home", 
            calorie: pseudo.calorie,
        });
        return;
    };    

    const calorie = pseudo.calorie + parseInt(req.body.cal);
    const account = new Account(pseudo.pseudo, calorie, pseudo.sleep);
    pseudo.calorie = calorie;

    accounts.add(account);
    accounts.save();

    res.render('home', { 
        title: "Home", 
        calorie: calorie,
    });
});



// REMET A 0 LE NOMBRE DE CALORIE SUR LA PAGE D'ACCUEIL
router.post('/homeResetCal', (req,res) => {
    sessionSecure(req,res);

    const pseudo = accounts.get(req.session.pseudo);
    const calorie = pseudo.calorie = 0;
    const account = new Account(pseudo.pseudo, calorie, pseudo.sleep);

    accounts.add(account);
    accounts.save();

    res.render('home', { 
        title: "Home", 
        calorie: calorie,
    });
});



// REMET A 0 LE NOMBRE DE CALORIE SUR LA PAGE D'ALIMENTATION
router.post('/resetCal', (req,res) => {
    sessionSecure(req,res);

    const pseudo = accounts.get(req.session.pseudo);
    const calorie = pseudo.calorie = 0;
    const account = new Account(pseudo.pseudo, calorie, pseudo.sleep);

    accounts.add(account);
    accounts.save();

    res.render('meal', { 
        title: "Meal", 
        calorie: calorie,
    });
});


 
// PAGE DE SOMMEIL
router.get('/sleep', (req,res) => {
    sessionSecure(req,res);
    res.render('sleep', { 
        title: "Sleep",
    });
});



 // PAGE DE PROFILE
router.get('/profiles', (req,res) => {
    sessionSecure(req,res);

    const pseudo = req.session.pseudo;
    const user = users.get(pseudo);
    res.render('profiles', { 
        title: "Profiles", 
        error: false,
        pseudo: user.pseudo,
        name: user.name,
        firstname: user.firstname,
        email: user.email,
    });
});



// LA PAGE D'ACCUEIL
router.get('/home', (req,res) => {
    sessionSecure(req,res);

    const pseudo = req.session.pseudo;
    const calorie = accounts.get(pseudo);
    res.render('home', { 
        title: "Home", 
        calorie: calorie.calorie,
    });
});



// AJOUTE DES ENTRAINEMENTS
router.post('/addWorkout', (req,res) => {
    sessionSecure(req,res);

    const pseudo = req.session.pseudo;
    
    let seance = new Seance(req.body.training_name, req.body.date, null, false, req.body.detail, req.body.type);
    
    for (let i = 0; i<req.body.repetition.length; i++) {
        const job = new Job(req.body.exercice[i], req.body.repetition[i], req.body.serie[i], req.body.reposSec[i]);
        seance.add(job);
    };

    new Workout(pseudo).load().add(seance).save();

    const data =  require('../data/' + pseudo + '.json').seances;
    const exMuscu =  require('../data/musculationExercice.json').exercice;
    const exCourse = require('../data/courseExercice.json').exercice;

    res.render('training', { 
        title: "Training",
        data: data,
        exMuscu: exMuscu,
        exCourse: exCourse,
    });
});



// L'AFTER ENTRAINEMENT 
router.post('/afterWorkout', (req,res) => {
    const done = req.body.done;
    const difficulty = req.body.difficulty;
    
    res.render('training', { 
        title:"Training", 
    });
});



module.exports = router;