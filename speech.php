<?php
 
// Convert Words (text) to Speech (MP3)
// ------------------------------------
   $word = urlencode($_GET["word"]);
 
// Name of the MP3 file generated using the MD5 hash
   $file = md5($word);
  
// Save the MP3 file in this folder with the .mp3 extension 
   $file = "audio/" . $file . ".mp3";
 
// If the MP3 file exists, do not create a new request
   if (!file_exists($file)) {
     $mp3 = file_get_contents('http://translate.google.com/translate_tts?tl=fr&q=' . $words);
     file_put_contents($file, $mp3);
   }

   echo $file;
?>