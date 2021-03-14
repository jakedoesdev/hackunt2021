<?php
//error_log(var_export($_POST, true));

require('../service/db.php');
$data = file_get_contents('php://input');
$data = json_decode($data);
//error_log(var_export($data, true));

$pi_name = $data->pi_name;
$device_id = $data->device_id;
$rssi = $data->RSSI;
$timestamp = $data->time;

error_log("Received pitracker data:" . $pi_name . ", " . $device_id . ", " . $rssi . ", " . $timestamp);
$timestamp = date('Y-m-d H:i:s');
$db->query("INSERT INTO logs (device_id, timestamp, identifier, rssi) VALUES ('$device_id', '$timestamp', '$pi_name', '$rssi')");
error_log($db->error);
