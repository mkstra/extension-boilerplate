/*global chrome*/

'use strict';

// universal Web Extension
window.browser = window.chrome ||  window.msBrowser || window.browser ;

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log("request here content")
      console.log(sender ?
                  "from a background script:" + sender:
                  "from the extension tt");

        sendResponse({content: "goodbye"});
    }
  );


// console.log(M, 'materialize')

window.onload = function () {
    const newDiv = document.createElement("div");

    newDiv.setAttribute("id", "prosebar");
    newDiv.innerHTML = "Shift + R to mark"
    document.body.appendChild(newDiv);

    /*
    https://developer.chrome.com/extensions/runtime#event-onMessage
    Fired when a message is sent from either an extension process 
    (by runtime.sendMessage) or a content script (by tabs.sendMessage).
    // */
    // chrome.tabs.sendMessage(EXTENSION_ID,{user: {uid:"hasasdasd uid"}}, function(response) {
    //     console.log("popup respone", response.res);
    //     //https://stackoverflow.com/questions/20077487/chrome-extension-message-passing-response-not-sent
    //     return true
    // })
    
    }