<?php
    $verb = $_SERVER['REQUEST_METHOD'];
    $uri = $_SERVER['PATH_INFO'];
    $routes = explode("/", $uri);
    
    if ($verb == "POST" && $routes[1] == "load"){
        $dbhandle = new PDO("sqlite:saves.db") or die("Failed to open DB");
        if (!$dbhandle) die ($error);
        
        $statement = $dbhandle->prepare("Select user,wordsFound,timeLeft,rack from saves where user='".$_POST['user']."' order by time limit 1");
        $statement->execute();
        
        $results = $statement->fetchAll(PDO::FETCH_ASSOC);
        $results[1] = getAllWords($results[0]['rack']);
        header('HTTP/1.1 200 OK');
        header('Content-Type: application/json');
        echo json_encode($results);
    } else if ($verb == "POST" && $routes[1] == "save"){
        $dbhandle = new PDO("sqlite:saves.db") or die("Failed to open DB");
        if (!$dbhandle) die ($error);
        
        $statement = $dbhandle->prepare("insert into saves (user, wordsFound, timeLeft, time, rack) values (:user, :wordsFound, :timeLeft, :time, :rack)");
        $statement->bindParam(":user", $_POST["user"]);
        $statement->bindParam(":wordsFound", $_POST["wordsFound"]);
        $statement->bindParam(":timeLeft", $_POST["timeLeft"]);
        $statement->bindParam(":time", date("m/d/y g:i a"));
        $statement->bindParam(":rack", $_POST["rack"]);
        $statement->execute();
    }
    
    
    /* getSubRacks
        takes in a master rack (string)
        returns a list of all sub racks (array)
    */
    function getSubRacks($rack) {
        $racks = [];
        for($i = 0; $i < pow(2, strlen($rack)); $i++){
        	$ans = "";
        	for($j = 0; $j < strlen($rack); $j++){
        		if (($i >> $j) % 2) {
        		  $ans .= $rack[$j];
        		}
        	}
        	if (strlen($ans) > 1){
          	    $racks[] = $ans;	
        	}
        }
        $racks = array_unique($racks);
        return $racks;
    }
    
    /* getWords
        takes in a single rack (string)
        queries the DB for possible words
        returns possible words (string)
    */
    function getWords($rack) {
        $dbhandle = new PDO("sqlite:scrabble.sqlite") or die("Failed to open DB");
        if (!$dbhandle) die ($error);
        $query = "SELECT words FROM racks WHERE rack='".$rack."'";
        $statement = $dbhandle->prepare($query);
        $statement->execute();
        $results = $statement->fetchAll(PDO::FETCH_ASSOC);
        return $results[0]["words"];
    }
    
    
    /* getAllWords
        takes in a master rack (string)
        finds all sub racks and all words for each sub rack
        returns all words for each sub rack (array)
    */
    function getAllWords($masterRack) {
        $racks = getSubRacks($masterRack);
        $result = [];
        foreach ($racks as &$rack) {
            $words = explode('@@',getWords($rack));
            foreach($words as $w) {
                if (!($w == null)) array_push($result,$w);
            }
        }
        return $result;
    }
?>