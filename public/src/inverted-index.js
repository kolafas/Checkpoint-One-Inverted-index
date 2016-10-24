window.Index = (function () {



    var indexMap = {};


    
    /**
     * IndexBot
     * 
     * The function takes in the neccesary arguments for 
     * indexing a json file and then stores the index in
     * an object. 
     * 
     * @param {array} splitedWords
     * @param {string} fileName
     * @param {object} source
     * @param {number} id
     */
    function indexBot(splitedWords, fileName, source, id) {
        splitedWords.forEach(function (word) {
            var newWord = helpers.sanitizer(word);
            //check if newToken has been indexed before
            //if index before add points to the priority
            if (indexMap[fileName][newWord] === undefined) {
                //declare the indexMap object located at empty
                indexMap[fileName][newWord] = {};
                //fill up with data
                indexMap[fileName][newWord][id] = {
                    source: source,
                    fileName:fileName
                };
            } 
            indexMap[fileName][newWord][id] = {
                source: source,
                fileName: fileName
            };

        });
    }




    /**
     * Create Index function
     * 
     * The createIndex function takes in a fileData in json format, 
     * it then splits the documents text & title into tokens.
     * The tokens are not pure because they might contain alpha-numerical
     * characters like commma etc, so it is passed to the
     * tokenize funtion for purification and a newToken is returned.
     * The newToken are then mapped in the following order
     * After the index has been mapped, An error or a result is sent 
     * through the callback
     * 
     * @params {object} fileData
     * @returns
     */
    function createIndex(fileData) {
        var fileCheck = helpers.fileChecker(fileData);
        if (fileCheck.type === "empty") {
            return fileCheck;
        }

        if (fileCheck.type === "wrong format") {
            return fileCheck;
        }

        if (fileCheck.type === "ok") {
            var docs = fileData.documents;
            var size = [];
            indexMap[fileData.name] = {
                _docsLen: (function () {
                    for (var i = 0; i < docs.length; i++) {
                        size.push(i);
                    }
                    return size;
                })()
            }

            for (var i = 0; i < docs.length; i++) {
                var currDoc = docs[i];
                //indexing the title
                //split the title into an array
                var rawTitleTokens = currDoc.title.split(" ");
                //send the data to the indexBot
                indexBot(rawTitleTokens, fileData.name, currDoc, i);
                //Indexing the text
                //split the text into an array
                var rawTextTokens = currDoc.text.split(" ");
                indexBot(rawTextTokens, fileData.name, currDoc, i);


            }
            return fileCheck;
        }

    }

    /**
     * GetIndex
     * 
     * This function gets the index of either
     * a file or the entire files in the indexMap
     * 
     * @param {string} fileName
     * @returns
     */
    function getIndex(fileName) {
        if (fileName && typeof fileName === "string") {
            return indexMap[fileName];
        } else {
            return indexMap;
        }
    }


    /**
     * Search Index
     * 
     * This function queries the indexMap for specific
     * words sent through the query argument, and then
     * return a result.
     * 
     * @param {string, array} query
     * @param {any} opts
     * @returns
     */
    function searchIndex(query, opts) {
        var usedWords = [];
        var result = {
            data: false
        };
        var searchResult = {};

        var fileName = Object.keys(indexMap);

        var queryCheck = helpers.queryChecker(query);

        if(queryCheck.type === "string") {
            splitedWords = queryCheck.words;
        }
        if(queryCheck.type === "array") {
            splitedWords = queryCheck.words;
        }

        splitedWords.forEach(function (word) {
            var newWord = helpers.sanitizer(word);

            //Check if the keys have been used during the present search
            if (usedWords.indexOf(newWord) < 0) {
                searchResult = helpers.search(newWord, opts, indexMap);   
            }
        });

        var wordsNotFound = searchResult.notFound;
        if(searchResult.result.length <= 0) {
            return {
                message:"There are no files with that word"
            };
        }
        if(searchResult.source === "all") {
            return {
                result:searchResult.result,
                message:wordsNotFound.toString() + " were not found in any files"
            };
        }
        return {
            result:searchResult.result,
            message:wordsNotFound.toString() + " was not found in the file"
        };
    
    }

    return {
        createIndex: createIndex,
        searchIndex: searchIndex,
        getIndex: getIndex
    }
})();