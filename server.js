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

const legoData = require('./modules/legoSets');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser'); // For parsing request bodies
const app = express();

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Middleware to set the current page URL in locals
app.use((req, res, next) => {
  res.locals.page = req.url;
  next();
});

const HTTP_PORT = process.env.PORT || 8080;

// Route to render home page
app.get('/', (req, res) => {
  res.render('home');
});

// Route to render about page
app.get('/about', (req, res) => {
  res.render('about');
});

// Route to render addSet page
app.get('/lego/addSet', async (req, res) => {
  try {
    let themes = await legoData.getAllThemes();
    res.render('addSet', { themes: themes });
  } catch (err) {
    res.status(500).render('500', { message: 'Error retrieving themes.' });
  }
});

// Route to handle adding a new Lego set
app.post('/lego/addSet', async (req, res) => {
  try {
    await legoData.addSet(req.body);
    res.redirect('/lego/sets');
  } catch (err) {
    const errorMessage = err.message || 'An unknown error occurred.';
    res.render('500', { message: `I'm sorry, but we have encountered the following error: ${errorMessage}` });
  }
});

// Route to render editSet page
app.get('/lego/editSet/:num', async (req, res) => {
  try {
    let set = await legoData.getSetByNum(req.params.num);
    let themes = await legoData.getAllThemes();
    res.render('editSet', { set, themes });
  } catch (err) {
    res.status(404).render('404', { message: err.message });
  }
});

// Route to handle editing a Lego set
app.post('/lego/editSet', async (req, res) => {
  try {
    await legoData.editSet(req.body.set_num, req.body);
    res.redirect('/lego/sets');
  } catch (err) {
    res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err.message}` });
  }
});

// Route to render sets page
app.get('/lego/sets', async (req, res) => {
  try {
    let sets = [];
    if (req.query.theme) {
      sets = await legoData.getSetsByTheme(req.query.theme);
    } else {
      sets = await legoData.getAllSets();
    }
    res.render('sets', { sets });
  } catch (err) {
    res.status(404).render('404', { message: err.message });
  }
});

// Route to render a specific Lego set page
app.get('/lego/sets/:num', async (req, res) => {
  try {
    let set = await legoData.getSetByNum(req.params.num);
    res.render('set', { set });
  } catch (err) {
    res.status(404).render('404', { message: err.message });
  }
});

// Route to handle deleting a Lego set
app.get('/lego/deleteSet/:num', (req, res) => {
  legoData.deleteSet(req.params.num).then(() => {
    res.redirect('/lego/sets');
  }).catch((err) => {
    res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err.message}` });
  });
});

// Custom 404 error handler for any routes not matched by above handlers
app.use((req, res) => {
  res.status(404).render('404', { message: 'The page you requested does not exist.' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('500', { message: `Something broke: ${err.message}` });
});

// Initialize and start the server
legoData.initialize().then(() => {
  app.listen(HTTP_PORT, () => console.log(`Server listening on http://localhost:${HTTP_PORT}`));
}).catch((err) => {
  console.error('Error initializing database:', err);
});


// Initialize database and start server
legoData.initialize()
  .then(() => {
    app.listen(HTTP_PORT, () => console.log(`Server listening on port ${HTTP_PORT}`));
  })
  .catch(err => {
    console.error("Failed to initialize database:", err);
  });
