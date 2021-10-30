const express = require('express');
const router = express.Router();
const Accounts = require('../public/javascripts/accouts');
const Account = require('../public/javascripts/account');
const workoutClass = require('../public/javascripts/workout');
const Seance = workoutClass.Seance;
const Job = workoutClass.Job;
const Workout = workoutClass.Workout;
const Users = require('../public/javascripts/users');
const store = require('store')

const users = new Users().load();
const accounts = new Accounts().load();

// Workout handle
 
router.get('/training', (req,res) => {
    const pseudo = store.get('user').pseudo;
    res.render('training', { 
        title: "Training",
        data: require('../data/' + pseudo + '.json').seances,
        exercice: require('../data/exercice.json').exercice,
    });
})

// Meal handle
 
router.get('/meal', (req,res) => {
    const pseudo = store.get('user').pseudo;
    const calorie = accounts.get(pseudo);
    res.render('meal', { title: "Meal", calorie: calorie.calorie});
})

router.post('/addCal', (req,res) => {
    const pseudo = accounts.get(req.body.ok_count_calorie);

    if (req.body.cal === ""){
        res.render('meal', { title: "Meal", calorie: pseudo.calorie })
        return;
    }

    const calorie = pseudo.calorie + parseInt(req.body.cal);
    const account = new Account(pseudo.pseudo, calorie, pseudo.sleep);

    pseudo.calorie = calorie;

    accounts.add(account);
    accounts.save();

    res.render('meal', { title: "Meal", calorie: calorie})
})

// Ajoute des calories sur la page d'accueil
router.post('/homeAddCal', (req,res) => {
    const pseudo = accounts.get(req.body.ok_count_calorie);

    if (req.body.cal === ""){
        res.render('home', { title: "Home", calorie: pseudo.calorie });
        return;
    }    

    const calorie = pseudo.calorie + parseInt(req.body.cal);
    const account = new Account(pseudo.pseudo, calorie, pseudo.sleep);
    pseudo.calorie = calorie;

    accounts.add(account);
    accounts.save();

    res.render('home', { title: "Home", calorie: calorie})
})

// Remet à 0 le nombre de calorie sur la page d'accueil
router.post('/homeResetCal', (req,res) => {
    const pseudo = accounts.get(req.body.reset_count_calorie);
    const calorie = pseudo.calorie = 0;
    const account = new Account(pseudo.pseudo, calorie, pseudo.sleep);

    accounts.add(account);
    accounts.save();

    res.render('home', { title: "Home", calorie: calorie});
})

// Remet à 0 le nombre de calorie sur la page d'alimentation
router.post('/resetCal', (req,res) => {
    const pseudo = accounts.get(req.body.reset_count_calorie);
    const calorie = pseudo.calorie = 0;
    const account = new Account(pseudo.pseudo, calorie, pseudo.sleep);

    accounts.add(account);
    accounts.save();

    res.render('meal', { title: "Meal", calorie: calorie})
})

// Sleep handle
 
router.get('/sleep', (req,res) => {
    res.render('sleep', { title: "Sleep"})
})


// Profiles handle
 
router.get('/profiles', (req,res) => {
    const pseudo = store.get('user').pseudo;
    const user = users.get(pseudo);
    console.log(user)
    res.render('profiles', { 
        title: "Profiles", 
        error: false,
        pseudo: user.pseudo,
        name: user.name,
        firstname: user.firstname,
        email: user.email
    })
})

router.get('/home', (req,res) => {
    const pseudo = store.get('user').pseudo;
    const calorie = accounts.get(pseudo);
    res.render('home', { title: "Home", calorie: calorie.calorie})
})

// Ajoute des entrainements
router.post('/addWorkout', (req,res) => {

    const pseudo = req.body.pseudo;
    //let data = require('../data/'+ pseudo +'.json');
    
    let seance = new Seance(req.body.training_name, req.body.date, null, false, req.body.detail, req.body.type);
    
    for (let i = 0; i<req.body.repetition.length; i++) {
        const job = new Job(req.body.exercice[i], req.body.repetition[i], req.body.serie[i], req.body.reposSec[i]);
        seance.add(job)
    }
    new Workout(pseudo).load().add(seance).save();

    const data =  require('../data/' + pseudo + '.json').seances
    const ex =  require('../data/exercice.json').exercice

    res.render('training', { 
        title: "Training",
        data: data,
        exercice: ex,
    });
})


// Je ne sais plus à quoi cela sert
router.post('/afterWorkout', (req,res) => {
    const done = req.body.done;
    const difficulty = req.body.difficulty;
    
    res.render('training', { title:"Training", ok:false})
})

module.exports = router

