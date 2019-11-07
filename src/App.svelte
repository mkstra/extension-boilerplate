<script>
//export const firebase
	console.log('haaaa', )
	export let name;
	const ui = new firebaseui.auth.AuthUI(firebase.auth());
	console.log("hi", firebaseui.auth.AuthUI)
	const uiConfig = {
  signInOptions: [
    {
      provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
      // Use email link authentication and do not require password.
      // Note this setting affects new users only.
      // For pre-existing users, they will still be prompted to provide their
	  // passwords on sign-in.
	}
	],
	signInSuccessWithAuthResult: function(authResult, redirectUrl) {
  // If a user signed in with email link, ?showPromo=1234 can be obtained from
  // window.location.href.
  // ...
  return false;
}
	}

	if (ui.isPendingRedirect()) {
  ui.start('#firebaseui-auth-container', uiConfig);
}

</script>


<style>
	h1 {
		color: purple;
	}
</style>


   <!-- The surrounding HTML is left untouched by FirebaseUI.
         Your app may use that space for branding, controls and other customizations.-->
    <h1>Welcome to My Awesome App</h1>
    <div id="firebaseui-auth-container"></div>
<h1>Hello {name}!</h1>