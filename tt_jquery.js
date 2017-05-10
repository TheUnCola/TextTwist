$(document).ready(function(){
    $("#save").on("submit", function(evt) {
        evt.preventDefault();
        $.ajax({
            method: "POST",
            url: "api/save",
            data: {
                "user": $("#username").val(),
                "wordsFound": getWordsFound(),
                "timeLeft" : gameTime,
                "rack": rack.join("")
            },
            success: function(data) {
                console.log(data);
            }
        });

        return false;
    });
    $("#load").on("submit", function(evt) {
        evt.preventDefault();
        $.ajax({
            method: "POST",
            url: "api/load",
            data: {
                "user": $("#usernameL").val()
            },
            datatype: "json",
            success: function(data) {
                console.log(data); //this part works now
                loadedGame = data;
                loadingGame = true;
                
                //do something with data returned
                
            }
        });

        return false;
    });
});