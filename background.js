chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    
    let word = request;
    let apiCall = `https://api.dictionaryapi.dev/api/v2/entries/en_US/${word}`
    
    fetch(apiCall).then(function(res){
        if(res.status!==200){
            sendResponse({"status": "error", 
                          "message": "I lost my super dictionary :("
                        });
            return;
        }
        res.json().then(function(data){

            response = {"status": "success"}
            response["word"] = word
            response["pos"] =  data[0].meanings[0].partOfSpeech
            response["definition"] = data[0].meanings[0].definitions[0].definition
            response["example"] =  data[0].meanings[0].definitions[0].example
            sendResponse(response);

        })
    }).catch(function(err){
        sendResponse({"status": "error", 
                          "message": "I lost my super dictionary :("
                        });
    });

    return true;
});