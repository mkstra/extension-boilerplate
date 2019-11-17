<script>
import {uiConfig} from "./firebaseSetup.js"
//TODO: very hacky because of chrome hostility... 

const isExistingUser = (currentUser) => (currentUser.metadata.lastSignInTime - currentUser.metadata.creationTime) > 1000


//https://github.com/firebase/firebaseui-web/issues/216
const ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(firebase.auth());

const loginUI = (isPendingRedirect) => {
  if (isPendingRedirect) {
    ui.start('#firebaseui-auth-container', uiConfig)
    }
}

//loginUI(ui.isPendingRedirect())

</script>
    <div id="firebaseui-auth-container"></div>

 <div id="loader"> About to Login...</div>
   <button on:click={loginUI}>
		Login 
	</button>