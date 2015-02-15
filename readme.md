# Dave's Simple Chat Service

![](https://raw.githubusercontent.com/rockbandit/DaveChat/master/screenshots/screenshot.png)

Note: You can see this in action on Heroku: [https://davechat.herokuapp.com/](https://davechat.herokuapp.com/)

I've been playing around with Node.js recently and taking some of the neat online lessons available through [Nodeschool](http://nodeschool.io/). One of the lessons involved streaming realtime data between the client and server using [Socket.io](http://socket.io/).

This sounded insanely powerful and fund, so I took a break from the rest of the lessons and started playing around with Socket.io. They have a tutorial that explains [how to build a simple, realtime chat application](http://socket.io/) using its library in about 20 minutes.

This little web app is more or less a result of tutorial and I've added some additional stuff as I played around with it (e.g., Ask for and display usernames).

### Things I've added

In the interest of learning more about Node.js (and JavaScript!), I've been working on adding a few more things than the default socket.io chat app tutorial has. This includes things like:

* Usernames!
* Number of active users!
* Timestamps on messages!
* Sanitizing user input!
* Properly autolink URLs!
* Detect if a link to an image is pasted in and expand!

### Things to potentially do

* Display a list of all connected users!
* Check for identical usernames and prompt for different name
* Limit username to X number of characters (and validate name so no null values are allowed).
* Prevent flooding chat with null values / null data.
* Embed YouTube videos? Instagram posts? Etc?
* Display welcome message on connect
* Play around with idea of adding admin options (kick user, ban user)
* Play around with idea of having a blacklist for certain words and phrases
