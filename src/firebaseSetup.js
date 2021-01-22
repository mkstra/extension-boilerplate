const firebaseConfig = {
  apiKey: "AIzaSyCrISdZPlEkPhQ6aeaQRdx-a67qZ0DMXpE",
  authDomain: "prose-ext.firebaseapp.com",
  projectId: "prose-ext",
  storageBucket: "prose-ext.appspot.com",
  messagingSenderId: "348264776983",
  appId: "1:348264776983:web:e32e7869a82d51a2d42352"
};;
// Initialize Firebas

const chromestoreID = "bedmbgkddhhnajfafgpbpbcjmdnnngll"
//...bf is localhost
const localDevID = "ldhfcelpkklpbfafamncdmgenaphmibf"
const EXTENSION_ID = localDevID

//FIXME: waiting for firebase to load into it....

const app = firebase.initializeApp(firebaseConfig);
const {firebase_} = app
const auth = firebase_.auth()
const db = firebase_.firestore()

const uiConfig = ({
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
    // Return a promise when error handling is completed and FirebaseUI
    // will reset, clearing any UI. This commonly occurs for error code
    // 'firebaseui/anonymous-upgrade-merge-conflict' when merge conflict
    // occurs. Check below for more details on this.
    console.error("---sign in FAILURE")
    return false
  },
  uiShown: function() {
    // The widget is rendered.
    // Hide the loader.
    document.getElementById('loader').style.display = 'none';
  }},
  signInOptions: [{
    provider: firebase_["auth"].EmailAuthProvider.PROVIDER_ID,
  
  }],
  signInSuccessUrl: "/",
})


export {firebase_, app, auth, uiConfig, db}
