<?php
//<!-- DAVID: JUST SOME IDEAS -->


    // Handling data in JSON format on the server-side using PHP
    //
    header("Content-Type: application/json");
    // build a PHP variable from JSON sent using POST method
    $v = json_decode(stripslashes(file_get_contents("php://input")));
    // build a PHP variable from JSON sent using GET method
    // $v = json_decode(stripslashes($_GET["data"]));
    // encode the PHP variable to JSON and send it back on client-side
    // echo json_encode($v);
    // $rack = $v["rack"];

    // $dbhandle = new PDO("sqlite:scrabble.sqlite") or die("Failed to open DB");

    // if (!$dbhandle) die ($error);

    // $query = "SELECT words FROM racks WHERE rack=':rack'";
    // $statement = $dbhandle->prepare($query);
    // $statement->bindParam(':author', $rack, PDO::PARAM_STR);
    // $statement->execute();

    // $results = $statement->fetchAll(PDO::FETCH_ASSOC);
    // $results
    $rack = "ABC";
    
    $dbhandle = new PDO("sqlite:scrabble.sqlite") or die("Failed to open DB");
    
    if (!$dbhandle) die ($error);

    $query = "SELECT words FROM racks WHERE rack=:rack";
    $statement = $dbhandle->prepare($query);
    $statement->bindParam(':rack', $rack, PDO::PARAM_STR);
    $statement->execute();

    $results = $statement->fetchAll(PDO::FETCH_ASSOC);


    
    echo json_encode($results);

    
    /*submitWord
    Takes the selected players selected letters
    concatenates them together to a string 
    and then queries the sqlite db
    */
    function submitWord($word){
        //TODO:SEE DESCRIPTION
    }//submitWord

?>
