

var mockFiles = [
        {
        "title": "Alice of in Wonderland",
        "text": "Alice falls into a rabbit hole and enters a world full of imagination."
        },

        {
        "title": "The Lord of the Rings: The Fellowship of the Ring.",
        "text": "An unusual alliance of man, elf, dwarf, wizard and hobbit seek to destroy a powerful ring."
        }
];


//write test to read book data
describe("Read book data", function() {
    it("should verify that the files are not empty", function () {
        expect(mockFiles.length>0).toBeTruthy();
    });

    it("should check if all properties in the file are strings", function () {
        mockFiles.forEach(function(document) {
            expect(typeof document.title === "string").toBeTruthy();
            expect(typeof document.text === "string").toBeTruthy();
        })
    });
});

//Populate Index

describe("Populate Index", function () {
    var indexMap = {};
     //makes sure to index is empty
    beforeAll(function () {
        var indexMap = {};
    });

    it("should verify that the index is created once the Json file has been read", function () {
        var file = {
            name: "Mockfile",
            documents: mockFiles
        }
        
        Index.createIndex(file, function (err, result) {
            if(err) {
                throw new Error("Something is wrong");
            }else {
                indexMap[result.fileName] = {
                    indexedData:result.data
                }
                // console.log();
            }
            var keys = Object.keys(indexMap[result.fileName].indexedData);
            expect(keys.length > 0).toBeTruthy();

        })
    });

    it("should verify that the index maps the string keys to the correct objects in the JSON array", function () {
        // console.log(indexMap);
        var check = [];
        Object.keys(indexMap).forEach(function (fileName) {
            Object.keys(indexMap[fileName].indexedData).forEach(function (tokens) {
                Object.keys(indexMap[fileName].indexedData[tokens]).forEach(function (keys) {
                    for(var i=0; i<mockFiles.length;i++){
                        var source = indexMap[fileName].indexedData[tokens][keys].source;
                        if(source.title === mockFiles[i].title 
                        && source.text === mockFiles[i].text) {
                            check.push(1);
                            // console.log(check);
                        }
                    }
                })
            })
        });
        // console.log(check);
        expect(check.length > 0).toBeTruthy();
    });
});



//writing test for search 

describe("Search Index", function () {
    var indexMap = {};
    var file = {
        name:"Mockfile",
        documents: mockFiles
    }

    beforeEach(function () {
        var searchResults = [];
    })

    Index.createIndex(file, function (err, result) {
        if(err) {
            throw new Error("Something went wrong");
        }else {
            indexMap[result.fileName] = {
                indexedData:result.data
            }
        }
    });

    it("should verify that search index function returns an array of the indices to the correct objects that contain the words in the search query", function () {
        
        var query = "This is the lord of the rings";
        var check = [];
        Index.searchIndex(query, indexMap, function (err, result) {
            if(err) {
                throw new Error("Something is wrong!");
            }else {
                var searchResults = result.data;

                for(var i=0;i<searchResults.length;i++) {
                    mockFiles.forEach(function (docs) {
                        if(searchResults[i].source.title === docs.title && searchResults[i].source.text === docs.text) {
                            check.push(1);
                        }
                    });
                }
                expect(check.length>0).toBeTruthy();
            }
        });

       
    });
});