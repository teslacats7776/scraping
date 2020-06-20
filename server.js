var express = require("express");

var expressHandleBars = require("express-handlebars");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = (process.env.PORT||3000);
// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));

app.engine("handlebars", expressHandleBars({
  defaultLayout: "main"
}))
app.set("view engine", "handlebars");
// Parse request body as JSON
app.use(express.urlencoded({
  extended: true
}));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

      // Connect to the Mongo DB
      mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/hwwebscrape" );
     
      
// Routes

// A GET route for scraping the echoJS website
app.get("/scrape", function (req, res) {
  // First, we grab the body of the html with axios
  axios.get("https://www.nytimes.com/news-event/coronavirus").then(function (response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);
    // console.log(response.data)
    // Now, we grab every h2 within an article tag, and do the following:
    $("ol li.css-ye6x8s").each(function (i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .children("div.css-1cp3ece")
        .children("div.css-1l4spti")
        .children("a")
        .children("h2")
        .text();
      result.link = $(this)
        .children("div.css-1cp3ece")
        .children("div.css-1l4spti")
        .children("a")
        .attr("href");
      result.summary = $(this)
        .children("div.css-1cp3ece")
        .children("div.css-1l4spti")
        .children("a")
        .children("p")
        .text();
      result.image = $(this)
        .children("div.css-1cp3ece")
        .children("div.css-1l4spti")
        .children("div.css-79elbk")
        .children("figure.css-ulz9xo")
        .children("div.css-79elbk")

        .attr("src");

      console.log("result")
      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function (dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function (err) {
          // If an error occurred, log it
          console.log(err);
        });
    });

    // Send a message to the client
    // res.send("Scrape Complete");
    res.redirect("/");
  });
});

app.get("/", function (err, res) {
  db.Article.find({
      saved: false
    })
    .then(function (dbArticle) {
      var newDbArticle = dbArticle.map(Article => {
        return {
          saved: Article.saved,
          _id: Article._id,
          title: Article.title,
          link: "https://www.nytimes.com" + Article.link,
          summary: Article.summary
        }
      })
      res.render("index", {
        articles: newDbArticle
      });

    })
    .catch(function (err) {
      res.json(err);

    });
});

// Route for getting all Articles from the db
// app.get("/articles", function(req, res) {
//   // TODO: Finish the route so it grabs all of the articles
//   db.Article.find({})
//   .then(function(dbArticle) {
//     // If all Notes are successfully found, send them back to the client
//     res.json(dbArticle);
//   })
//   .catch(function(err) {
//     // If an error occurs, send the error back to the client
//     res.json(err);
//   });
// });

//saved
app.get("/saved", function (err, res) {
  db.Article.find({
      saved: true
    })
    .then(function (dbArticle) {
      var newDbArticle = dbArticle.map(Article => {
        return {
          saved: Article.saved,
          _id: Article._id,
          title: Article.title,
          link: "https://www.nytimes.com" + Article.link,
          summary: Article.summary
        }
      })
      res.render("saved", {
        articles: newDbArticle
      });
    })
    .catch(function (err) {
      res.json(err);
    });
});
app.delete("/delete/:id", function (req, res) {
  db.Article.deleteOne({
      _id: req.params.id
    })
    .then(function (dbArticles) {
      res.render("saved", {
        articles: dbArticles
      });
    })
    .catch(function (err) {
      res.json(err);
    });
});

app.delete("/deletecomment/:articleId/:id", function (req, res) {
      var articleId = req.params.articleId
      console.log(articleId, "articleid")
      console.log(req.params.id, "noteid")
      // db.Note.deleteOne({
      //   _id: req.params.id
      // })
      // .then(function (dbArticles) {
      //  res.json(dbArticles)
      // })
      // .catch(function (err) {
      //   res.json(err);
      // });
 
      db.Article.updateOne({
        _id: articleId
      }, {
        $pullAll: {
          note: [req.params.id]
        }
      })
      .then(function (dbArticles) {
                db.Note.deleteOne({
        _id: req.params.id
      })
      .then(function (dbArticles) {
       res.json(dbArticles)
      })
      .catch(function (err) {
        res.json(err);
      });
            })
            .catch(function (err) {
                res.json(err);
            });
      });
        
       

      app.put("/saved/:id", function (req, res) {
        db.Article.update({
          _id: req.params.id
        }, {
          saved: true
        }).then(
          function (dbArticle) {
            res.json(dbArticle);
          }
        );
      });
      // Route for grabbing a specific Article by id, populate it with it's note
      app.get("/articles/:id", function (req, res) {
        // TODO
        // ====
        // Finish the route so it finds one article using the req.params.id,
        // and run the populate method with "note",
        // then responds with the article with the note included
        db.Article.findById(req.params.id)
          // Specify that we want to populate the retrieved libraries with any associated books
          .populate("note")
          .then(function (dbUser) {
            // If any Libraries are found, send them to the client with any associated Books
            res.json(dbUser);
          })
          .catch(function (err) {
            // If an error occurs, send it back to the client
            res.json(err);
          });
      });

      // Route for saving/updating an Article's associated Note
      app.post("/articles/:id", function (req, res) {
        // TODO
        // ====
        // save the new note that gets posted to the Notes collection
        // then find an article from the req.params.id
        // and update it's "note" property with the _id of the new note
        db.Note.create(req.body)
          .then(function (dbNote) {
            const filter = {
              _id: req.params.id
            };
            const update = {
              $push: {
                note: dbNote._id
              }
            };
            // If a Note was created successfully, find one User (there's only one) and push the new Note's _id to the User's `notes` array
            // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
            // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
            return db.Article.findOneAndUpdate(filter, update, {
              new: true
            });
          })
          .then(function (dbUser) {
            // If the User was updated successfully, send it back to the client
            res.json(dbUser);
          })
          .catch(function (err) {
            // If an error occurs, send it back to the client
            res.json(err);
          });



      });

 

      app.get("/notes/:id", function (req, res) {

        db.Note.findOne({ _id: req.params.id })
    
            .then(function (dbArticle) {
    
                res.json(dbArticle);
            })
            .catch(function (err) {
    
                res.json(err);
            });
    });
    
            // Start the server
            app.listen(PORT, function () {
              console.log("App running on port ", "http://localhost:" + PORT);
            });
      
