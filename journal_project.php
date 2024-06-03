

<?php
// header('Content-Type: text/csv');
// header('Access-Control-Allow-Origin: *'); // Allow any domain if your files are on different domains

$server = //enter your local host server;
$username = //enter your username to database;
$password = //enter your password;
$dbname = //enter your database name;

$conn = mysqli_connect($server, $username, $password, $dbname);
if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}

$sql = "SELECT * FROM journal";
$result = mysqli_query($conn, $sql);
if (!$result) {
    die("Error executing query: " . mysqli_error($conn));
}

if(mysqli_num_rows($result) > 0){
    echo "date,food,drinks,drink_oz,food_cal \n";
    while($row = mysqli_fetch_assoc($result)) {
        echo $row["date"] . ",\"" . 
        $row["food"] . "\",\"" . 
        $row["drinks"] . "\"," . 
        $row["drink_oz"] . "," .
        $row["food_cal"] . "\n";
    }
}

$data = array();
if (mysqli_num_rows($result) > 0) {
    while ($row = mysqli_fetch_assoc($result)) {
        $data[] = $row;
    }
} else {
    echo "No data found";
    exit;  // If no data found, exit
}