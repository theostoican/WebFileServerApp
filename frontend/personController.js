var myApp = angular.module("fileServer", []);
var reader = new FileReader()

myApp.controller('AppController', ['$scope', '$http', function($scope, $http) {
    $scope.object = {spice: "asdasda"}
    $scope.spice = "very"
    $scope.fileName = 'wasabi';
    $scope.fileContent = "";
    $scope.files = {}
    $scope.filesInfo = {}
    $scope.fileToPost = ""
    $scope.fileToPostContent =""
    $scope.showAdditionalPermissions = {}

    $scope.postFile = function(fileName, fileToPostContent) {
        var jsonData = {"filename" : fileName,
              "content": fileToPostContent};

        console.log(jsonData)

        $http({
          url: 'http://localhost:8034',
          method: 'POST',
          data: jsonData,
          headers: {
            'Content-Type' : 'application/json'
          }
        }).then(function successCallback(response) {
                    //var parsed = JSON.parse(response)
                    console.log("fine")
                    console.log(response)
                }, function errorCallBack(response) {
                    console.log(response)
                });

    }

    $scope.requestFile = function(fileName) {
        $scope.spice = "A sda";
        $scope.fileContent = fileName;
        var url = ""
        url += "http://127.0.0.1:8034?filename=" + fileName;
        console.log("url: " + url)
        httpGetAsync(url, manageResponse);
    };
    function httpGetAsync(theUrl, callback)
    {
      var config = ""
      //$http.get('http://localhost:8034?filename=a.txt,b.txt', config)
      $http({
         url: theUrl,
         method: 'GET'
       })
      .then(function successCallback(response) {
          //var parsed = JSON.parse(response)
          for (i = 0; i < response.data.length; i++)
          {
            $scope.files[response.data[i].filename] = response.data[i].content
            //$scope.files.push(response.data[i].filename)
            $scope.filesInfo[response.data[i].filename] = response.data[i].info
            $scope.showAdditionalPermissions[response.data[i].filename] = false
          }
          console.log($scope.filesInfo)
      }, function errorCallBack(response) {
          console.log(response)
      });
    }
    function manageResponse(response) {
      console.log(response)
    }
    $scope.showPermissionsFunction = function(fName) {
      if ($scope.showAdditionalPermissions[fName] == false) {
        $scope.showAdditionalPermissions[fName] = true
      } else {
        $scope.showAdditionalPermissions[fName] = false
      }
    }
    window.onload = function() {
    		var fileInput = document.getElementById('fileInput');
    		var fileDisplayArea = document.getElementById('fileDisplayArea');

    		fileInput.addEventListener('change', function(e) {
    			var file = fileInput.files[0];
    			var textType = /text.*/;

    			if (file.type.match(textType)) {
    				var reader = new FileReader();

    				reader.onload = function(e) {
    					fileDisplayArea.innerText = reader.result;
              $scope.postFile(file.name, reader.result)
              console.log("fiLE::: "+file.name)
              console.log("rESULT:   "+reader.result)
    				}

    				reader.readAsText(file);

    			} else {
    				fileDisplayArea.innerText = "File not supported!"
    			}
    		});
    }
}]);
