<script>
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

</script>

<div id="prosebar">Shift + RFFF taaaaaaawwwo mark</div>