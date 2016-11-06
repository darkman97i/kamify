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

function isEmpty(str) {
    return (!str || 0 === str.length);
}

function convertISO8601toDate(dtstr) {
    // replace anything but numbers by spaces
    dtstr = dtstr.replace(/\D/g," ");

    // trim any hanging white space
    dtstr = dtstr.replace(/\s+$/,"");

    // split on space
    var dtcomps = dtstr.split(" ");

    // not all ISO 8601 dates can convert, as is
    // unless month and date specified, invalid
    if (dtcomps.length < 3) return "invalid date";
    // if time not provided, set to zero
    if (dtcomps.length < 4) {
      dtcomps[3] = 0;
      dtcomps[4] = 0;
      dtcomps[5] = 0;
    }

    // modify month between 1 based ISO 8601 and zero based Date
    dtcomps[1]--;

    var d = new Date(Date.UTC(dtcomps[0],dtcomps[1],dtcomps[2],dtcomps[3],dtcomps[4],dtcomps[5]));
    var datestring = d.getFullYear() + "-" + (d.getMonth()+1) + "-" + d.getDate() + " " + d.getHours() + ":" + d.getMinutes();
    return datestring;
}

function sanitizeHTML(s) {
    // Convert <span class='highlight'>(.*?)</span>) to [span class='highlight'](.*?)[/span] before sanitize for preservating
    var result;
    var reg = new RegExp("(<span class='highlight'>(.*?)</span>)","gi");   
    while((result = reg.exec(s)) !== null) {
        s = s.replace(result[0],"[span class=highlight]"+result[2]+"[/span]");
    }
    
    // Sanitize html
    s =  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;').replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
            //.replace('script','');

    // Restore hightlight 
    reg = new RegExp("(\\[span class=highlight\\](.*?)\\[/span\\])","gi");       
    while((result = reg.exec(s)) !== null) {
        s = s.replace(result[0],"<span class='highlight'>"+result[2]+"</span>");
    }
    
    return s;
}

function showWaitWhileSearchingMessage() {
    document.getElementById("waitWhileSearchingMessage").style.display="block";
}

function hideWaitWhileSearchingMessage() {
    document.getElementById("waitWhileSearchingMessage").style.display="none";
}

function previous() {
    var limit = parseInt(document.getElementById("texPaginatedLimit").value);
    var offset = parseInt(document.getElementById("texPaginatedOffset").value);
    offset = offset - limit;
    // Prevent problems if the user change limit on fly
    if (offset<0) {
        offset = 0;
    }
    document.getElementById("texPaginatedOffset").value = offset.toString();
    runQueryPaginated();
}

function next() {
    var limit = parseInt(document.getElementById("texPaginatedLimit").value);
    var offset = parseInt(document.getElementById("texPaginatedOffset").value);
    offset = offset + limit;
    document.getElementById("texPaginatedOffset").value = offset.toString();
    runQueryPaginated();
}

function generateHtmlResultsWS1(results, baseUrl, offset, limit, total) {
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
            html += generateRowWS(res, "document", baseUrl, "1");
        }
    } else if (length==1) {
        html += generateRowWS(results, "document", baseUrl, "1");
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
            var uuid = res["document"]["uuid"]; 
            document.getElementById(uuid).addEventListener('click', function() {
                getContent(this.id);
            });
        }
    } else if (length==1) {
        var uuid = results["document"]["uuid"];
        document.getElementById(uuid).addEventListener('click', function() {
            getContent(this.id);
        });
    } 
}

