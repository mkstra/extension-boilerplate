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


export {firebase_, app}
