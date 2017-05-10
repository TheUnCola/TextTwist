<?php
    
    $verb = $_SERVER["REQUEST_METHOD"];
    switch ($verb) {
		case 'GET':
            simulateRandomScrabble(6);
        	break;
		case 'POST':
		    $data = json_decode(stripslashes(file_get_contents("php://input")));
		    $rack = $data->rack; ///////////////TESTING
		    $word = $data->word;
		  //  echo json_encode(array($data));
		    echo json_encode(checkWord($rack, $word));
			break;
		default:
		    break;
	};
    

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
    
    /* generate_rack
    Given some length n, generates a random rack
    returns string
    */
    function generate_rack($n){
      $tileBag = "AAAAAAAAABBCCDDDDEEEEEEEEEEEEFFGGGHHIIIIIIIIIJKLLLLMMNNNNNNOOOOOOOOPPQRRRRRRSSSSTTTTTTUUUUVVWWXYYZ";
      $rack_letters = substr(str_shuffle($tileBag), 0, $n);
      $temp = str_split($rack_letters);
      sort($temp);
      return implode($temp);
    };

    /*simulateRandomScrabble
    Given a length of a rack n, generates the random rack, gets all useful
    subracks, and all the words that can be created.
    returns json in format {rack,words}
    */
    function simulateRandomScrabble($n) {
        $newRack = generate_rack($n);
        $result["rack"] = $newRack; 
        $result["words"] = getAllWords($newRack);
        echo json_encode($result);
    }
	
    /*submitWord
    Takes the selected players selected letters
    concatenates them together to a string 
    and then queries the sqlite db
    ~~
    DAVID:
    Takes the selected player's selected word and their given rack
    and then queries the sqlite db
    */
    function checkWord($rack, $word){
        $dbhandle = new PDO("sqlite:scrabble.sqlite") or die("Failed to open DB");
        if (!$dbhandle) die ($error);
    
        $query = "SELECT words FROM racks WHERE rack=:rack";
        $statement = $dbhandle->prepare($query);
        $statement->bindParam(':rack', $rack, PDO::PARAM_STR);
        $statement->execute();
    
        $results = $statement->fetchAll(PDO::FETCH_ASSOC);
        /*$result =*/return array(
            "result" => (strpos($results[0]["words"], $word) !== false), // see https://stackoverflow.com/questions/4366730/how-do-i-check-if-a-string-contains-a-specific-word-in-php
            "rack" => $rack,
            "word" => $word,
        );
    };
    
    //this next line could actually be used to provide user_given input to the query to 
    //avoid SQL injection attacks
    // $statement = $dbhandle->prepare($query);
    // $statement->execute();
    
    //The results of the query are typically many rows of data
    //there are several ways of getting the data out, iterating row by row,
    //I chose to get associative arrays inside of a big array
    //this will naturally create a pleasant array of JSON data when I echo in a couple lines
    // $results = $statement->fetchAll(PDO::FETCH_ASSOC);
    
    //this part is perhaps overkill but I wanted to set the HTTP headers and status code
    //making to this line means everything was great with this request
    header('HTTP/1.1 200 OK');
    //this lets the browser know to expect json
    header('Content-Type: application/json');
    //this creates json and gives it back to the browser
    //echo json_encode($results);
?>