function generateHtmlResultsWS2(results, baseUrl, offset, limit, total) {
    // Check case results <=1 ( in case 0,1 results.length is undefined, and in case 0 result is undefined )
    var length = 0;
    if (typeof results !== 'undefined' && typeof results.length !== 'undefined') {
        length = results.length;
    } else if (typeof results !== 'undefined') {
        length = 1;
    }

    var html = "<div class='callout callout-top clearfix'>";
    
    if (typeof offset !== 'undefined') {
        if (total==0) {
            html += "<h6><i class='fa fa-list-alt fa-lg'></i> Resultados: 0</h6>";
        } else {
            var from = offset + 1;
            var to = offset+limit;
            if ((offset + limit)>=total) {
                to = total;
            }
            html += "<h6><i class='fa fa-list-alt fa-lg'></i> Resultados: " + from + "/" + to + " de " + total + "</h6>";
        }
    } else {
        html += "<h6><i class='fa fa-list-alt fa-lg'></i> Resultados: " + length+ "</h6>";
    }
    
    html += "<table class='tight' cellspacing='0' cellpadding='0'><br>";
    html += "<thead></thead><br>";

    //Body
    html += '<tbody><br>';
    
    if (length>1) {
        for (var k = 0; k < length; k++) {
            var res = results[k];
            html += generateRowWS(res, "node", baseUrl, "2");
        }
    } else if (length==1) {
        html += generateRowWS(results, "node", baseUrl, "2");
    } 
    
    // Closing the results
    html += "</tbody><br>";
    html += "</table>";
    
    // Show buttons
    document.getElementById("previousPaginatedSearch").style.display="none";
    document.getElementById("nextPaginatedSearch").style.display="none";
    if (typeof offset !== 'undefined') {
        if (offset>0) {
            document.getElementById("previousPaginatedSearch").style.display="block";
        }
        if ((offset + limit)<total ) {
            document.getElementById("nextPaginatedSearch").style.display="block";
        }
    }

    html += "</div>"; 
    
    // Setting html results
    document.getElementById("results").innerHTML = html;
    
    // Adding downloading listeners
    if (length>1) {
        for (var k = 0; k < length; k++) {
            var res = results[k];
            var uuid = res["node"]["uuid"];
            document.getElementById(uuid).addEventListener('click', function() {
                getContent(this.id);
            });
        }
    } else if (length==1) {
        var uuid = results["node"]["uuid"];
        document.getElementById(uuid).addEventListener('click', function() {
            getContent(this.id);
        });
    } 
}

function generateRowWS(res, rootNodeName, baseUrl, ws) {
    var newRow = "<tr class='result'>";
    // Setting the file name and the Download link
    newRow += "<docname>" + getFileIconCode(res[rootNodeName]["mimeType"]);
    newRow += " <a href='#' id='"+res[rootNodeName]["uuid"]+"'>" + getName(res[rootNodeName]["path"]) + "</a>";
    if (ws == "2") {
        newRow += " &nbsp;&nbsp;<a target='_blank' href='" + baseUrl + "frontend/index?uuid=" + res[rootNodeName]["uuid"] + "'><i class='fa fa-external-link-square' aria-hidden='true'></i></a>";
    } else {
        newRow += " &nbsp;&nbsp;<a target='_blank' href='" + baseUrl + "frontend/index.jsp?uuid=" + res[rootNodeName]["uuid"] + "'><i class='fa fa-external-link-square' aria-hidden='true'></i></a>";
    }
    newRow += "</docname>";
    newRow += "<date>Date: " + convertISO8601toDate(res[rootNodeName]["actualVersion"]["created"].toString()) + "</date><br><br>";
    
    // Adding the excerpt if it exists
    try {
        if (res["excerpt"].toString() == "undefined") {
            newRow += "<i>[N/F]</i>";
        }
        else {
            // small XSS protection at least for best UI look and feel, sanitize most common ( TODO: use some js lib for it )
            newRow += "<i class='fa fa-quote-left'></i><excerpt>[...] " + sanitizeHTML(res["excerpt"]) + "[...]</excerpt><i class='fa fa-quote-right'></i>";
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
        
        // Reset UI to initial search widgets
        document.getElementById('optMessage').innerHTML = "";
        document.getElementById("results").innerHTML = "";
        
        var content = document.getElementById("texQuery").value;
        if (isEmpty(content)) {
            document.getElementById('optMessage').innerHTML = "<div class='notice warning'><i class='icon-warning-sign icon-large'></i> " + "Content can not be empty value." + "<a href='#close' class='icon-remove'></a></div>";
        } else {
            showWaitWhileSearchingMessage();
            
            var requestUrl = url + "services/rest/search/findByContent?content=" + content;
    
            var xhr = new XMLHttpRequest();
            xhr.open("GET", requestUrl, false);
    
            xhr.setRequestHeader("Authorization", "Basic " + btoa(dictConfig["profiles"][dictConfig["currentProfile"]]["username"] + ":" + dictConfig["profiles"][dictConfig["currentProfile"]]["password"]));
            xhr.setRequestHeader("Accept", "application/json; indent=4");
            try {
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4) {
                        var status = xhr.status;
        
                        if ((status >= 200 && status < 300) || status === 304) {
                            // Unmarshall depends on WS version implementation
                            var jsonDict = JSON.parse(xhr.responseText);
                            if (ws == "2") {
                                generateHtmlResultsWS2(jsonDict["queryResult"], url);
                            } else {
                                var results = jsonDict["queryResult"];
                                // workaround for older ws version what shows root variable
                                if (typeof jsonDict["queryResults"] !== 'undefined') {
                                    results = jsonDict["queryResults"]["queryResult"];
                                }
                                generateHtmlResultsWS1(results, url);
                            }
                        } else {
                            document.getElementById('optMessage').innerHTML = "<div class='notice warning'><i class='icon-warning-sign icon-large'></i> " + "Error cause: " +  xhr.statusText + "<a href='#close' class='icon-remove'></a></div>";
                            console.log("Error: Configuration is NOT properly defined to let the application work or OpenKM not available" );
                        }
                    }
                    hideWaitWhileSearchingMessage();
                };
                
                xhr.send();
            } catch (e) {
                document.getElementById('optMessage').innerHTML = "<div class='notice warning'><i class='icon-warning-sign icon-large'></i> " + e + "<a href='#close' class='icon-remove'></a></div>";
                hideWaitWhileSearchingMessage();
            }
        }
    });
}

