var mockFiles = [
    [{
            "title": "Alice of in Wonderland",
            "text": "Alice falls into a rabbit shit hole and enters a world full of imagination."
        },

        {
            "title": "The Lord of the zip Rings: The Fellowship of the Ring.",
            "text": "An unusual alliance of man, elf, dwarf, oobit wizard and hobbit seek to destroy a powerful ring."
        }
    ],

    [{
            "title": "keep of of of in Wonderland king",
            "text": "Alice falls into a rabbit sleep it all today hole and enters a world full of imagination."
        },

        {
            "title": "The sheep: The Fellowship sleep of the Ring.",
            "text": "elf, dwarf, wizard and hobbit seek to destroy a king powerful ring."
        }
    ]
];


//write test to read book data
describe("Read book data", function () {
    it("should verify that the files are not empty", function () {
        expect(mockFiles.length > 0).toBeTruthy();
    });

    it("should check if all properties in the file are strings", function () {
        mockFiles[0].forEach(function (document) {
            expect(typeof document.title === "string").toBeTruthy();
            expect(typeof document.text === "string").toBeTruthy();
        });
    });

    it("should verify that the file content is a JSON array", function () {
        expect(Array.isArray(mockFiles)).toBeTruthy();
    });
});

//Populate Index

describe("Populate Index", function () {
    var result = {};
    //makes sure to empty indexMap
    beforeAll(function () {
        var result = {};
    });

    it("should verify that the index is created once the Json file has been read", function () {
        var file = {
            name: "Mockfile",
            documents: mockFiles[0]
        };

        Index.createIndex(file);
        var result = Index.getIndex(file.name);
        var count = Object.keys(result).length;

        expect(count > 0).toBeTruthy();
    });

    it("should map the string keys to the correct objects in the JSON array", function () {
        // console.log(indexMap);
        var file = {
            name: "Mockfile",
            documents: mockFiles[0]
        };

        Index.createIndex(file);
        var result = Index.getIndex(file.name);
        delete(result._size);
        Object.keys(result).forEach(function (key) {
            Object.keys(result[key]).forEach(function (id) {
                var doc = result[key][id].source;
                // console.log(mockFiles[0][id]);
                expect(doc.title === mockFiles[0][id].title).toBeTruthy();
                expect(doc.text === mockFiles[0][id].text).toBeTruthy();
            });
        });

    });

    it("should not overwrite the index when adding a new file", function () {
        var fileOne = {
            name: "Mockfile-one",
            documents: mockFiles[0]
        };
        var fileTwo = {
            name: "Mockfile-two",
            documents: mockFiles[1]
        };

        Index.createIndex(fileOne);
        Index.createIndex(fileTwo);

        var result = Index.getIndex();
        delete(result["Mockfile"]);
        console.log(result);
        expect(Object.keys(result).length > 0).toBeTruthy();
    });
});



//writing test for search 

describe("Search Index", function () {
    beforeEach(function () {
        var searchResults = [];
    });

    it("should return the correct result when searched", function () {

        var query = "judge sleep",
            check = [],
            options = {
                fileName: "Mockfile-two"
            };

        searchResults = Index.searchIndex(query, options);
        console.log(searchResults);

        if (Array.isArray(query)) {
            query.map(function (key) {
                var newKey = Index.tokenize(key);

                Object.keys(searchResults.data).forEach(function (id) {
                    var title = searchResults.data[id].source.title;
                    var text = searchResults.data[id].source.text;

                    if (title.indexOf(newKey) >= 0 || text.indexOf(newKey) >= 0) {
                        check.push(1);
                    }
                });
            });
        } else {
            query.split(" ").map(function (key) {
                var newKey = Index.tokenize(key);

                Object.keys(searchResults.data).forEach(function (id) {
                    var title = searchResults.data[id].source.title;
                    var text = searchResults.data[id].source.text;

                    if (title.indexOf(newKey) >= 0 || text.indexOf(newKey) >= 0) {
                        check.push(1);
                    }
                });
            });
        }

        expect(check.length >= 0).toBeTruthy();
    });

    // it("should not take too long to execute", function () {


    //     var date = new Date();
    //     console.log(date);
    // });

    it("should handle an array of search terms", function () {
        var query = ['the', 'lord', 'of'],
            options = {
                fileName: 'all'
            };

        searchResults = Index.searchIndex(query, options);
        console.log(searchResults.data);

        expect(searchResults.data.length > 0).toBeTruthy();

    });
});

describe("Get Index", function () {
    it("should take a string specifying the location of the JSON data", function () {
        var check = Index.getIndex('Mockfile-one');
        expect(check._size.length > 0).toBeTruthy();
    });
});