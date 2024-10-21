// Firebase configuration
const firebaseConfig = {
    apiKey: "TON_API_KEY",
    authDomain: "TON_AUTH_DOMAIN",
    databaseURL: "TON_DATABASE_URL",
    projectId: "TON_PROJECT_ID",
    storageBucket: "TON_STORAGE_BUCKET",
    messagingSenderId: "TON_MESSAGING_SENDER_ID",
    appId: "TON_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// References
const auth = firebase.auth();
const database = firebase.database();

// DOM Elements
const loginContainer = document.getElementById('login-container');
const userInfo = document.getElementById('user-info');
const userPic = document.getElementById('user-pic');
const userName = document.getElementById('user-name');
const signOutButton = document.getElementById('sign-out');
const googleLoginButton = document.getElementById('google-login');
const chatContainer = document.getElementById('chat-container');
const messagesDiv = document.getElementById('messages');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const imageInput = document.getElementById('image-input');

// Google Login
googleLoginButton.addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
});

// Sign Out
signOutButton.addEventListener('click', () => {
    auth.signOut();
});

// Auth State Change
auth.onAuthStateChanged(user => {
    if (user) {
        loginContainer.style.display = 'none';
        chatContainer.style.display = 'block';
        userInfo.style.display = 'block';
        userPic.src = user.photoURL;
        userName.textContent = user.displayName;

        loadMessages();
    } else {
        loginContainer.style.display = 'block';
        chatContainer.style.display = 'none';
        userInfo.style.display = 'none';
    }
});

// Load and display messages
function loadMessages() {
    database.ref('messages').on('child_added', (snapshot) => {
        const messageData = snapshot.val();
        displayMessage(messageData);
    });
}

// Send a new message
messageForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const message = messageInput.value;
    const file = imageInput.files[0];

    if (message || file) {
        const newMessageRef = database.ref('messages').push();
        const messageData = {
            text: message,
            author: auth.currentUser.displayName,
            timestamp: Date.now(),
        };

        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                messageData.image = e.target.result;
                newMessageRef.set(messageData);
            };
            reader.readAsDataURL(file);
        } else {
            newMessageRef.set(messageData);
        }

        messageInput.value = '';
        imageInput.value = '';
    }
});

// Display message
function displayMessage(messageData) {
    const div = document.createElement('div');
    div.textContent = `${messageData.author}: ${messageData.text || ''}`;
    if (messageData.image) {
        const img = document.createElement('img');
        img.src = messageData.image;
        img.style.width = '100px';
        div.appendChild(img);
    }
    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}
