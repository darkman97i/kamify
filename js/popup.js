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

function generateHtmlResultsWS1(jsonDict, baseUrl) {
    // Grabbing the results
    var results = jsonDict["queryResult"];
    // workaround for older ws version what shows root variable
    if (typeof jsonDict["queryResults"] !== 'undefined') {
        results = jsonDict["queryResults"]["queryResult"]
    }

    var html = "<div class='callout callout-top clearfix'>";    
    html += "<h6><i class='fa fa-list-alt fa-lg'></i> Resultados: " + results.length.toString() + "</h6>";
    html += "<table class='tight' cellspacing='0' cellpadding='0'><br>";
    html += "<thead></thead><br>";

    //Body
    html += '<tbody><br>';

    for (var k = 0; k < results.length; k++) {
        var res = results[k];
        
        var newRow = "<tr class='result'>";
        // Setting the file name and the Download link
        newRow += "<docname>" + getFileIconCode (res["document"]["mimeType"] ) + " <a target='_blank' href='" + baseUrl + "Download?uuid=" + res["document"]["uuid"] + "'>" + res["document"]["path"].substring(res["document"]["path"].lastIndexOf('/')+1)+ "</a></docname>";
        newRow += "<date>Date: " + res["document"]["actualVersion"]["created"].toString()+ "</date><br><br>";
        
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

        html += newRow;
    }
    
    // Closing the results
    html += "</tbody><br>";
    html += "</table>";

    html += "</div>";

    return html;
}

function generateHtmlResultsWS2(jsonDict, baseUrl) {    
    // Grabbing the results
    var results = jsonDict["queryResult"];

    var html = "<div class='callout callout-top clearfix'>";

    html += "<h6><i class='fa fa-list-alt fa-lg'></i> Resultados: " + results.length.toString()+ "</h6>";
    
    html += "<table class='tight' cellspacing='0' cellpadding='0'><br>";
    html += "<thead></thead><br>";

    //Body
    html += '<tbody><br>';
    
    for (var k = 0; k < results.length; k++) {
        var res = results[k];
        
        var newRow = "<tr class='result'>";
        // Setting the file name and the Download link
        newRow += "<docname>" + getFileIconCode (res["node"]["mimeType"] ) + " <a target='_blank' href='" + baseUrl + "Download?uuid=" + res["node"]["uuid"] + "'>" + res["node"]["path"].substring(res["node"]["path"].lastIndexOf('/')+1)+ "</a></docname>";
        newRow += "<date>Date: " + res["node"]["actualVersion"]["created"].toString()+ "</date><br><br>";
        
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

        html += newRow;
    }
    
    // Closing the results
    html += "</tbody><br>";
    html += "</table>";

    html += "</div>";

    return html;
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
                        var html = generateHtmlResultsWS2(JSON.parse(xhr.responseText), url);
                    } else {
                        var html = generateHtmlResultsWS1(JSON.parse(xhr.responseText), url);
                    }
                    document.getElementById("results").innerHTML = html;
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