var allUsernames = new Array(); // Store a list of all usernames
var userScroll = false; // Track whether user scrolled the page so we can autofocus on new chats.

// If the user scrolls the mouse, change value.
function mouseEvent(e) {
    userScroll = true;
}

// detect user scroll through mouse
// Mozilla/Webkit
if(window.addEventListener) {
    document.addEventListener('DOMMouseScroll', mouseEvent, false);
}

//for IE/OPERA etc
document.onmousewheel = mouseEvent;

// Try to linkify any properly detected URL
// If we detect an image (ends in gif/jpg/png extensions, let's display it)
String.prototype.parseURL = function() {
  return this.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&~\?\/.=]+/g, function(url) {

    function checkImg(url) {
      var imgDetected = false;
      var newURL;
      var suffix;
      var imgExt = [
        "gif",
        "jpg",
        "png"
      ];

      for (var i=0; i < imgExt.length; i++) {
        suffix = imgExt[i];
        if (url.indexOf(suffix, url.length - suffix.length) !== -1) {
          newURL = "<br/><img class=\"chatImages\" src=\"" + url + "\">";
          imgDetected = true;
          //return newURL;
        }
      }

      if (imgDetected == false) {
        var displayURL = url;
        urlCount = url.length;
        // Truncate extra long URLs
        if (url.length > 40) {
          //displayURL = url.substring(0,35);
          //displayURL = displayURL + "…";
        }

        newURL = "<a href=\"" + url + "\" target=\"_blank\">" + displayURL + "<a/>";
      }

      return newURL;
    };

    newURL = checkImg(url);
    return newURL;
    //return url.link(url);
  });
};

// Detect if our URL ends with an image link. If so, let's embed the image!

// Create a nice timestamp
function timeStamp() {
// Create a date object with the current time
  var now = new Date();

// Create an array with the current month, day and time
  var date = [ now.getMonth() + 1, now.getDate(), now.getFullYear() ];

// Create an array with the current hour, minute and second
  var time = [ now.getHours(), now.getMinutes(), now.getSeconds() ];

// Determine AM or PM suffix based on the hour
  var suffix = ( time[0] < 12 ) ? "AM" : "PM";

// Convert hour from military time
  time[0] = ( time[0] < 12 ) ? time[0] : time[0] - 12;

// If hour is 0, set it to 12
  time[0] = time[0] || 12;

// If seconds and minutes are less than 10, add a zero
  for ( var i = 1; i < 3; i++ ) {
    if ( time[i] < 10 ) {
      time[i] = "0" + time[i];
    }
  }

// Return the formatted string
  return time.join(":") + " " + suffix;
}

// Detect if user entered whitespace
function isEmpty(str) {
  return str.replace(/^\s+|\s+$/g, '').length == 0;
}

// On initial page load, let's use jQuery to hide our
// message div and the send message form so we can
// ask for a username first.
function loadPage() {
  $('#getName').show();
  $('#footer_container').hide();
  $('#messages').hide();
  $('#welcomeMessage').hide();
  document.getElementById("un").focus();
}

// Call loadPage() function to set everything up!
loadPage();


var socket = io();
$('#getName').submit(function () {
  var myUsername = $('#un').val();


  if (isEmpty(myUsername)) {
    // User entered no data. Do nothing!
    $('#un').val('');
    return false;
  } else {
    if (allUsernames.indexOf(myUsername) == -1) {
      // Username not found in array, go ahead and add it!
      socket.emit('username', $('#un').val());
      $('#getName').hide();
      $('#welcomeMessage').show();
      $('#messages').show();
      $('#footer_container').show();
      document.getElementById("m").focus();
      return false;
    } else {
      $('#alertMessage').html("<strong>Error:</strong> Username already taken, please choose another.");
      return false;
    }


  }
})

$('#sendMessage').submit(function () {
  if ($('#m').val() == "" || $('#m').val() == null || isEmpty($('#m').val())) {
    // User entered nothing in the chat box.
    // Do nothing!
    $('#m').val('');
    return false;
  } else {
    //window.scrollTo(0,document.body.scrollHeight); // Always scroll down to your latest message
    socket.emit('chat message', $('#m').val());
    $('#m').val('');
    window.scrollTo(0,document.body.scrollHeight); // Always scroll down to your latest message
    userScroll = false;
    return false;
  }
});

socket.on('chat message', function(username, msg){
  var currTime = "<span class=\"currentTime\">" + timeStamp() + "</span>";
  //msg = findURL(msg);
  msg = msg.parseURL();
  $('#messages').append($('<li>' + currTime + '<strong>' + username + ':</strong> ' + msg + '</li>'));

  if (userScroll == false) {
    window.scrollTo(0,document.body.scrollHeight);
  }

});

// Get list of usernames.
// In theory, this is probably a bad idea, since a user could change the code
// on his client and bypass our check. This should happen on the server.
socket.on('usernames', function(usernames) {
  allUsernames = usernames;
});

// We'll use this to detect whether the is no username detected (e.g., after the server reboots)
socket.on('my username', function(username) {
  console.log(typeof username + " " + username);
  if (username === null) {
    //$('#alertMessage').html("<strong>Error:</strong> Ack, sorry!! Disconnected from the server. Please log in again. :)");
    //loadPage(); // Kick this user out and force them to log in again.
  }
});

/*

<ul>
   <li>Subitem One</li><li>
   <a href="#">What's this?</a></li></ul>

*/

socket.on('user count', function(userCount) {

  function printUsers() {
    var tempHTML;
    for (var i = 0; i < allUsernames.length; i++) {
      if (typeof tempHTML == "undefined") {
        tempHTML = "<ul><li>" + allUsernames[i] + "</li>";
      } else {
        tempHTML = tempHTML + "<li>" + allUsernames[i] + "</li>";
      }
    }

    tempHTML = tempHTML + "</ul>";
    return tempHTML;
  }

  var userMessage;
  if (userCount == 1) {
    userMessage = "1 user online";
  } else {
    userMessage = userCount + " users online";
  }

  if (allUsernames.length == 0) {
    userMessage = "<a href=\"#\">" + userMessage + "</a>";
  } else {
    userMessage = "<a href=\"#\">" + userMessage + "</a>" + printUsers();
  }

  $('#currentUsers').html(userMessage);
})

$(document).ready(function () {
  $(window).scroll(function (){
    //console.log("You scrolled!");
    userScrolled=true;
  })
})
