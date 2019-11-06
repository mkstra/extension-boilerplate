'use strict';

// universal Web Extension
window.browser = window.chrome ||  window.msBrowser || window.browser ;

window.onload = function () {
    const newDiv = document.createElement("div");

    newDiv.setAttribute("id", "markusExtend");
    document.body.appendChild(newDiv);
}

console.log("hello content")
