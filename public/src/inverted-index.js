window.invertedIndex = (function (){




        /*
        * The tokenize function is written to purify tokens or terms from alpha-numerical characters
        * @params {string} tokens
        * @return {string} newToken
        */
        function tokenize(tokens) {
            //remove every special character from the tokens

            //turn tokens into lowercase for better search
            var newToken = tokens.trim().replace(/[^a-z0-9]+/gi, '').toLowerCase();
            //send out the new token
            return newToken;
        }

        /*
        * The createIndex function takes in a fileData in json format, it then splits the documents text & title into tokens.
        * The tokens are not pure because they might contain alpha-numerical characters like commma etc, so it is passed to the
        * tokenize funtion for purification and a newToken is returned.
        * The newToken are then mapped in the following order
        * {
        *   newToken: {
        *       doc_id: {
        *         priority:integer, //for importance
        *         source: {
        *             text:"This is a sample text",
        *             title: "This is a sample title"
        *           }
        *       }
        *    }
        * After the index has been mapped, An error or a result is sent through the callback
        * @params {object} fileData
        * @params {function} done
        */
        function createIndex(fileData, done) {
            /*
            * The structure of the fileData:
            * {
            *   documents: {
            *       objectIndex: {
            *         title:"This is a sample title",
            *         text: "This is a sample text"
            *       }
            *    }
            *  name: "The name of the file"
            * }
            */
            //set an empty index
            var index = {};
            var documents = fileData.documents;


            //The functionality of this indexBot method is to index data according to priority
            var indexBot = function (splitedTokens, priority, source, id) {

                        splitedTokens.forEach(function(tokens) {
                            //clean token b removing commas and special characters
                            var newToken = tokenize(tokens);
                            //check if newToken has been indexed before
                            //if index before add points to the priority
                            if(index[newToken]) {
                                //check if token with the called index (id) is already available
                                if( index[newToken][id] ) {
                                    //if available update the priority
                                    index[newToken][id].priority += priority;
                                }else {
                                   index[newToken][id] =  {
                                     score: priority,
                                     source: source
                                   };
                                }
                            }else{
                                //declare the index object located at empty
                                index[newToken] = {};
                                //fill up with data
                                index[newToken][id] = {
                                    priority:priority,
                                    source:source
                                };
                            }
                        });
            }
   
            //loop through the documents
            for(var i = 0; i < documents.length; i++) {
                var currDoc = documents[i];

                //For title: Priority points = 2
                //Fore text: Priority points = 1
                var titlePriority = 2;
                var textPriority = 1;


                //indexing the title
                //split the title into an array
                var badTitleTokens = currDoc.title.split(" ");
                //console.log(badTitleTokens);
                //send the data to the indexBot
                indexBot(badTitleTokens, titlePriority, currDoc, i);

                //Indexing the text
                //split the text into an array
                var badTextTokens = currDoc.text.split(" ");
                //console.log(badTextTokens);
                indexBot(badTextTokens, textPriority, currDoc, i);
            }


            //set the callback
            done(null, {
                fileName: fileData.name,
                data:index
            });
        }

                /*
        * This function takes in terms with spaces, commas and other alpha-numerical characters
        * It also takes in the mapped index created from the files and a callback to send notification of error or returns a result
        * @params {object} indexMap
        * @params {string} theTerms
        * @params {function} done
        */

        function searchIndex(theTerms, indexMap, done){
                var searchResult = [];
                var terms = [];
                var isEmpty = "";
                delete indexMap[isEmpty];
                var theFileName = Object.keys(indexMap);
                console.log(theFileName);
                console.log(indexMap);
                //check if a doc already exists in the search result
                var resultExist = function(docId){
                    for(var i=0; i < searchResult.length; i++) {
                        if(searchResult[i].source.title === docId.source.title && searchResult[i].source.text === docId.source.text){
                            return true;
                        }else{
                            return false;
                        }
                    }
                }

                var splitedTerms = theTerms.split(' ');
                console.log(splitedTerms);
                splitedTerms.forEach(function(term) {
                        var searchToken = tokenize(term);
                        var terms = [];

                        //Check if the terms have been used during the present search
                        if(terms.indexOf(searchToken) < 0) {
                            theFileName.forEach(function (name){
                                if(indexMap[name].indexedData[searchToken]) {
                                    //iterate the documents with id
                                    Object.keys(indexMap[name].indexedData[searchToken]).forEach(function (id) {
                                        //add a unique document in the result
                                        var documents = indexMap[name].indexedData[searchToken][id];
                                        //check if the search result has the document alreadt to prevent duplicate entry
                                        if(!resultExist(documents)) {
                                            searchResult.push(documents);
                                        }
                                    });
                                }
                            });

                            //keep track of used terms
                            terms.push(searchToken);

                        }
                });
                //return the searchResult through the callback

                done(null, {
                    data: searchResult
                });


        }



    return {
        createIndex:createIndex,
        searchIndex:searchIndex
    }
})();
