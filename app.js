// Do NOT include this line if you are using the browser version.
var irc = require("tmi.js");
var fs = require('fs');
require('dotenv').config()
var os = require("os");

var LinkCheck = true


var options = {
    options: {
        debug: false
    },
    connection: {
        cluster: "aws",
        reconnect: true
    },
    identity: {
        username: "nebhay",
        password: process.env.oauth
    },
    channels: ["#nebhay"]
};


function Chatlogs(channel, user, message) {
  fs.open("./" + channel + "/chat.txt", 'a', 666, function( e, id ) {
  fs.write( id, "Channel: " + channel + " || User: "+ user.username + " || Message: " + message + os.EOL, null, 'utf8', function(){
  fs.close(id, function(){
        //console.log('file is updated');
      });
   });
  });
}


function Modaclogs(channel, username, reason) {
  fs.open("./" + channel + "/modactions.txt", 'a', 666, function( e, id ) {
  fs.write( id, "Channel: " + channel + " || User: "+ username + " || was banned: " + reason + os.EOL, null, 'utf8', function(){
  fs.close(id, function(){
        //console.log('file is updated');
      });
   });
  });
}








var client = new irc.client(options);

// Connect the client to the server..
client.connect();


client.on("ban", function (channel, username, reason) {
    Modaclogs(channel, username, reason);
    if(reason == null) {
      console.log(`Channel: ${channel} || Mod Action || user: ${username} was banned for: NO REASON GIVEN `)
      }else{
      console.log(`Channel: ${channel} || Mod Action || user: ${username} was banned for: ${reason} `)
}


});



  client.on("message", function (channel, user, message, self) {
  Chatlogs(channel, user, message);

  console.log("Channel: " + channel + " || User: "+ user.username + " || Message: " + message)
  if(LinkCheck == true) {
    const regex = /[-a-zA-Z0-9@:%_\\+.~#?&/=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\\+.~#?&/=]*)?/ig;
    if(message.match(regex)) {
      if(user.mod == false) {
        client.timeout(channel, user.username, 300, "[NBot] Links").then(function(data) {
        console.log(channel + " " + "[Action] Timeing out user: " + user.username)    // data returns [channel, username, seconds, reason]
        }).catch(function(err) {
          console.log("Not able to ban")

        });



      }


    }else {



    }



  }






});
