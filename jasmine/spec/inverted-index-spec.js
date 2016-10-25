
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
            "text": "elf, dwarf, rings wizard and hobbit seek to destroy a king powerful ring."
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
    //makes sure to empty indexMap

    it("should verify that the index is created once the Json file has been read", function () {
        var file = {
            name: "Mockfile",
            documents: mockFiles[0]
        };

        var result = Index.createIndex(file);

        expect(result.message).toBe("The file " + file.name + " has been indexed")
    });

    it("Should return an err if json file is empty", function () {
        var file = {
            name:"Empty file",
            documents:undefined
        };

        var result = Index.createIndex(file);
        expect(result.status).toBeFalsy();
        expect(result.message).toBe(file.name + ' file is empty');
    });

    it("should return an err if json file is not in correct format", function () {
        var file = {
            name: "Random file",
            documents: [{
                alice: "sure",
                desc: "text"
            },
                {
                    alice: "sure",
                    desc: "text"
                }
            ]
        };

        var result = Index.createIndex(file);
        expect(result.status).toBeFalsy();
        expect(result.message).toBe(file.name +' file is not in the correct format');
    })

    it("should map the string keys to the correct objects in the JSON array", function () {
        var file = {
            name: "Mockfile",
            documents: mockFiles[0]
        };

        Index.createIndex(file);
        var result = Index.getIndex(file.name);
        delete(result._docsLen);
        Object.keys(result).forEach(function (key) {
            Object.keys(result[key]).forEach(function (id) {
                var doc = result[key][id].source;
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
        expect(Object.keys(result).length > 0).toBeTruthy();
    });
});



//writing test for search 

describe("Search Index", function () {
    beforeEach(function () {
        var searchResults = [];
    });
    it("should handle an array of search terms", function () {
        var query = "the lord of the Rings";
        var opts = {
            fileName:"Mockfile-two"
        }
        searchResults = Index.searchIndex(query, opts);

        expect(searchResults.result.length > 0).toBeTruthy();

    });
    it("should return message for empty searchResults", function () {
        var query = "";
        var opts = {
            fileName:"Mockfile-two"
        }
        searchResults = Index.searchIndex(query, opts);
        expect(searchResults.message).toBe('There are no files with that word');
    });
});

describe("Get Index", function () {
    it("should take a string specifying the location of the JSON data", function () {
        var check = Index.getIndex('Mockfile-one');
        expect(check._docsLen.length > 0).toBeTruthy();
    });
});