var express = require('express');
    app = express();
    http = require('http').Server(app);
    io = require('socket.io')(http);
    path = require('path');
    os = require('os');

// Get local IP address of server for development purposes.
function getIPaddres() {
  var interfaces = os.networkInterfaces();
  var addresses = [];
  for (var k in interfaces) {
      for (var k2 in interfaces[k]) {
          var address = interfaces[k][k2];
          if (address.family === 'IPv4' && !address.internal) {
              addresses.push(address.address);
          }
      }
  }

  return addresses;
}

// Display IP of development server in the console.
// I'm using this so I can easily connect my phone and other devices
// to the chat app.
console.log("IP address: " + getIPaddres());

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
  //res.send('<h1>Hello, World!</h1>');
});

// Store all usernames that are connected to the chat app.
var usernames = {};
    userCount = 0; // Count total number of users.

// Use this to store HTML entities we want to escape.
// There's probably a better way, but hey.
var entityMap = {
   "&": "&amp;",
   "<": "&lt;",
   ">": "&gt;",
   '"': '&quot;',
   "'": '&#39;',
   "/": '&#x2F;'
 };

function escapeHtml(string) {
  return String(string).replace(/[&<>"'\/]/g, function (s) {
    return entityMap[s];
  });
}

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', function(socket){
  //io.emit('chat message', 'a user has connected. :)');
  userCount++; // Increment the number of active users.
  io.emit('user count', userCount); // Send number of users to client.
  console.log("a user has connected");
  console.log('Users online: ' + userCount);


  socket.on('user count', function(usersOnline) {
    io.emit('user count', userCount);
  })

  socket.on('username', function(username) {
    socket.username = username; // we store the username in the socket session for this client
  })

  socket.on('chat message', function(msg) {
    //io.emit('username', username);
    //io.emit('username', socket.username);
    msg = escapeHtml(msg); // Escape random HTML entities if someone posts code into message box.
    io.emit('chat message',  socket.username, msg, userCount);
    //console.log('username: ' + socket.username);
    console.log('(message) ' + socket.username + ": " + msg);
  });

  socket.on('disconnect', function() {
    userCount--; // Decrease the number of active users
    io.emit('user count', userCount);
    //io.emit('chat message', 'a user has disconnected. :(');
    console.log('Users online: ' + userCount);
    console.log('user disconnected');
  });
});

http.listen(3000, function() {
  console.log("Listening on *:3000");
});
