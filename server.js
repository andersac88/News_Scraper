var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/NewsScraper", { useNewUrlParser: true });

// Routes

// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with axios
  axios.get("https://www.politicalwire.com/").then( response => {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    const $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $(".post").each(function(i, element) {
      // Save an empty result object
      const result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this).find("h2").text();
      result.content = $(this).find(".entry-content").text();
      result.link = $(this).find(".entry-content").find("a").attr("href");
      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
        })
        .catch(function(err) {
          // If an error occurred, log it
          console.log(err);
        });
    });

    // Send a message to the client
    res.send("Scrape Complete");
  });
});

app.get("/", function(req, res) {
  let start = new Date(new Date().getTime() - (6 * 60 * 60 * 1000));
  db.Article.find({date: {$gte: start}}).sort({ createdAt: -1 }).then(dbArticles => {
    let hbsObject = {
      articles: dbArticles
    };
    res.render("index", hbsObject);
  })
  .catch(function(err) {
    // If an error occurred, send it to the client
    res.json(err);
  });
})

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  db.Article.find().sort({ createdAt: -1 }).then(dbArticles => {
    let hbsObject = {
      articles: dbArticles
    };
    res.render("index", hbsObject);
  })
  .catch(function(err) {
    // If an error occurred, send it to the client
    res.json(err);
  });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      let hbsObject = {
        articleName: dbArticle.title,
        notes: dbArticle.note
      }
res.render("article", hbsObject)
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving an Article's associated Note
app.post("/articles/:id", function(req, res) {
  db.Note.create(req.body)
  .then(function(dbNote) {
    return db.Article.findOneAndUpdate({"_id": req.params.id}, { $push: {
      note: dbNote._id} }, {new: true})
    })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(error) {
      res.json(error);
    })
  })

app.get("/notes/:id", function(req, res) {
  db.Note.findOne({"_id": req.params.id}).then(function(dbNote) {
    res.json(dbNote);
  })
})

app.put("/notes/:id", function(req, res) {
  db.Note.update({"_id": req.params.id}, {$set: req.body}).then(function(dbNote) {
    res.json(dbNote);
  })
})

app.delete("/notes/:id", function(req, res) {
  db.Note.remove({"_id": req.params.id}).then(function(dbNote){
    res.json(dbNote);
  })
})

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
