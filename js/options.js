/*
     _ _____      _     _
    (_)___ /_   _(_)___(_) ___         ___ ___  _ __ ___
    | | |_ \ \ / / / __| |/ _ \       / __/ _ \| '_ ` _ \
    | |___) \ V /| \__ \ | (_) |  _  | (_| (_) | | | | | |
    |_|____/ \_/ |_|___/_|\___/  (_)  \___\___/|_| |_| |_|

    Copyright 2016 Félix Brezo and Yaiza Rubio (i3visio, contacto@i3visio.com)

    This file is part of Kamify. You can redistribute it and/or 
    modify it under the terms of the GNU General Public License as published 
    by the Free Software Foundation, either version 3 of the License, or (at 
    your option) any later version.

    This program is distributed in the hope that it will be useful, but 
    WITHOUT ANY WARRANTY; without even the implied warranty of 
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General 
    Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

*/

// Normalize OpenKM Url
function normalizeUrl(url) {
    // Ensure url ends with "/"
    if (!url.endsWith("/")) {
        url = url + "/";
    }
    return url;
}

// Check OpenKM connection data
function checkConnection(url, userName, password) {    
    // Normalize url
    url = normalizeUrl(url);
    
    // Check connection
    var requestUrl = url + "services/rest/repository/getAppVersion";
    var xhr = new XMLHttpRequest();
    xhr.open("GET", requestUrl, false);
    //xhr.setRequestHeader("Authorization", "Basic " + btoa("okmAdmin" + ":" + "OpenKMi3visio15?"));
    xhr.setRequestHeader("Authorization", "Basic " + btoa(userName + ":" + password));
    xhr.setRequestHeader("Accept", "application/json; indent=4");
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            var status = xhr.status;

            if ((status >= 200 && status < 300) || status === 304) {
                var ver = JSON.parse(xhr.responseText);
                var okmVersion = "OpenKM version " + ver.major + "." + ver.minor + "." + ver.maintenance + " " + ver.extension + " build:" + ver.build;
                document.getElementById('optMessage').innerHTML = "<div class='notice success'><i class='icon-ok icon-large'></i> " + "Connected to " + okmVersion + "<a href='#close' class='icon-remove'></a></div>";
                console.log("Connected to " + okmVersion);
            } else {
                document.getElementById('optMessage').innerHTML = "<div class='notice warning'><i class='icon-warning-sign icon-large'></i> " + "Configuration is NOT properly defined to let the application work or OpenKM not available." + "<a href='#close' class='icon-remove'></a></div>";
                console.log("Error: Configuration is NOT properly defined to let the application work or OpenKM not available" );
            }
        }
    };
    
    xhr.send();
}

/*
    The configuration file is a Json with the following structure:
        {
            "numSearchResults" : 5,
            "forgetResults" : false,
            "currentProfile": "profile1",
            "profiles": {
                "profile1" : {
                    "url": "http://localhost:8080/OpenKM/",
                    "username": "username",
                    "password": "password",
                    "ws": "ws"
                }
            }
        }
*/

function saveConfiguration() {
    console.log("options.js: Save configuration");
    
    // Get a value saved in a form.
    var dictConfig = {};
    dictConfig["profiles"] = {};
    dictConfig["currentProfile"] = "profile1";
    dictConfig["numSearchResults"] = 5;
    dictConfig["forgetResults"] = false;

    // Setting up the profiles
    var dictProfile = {};
    dictProfile["url"] = normalizeUrl(document.getElementById('texURL').value); // Ensure url ends with "/"
    dictProfile["username"] = document.getElementById('texUsername').value;
    dictProfile["password"] = document.getElementById('texPassword').value;
    var wsVersion = document.getElementById('texWSVersion');
    dictProfile["ws"] = wsVersion.options[wsVersion.selectedIndex].value;

    dictConfig["profiles"]["profile1"] = dictProfile;

    var textConfig = JSON.stringify(dictConfig, null, 4);

    console.log("options.js: " + textConfig);
    
    // Check connection 
    checkConnection(dictProfile["url"], dictProfile["username"], dictProfile["password"]);
    
    // Save it using the Chrome extension storage API.
    chrome.storage.sync.set({'config': dictConfig}, function() {
        // Notify that we saved.
        console.log("Settings saved");
        // Showing message
        //alert(chrome.i18n.getMessage(aleConfigurationSaved));

        console.log("Sending reload message...");
        // Sending message of task completed to let the scripts reload the information
        chrome.runtime.sendMessage({done: true});
    });

    return true;
}

/*
    Grabbing the configuration and seting it into the UI.
*/
document.addEventListener('DOMContentLoaded', function () {
    console.log("Grabbing the current configuration...");
    // Grabbing the configuration
    chrome.storage.sync.get("config", function (storage) {
        var dictConfig = storage["config"];
        var url = dictConfig["profiles"][dictConfig["currentProfile"]]["url"];
        var userName = dictConfig["profiles"][dictConfig["currentProfile"]]["username"];
        var password = dictConfig["profiles"][dictConfig["currentProfile"]]["password"];
        
        // Check connection 
        checkConnection(url, userName, password);

        // Saving the configuration:
        //      - texURL
        //      - texUsername
        //      - texPassword

        // Inserting the URL into the UI
        try {
            var element = document.getElementById('texURL');
            element.value = dictConfig["profiles"][dictConfig["currentProfile"]]["url"];
        }
        catch(e){
            console.log("ERROR: There is no URL in the current configuration.");
        }

        // Inserting the username into the UI
        try {
            var element = document.getElementById('texUsername');
            element.value = dictConfig["profiles"][dictConfig["currentProfile"]]["username"];
        }
        catch(e){
            console.log("ERROR: There is no username in the current configuration.");
        }

        // Inserting the password into the UI
        try {
            var element = document.getElementById('texPassword');
            element.value = dictConfig["profiles"][dictConfig["currentProfile"]]["password"];
        }
        catch(e){
            console.log("ERROR: There is no password in the current configuration.");
        }
        
        // Inserting the ws into the UI
        try {
            var element = document.getElementById('texWSVersion');
            element.value = dictConfig["profiles"][dictConfig["currentProfile"]]["ws"];
        }
        catch(e){
            console.log("ERROR: There is no ws version in the current configuration.");
        }
    });
});

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('butSave').addEventListener('click', saveConfiguration);
});
