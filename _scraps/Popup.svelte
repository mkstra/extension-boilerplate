<script>
    import Profile from './Profile.svelte';
    let uid
    //TODO: listen to message {User}

//     chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse) {
// 	console.log(
// 		sender.tab 
// 		? "from a content script to background" + sender.tab.url 
// 		: "from the extension")

// if (request.user) {
// console.log("user in popup", request.user)
// sendResponse({res: "background here got iut"});

// }
// return true

// })

</script>
<h1>Popup Land</h1>
<Profile {uid} />