function clean() {
    document.getElementById("previousPaginatedSearch").style.display="none";
    document.getElementById("nextPaginatedSearch").style.display="none";
    document.getElementById("texPaginatedOffset").value='0';
    document.getElementById("texPaginatedContent").value='';
    document.getElementById("texPaginatedName").value='';
    document.getElementById("texPaginatedKeywords").value='';
    document.getElementById("texPaginatedAuthor").value='';
    document.getElementById("texPaginatedLimit").value='10';
    document.getElementById("results").innerHTML = '';
}

function runFirstQueryPaginated() {
    // Reset offset values
    document.getElementById("texPaginatedOffset").value='0';
    runQueryPaginated();
}

//Executing the Query towards OpenKM
function runQueryPaginated() {
    // Grabbing the configuration
    chrome.storage.sync.get("config", function (storage) {
        var dictConfig = storage["config"];
        
        var url = dictConfig["profiles"][dictConfig["currentProfile"]]["url"];
        var userName = dictConfig["profiles"][dictConfig["currentProfile"]]["username"];
        var password = dictConfig["profiles"][dictConfig["currentProfile"]]["password"];
        var ws = dictConfig["profiles"][dictConfig["currentProfile"]]["ws"];
        
        // Reset UI to initial search widgets
        document.getElementById('optMessage').innerHTML = "";
        document.getElementById("results").innerHTML = "";
        
        var content = document.getElementById("texPaginatedContent").value;
        var name = document.getElementById("texPaginatedName").value;
        var keywords = document.getElementById("texPaginatedKeywords").value;
        var author = document.getElementById("texPaginatedAuthor").value;
        var limit = parseInt(document.getElementById("texPaginatedLimit").value);
        var offset = parseInt(document.getElementById("texPaginatedOffset").value);
        if (isEmpty(content) && isEmpty(name) && isEmpty(keywords) && isEmpty(author)) {
            document.getElementById('optMessage').innerHTML = "<div class='notice warning'><i class='icon-warning-sign icon-large'></i> " + "All fields can not have an empty value." + "<a href='#close' class='icon-remove'></a></div>";
        } else {

            showWaitWhileSearchingMessage();
            var params = "";
            if (!isEmpty(content)) {
                params = "content="+content;
            }
            if (!isEmpty(name)) {
                if (!isEmpty(params)) {
                    params = params + "&";
                }
                params = params + "name="+name;
            }
            if (!isEmpty(keywords)) {
                var keyword = keywords.split(" ");
                for (var i = 0; i < keyword.length; i++) {
                    if (!isEmpty(params)) {
                        params = params + "&";
                    }
                    params = params + "keyword="+keyword[i];
                }
            }
            if (!isEmpty(author)) {
                if (!isEmpty(params)) {
                    params = params + "&";
                }
                params = params + "author="+author;
            }
            params = params + "&offset="+offset;
            params = params + "&limit="+limit;
            var requestUrl = url + "services/rest/search/findPaginated?" + params;
    
            var xhr = new XMLHttpRequest();
            xhr.open("GET", requestUrl, false);
    
            xhr.setRequestHeader("Authorization", "Basic " + btoa(dictConfig["profiles"][dictConfig["currentProfile"]]["username"] + ":" + dictConfig["profiles"][dictConfig["currentProfile"]]["password"]));
            xhr.setRequestHeader("Accept", "application/json; indent=4");
            try {
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4) {
                        var status = xhr.status;
        
                        if ((status >= 200 && status < 300) || status === 304) {
                            var jsonDict = JSON.parse(xhr.responseText);
                            var total = 0;
                            // Unmarshall depends on WS version implementation
                            if (ws == "2") {
                                total = parseInt(jsonDict.total);
                                generateHtmlResultsWS2(jsonDict["results"], url, offset, limit, total);
                            } else {
                                var results = jsonDict["results"];
                                // workaround for older ws version what shows root variable
                                if (typeof jsonDict["resultSet"] !== 'undefined') {
                                    results = jsonDict["resultSet"]["results"];
                                    total = jsonDict["resultSet"].total;
                                } else {
                                    total = parseInt(jsonDict.total);
                                }
                                generateHtmlResultsWS1(results, url, offset, limit, total);
                            }
                        } else {
                            document.getElementById('optMessage').innerHTML = "<div class='notice warning'><i class='icon-warning-sign icon-large'></i> " + "Error cause: " +  xhr.statusText + "<a href='#close' class='icon-remove'></a></div>";
                            console.log("Error: Configuration is NOT properly defined to let the application work or OpenKM not available" );
                        }
                    }
                    hideWaitWhileSearchingMessage();
                };
                
                xhr.send();
            } catch (e) {
                document.getElementById('optMessage').innerHTML = "<div class='notice warning'><i class='icon-warning-sign icon-large'></i> " + e + "<a href='#close' class='icon-remove'></a></div>";
                hideWaitWhileSearchingMessage();
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    // Adding the main listener
    document.getElementById('butSearch').addEventListener('click', runQuery);
});

document.addEventListener('DOMContentLoaded', function () {
    // Adding the main listener
    document.getElementById('butPaginatedClean').addEventListener('click', clean);
});

document.addEventListener('DOMContentLoaded', function () {
    // Adding the main listener
    document.getElementById('butPaginatedSearch').addEventListener('click', runFirstQueryPaginated);
});

document.addEventListener('DOMContentLoaded', function () {
    // Adding the main listener
    document.getElementById('previousPaginatedSearch').addEventListener('click', previous);
});

document.addEventListener('DOMContentLoaded', function () {
    // Adding the main listener
    document.getElementById('nextPaginatedSearch').addEventListener('click', next);
});

window.onerror = function myErrorHandler(errorMsg, url, lineNumber) {
    document.getElementById('optMessage').innerHTML = "<div class='notice warning'><i class='icon-warning-sign icon-large'></i> " + "Unexpected error in "+ url + " at line " + lineNumber+ " : " +  errorMsg + "<a href='#close' class='icon-remove'></a></div>";
    return false;
}