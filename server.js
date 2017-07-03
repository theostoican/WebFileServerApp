var http = require('http')
var fs = require('fs')
var url = require('url');
var async = require("async")
var shell = require('shelljs')
var http_req = require('request');
var md5 = require('md5')

var asyncTasks = []
var port = process.argv[2]

var server = http.createServer(function callback (request, response) {

  console.log(request.method)
    var urlObj = url.parse(request.url, true);
    var query = urlObj.query
    if (request.method == 'OPTIONS') {
      response.setHeader('access-control-allow-origin' ,'*')
      response.setHeader('access-control-allow-methods', 'GET, POST, PUT, DELETE, OPTIONS')
      response.setHeader('access-control-allow-headers', 'content-type, accept')
      response.setHeader('access-control-max-age', '10')
      response.end()
    } else if (request.method == 'POST') {
      var body = ""
      request.on('error', function(err) {
        console.error(err);
      })
      request.on('data', function(chunk) {
        body += chunk;
      })
      request.on('end', function() {
        console.log ('Received post request')
        var jsonObj = JSON.parse(body)
        var keys = Object.keys(jsonObj)
        if (keys.length > 1) {
          var fileName = "./filesystem/" + jsonObj[keys[0]]
          var content = jsonObj[keys[1]]
          var path = fileName.split('/')
          console.log("path: " + path.length)
          if (path.length > 1) {
            var pathDir = ""
            for (i = 0; i < path.length - 1; i++)
            {
              pathDir += path[i] + "/"
            }
            console.log(pathDir)
            shell.mkdir('-p', pathDir)
          }
          fs.writeFile(fileName, content, function(err) {
            console.log(fileName + " Finished writing to files")
            })
        }
        response.setHeader('access-control-allow-origin' ,'*')
        response.setHeader('access-control-allow-methods', 'GET, POST, PUT, DELETE, OPTIONS')
        response.setHeader('access-control-allow-headers', 'content-type, accept')
        response.setHeader('access-control-max-age', '10')
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.end('post received')
      });

    } else if (request.method == 'GET') {
       var queryFiles = query.filename
       var fileNames = queryFiles.split(",");
       for (i = 0; i < fileNames.length; i++)
       {
         fileNames[i] = "./filesystem/" + fileNames[i]
       }
       console.log(fileNames)
       async.map(fileNames, readAsync, function(err, results) {
           if (err)
           {
             /*
              Search according to the md5 of that file
              */
              console.log("Eroare")
              var files = _getAllFilesFromFolder("./filesystem")
              async.map(files, readAsync, function(err, results2){
                var i = 0;
                for (i = 0; i < results2.length; i++)
                {
                  for (j = 0; j < fileNames.length; j++)
                  {
                    console.log(md5(results2[i]) + "  ::  ", files[i])
                    if (md5(results2[i]) == fileNames[j])
                    {
                      fileNames[j] = files[i]
                      results[j] = results2[i]
                    }
                  }
                }
              });

           }
           var finalJson = []

            http_req('http://localhost:8035?filename=' + queryFiles,
            function (error, resp, body) {
              //console.log('error:', error); // Print the error if one occurred
              //console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
              //console.log('body:', body); // Print the HTML for the Google homepage.
              var parsedResponse = JSON.parse(body)
              for (i = 0; i < results.length; i++)
              {
                finalJson.push({filename: fileNames[i],
                                content: results[i],
                                info: parsedResponse[i]})
              }
              response.setHeader('Content-Type', 'application/json');
              response.setHeader('access-control-allow-origin' ,'*')
              response.setHeader('access-control-allow-methods', 'GET, POST, PUT, DELETE, OPTIONS')
              response.setHeader('access-control-allow-headers', 'content-type, accept')
              response.setHeader('access-control-max-age', '10')
              response.write(JSON.stringify(finalJson))
              response.end()
            //  console.log(JSON.stringify(parsedResponse, null, 2))
            });

       });

    }
});
server.listen(port);


function readAsync(file, callback) {
    fs.readFile(file, 'utf8', callback);
}

function writeAsync(file, data, callback) {
  fs.writeFile(file, data, {flag:'w'}, function(err) {
    if (err) {
      console.log("error")
      return err
    }
  });
}

/*
 * function used to get all the files from the server's directory
 * synchronously
 */
var _getAllFilesFromFolder = function(dir) {

    var results = [];

    fs.readdirSync(dir).forEach(function(file) {

        file = dir+'/'+file;
        var stat = fs.statSync(file);

        if (stat && stat.isDirectory()) {
            results = results.concat(_getAllFilesFromFolder(file))
        } else results.push(file);

    });

    return results;

};
