// Repository -> twitchbot
// Branch -> BleedingEdge
// Author -> https://github.com/Nebhay/
// Contributor
  /**
   * -> https://github.com/KillerDucks/
   */

// Libs
const appRoot = require('app-root-path');
const irc = require("tmi.js");
const fs = require('fs');
const os = require("os");

// System
const System = require(appRoot + '/Core/System');
const Collection = System.Collection;
const prettyLog = System.prettyLog;
const showObj = System.showObj;

// Configs
const Config = require("./Config");

// Vars
let LinkCheck = true

let options = {
    options: {
        debug: false
    },
    connection: {
        cluster: "aws",
        reconnect: true
    },
    identity: {
        username: Config.Creds.Username,
        password: Config.Creds.Password
    },
    channels: ["#nebhay"]
};

// Used for Twitch Commands
let commands = [];
let cmd = new Collection();


/////////////////////// Load Commands
try {
  fs.readdir(__dirname + "/Core/Commands", (err, files) => {
    if(err) throw err;
    prettyLog("Init", 'Loading Commands');    
    let ComFiles = files.filter(f => f.split(".").pop() === "js");
    if(ComFiles.length <= 0){
      console.log("No Commands to load");
      prettyLog("Init", '[Warn] No Commands Loaded');  
      return;
    }

    prettyLog("Init", 'Found '+ ComFiles.length +' Commands');              
    ComFiles.forEach((f, i) => {
      try {
        let meta = require(__dirname + '/Core/Commands/' + f);
        prettyLog("Init", i + 1 +': '+ f +' loaded');            
        cmd.set(meta.help.name, meta);
        commands.push({
          Name: meta.help.name,
          Info: meta.help.Info
        });
      } catch (error) {
        prettyLog("Init", "[Error] Failed to Load Commands"); 
        prettyLog("Init", "[Error] " + error.message); 
        prettyLog("Fatal", "Exiting, Refer to the Fatal Error Logs"); 
        process.exit(0);
      }
    });

    prettyLog("Init", "Loaded all Commands");  
  });
} catch (error) {
  prettyLog("Init", "[Error] Failed to Load Commands"); 
  prettyLog("Init", "[Error] " + error.message); 
  prettyLog("Fatal", "Exiting, Refer to the Fatal Error Logs"); 
  process.exit(0);
}

const client = new irc.client(options);

// Connect the client to the server..
client.connect();

// Connected to server
client.on("connected", (addr, port) => {
  // client.say(options.channels[0], "Hello, I am connected to the chat!");
  prettyLog("Init", "Client is Connected");
});

// >> Events Start

client.on("clearchat", function (channel) {
  prettyLog("Event", "Chat has been cleared");
});

client.on("disconnected", function (reason) {
  prettyLog("Event", `Been disconnected from the server: ${reason}`);  
});

client.on("join", function (channel, username, self) {
  prettyLog("Event", `User has joined the channel: ${username}`);
});

client.on("mods", function (channel, mods) {
  prettyLog("Event", `List of moderators has been recived`);

});

client.on("ping", function () {
  prettyLog("HeartBeat", `A Ping has been recived from Twitch`);
});

client.on("pong", function (latency) {
  prettyLog("HeartBeat", `A Ping has been sent to Twitch with a latency of: ${latency}`);
});

client.on("reconnect", function () {
  prettyLog("Event", `Trying to reconnect`);
});

client.on("serverchange", function (channel) {
  prettyLog("Event", `The server has been changed: ${channel}`);    
});

// // TO REFACTOR
// function Chatlogs(channel, user, message) {
//   fs.open("./" + channel + "/chat.txt", 'a', 666, function( e, id ) {
//   fs.write( id, "Channel: " + channel + " || User: "+ user.username + " || Message: " + message + os.EOL, null, 'utf8', function(){
//   fs.close(id, function(){
//         //console.log('file is updated');
//       });
//    });
//   });
// }


// function Modaclogs(channel, username, reason) {
//   fs.open("./" + channel + "/modactions.txt", 'a', 666, function( e, id ) {
//   fs.write( id, "Channel: " + channel + " || User: "+ username + " || was banned: " + reason + os.EOL, null, 'utf8', function(){
//   fs.close(id, function(){
//         //console.log('file is updated');
//       });
//    });
//   });
// }

client.on("ban", function (channel, username, reason) {
    Modaclogs(channel, username, reason);
    if(reason == null) {
      console.log(`Channel: ${channel} || Mod Action || user: ${username} was banned for: NO REASON GIVEN `)
    }else{
      console.log(`Channel: ${channel} || Mod Action || user: ${username} was banned for: ${reason} `)
    }
});


// OLD CODE !!
// NEED TO REFACTOR !!
//   client.on("message", function (channel, user, message, self) {
//   Chatlogs(channel, user, message);
//   console.log("Channel: " + channel + " || User: "+ user.username + " || Message: " + message)
//   if(LinkCheck == true) {
//     const regex = /[-a-zA-Z0-9@:%_\\+.~#?&/=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\\+.~#?&/=]*)?/ig;
//     if(message.match(regex)) {
//       if(user.mod == false) {
//         client.timeout(channel, user.username, 300, "[NBot] Links").then(function(data) {
//         console.log(channel + " " + "[Action] Timeing out user: " + user.username)    // data returns [channel, username, seconds, reason]
//         }).catch(function(err) {
//           console.log("Not able to ban")

//         });
//       }
//     } else {



//     }



//   }
// });


client.on("chat", function (channel, userstate, message, self) {
  // Don't listen to my own messages..
  if (self) return;
  prettyLog("DEBUG", `Userstate: ${showObj(userstate)}`, null);
  // Auto Moderation Hook TBI
  // !# To Be Implimented

  //Check if message has the serverPrefix
  if(!message.startsWith(Config.Commands.Prefix)) return;
  // Explode the Message down to parameters keeping quotes
  let prams = [].concat.apply([], message.split('"').map(function(v,i){
      return i%2 ? v : v.split(' ')
  })).filter(Boolean);

  // New Command loader
  let sentCmd = prams[0];
  // Remove the Command from Prams
  prams.splice(0, 1);
  // Slide the commands into the args
  prams.push(commands);
  // Remove the prefix from the command
  sentCmd = sentCmd.substr(1);
  
  // Get the command object
  let foundCommand = cmd.get(sentCmd);
  prettyLog("Message", `[${userstate.username}] ${sentCmd}`);
  // Command Found
  if(foundCommand) {
  // Try to run
  try {
      // Run the Command
      foundCommand.run(client, message, userstate, prams);
  } catch (error) {
      client.action("speedoflightpen", Config.Commands.error);
      prettyLog("Message", "[Error] Ran into an Error"); 
  }
  } else {
      // Show error message
      client.action("speedoflightpen", Config.Commands.invalid);
      prettyLog("Message", "[Warn] Invalid Command Sent");                
  }

});
