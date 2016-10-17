window.Index = (function () {



    var indexMap = {};

    /**
     * Tokenize function
     * 
     * The tokenize function is written to purify tokens or terms from alpha-numerical characters
     * 
     * @params {string} tokens
     * @return {string} newToken
     */
    function tokenize(tokens) {
        var newToken = tokens.trim().replace(/[^a-z0-9]+/gi, '').toLowerCase();
        //send out the new token
        return newToken;
    }


    function searchAll(newKeys) {
        var searchResult = [];

        Object.keys(indexMap).forEach(function (name) {
            if (indexMap[name][newKeys]) {
                Object.keys(indexMap[name][newKeys]).forEach(function (id) {
                    //add a unique document in the result
                    var docs = indexMap[name][newKeys][id];

                    //check if the search result has the document already to prevent duplicate entry
                    if (!resultExist(docs, searchResult)) {
                        searchResult.push(docs);
                    }
                });
            }
        });

        return searchResult;
    }
    //End searchAll



    //searchOne functionality enables a user to search through one file
    function searchOne(newKeys, fileName) {
        var searchResult = [];

        if (indexMap[fileName][newKeys]) {

            Object.keys(indexMap[fileName][newKeys]).forEach(function (id) {
                //add a unique document in the result
                var docs = indexMap[fileName][newKeys][id];

                //check if the search result has the document already to prevent duplicate entry
                if (!resultExist(docs, searchResult)) {
                    searchResult.push(docs);
                }
            });

        }

        return searchResult;
    }




    function resultExist(docId, searchResult) {
        for (var i = 0; i < searchResult.length; i++) {
            if (searchResult[i].source.title === docId.source.title && searchResult[i].source.text === docId.source.text) {
                return true;
            } else {
                return false;
            }
        }
    }




    //The functionality of this indexBot method is to index data according to priority
    var indexBot = function (splitedTokens, fileName, priority, source, id) {
        splitedTokens.forEach(function (tokens) {
            //clean token by removing commas and special characters

            var newToken = tokenize(tokens);

            //check if newToken has been indexed before
            //if index before add points to the priority
            if (indexMap[fileName][newToken]) {
                //check if token with the called indexMap (id) is already available
                if (indexMap[fileName][newToken][id]) {
                    //if available update the priority
                    indexMap[fileName][newToken][id].priority += priority;
                } else {
                    indexMap[fileName][newToken][id] = {
                        priority: priority,
                        source: source,
                        fileName:fileName
                    };
                }
            } else {
                //declare the indexMap object located at empty
                indexMap[fileName][newToken] = {};
                //fill up with data
                indexMap[fileName][newToken][id] = {
                    priority: priority,
                    source: source,
                    fileName:fileName
                };
            }
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
     * @params {object} fileDatas
     */
    function createIndex(fileData) {

        if (fileData.documents === undefined) {
            return message = {
                status: false,
                message: fileData.name + " file is empty"
            };
        }
        if (fileData.documents[0].title === undefined && fileData.documents[0].text === undefined) {
            return message = {
                status: false,
                message: fileData.name + " file is not in the correct format"
            };
        }


        if (typeof fileData === "object") {
            var docs = fileData.documents;
            var size = [];
            indexMap[fileData.name] = {
                _size: (function () {
                    for (var i = 0; i < docs.length; i++) {
                        size.push(i);
                    }
                    return size;
                })()
            }

            for (var i = 0; i < docs.length; i++) {
                var currDoc = docs[i];

                //For title: Priority points = 2
                //For text: Priority points = 1
                var titlePriority = 2;
                var textPriority = 1;

                //indexing the title
                //split the title into an array
                var badTitleTokens = currDoc.title.split(" ");
                //send the data to the indexBot
                indexBot(badTitleTokens, fileData.name, titlePriority, currDoc, i);
                //Indexing the text
                //split the text into an array
                var badTextTokens = currDoc.text.split(" ");
                indexBot(badTextTokens, fileData.name, textPriority, currDoc, i);


            }

            message = {
                status: true,
                message: "The file " + fileData.name + " has been indexed"
            };
            return message;
        }
    }

    /*
     * This function takes in terms with spaces, commas and other alpha-numerical characters
     * It also takes in the mapped index created from the files and a callback to send notification of error or returns a result
     * @params {object} indexMap
     * @params {string} theTerms
     * @params {function} done
     */

    function getIndex(fileName) {
        if (fileName && typeof fileName === "string") {
            return indexMap[fileName];
        } else {
            return indexMap;
        }
    }


    function searchIndex(query, opts) {
        var usedKeys = [];
        var result = {
            data: false
        };
        var sResult;

        var fileName = Object.keys(indexMap);

        if (typeof query === "string") {
            var splitedKeys = query.split(' ');
        } else if (typeof query[0] === "string") {
            var splitedKeys = query;
        }

        splitedKeys.forEach(function (keywords) {
            var newKeys = tokenize(keywords);

            //Check if the keys have been used during the present search
            if (usedKeys.indexOf(newKeys) < 0) {
                if (opts === undefined) {
                } else {
                    var sResult = searchOne(newKeys, opts.fileName);
                }
                //keep track of used terms
                usedKeys.push(newKeys);
            }

            result = {
                data: sResult
            };
        });
        return result;
    }

    return {
        createIndex: createIndex,
        searchIndex: searchIndex,
        getIndex: getIndex,
        tokenize: tokenize
    }
})();