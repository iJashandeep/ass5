/********************************************************************************
* WEB322 – Assignment 05
* 
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
* 
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
* Name: Pavneet Kaur   Student ID: 132766221   Date: 29/03/2024
*
* Published URL: https://tan-lively-lobster.cyclic.app/
*
********************************************************************************/

app.use(express.static(__dirname + '/public'));
app.set('views', path.join(__dirname, '/views'));


const express = require('express');
const path = require('path');
const legoData = require('./modules/legoSets');
const pg = require('pg'); // Explicitly require the "pg" module
const app = express();

const HTTP_PORT = process.env.PORT || 8080;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Set the views directory

app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from public
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.locals.page = req.url;
  next();
});

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/about', (req, res) => {
  res.render('about');
});

app.get('/lego/addSet', async (req, res) => {
  let themes = await legoData.getAllThemes();
  res.render('addSet', { themes: themes });
});

app.post('/lego/addSet', async (req, res) => {
  try {
    await legoData.addSet(req.body);
    res.redirect('/lego/sets');
  } catch (err) {
    const errorMessage = err.message || 'An unknown error occurred.';
    res.render('500', { message: `I'm sorry, but we have encountered the following error: ${errorMessage}` });
  }
});

app.get('/lego/editSet/:num', async (req, res) => {
  try {
    let set = await legoData.getSetByNum(req.params.num);
    let themes = await legoData.getAllThemes();
    res.render('editSet', { set, themes });
  } catch (err) {
    res.status(404).render('404', { message: err });
  }
});

app.post('/lego/editSet', async (req, res) => {
  try {
    await legoData.editSet(req.body.set_num, req.body);
    res.redirect('/lego/sets');
  } catch (err) {
    res.render('500', { message: `I'm sorry, but we have encountered the following error ${err}` });
  }
});

app.get('/lego/sets', async (req, res) => {
  let sets = [];
  try {
    if (req.query.theme) {
      sets = await legoData.getSetsByTheme(req.query.theme);
    } else {
      sets = await legoData.getAllSets();
    }
    res.render('sets', { sets });
  } catch (err) {
    res.status(404).render('404', { message: err });
  }
});

app.get('/lego/sets/:num', async (req, res) => {
  try {
    let set = await legoData.getSetByNum(req.params.num);
    res.render('set', { set });
  } catch (err) {
    res.status(404).render('404', { message: err });
  }
});

app.get('/lego/deleteSet/:num', (req, res) => {
  legoData.deleteSet(req.params.num).then(() => {
    res.redirect('/lego/sets');
  }).catch((err) => {
    res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` });
  });
});

app.use((req, res) => {
  res.status(404).render('404', { message: 'The page you requested does not exist.' });
});

legoData.initialize().then(() => {
  app.listen(HTTP_PORT, () => console.log(`Server listening on: ${HTTP_PORT}`));
}).catch((err) => {
  console.log(err);
});
