

const { app, BrowserWindow, ipcMain } = require("electron")
const sqlite3 = require('sqlite3').verbose();
const mediadatabase = "mediadatabase.db";
const fileType = require('file-type');
const fs = require('fs'); // Load the File System to execute our common tasks (CRUD)
const DownloadManager = require("electron-download-manager");


const advertisngfile ="http://localhost/advertisng/file/";

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





function Setup(){

  fs.readdir('.', (err, dir) => {
      for (var i = 0, path; path = dir[i]; i++) {
              // do stuff with path
              //console.log(path);
              files.push(path);

      }
  });
  // var walkSync = function(dir, files) {
  //   var fs = fs || require('fs'),
  //       files = fs.readdirSync(dir);
  //   files = files || [];
  //   files.forEach(function(file) {
  //     if (fs.statSync(dir + '/' + file).isDirectory()) {
  //       files = walkSync(dir + file + '/', files);
  //     }
  //     else {
  //       files.push(file);
  //       console.log(file);
  //
  //     }
  //   });
  //   return files;
  // };
  // var r= walkSync("/",files);

  //files = Directory.GetFiles(AppDomain.CurrentDomain.BaseDirectory+"Data\\Media");
  // fs.readDir('/node_modules', function(dir) {
  //   console.log("satre 43");
  //
  // // // es5
  // // for(var i = 0, l = dir.length; i < l; i++) {
  // //   var filePath = dir[i];
  // //   console.log(filePath)
  // // }
  // // es6
  //   for(let filePath of dir) {
  //     console.log(filePath);
  //   }
  // });
  // fs.readdir('.', (err, "Data/Media") => {
  //     for (var i = 0, path; path = dir[i]; i++) {
  //             // do stuff with path
  //             console.log(path);
  //
  //     }
  // });
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
  var HasRow =false;
  db.all(sql, [], (err, rows) => {
    if (err) {
      //throw err;                                    //TODO ilmiram 0 olanda bira ijra olur yo oxuyaniyanda
    }
    rows.forEach((row) => {
      name =row.name;
      version = row.version;
      console.log("database xande shod : "+ name + " : "+ version);
      hasRow=true;
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
        console.log("satre 144");
  //      var myArr = JSON.parse(json);
        var array = new Array(Object.keys(json).length);

        for (var i = 0; i < Object.keys(json).length ; i++)
        {
            array[i] = 0;
        }
        console.log("satre 152");

        if(hasRow){
          for(var i = 0 ; i < Object.keys(json).length ; i++) {
              console.log(json[i]);
              console.log("satre 156");

              if(name == json[i].name){
                array[i]=(json[i].id);
                console.log("satre 160");

                if(version < json[i].version){
                  deleteExitingFile("Data/File/" + json[i].name);
                  downloadNewFile("http://localhost/advertisng/file/"+json[i].name + "?timestamp="+Date.now());
                  UpdateData.push({
                    id : json[i].id,
                    name : json[i].name,
                    version : json[i].version
                  });

                }else if (json[i].version == 0) {
                  console.log("satre 172");
                  deleteExitingFile("Data/File/" + json[i].name);
                  DeleteData.push({
                    id : json[i].id,
                    name : json[i].name,
                    version : json[i].version
                  });
                  console.log("satre 179");

                }
              }
              console.log("satre 183");

          }   //end of for
          for(var i = 0 ; i < Object.keys(json).length ; i++) {
            console.log("satre 187");

            if (array[i] == 0)
            {
              console.log("satre 191");

              NewData.push({
                id : json[i].id,
                name : json[i].name,
                version : json[i].version
              });
            }
          }
          console.log("satre 200");

          Setup();
        }





        console.log("satre 203");
        if(NewData.length>0){
          var db = new sqlite3.Database(mediadatabase);
          for (var i = 0; i < Object.keys(NewData).length ; i++){
            // insert one row into the langs table
              db.run(`INSERT INTO doc (name,version) VALUES (?, ?)`,NewData[i].name,NewData[i].version, function(err) {
                //db.run("INSERT into table_name(col1,col2,col3) VALUES (val1,val2,val3)");
                if (err) {
                  return console.log(err.message);
                }
                // get the last insert id
                console.log(`A row has been inserted `);
              });
              downloadNewFile("http://localhost/advertising/file/"+NewData[i].name + "?timestamp="+Date.now());
          }

          Setup();
          NewData = [];
        }




        if(DeleteData.length>0){
          var db = new sqlite3.Database(mediadatabase);
          for (var i = 0; i < Object.keys(DeleteData).length ; i++){
            // insert one row into the langs table
              db.run(`UPDATE  doc SET version=? WHERE id=? VALUES (?, ?)`,DeleteData[i].version,DeleteData[i].id, function(err) {
                //db.run("INSERT into table_name(col1,col2,col3) VALUES (val1,val2,val3)");
                if (err) {
                  return console.log(err.message);
                }
                // get the last insert id
                console.log(`A row has been updated `);
              });
          }
          Setup();
          DeleteData = [];
        }




        if(UpdateData.length>0){
          var db = new sqlite3.Database(mediadatabase);
          for (var i = 0; i < Object.keys(UpdateData).length ; i++){
            // insert one row into the langs table
              db.run(`UPDATE  doc SET version=? WHERE id=? VALUES (?, ?)`,UpdateData[i].version,UpdateData[i].id, function(err) {
                //db.run("INSERT into table_name(col1,col2,col3) VALUES (val1,val2,val3)");
                if (err) {
                  return console.log(err.message);
                }
                // get the last insert id
                console.log(`A row has been updated `);
              });
          }
          Setup();
          UpdateData = [];
        }
      if(!hasRow){

        var db = new sqlite3.Database(mediadatabase);
        for (var i = 0; i < Object.keys(json).length ; i++){
          // insert one row into the langs table
            db.run(`INSERT INTO doc (name,version) VALUES (?, ?)`,json[i].name,json[i].version, function(err) {
              //db.run("INSERT into table_name(col1,col2,col3) VALUES (val1,val2,val3)");
              if (err) {
                return console.log(err.message);
              }
              // get the last insert id
              console.log(`A row has been inserted `);
            });
            downloadNewFile("http://localhost/advertising/file/"+json[i].name + "?timestamp="+Date.now());
        }
        hasRow=true;
        Setup();
      }

      })
      .catch(function () {
           console.log("Promise Rejected2");
      });
    });
    db.close();
  }












  function mediaDownload() {

    const fetch = require('electron-fetch');
    const url2getJson="http://localhost/advertising/api.php?msg=whatsupmedia";
    var name , version;


  //read from db name , version
    var db = new sqlite3.Database(mediadatabase);
    let sql = `SELECT id , name , version FROM media`;
    var HasRow =false;
    db.all(sql, [], (err, rows) => {
      if (err) {
        //throw err;                                    //TODO ilmiram 0 olanda bira ijra olur yo oxuyaniyanda
      }
      rows.forEach((row) => {
        name =row.name;
        version = row.version;
        console.log("database xande shod : "+ name + " : "+ version);
        hasRow=true;
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
          console.log("satre 144");
    //      var myArr = JSON.parse(json);
          var array = new Array(Object.keys(json).length);

          for (var i = 0; i < Object.keys(json).length ; i++)
          {
              array[i] = 0;
          }
          console.log("satre 152");

          if(hasRow){
            for(var i = 0 ; i < Object.keys(json).length ; i++) {
                console.log(json[i]);
                console.log("satre 156");

                if(name == json[i].name){
                  array[i]=(json[i].id);
                  console.log("satre 160");

                  if(version < json[i].version){
                    deleteExitingFile("Data/Media/" + json[i].name);
                    downloadNewFile("http://localhost/advertisng/media/"+json[i].name + "?timestamp="+Date.now());
                    UpdateData.push({
                      id : json[i].id,
                      name : json[i].name,
                      version : json[i].version
                    });

                  }else if (json[i].version == 0) {
                    console.log("satre 172");
                    deleteExitingFile("Data/Media/" + json[i].name);
                    DeleteData.push({
                      id : json[i].id,
                      name : json[i].name,
                      version : json[i].version
                    });
                    console.log("satre 179");

                  }
                }
                console.log("satre 183");

            }   //end of for
            for(var i = 0 ; i < Object.keys(json).length ; i++) {
              console.log("satre 187");

              if (array[i] == 0)
              {
                console.log("satre 191");

                NewData.push({
                  id : json[i].id,
                  name : json[i].name,
                  version : json[i].version
                });
              }
            }
            console.log("satre 200");

            Setup();
          }





          console.log("satre 203");
          if(NewData.length>0){
            var db = new sqlite3.Database(mediadatabase);
            for (var i = 0; i < Object.keys(NewData).length ; i++){
              // insert one row into the langs table
                db.run(`INSERT INTO media (name,version) VALUES (?, ?)`,NewData[i].name,NewData[i].version, function(err) {
                  //db.run("INSERT into table_name(col1,col2,col3) VALUES (val1,val2,val3)");
                  if (err) {
                    return console.log(err.message);
                  }
                  // get the last insert id
                  console.log(`A row has been inserted `);
                });
                downloadNewFile("http://localhost/advertising/media/"+NewData[i].name + "?timestamp="+Date.now());
            }

            Setup();
            NewData = [];
          }




          if(DeleteData.length>0){
            var db = new sqlite3.Database(mediadatabase);
            for (var i = 0; i < Object.keys(DeleteData).length ; i++){
              // insert one row into the langs table
                db.run(`UPDATE  doc SET version=? WHERE id=? VALUES (?, ?)`,DeleteData[i].version,DeleteData[i].id, function(err) {
                  //db.run("INSERT into table_name(col1,col2,col3) VALUES (val1,val2,val3)");
                  if (err) {
                    return console.log(err.message);
                  }
                  // get the last insert id
                  console.log(`A row has been updated `);
                });
            }
            Setup();
            DeleteData = [];
          }




          if(UpdateData.length>0){
            var db = new sqlite3.Database(mediadatabase);
            for (var i = 0; i < Object.keys(UpdateData).length ; i++){
              // insert one row into the langs table
                db.run(`UPDATE  media SET version=? WHERE id=? VALUES (?, ?)`,UpdateData[i].version,UpdateData[i].id, function(err) {
                  //db.run("INSERT into table_name(col1,col2,col3) VALUES (val1,val2,val3)");
                  if (err) {
                    return console.log(err.message);
                  }
                  // get the last insert id
                  console.log(`A row has been updated `);
                });
            }
            Setup();
            UpdateData = [];
          }
        if(!hasRow){

          var db = new sqlite3.Database(mediadatabase);
          for (var i = 0; i < Object.keys(json).length ; i++){
            // insert one row into the langs table
              db.run(`INSERT INTO media (name,version) VALUES (?, ?)`,json[i].name,json[i].version, function(err) {
                //db.run("INSERT into table_name(col1,col2,col3) VALUES (val1,val2,val3)");
                if (err) {
                  return console.log(err.message);
                }
                // get the last insert id
                console.log(`A row has been inserted `);
              });
              downloadNewFile("http://localhost/advertising/media/"+json[i].name + "?timestamp="+Date.now());
          }
          hasRow=true;
          Setup();
        }

        })
        .catch(function () {
             console.log("Promise Rejected2");
        });
      });
      db.close();
    }

































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



// close the database connection


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
