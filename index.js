const requestPromise = require('request-promise');
const Cheerio = require('cheerio');
const $ = Cheerio.load('html');
const mongoClient = require('mongodb').MongoClient;

const mongodbURI = "mongodb+srv://admin:jDCxN4CS1WApc5m1@cluster0.jebzx.mongodb.net";
const url = 'https://www.futbolargentino.com/primera-division/tabla-de-posiciones';

function updateDB() {
  return new Promise(function (resolve, reject) {
    requestPromise(url)
      .then(html => {
        var teams = processHTML(html);
        mongoClient.connect(mongodbURI, function (err, dbo) {
          if (err)
            reject(err);
          else {
            var teamsDB = dbo.db("MyDataBase").collection("Teams");
            teamsDB.deleteMany({}, () => {
              teamsDB.insertMany(teams, function (err, result) {
                dbo.close();
                if (err)
                  reject(err);
                else
                  resolve(result);
              });
            });
          }
        });
      }).catch(error => {
        console.log(error);
      });
  });
}

function processHTML(html) {
  var teams = [];
  const teamsHTML = $('.card-body .table tbody tr', html);
  teamsHTML.each(((i, el) => {
    var team = [];

    $(el).find('td').each((i2, el2) => {
      if ($(el2).hasClass("equipo text-left")) {
        team.push($(el2).find("img").data("src"));
        team.push($(el2).find("span:first").text().trim());
      }
      else {
        team.push($(el2).text().trim());
      }
    });

    teams.push(team);
  }));

  return formatData(teams);
}

//convert [[string, string, string, string, string, string, string, string, string, string, string], ...]
//to [{ position: string, imgUrl: string, team: sring, PJ: string, G: string, E: string, P: string, GF: string, GC: string, DG: string, points: string }, ...]
function formatData(data) {
  var formattedData = [];

  data.forEach(element => {
    formattedData.push({
      position: element[0],
      imgUrl: element[1],
      team: element[2],
      PJ: element[3],
      G: element[4],
      E: element[5],
      P: element[6],
      GF: element[7],
      GC: element[8],
      DG: element[9],
      points: element[10]
    })
  });

  return formattedData;
}

function readDB() {
  return new Promise(function (resolve, reject) {
    mongoClient.connect(mongodbURI, function (err, dbClient) {
      if (err)
        console.log(err);
      else {
        var teamsCollection = dbClient.db("MyDataBase").collection("Teams");
        teamsCollection.find().toArray(function (err, result) {
          if (err)
            reject(err);
          else
            resolve(result);

          dbClient.close();
        });
      }
    });
  });
}

const express = require('express');
const app = express();
const path = require('path');

app.set('port', process.env.PORT || 8000);

//handlebars
const {engine} = require('express-handlebars') 
app.set('view engine', 'hbs');

app.engine('hbs', engine({
    defaultLayout: false,
    helpers:{
      posColor: function(value, options) {
        switch(value){
          case "1": 
          case "2":
            return "clasifica";
            break;
          case "13":
          case "14":
            return "no-clasifica";
            break;
          default: ""
        }        
      }
    }
}));
app.use(express.static('views'));


app.get('/', (req, res) => {
  updateDB().then(() => {
    readDB().then((data) => {
      res.render('index', { teamsA: data.slice(0,14), teamsB: data.slice(14, data.length) });
    }).catch((err) => { console.log(err); });
  }).catch((err) => { console.log(err); });
});

app.listen(app.get('port'), () => {
  console.log(`app listening on port ${app.get('port')}`)
});


setInterval(() => {
  updateDB();
}, 10000);
