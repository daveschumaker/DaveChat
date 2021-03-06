var express = require('express');
    app = express();
    http = require('http').Server(app);
    io = require('socket.io')(http);
    path = require('path');
    os = require('os');
    sanitizer = require('sanitizer');

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

app.use(express.static(path.join(__dirname, 'public')));

// Detect if user entered whitespace
function isEmpty(str) {
  return str.replace(/^\s+|\s+$/g, '').length == 0;
}

// Store all usernames that are connected to the chat app.
var usernames = new Array();
var userCount = 0; // Count total number of users.
//var socket.username;

// Use this to easily remove users from our users array.
Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

io.on('connection', function(socket){
  //io.emit('chat message', 'a user has connected. :)');
  //userCount++; // Increment the number of active users.
  //io.emit('user count', userCount); // Send number of users to client.
  //io.emit('usernames', usernames);
  console.log("a user has connected");
  console.log('Users online: ' + userCount);
  //console.log("Length: " + usernames.length + " Usernames: " + usernames);

  // Emit an updated list of usernames and the userCount ever 5 seconds
  setInterval(function() {
    usernames.sort(); // Sort username array alphabetically
    io.emit('user count', userCount);
    io.emit('usernames', usernames);
    io.emit('my username', socket.username); // Send the user's username so we can detect if server rebooted.
  }, 2500);

  socket.on('user count', function(usersOnline) {
    io.emit('user count', userCount);
  })

  socket.on('username', function(username) {
    socket.username = username; // we store the username in the socket session for this client
    usernames.push(username); // Add this to our user array.
    console.log('Active users: ' + usernames);
    io.emit('usernames', usernames); // Send array of usernames to client.
    io.emit('connection message', "<p class=\"connectionMessage\">" + username + " has connected.</p>", username);
    userCount = usernames.length;
    io.emit('user count', userCount); // Send number of users to client.
  })

  socket.on('chat message', function(msg) {
    if (isEmpty(msg)) {
      // Do nothing, since the user entered nothing but whitespace.
    } else {
      msg = sanitizer.escape(msg);
      io.emit('chat message',  socket.username, msg, userCount);
      console.log('(message) ' + socket.username + ": " + msg);
    }
  });

  // Detect which user is typing and send it to all clients.
  socket.on('user typing', function(getUsername) {
    io.emit('user typing', getUsername);
  });

  socket.on('disconnect', function() {
    console.log("socket.username " + typeof socket.username);
    if (typeof socket.username === "undefined") {
      // Don't do anything here.
    } else {
      io.emit('connection message', "<p class=\"connectionMessage\">" + socket.username + " has disconnected.</p>", socket.username);
    }
      usernames.remove(socket.username);
    //io.emit('chat message', 'a user has disconnected. :(');
    console.log('Active users: ' + usernames);
    console.log('Total users online: ' + userCount);
    console.log('user disconnected');
    userCount = usernames.length; // Decrease the number of active users
    io.emit('user count', userCount);
    io.emit('usernames', usernames); // Send array of usernames to client.
  });
});

// Accept port input from Heroku, otherwise bind to port 3000.
http.listen(process.env.PORT || 3000, function() {
  console.log("Listening on *:3000");
});
