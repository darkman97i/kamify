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

function getFileIconCode (mimeType) {
    if (mimeType == "application/pdf") {
        return "<i class='fa fa-file-pdf-o'></i>";
    } else if (mimeType == "text/plain") { 
        return "<i class='fa fa-file-text-o'></i>";
    } else if (mimeType == "application/msword") { 
        return "<i class='fa fa-file-word-o'></i>";
    } else if (mimeType == "application/vnd.ms-excel"){ 
        return "<i class='fa fa-file-excel-o'></i>";
    } else if (mimeType == "application/vnd.ms-powerpointtd"){ 
        return "<i class='fa fa-file-powerpoint-o'></i>";
    } else if (mimeType == "application/zip"){ 
        return "<i class='fa fa-file-zip-o'></i>";
    } else if (mimeType == "text/html"){ 
        return "<i class='fa fa-file-code-o'></i>";
    } else {
        return "<i class='fa fa-file-o'></i>";
    }
}

function getName(nodePath) {
    return nodePath.substring(nodePath.lastIndexOf('/')+1)
}

function isBrowserPreview(mimeType) {
    if (mimeType == "application/pdf" || mimeType == "text/plain" || mimeType == "image/jpeg" || mimeType == "image/gif" || 
            mimeType == "image/png" || mimeType == "image/bmp" || mimeType == "text/html" || mimeType == "text/plain") {
        return true;
    } else {
        return false;
    }
}

function generateHtmlResultsWS1(jsonDict, baseUrl) {
    // Grabbing the results
    var results = jsonDict["queryResult"];
    // workaround for older ws version what shows root variable
    if (typeof jsonDict["queryResults"] !== 'undefined') {
        results = jsonDict["queryResults"]["queryResult"];
    }
    
    // Check case results <=1 ( in case 0,1 results.length is undefined, and in case 0 result is undefined )
    var length = 0;
    if (typeof results !== 'undefined' && typeof results.length !== 'undefined') {
        length = results.length;
    } else if (typeof results !== 'undefined') {
        length = 1;
    }

    var html = "<div class='callout callout-top clearfix'>";    
    html += "<h6><i class='fa fa-list-alt fa-lg'></i> Resultados: " + length + "</h6>";
    html += "<table class='tight' cellspacing='0' cellpadding='0'><br>";
    html += "<thead></thead><br>";

    //Body
    html += '<tbody><br>';
    
    if (length>1) {
        for (var k = 0; k < length; k++) {
            var res = results[k];
            html += generateRowWS(res, "document", baseUrl);
        }
    } else if (length==1) {
        html += generateRowWS(results, "document", baseUrl);
    } 
    
    // Closing the results
    html += "</tbody><br>";
    html += "</table>";

    html += "</div>";

    // Setting html results
    document.getElementById("results").innerHTML = html;
    
    // Adding downloading listeners
    if (length>1) {
        for (var k = 0; k < length; k++) {
            var res = results[k];
            if (isBrowserPreview(res["document"]["mimeType"])) {
                var uuid = res["document"]["uuid"];
                document.getElementById(uuid).addEventListener('click', function() {
                    getContent(this.id);
                });
            }
        }
    } else if (length==1) {
        var uuid = results["document"]["uuid"];
        document.getElementById(uuid).addEventListener('click', function() {
            getContent(this.id);
        });
    } 
}

function generateHtmlResultsWS2(jsonDict, baseUrl) {    
    // Grabbing the results
    var results = jsonDict["queryResult"];
    
    // Check case results <=1 ( in case 0,1 results.length is undefined, and in case 0 result is undefined )
    var length = 0;
    if (typeof results !== 'undefined' && typeof results.length !== 'undefined') {
        length = results.length;
    } else if (typeof results !== 'undefined') {
        length = 1;
    }

    var html = "<div class='callout callout-top clearfix'>";

    html += "<h6><i class='fa fa-list-alt fa-lg'></i> Resultados: " + length+ "</h6>";
    
    html += "<table class='tight' cellspacing='0' cellpadding='0'><br>";
    html += "<thead></thead><br>";

    //Body
    html += '<tbody><br>';
    
    if (length>1) {
        for (var k = 0; k < length; k++) {
            var res = results[k];
            html += generateRowWS(res, "node", baseUrl);
        }
    } else if (length==1) {
        html += generateRowWS(results, "node", baseUrl);
    } 
    
    // Closing the results
    html += "</tbody><br>";
    html += "</table>";

    html += "</div>"; 
    
    // Setting html results
    document.getElementById("results").innerHTML = html;
    
    // Adding downloading listeners
    if (length>1) {
        for (var k = 0; k < length; k++) {
            var res = results[k];
            if (isBrowserPreview(res["node"]["mimeType"])) {
                var uuid = res["node"]["uuid"];
                document.getElementById(uuid).addEventListener('click', function() {
                    getContent(this.id);
                });
            }
        }
    } else if (length==1) {
        var uuid = results["node"]["uuid"];
        document.getElementById(uuid).addEventListener('click', function() {
            getContent(this.id);
        });
    } 
}

