var http = require('http')
var fs = require('fs')
var url = require('url');
var async = require("async")
var shell = require('shelljs')
var port = process.argv[2]

var server = http.createServer(function callback (request, response) {

  console.log(request.method)
    var urlObj = url.parse(request.url, true);
    var query = urlObj.query
    if (request.method == 'OPTIONS') {

      response.end()
    } else if (request.method == 'GET') {
      console.log(query)
       var queryFiles = query.filename
       var fileNames = queryFiles.split(",");
       for (i = 0; i < fileNames.length; i++) {
         fileNames[i] = "./filesystem/" + fileNames[i]
       }
       console.log(fileNames)
       async.map(fileNames, fs.stat, function(err, results) {
            console.log(results)
           var finalJson = []
           for (i = 0; i < results.length; i++)
           {
             finalJson.push({filename: fileNames[i],
                             content: results[i]})
           }
           console.log(finalJson)
           response.write(JSON.stringify(finalJson))
           response.end()
       });

    }
});
server.listen(port);
