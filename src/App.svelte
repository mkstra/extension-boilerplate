<script>
//export const firebase
import { authState } from 'rxfire/auth';
import Profile from './Profile.svelte';
    
    let user;
    const unsubscribe = authState(auth).subscribe(u => user = u);

  
  console.log('haaaa', )
	export let name;
	const ui = new firebaseui.auth.AuthUI(auth);
	console.log("hi", firebaseui.auth.AuthUI)
	const uiConfig = {

          credentialHelper: firebaseui.auth.CredentialHelper.GOOGLE_YOLO,
    callbacks: {
          signInSuccessWithAuthResult: function(authResult, redirectUrl) {
            // Do something with the returned AuthResult.
            // Return type determines whether we continue the redirect automatically
            // or whether we leave that to developer to handle.
            console.log("authResult", authResult)
            return false;
          },
          signInFailure: function(error) {
            // Some unrecoverable error occurred during sign-in.
            // Return a promise when error handling is completed and FirebaseUI
            // will reset, clearing any UI. This commonly occurs for error code
            // 'firebaseui/anonymous-upgrade-merge-conflict' when merge conflict
            // occurs. Check below for more details on this.
            console.log("sign in FAILURE")
            return false
          },
          uiShown: function() {
            // The widget is rendered.
            // Hide the loader.
            document.getElementById('loader').style.display = 'none';
          }},
  signInOptions: [
    {
      provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
      // Use email link authentication and do not require password.
      // Note this setting affects new users only.
      // For pre-existing users, they will still be prompted to provide their
	  // passwords on sign-in.
	}
  ],
  signInSuccessUrl: "/",

}

  const loginUI = () => {

  
  if (ui.isPendingRedirect()) {
  ui.start('#firebaseui-auth-container', uiConfig);
}
}
loginUI()

</script>


<style>
	h1 {
		color: purple;
	}
</style>
{#if user}
  <Profile uid={user.uid} />
    <button on:click={() => auth.signOut() }>Logout</button>
    <hr>
{:else}
   <button on:click={() => ui.start('#firebaseui-auth-container', uiConfig)}>
		Signin 
	</button>
{/if}
   <!-- The surrounding HTML is left untouched by FirebaseUI.
         Your app may use that space for branding, controls and other customizations.-->
    <h1>Welcome to My Awesome App</h1>
    <div id="firebaseui-auth-container"></div>
     <div id="loader">Loading...</div>
<h1>Hello {name}!</h1>