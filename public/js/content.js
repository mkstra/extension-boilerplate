/*global chrome*/

'use strict';

// chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
//     console.log(response.farewell);
//   });

// universal Web Extension
window.browser = window.chrome ||  window.msBrowser || window.browser ;


const bottomBarStyle = `
    margin-top: 0;
    position: fixed;
    z-index: 1000000;
    /* left: 50%; */
    bottom: 1rem;
    background: white;
    border: 1px black solid;
    padding: 0.3rem;
    border-radius: 5px;"`


window.onload = function () {
    const newDiv = document.createElement("div");

    newDiv.setAttribute("id", "markusExtend");
    newDiv.innerHTML = "yolo content"
    newDiv.style = bottomBarStyle;
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
    // });

    
     console.log("hello content end")

     

    }