function generateRowWS(res, rootNodeName, baseUrl) {
    var newRow = "<tr class='result'>";
    // Setting the file name and the Download link
    if (isBrowserPreview(res[rootNodeName]["mimeType"])) {
        newRow += "<docname>" + getFileIconCode(res[rootNodeName]["mimeType"]);
        newRow += " <a href='#' id='"+res[rootNodeName]["uuid"]+"'>" + getName(res[rootNodeName]["path"]) + "</a>";
        newRow += "</docname>";
    } else {
        newRow += "<docname>" + getFileIconCode(res[rootNodeName]["mimeType"]);
        newRow += " <a target='_blank' href='" + baseUrl + "Download?uuid=" + res[rootNodeName]["uuid"] + "'>" + getName(res[rootNodeName]["path"]) + "</a>"
        newRow += "</docname>";
    }
    
    newRow += "<date>Date: " + res[rootNodeName]["actualVersion"]["created"].toString()+ "</date><br><br>";
    
    // Adding the excerpt if it exists
    try {
        if (res["excerpt"].toString() == "undefined") {
            newRow += "<i>[N/F]</i>";
        }
        else {
            newRow += "<i class='fa fa-quote-left'></i><excerpt>[...] " +res["excerpt"] + "[...]</excerpt><i class='fa fa-quote-right'></i>";
        }
    }
    catch (e) {
        newRow += "<i>--</i>";
    }
    
    newRow+="</tr><hr><br>";
    return newRow;
}

// Executing the Query towards OpenKM
function runQuery() {
    // Grabbing the configuration
    chrome.storage.sync.get("config", function (storage) {
        var dictConfig = storage["config"];
        
        var url = dictConfig["profiles"][dictConfig["currentProfile"]]["url"];
        var userName = dictConfig["profiles"][dictConfig["currentProfile"]]["username"];
        var password = dictConfig["profiles"][dictConfig["currentProfile"]]["password"];
        var ws = dictConfig["profiles"][dictConfig["currentProfile"]]["ws"];
        
        var requestUrl = url + "services/rest/search/findByContent?content=" + document.getElementById("texQuery").value;

        var xhr = new XMLHttpRequest();
        xhr.open("GET", requestUrl, false);

        xhr.setRequestHeader("Authorization", "Basic " + btoa(dictConfig["profiles"][dictConfig["currentProfile"]]["username"] + ":" + dictConfig["profiles"][dictConfig["currentProfile"]]["password"]));
        xhr.setRequestHeader("Accept", "application/json; indent=4");
        
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                var status = xhr.status;

                if ((status >= 200 && status < 300) || status === 304) {
                    // Unmarshall depends on WS version implementation
                    if (ws == "2") {
                        generateHtmlResultsWS2(JSON.parse(xhr.responseText), url);
                    } else {
                        generateHtmlResultsWS1(JSON.parse(xhr.responseText), url);
                    }
                } else {
                    document.getElementById('optMessage').innerHTML = "<div class='notice warning'><i class='icon-warning-sign icon-large'></i> " + "Configuration is NOT properly defined to let the application work or OpenKM not available." + "<a href='#close' class='icon-remove'></a></div>";
                    console.log("Error: Configuration is NOT properly defined to let the application work or OpenKM not available" );
                }
            }
        };
        
        xhr.send();        
    });
}

document.addEventListener('DOMContentLoaded', function () {
    // Adding the main listener
    document.getElementById('butSearch').addEventListener('click', runQuery);
});