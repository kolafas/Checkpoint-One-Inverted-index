var myapp = angular.module("invertedIndexApp", []);

myapp.directive("theFileSelected", ["$window", function ($window) {
    return {
        restrict: "A",
        require: "ngModel",
        link: function (scope, ele, attrs, ctrl) {
            var fileReader = new FileReader;
            var theFileName = 0;

            ele.bind("change", function (e) {

                var fileData = e.target.files[0];
                //console.log(fileData)
                //check if it a json file
                if (fileData.name.indexOf('json') >= 0) {
                    theFileName = fileData.name;
                    //Read data in file
                    var checkData = fileReader.readAsText(fileData);
                } else {
                    alert("This not a json file");
                }
            });

            fileReader.onload = function () {
                ctrl.$setViewValue({
                    name: theFileName,
                    documents: scope.$eval(fileReader.result)
                });

                if (attrs.fileLoaded) {
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
    $scope.message =  {
        status:false,
        message:false
    };

    $scope.checkLoad = function () {
        console.log($scope.file);

        $timeout(function () {
            $scope.rawIndex[$scope.file.name] = angular.copy($scope.file);
            console.log($scope.rawIndex);
        }, 1000);
    }


    $scope.createIndex = function (fileName) {
        //using the fileName to get the stored data from the indexMap
        var fileData = $scope.rawIndex[fileName];
        console.log(fileData);
        //send  the data for indexing and use a callback to get the result or errors
        var success = Index.createIndex(fileData);
        
        if (success.status) {
            $scope.flashMessage = {
                message:success.message,
                status:true
            };
            var result = Index.getIndex();
            console.log(result[fileData.name]);
            var docLen = result[fileData.name]._size;

            delete(result[fileData.name]._size);


            $timeout(function () {
                $scope.indexMap[fileData.name] = {
                    indexedData: result[fileData.name],
                    size: (function () {
                        var arr = [];
                        for (var i = 0; i < docLen.length; i++) {
                            arr.push(i);
                        }
                        return arr;
                    })()
                }
            }, 1000);
        } else {
            $scope.flashMessage = {
                message:success.message,
                status:false,
                error:true
            };
        }
    }



    //end or createIndex
    $scope.choose = undefined;
    delete($scope.searchResult);

    //start of search Index
    $scope.searchIndex = function () {
        delete($scope.searchResult);
        console.log($scope.sear)
        delete($scope.searchMessage);

        if ($scope.choose === "all") {
            var terms = $scope.search;
            var result = Index.searchIndex(terms);

            $scope.searchResult = result.data;
            console.log($scope.searchResult);
            if($scope.searchResult === undefined) {
                $scope.searchMessage = {
                    status:true,
                    message:"Opps!!. '"+ terms + "' was not found in any files"
                };
            }

        } else {
            var options = {
                fileName: $scope.choose
            };
            var terms = $scope.search;
            var result = Index.searchIndex(terms, options);

            $scope.searchResult = result.data;
            console.log($scope.searchResult.length);
            if($scope.searchResult.length <= 0) {
                $scope.searchMessage = {
                    status:true,
                    message: "Opps!!. '" + terms + "' was not found in " + $scope.choose
                };
            }
            

        }

    };


});