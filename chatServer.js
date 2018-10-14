/*
chatServer.js
Author: David Goedicke (da.goedicke@gmail.com)
Closley based on work from Nikolas Martelaro (nmartelaro@gmail.com) as well as Captain Anonymous (https://codepen.io/anon/pen/PEVYXz) who forked of an original work by Ian Tairea (https://codepen.io/mrtairea/pen/yJapwv)
*/

var express = require('express'); // web server application
var app = express(); // webapp
var http = require('http').Server(app); // connects http library to server
var io = require('socket.io')(http); // connect websocket library to server
var serverPort = 8000;


//---------------------- WEBAPP SERVER SETUP ---------------------------------//
// use express to create the simple webapp
app.use(express.static('public')); // find pages in public directory

// start the server and say what port it is on
http.listen(serverPort, function() {
  console.log('listening on *:%s', serverPort);
});
//----------------------------------------------------------------------------//


//---------------------- WEBSOCKET COMMUNICATION -----------------------------//
// this is the websocket event handler and say if someone connects
// as long as someone is connected, listen for messages
io.on('connect', function(socket) {
  console.log('a new user connected');
  var questionNum = 0; // keep count of question, used for IF condition.
  var score = 5;
  var botOutput;
  var questionAnswer = 2;
  socket.on('loaded', function() { // we wait until the client has loaded and contacted us that it is ready to go.

    socket.emit('answer', "Hey, hello I am QuizBot, a simple chat bot example."); //We start with the introduction;
    setTimeout(timedQuestion, 2000, socket, "What is your name?"); // Wait a moment and respond with a question.

  });
  socket.on('message', (data) => { // If we get a new message from the client we process it;
    console.log(data);
    botOutput = bot(data, socket, questionNum, score,questionAnswer);// run the bot function with the new message
    questionNum = botOutput[0]
    score = botOutput[1]
    questionAnswer = botOutput[2]
    console.log(botOutput)
  });
  socket.on('disconnect', function() { // This function  gets called when the browser window gets closed
    console.log('user disconnected');
  });
});
//--------------------------CHAT BOT FUNCTION-------------------------------//
function bot(data, socket, questionNum, score, questionAnswer) {
  var input = data; // This is generally really terrible from a security point of view ToDo avoid code injection
  var answer;
  var question;
  var waitTime;
  var newScore = score;
  var a = Math.floor(Math.random() * 10);
  var b = Math.floor(Math.random() * 10);
  var qa = a+b;

  /// These are the main statments that make up the conversation.
  if (questionNum == 0) {
    answer = 'Hello ' + input + ' :-)'; // output response
    waitTime = 2000;
    question = 'Are you ready to play?'; // load next question
  } else if (questionNum == 1) {
    if (input.toLowerCase() === 'yes') {
      answer = 'Perfect. Let\'s get started!';
      waitTime = 2000;
      question = 'What is 1+1?';
      qa = 2;
    } else{
      answer = ''
      question = 'How about now?';
      waitTime = 0;
      questionNum--;
    }
  } else if ((questionNum >= 2) && (score < 10) && (score > 0)){
    if (Number(input) == questionAnswer){
      answer = 'Correct!';
      waitTime = 2000;
      newScore = score + 1;
      socket.emit('changeBG', newScore);
    } else{
      answer = 'Wrong.';
      waitTime = 2000;
      newScore = score - 1;
      socket.emit('changeBG', newScore);
    }
    if ((newScore < 10) && (newScore > 0)){
      question = 'What is ' + String(a) + ' + ' + String(b) + '?'; // load next question
    } else{
      question = 'Ready to see results?'
    }
  } else if (score == 0) {
    answer = 'Oy vey, you lose.';
    waitTime = 2000;
    question = ''; // load next question
  } else if (score == 10) {
    answer = 'Mazel-Tov, you win!';
    waitTime = 2000;
    question = ''; // load next question
  }

  socket.emit('answer', answer);
  setTimeout(timedQuestion, waitTime, socket, question);
  return [questionNum + 1,newScore, qa];
}

function timedQuestion(socket, question) {
  if (question != '') {
    socket.emit('question', question);
  } else {
    //console.log('No Question send!');
  }

}
//----------------------------------------------------------------------------//
