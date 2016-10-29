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

function getName(nodePath) {
    return nodePath.substring(nodePath.lastIndexOf('/')+1)
}

// getContent based on http://stackoverflow.com/questions/17696516/download-binary-files-with-javascript
function getContent(uuid) {
    // Grabbing the configuration
    chrome.storage.sync.get("config", function (storage) {
        var dictConfig = storage["config"];
        
        var url = dictConfig["profiles"][dictConfig["currentProfile"]]["url"];
        var userName = dictConfig["profiles"][dictConfig["currentProfile"]]["username"];
        var password = dictConfig["profiles"][dictConfig["currentProfile"]]["password"];
        
        // Getting the mime type and document name
        var mimeType = "";
        var docName = "";
        var requestUrl = url + "services/rest/document/getProperties?docId=" + uuid;

        var xhr = new XMLHttpRequest();
        xhr.open("GET", requestUrl, false);

        xhr.setRequestHeader("Authorization", "Basic " + btoa(userName + ":" + password));
        xhr.setRequestHeader("Accept", "application/json; indent=4");
        
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                var status = xhr.status;

                if ((status >= 200 && status < 300) || status === 304) {
                    var doc = JSON.parse(xhr.responseText);
                    // workaround for older ws version what shows root variable
                    if (typeof doc.document !== 'undefined') {
                        doc = doc.document;
                    }
                    mimeType = doc.mimeType;
                    docName = getName(doc.path);
                } else {
                    document.getElementById('optMessage').innerHTML = "<div class='notice warning'><i class='icon-warning-sign icon-large'></i> " + "Configuration is NOT properly defined to let the application work or OpenKM not available." + "<a href='#close' class='icon-remove'></a></div>";
                    console.log("Error: Configuration is NOT properly defined to let the application work or OpenKM not available" );
                }
            }
        };
        
        xhr.send();
        
        if (mimeType.length>0) {
            try {
                var requestUrl = url + "services/rest/document/getContent?docId=" + uuid;
                
                xhr = new XMLHttpRequest();
                xhr.open("GET", requestUrl);
                
                xhr.responseType = "arraybuffer";
                
                xhr.setRequestHeader("Authorization", "Basic " + btoa(userName + ":" + password));
                xhr.setRequestHeader("Accept", "application/octet-stream");
                
                xhr.onload = function () {
                    if (this.status === 200) {
                        var blob = new Blob([xhr.response], {type: mimeType, name: docName});
                        var objectUrl = URL.createObjectURL(blob);
                        window.open(objectUrl);
                    }
                };
                
                xhr.send();
            } catch (e) {
                alert(e);
            }
        } 
    });
}