const firebaseConfig = {
    apiKey: "AIzaSyDC1R-8N_K9ExqoUqlY_hv3Hsq-95fL7XU",
    authDomain: "together-7d90d.firebaseapp.com",
    databaseURL: "https://together-7d90d.firebaseio.com",
    projectId: "together-7d90d",
    storageBucket: "together-7d90d.appspot.com",
    messagingSenderId: "1051151523557",
    appId: "1:1051151523557:web:43e5075d31f4722731be0c",
    measurementId: "G-279CSGB8R1"
  };
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
