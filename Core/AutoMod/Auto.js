//Meta/AutoMod/V1/KillerDucks

// Auto moderator for all text communications
// Admins and me (KillerDucks) are exempt from moderation
// Users who violate are added to a WatchList
// > This is done by a server by server configuration

// System Load
const approot = require('app-root-path');
const Config = require(approot + '/Configs/config');
const System = require(approot + '/Core/System');
const prettyLog = System.prettyLog;

// Libs
const fs = require('fs');

// Drop Some Vars
let GuildNum = 0;
let args = null;

// Blacklist Load
// >> TODO add the ablity for Guild Custom Blacklists
let Blacklist = fs.readFileSync(approot + '/Lists/BlackList.txt', { encoding: 'utf8' });

module.exports.Init = function(client){
    prettyLog("AutoMod", "Hooked into Bot!")
};

module.exports.Check = function(client, message, argsV){
    try {
        // Get Server Object        
        // Find what arg the Servers Object is in
        if(true){
            // Set Args
            args = argsV;
            // We know the obj is args
            let Servers = args;
            // Itterate through the object to find Guild
            for(Guild in Servers){
                // Match Guild Name
                if(Servers[Guild]['Name'] == message.guild.name){
                    // Store the Guild position
                    GuildNum = Guild;
                    // Break Loop
                    continue;
                }
            }
        }

        // > We know the obj is args
        let Servers = args;

        // If the WatchList is enabled then continue else return
        if(!Servers[GuildNum]['WatchList']['enabled']){
            return;
        }

        // Get all of the Guilds Watched Users
        let WatchedUsers = Servers[GuildNum]['WatchList']['Users']; 

        // Check if Creator
        if (message.author.id === 217588773393793025) return;
        if(Config.Discord.AutoMod.AdminMiss){
            // Check if Admin user group
            if(message.member.hasPermission(["ADMINISTRATOR"], true, false, false)) return;
        }

        // Check the message

        // Get Blacklist into Array
        let Blacklistz = [];
        // Remove carriage returns
        stringReplace = Blacklist.replace(/(\r\n|\n|\r)/gm," ");
        // Blacklistz = Blacklist.split("\n");
        Blacklistz = stringReplace.split(" ");
        // Split the message into words
        let StrNuke = message.content.split(" ");
        for(word in Blacklistz){
            // 2nd Loop
            for(let Word in StrNuke){                
                // Check
                if(Blacklistz[word] === StrNuke[Word]){
                    // Blacklist word found
                    // Get the User
                    let usr = message.author.username;
                    if(!CheckWatchList(usr)){
                        // User is not found
                        // Add the user to the WatchList
                        WatchedUsers.push(
                            {
                                Username: usr,
                                Reason: "Use of Blacklisted Word",
                                Attempts: 1
                            }
                        );
                    } else {
                        // User found
                        // > Get their object and check info
                        let usrObj = GetWatchListUser(usr);
                        if(usrObj['Attempts'] >= 3){
                            // Apply punishment
                            // > Mute the user
                            // >> Todo: Think of a punishment System
                            message.member.setMute(true, `AutoMod Anti-Spam`); // >> Check this out
                            message.channel.send("User has been muted");
                        } else {
                            // Incriment Attempts Counter
                            usrObj['Attempts']++;
                        }
                    }                  
                    // Remove message
                    message.delete()
                        .then((msg) => {
                            message.reply(` [>AutoMod] Please do not use that word again or face a Ban/Kick/Timeout`);
                            prettyLog("AutoMod", "[Detected] Blacklist word detected, removing message");
                        })
                        .catch(/*prettyLog("AutoMod", "[Error] Message not found/deleted")*/ console.error)
                }
            }            
        }
    } catch (error) {
        prettyLog("Error", "[Warn] Failed To Execute Auto Moderator");
        prettyLog("Error", "[Warn] " + error.message);
        prettyLog("Fatal", "Exiting, Refer to the Fatal Error Logs"); 
        process.exit(0);
    }
}

// Helper Functions
function CheckWatchList(usr){
    try {
        let Servers = args;
        // Get all of the Guilds Watched Users
        let WatchedUsers = Servers[GuildNum]['WatchList']['Users']; 
        // Check if the user is on the WatchList if so incriment Attempts
        for(let User in WatchedUsers){
            if(WatchedUsers[User]['Username'] == usr){
                // User is found return true
                return true;
            }
            // Not found return false
            return false;
        }
    } catch (error) {
        prettyLog("Error", "[Warn] Failed To Check the Watchlist > Auto Moderator");
        prettyLog("Error", "[Warn] " + error.message);
        prettyLog("Fatal", "Exiting, Refer to the Fatal Error Logs"); 
        process.exit(0);
    }
}

function GetWatchListUser(usr){
    try {
        let Servers = args;
        // Get all of the Guilds Watched Users
        let WatchedUsers = Servers[GuildNum]['WatchList']['Users']; 
        for(let User in WatchedUsers){
            if(WatchedUsers[User]['Username'] == usr){
                // Return the User Object
                return WatchedUsers[User];
            }
            // Not found return false
            return false;
        }
    } catch (error) {
        prettyLog("Error", "[Warn] Failed To Get the User from the Watchlist > Auto Moderator");
        prettyLog("Error", "[Warn] " + error.message);
        prettyLog("Fatal", "Exiting, Refer to the Fatal Error Logs"); 
        process.exit(0);
    }
}
