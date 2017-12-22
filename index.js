

const { app, BrowserWindow, ipcMain } = require("electron")
const sqlite3 = require('sqlite3').verbose();
const mediadatabase = "mediadatabase.db";
const fileType = require('file-type');
const fs = require('fs'); // Load the File System to execute our common tasks (CRUD)
const DownloadManager = require("electron-download-manager");

DownloadManager.register({downloadFolder:"Data/File/"});;


// var knex = require("knex")({
// 	client: "sqlite3",
// 	connection: {
// 		filename: "./database.sqlite"
// 	}
// });

app.on("ready", () => {

var UpdateData = [];
var DeleteData = [];
var NewData = [];
var files = [];


const mainWindow = new BrowserWindow({});
mainWindow.loadURL(`file://${__dirname}/index.html`);



databaseSetup();
fileDownload();





function Setup{
  files = Directory.GetFiles(AppDomain.CurrentDomain.BaseDirectory+"Data\\Media");
}



function downloadNewFile(urll){

  //url: "http://localhost/advertisng/file/"+"IELTS & TOEFL.doc" + "?timestamp="+Date.now()

  DownloadManager.download({
      url : urll
   }, function(error, url){
       if(error){
           console.log("ERROR: " + url);
           return;
       }

       console.log("DONE: " + url);
   });



}


function deleteExitingFile(filepath){

  if (fs.existsSync(filepath)) {
      fs.unlink(filepath, (err) => {
          if (err) {
              console.log(err);
              return;
          }
          console.log("File succesfully deleted");
      });
  } else {
      console.log("This file doesn't exist, cannot delete");
  }


}


function databaseSetup(){
  let db = new sqlite3.Database(mediadatabase);

  db.run('CREATE TABLE IF NOT EXISTS media (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,name VARCHAR( 100 ) NULL,version INT NULL);');
  db.run('CREATE TABLE IF NOT EXISTS doc (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,name VARCHAR( 100 ) NULL,version INT NULL);');

  db.close();

}

function fileDownload() {

  const fetch = require('electron-fetch');
  const url2getJson="http://localhost/advertising/api.php?msg=whatsupdoc";
  var name , version;


//read from db name , version
  var db = new sqlite3.Database(mediadatabase);
  let sql = `SELECT id , name , version FROM doc`;

  db.all(sql, [], (err, rows) => {
    if (err) {
      throw err;
    }
    rows.forEach((row) => {
      name =row.name;
      version = row.version;
      console.log("database xande shod : "+ name + " : "+ version);
    });


//get data from server in json template
  fetch(url2getJson)
      .then(res => res.json())
      .catch(function () {
           console.log("Promise Rejected1");
      })
      //.then(json => console.log(json))
      .then(function(json){
        console.log(json);
  //      var myArr = JSON.parse(json);
        var array = new Array(Object.keys(json).length);

        for (int i = 0; i < Object.keys(json).length ; i++)
        {
            array[i] = 0;
        }

        for(var i = 0 ; i < Object.keys(json).length ; i++) {
            console.log(json[i]);

            if(name == json[i].name){
              array[i]=(json[i].id);

              if(version < json[i].version){
                deleteExitingFile("Data/File/" + json[i].name);
                downloadNewFile("http://localhost/advertisng/file/"+json[i].name + "?timestamp="+Date.now());
                UpdateData.push({
                  id : json[i].id,
                  name : json[i].name,
                  version : json[i].version
                });

              }else if (json[i].version == 0) {
                deleteExitingFile("Data/File/" + json[i].name);
                DeleteData.push({
                  id : json[i].id,
                  name : json[i].name,
                  version : json[i].version
                });
              }
            }
        }   //end of for
        for(var i = 0 ; i < Object.keys(json).length ; i++) {
          if (array[i] == 0)
          {
            NewData.push({
              id : json[i].id,
              name : json[i].name,
              version : json[i].version
            });
          }
        }
        Setup();

      })
      .catch(function () {
           console.log("Promise Rejected2");
      });

//////////////////// ravesh 2
//   db.serialize(() => {
//     db.each(`SELECT name  ,version  FROM doc`, (err, row) => {
//       if (err) {
//         console.error(err.message);
//       }
//       console.log(row.version + "\t" + row.name);
//     });
// });
//
// db.close((err) => {
//   if (err) {
//     console.error(err.message);
//   }
//   console.log('Close the database connection.');
// });
////////////////////////////////

});

// close the database connection
db.close();


  // fetch("https://www.google.com/") // Call the fetch function passing the url of the API as a parameter
  // .then(function(data) {
  //     // Your code for handling the data you get from the API
  //     console.log(data);
  // })
  // .catch(function(error) {
  //     // This is where you run code if the server returns any errors
  //     console.log("adad");
  // });
  ///////////////////////////////////////////////////////////////////////////////////////////



//   // plain text or html
//
// fetch('https://github.com/')
//     .then(res => res.text())
//     .then(body => console.log(body))
//
// // json
//
// fetch('https://api.github.com/users/github')
//     .then(res => res.json())
//     .then(json => console.log(json))
//
// // catching network error
// // 3xx-5xx responses are NOT network errors, and should be handled in then()
// // you only need one catch() at the end of your promise chain
//
// fetch('http://domain.invalid/')
//     .catch(err => console.error(err))
//
// // stream
// // the node.js way is to use stream when possible
//
// fetch('https://assets-cdn.github.com/images/modules/logos_page/Octocat.png')
//     .then(res => {
//         const dest = fs.createWriteStream('./octocat.png')
//         res.body.pipe(dest)
//     })
//
// // buffer
// // if you prefer to cache binary data in full, use buffer()
// // note that buffer() is a electron-fetch only API
// const fileType = require('file-type');
//
// fetch('https://assets-cdn.github.com/images/modules/logos_page/Octocat.png')
//     .then(res => res.buffer())
//     .then(buffer => fileType(buffer))
//     .then(type => { /* ... */ })
//
// // meta
//
// fetch('https://github.com/')
//     .then(res => {
//         console.log(res.ok)
//         console.log(res.status)
//         console.log(res.statusText)
//         console.log(res.headers.raw())
//         console.log(res.headers.get('content-type'))
//     })
//
// // post
//
// fetch('http://httpbin.org/post', { method: 'POST', body: 'a=1' })
//     .then(res => res.json())
//     .then(json => console.log(json))
//
// // post with stream from file
// const createReadStream = require('fs');
//
//
// const stream = createReadStream('input.txt')
// fetch('http://httpbin.org/post', { method: 'POST', body: stream })
//     .then(res => res.json())
//     .then(json => console.log(json))
//
// // post with JSON
//
// const body = { a: 1 }
// fetch('http://httpbin.org/post', {
//     method: 'POST',
//     body:    JSON.stringify(body),
//     headers: { 'Content-Type': 'application/json' },
// })
//     .then(res => res.json())
//     .then(json => console.log(json))
//
// // post with form-data (detect multipart)
//
// const FormData = require('form-data');
//
// const form = new FormData()
// form.append('a', 1)
// fetch('http://httpbin.org/post', { method: 'POST', body: form })
//     .then(res => res.json())
//     .then(json => console.log(json))
//
// // post with form-data (custom headers)
// // note that getHeaders() is non-standard API
//
//
// form.append('a', 1)
// fetch('http://httpbin.org/post', { method: 'POST', body: form, headers: form.getHeaders() })
//     .then(res => res.json())
//     .then(json => console.log(json))
//
// // node 7+ with async function
//
// (async function () {
//     const res = await fetch('https://api.github.com/users/github')
//     const json = await res.json()
//     console.log(json)
// })()


}







//
// let mainWindow = new BrowserWindow({ height: 800, width: 800, show: false })
// mainWindow.loadURL(`file://${__dirname}/main.html`)
// mainWindow.once("ready-to-show", () => { mainWindow.show() })

// ipcMain.on("mainWindowLoaded", function () {
// 	let result = knex.select("FirstName").from("User")
// 	result.then(function(rows){
// 		mainWindow.webContents.send("resultSent", rows);
// 	})
// });



// var sqlite3 = require('sqlite3').verbose();
// let db = new sqlite3.Database(':memory:', (err) => {
//   if (err) {
//     return console.error(err.message);
//   }
//   console.log('Connected to the in-memory SQlite database.');
// });

//
// // close the database connection
// db.close((err) => {
//   if (err) {
//     return console.error(err.message);
//   }
//   console.log('Close the database connection.');
// });


//var sqlite3 = require('sqlite3').verbose();
// var db = new sqlite3.Database(':memory:');
//
// db.serialize(function() {
//   db.run("CREATE TABLE lorem (info TEXT)");
//
//   var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
//   for (var i = 0; i < 10; i++) {
//       stmt.run("Ipsum " + i);
//   }
//   stmt.finalize();
//
//   db.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
//       console.log(row.id + ": " + row.info);
//   });
// });
//
// db.close();

// let db = new sqlite3.Database('./db/chinook.db', (err) => {
//   if (err){
//     console.error(err.message);
//   }
//   console.log('Connected to the chinook database.');
// });


});












app.on("window-all-closed", () => { app.quit() })
