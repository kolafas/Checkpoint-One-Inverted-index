var myapp = angular.module("invertedIndexApp", []);

myapp.directive("theFileSelected", ["$window", function ($window) {
  return {
    restrict: "A",
    require:  "ngModel",
    link: function(scope, ele, attrs, ctrl) {
          var fileReader = new FileReader;
          var theFileName = 0;

          ele.bind("change", function(e) {

            var fileData = e.target.files[0];
            //console.log(fileData)
            //check if it a json file
            if(fileData.name.indexOf('json') >= 0) {
                theFileName = fileData.name;
                //Read data in file
                var checkData = fileReader.readAsText(fileData);
            }else{
                console.log("This is not a json file");
            }
          });

          fileReader.onload = function () {
              ctrl.$setViewValue({
                  name: theFileName,
                  documents: scope.$eval(fileReader.result)
              });

              if(attrs.fileLoaded) {
                    scope.$eval(attrs.fileLoaded);
              }
          };
    }
  };
}]);

myapp.controller("invertedIndexCtrl", function ($scope, $timeout) {

    //set an object to hold the index map
    $scope.rawIndex = {};
    $scope.indexMap = {};
    $scope.setIndex = {};

    //set an array to hold search results
    $scope.searchResult = [];
    $scope.checkLoad = function () {
          console.log($scope.file);

          $timeout(function() {
            $scope.rawIndex[$scope.file.name] = angular.copy($scope.file);
            console.log($scope.rawIndex);
          }, 1000);
    }


    $scope.createIndex = function (fileName) {
        //using the fileName to get the stored data from the indexMap
        var fileData = $scope.rawIndex[fileName];
        //send  the data for indexing and use a callback to get the result or errors
        Index.createIndex(fileData, function(err, result) {
            if(err) {
                $scope.error = "Oops you got an invalid file";
            }else{
                  //send the result data to the indexMap

                  $timeout(function () {
                        $scope.indexMap[fileName] = {
                            indexedData: result.data,
                            //the size stores the number of document in an array
                            size: (function () {
                                var arr = [];
                                var documents = $scope.file.documents;
                                for(var i = 0; i < documents.length; i++) {
                                    arr.push(i);
                                }
                                return arr;
                            })()
                        }
                  }, 1000);
            }
        });

        console.log($scope.indexMap);
    }



    //end or createIndex

    //start of search Index
    $scope.searchIndex = function () {

      if($scope.choose === undefined) {
        $scope.setIndex = angular.copy($scope.indexMap);
        console.log($scope.searchResult);
        var terms = $scope.search;
        // console.log($scope.indexMap);
        Index.searchIndex(terms, $scope.setIndex, function(err, result) {
            if(err) {
                console.log("error in your file");
            }else{
                console.log(result.data);

                $scope.searchResult = result.data;
            }
        });

      }else {
        $scope.searchResult = [];
        $scope.setIndex = {};
        console.log($scope.setIndex);
        $scope.setIndex[$scope.choose] = angular.copy($scope.indexMap[$scope.choose]);
        var terms = $scope.search;
        Index.searchIndex(terms, $scope.setIndex, function(err, result) {
            if(err) {
                console.log("error in your file");
            }else{
                console.log(result.data);
                $scope.searchResult = result.data;
            }
        });

      }

    }
    delete $scope.searchResult;
});