
<script>
    import Profile from './Profile.svelte';
    
    let uid
    //TODO: listen to message {User}

    chrome.runtime.onMessage
    .addListener(function(request, sender, sendResponse) {
            console.log(
                sender.tab 
                ? "from a content script:" + sender.tab.url 
                : "from the extension")

    if (request.uid) {
        uid = "fat mongo"
        sendResponse({res: "got it"});
        
    }
    else console.log("AAAH")


  });
</script>
<Profile {uid} />