
window.helpers = (function () {


/**
* sanitizer function
* 
* The sanitizer function is written to purify tokens or terms from alpha-numerical characters
* 
* @params {string} tokens
* @return {string} newToken
*/
function sanitizer(tokens) {
    var newToken = tokens.trim().replace(/[^a-z0-9]+/gi, '').toLowerCase();
    //send out the new token
    return newToken;
};



/**
 * fileChecker
 * 
 * This function checks if the file passed if
 * in the right format for indexing.It handles
 * empty, random and correct format of file 
 * content.
 * 
 * @param {any} fileData
 * @returns
 */
function fileChecker(fileData) {
    if (fileData.documents === undefined) {
        return message = {
            type: "empty",
            status: false,
            message: fileData.name + " file is empty"
        };
    }

    if (fileData.documents[0].title === undefined && fileData.documents[0].text === undefined) {
        return message = {
            type: "wrong format",
            status: false,
            message: fileData.name + " file is not in the correct format"
        };
    }

    if (typeof fileData === "object") {
        return message = {
            type: "ok",
            status: true,
            message: "The file " + fileData.name + " has been indexed"
        };
    }
};


/**
 * resultExist
 * 
 * This function checks if there are any duplicates
 * in a searchResult
 * 
 * @param {any} docId
 * @param {any} searchResult
 * @returns
 */
function resultExist(docId, searchResult) {
    for (var i = 0; i < searchResult.length; i++) {
        if (searchResult[i].source.title === docId.source.title && searchResult[i].source.text === docId.source.text) {
            return true;
        } else {
            return false;
        }
    }
};

/**
 * queryChecker
 * 
 * This function check if a query sent to the Index.searchIndex
 * function is in the right format.
 * 
 * @param {any} query
 * @returns
 */
function queryChecker(query) {
    var splitArg = [];
    if (typeof query === "string") {
            var splitedWord = query.split(' ');
            return {
                type: "string",
                words: splitedWord
            };
    }

    if(Array.isArray(query)) {
        var splitedWord = query;

        return {
            type:"array",
            words:splitedWord
        };
    }
};

/**
 * removeDuplicates
 * 
 * This function removes duplicates in an array.
 * 
 * @param {any} arr
 */
function removeDuplicates(arr){
    arr.filter(function(elem, index, self) {
        return index == self.indexOf(elem);
    })
}



/**
 * search
 * 
 * This function searches for results with the words
 * passed that is passed as an argument.
 * 
 * @param {any} words
 * @param {any} opts
 * @param {any} indexMap
 * @returns
 */
function search(words, opts, indexMap) {
    var searchResult = [];
    var wordsNotFound = [];
    if(opts === undefined) {
         Object.keys(indexMap).forEach(function (name) {
            if (indexMap[name][words] === undefined) {
                wordsNotFound.push(words);
            }else{
                Object.keys(indexMap[name][words]).forEach(function (id) {
                    debugger;
                    //add a unique document in the result
                    var doc = indexMap[name][words][id];
                    //check if the search result has the document already to prevent duplicate entry
                    if (!resultExist(doc, searchResult)) {
                        searchResult.push(doc);
                    }
                });
            }
            
        });
        return {
            source:"all",
            result:searchResult,
            notFound:wordsNotFound
        };
    }

    if (indexMap[opts.fileName][words] === undefined) {
        wordsNotFound.push(words);
    }else {
        Object.keys(indexMap[opts.fileName][words]).forEach(function (id) {
            //add a unique document in the result
            var doc = indexMap[opts.fileName][words][id];

            //check if the search result has the document already to prevent duplicate entry
            if (!resultExist(doc, searchResult)) {
                searchResult.push(doc);
            }
        });
    }
    return {
        source:"fileName",
        result:searchResult,
        notFound:wordsNotFound
    };
}

return {
    sanitizer:sanitizer,
    search:search,
    queryChecker:queryChecker,
    resultExist:resultExist,
    fileChecker:fileChecker,
    removeDuplicates:removeDuplicates
};

})();