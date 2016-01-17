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

function getHtmlFromMdFile(mdFile, tab) {
    // Reading the markdown text
    try {
        var markdownText = readTextFile(mdFile);
    }
    catch(e) {
        var markdownText = "Markdown is **sweet**... But cannot be loaded from: [" + mdFile +"] " + mdFile + ".";
    }
    // Converting it to HTML
    //alert(mmd(markdownText));
    htmlText = mmd(markdownText);
    //alert(htmlText);
    
    // Inserting it into the appropriate tab
    var element = document.getElementById(tab);
    element.innerHTML = htmlText;
}

getHtmlFromMdFile(chrome.i18n.getMessage("fileFAQ"), "tabFAQ");
getHtmlFromMdFile(chrome.i18n.getMessage("fileCoding"), "tabCoding");
getHtmlFromMdFile(chrome.i18n.getMessage("fileTranslating"), "tabTranslating");
getHtmlFromMdFile(chrome.i18n.getMessage("fileUsing"), "tabUsing");

