/********************************************************************************
* WEB322 – Assignment 05
* 
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
* 
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
* Name: Jashandeep Singh   Student ID: 145936225   Date: 28/07/2024
*
* Published URL: https://ass5-six.vercel.app/
*
********************************************************************************/
const legoData = require("./modules/legoSets");
const path = require("path");
const express = require('express');
const app = express();

// Explicitly require 'pg' to ensure it's loaded properly
require('pg');

const HTTP_PORT = process.env.PORT || 8080;

// Set the views directory
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Update express.static middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.locals.page = req.url;
  next();
});

app.get('/', (req, res) => {
  res.render("home");
});

app.get('/about', (req, res) => {
  res.render("about");
});

app.get('/lego/addSet', async (req, res) => {
  try {
    let themes = await legoData.getAllThemes();
    res.render('addSet', { themes: themes });
  } catch (err) {
    console.error('Error fetching themes for addSet:', err);
    res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err.message}` });
  }
});

app.post('/lego/addSet', async (req, res) => {
  try {
    await legoData.addSet(req.body);
    res.redirect("/lego/sets");
  } catch (err) {
    console.error('Error adding set:', err);
    res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err.message}` });
  }
});

app.get('/lego/editSet/:num', async (req, res) => {
  try {
    let set = await legoData.getSetByNum(req.params.num);
    let themes = await legoData.getAllThemes();
    res.render("editSet", { set, themes });
  } catch (err) {
    console.error('Error fetching set or themes for editSet:', err);
    res.status(404).render("404", { message: err.message });
  }
});

app.post("/lego/editSet", async (req, res) => {
  try {
    await legoData.editSet(req.body.set_num, req.body);
    res.redirect("/lego/sets");
  } catch (err) {
    console.error('Error editing set:', err);
    res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err.message}` });
  }
});

app.get("/lego/sets", async (req, res) => {
  try {
    let sets = req.query.theme
      ? await legoData.getSetsByTheme(req.query.theme)
      : await legoData.getAllSets();
    res.render("sets", { sets });
  } catch (err) {
    console.error('Error fetching sets:', err);
    res.status(404).render("404", { message: err.message });
  }
});

app.get("/lego/sets/:num", async (req, res) => {
  try {
    let set = await legoData.getSetByNum(req.params.num);
    res.render("set", { set });
  } catch (err) {
    console.error('Error fetching set by number:', err);
    res.status(404).render("404", { message: err.message });
  }
});

app.get("/lego/deleteSet/:num", (req, res) => {
  legoData.deleteSet(req.params.num)
    .then(() => res.redirect("/lego/sets"))
    .catch((err) => {
      console.error('Error deleting set:', err);
      res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err.message}` });
    });
});

app.use((req, res) => {
  res.status(404).render("404", { message: "The page you requested does not exist." });
});

legoData.initialize()
  .then(() => app.listen(HTTP_PORT, () => console.log(`Server listening on port ${HTTP_PORT}`)))
  .catch((err) => console.error('Error initializing the database:', err));
