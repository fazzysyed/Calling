import firebase from "firebase";

var firebaseConfig = {
  apiKey: "AIzaSyBaoAFQYfOrk-tJenoNyLeWDim7EJH61Vw",
  authDomain: "travelling-app-b0719.firebaseapp.com",
  databaseURL: "https://travelling-app-b0719-default-rtdb.firebaseio.com",
  projectId: "travelling-app-b0719",
  storageBucket: "travelling-app-b0719.appspot.com",
  messagingSenderId: "1098185094546",
  appId: "1:1098185094546:web:bebf65a404a339e43abd4b",
  measurementId: "G-PLR5F8YP1S",
};

firebase.initializeApp(firebaseConfig);

export const db = firebase;

var firepadRef = firebase.database().ref();

function generateRandomName() {
  // Generate a random number between 10000 and 99999
  const randomNumber = Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000;

  // Concatenate "EHR_" with the random number
  return `EHR_${randomNumber}`;
}

const urlparams = new URLSearchParams(window.location.search);
const roomId = urlparams.get("id");
const userId = urlparams.get("userId");

export const userName = userId ? userId : generateRandomName();
if (roomId) {
  firepadRef = firepadRef.child(roomId);
} else {
  firepadRef = firepadRef.push();
  window.history.replaceState(null, "Meet", "?id=" + firepadRef.key);
}

export default firepadRef;
