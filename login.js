// signup.js

document.addEventListener('DOMContentLoaded', () => {
    
    // သင်ပေးထားတဲ့ Firebase Config ကုဒ်ကို ထည့်သွင်းထားပါတယ်။
    const firebaseConfig = {
      apiKey: "AIzaSyCUk-1FHFjhIVDD4foYuKHM7PyT_A1A1vk",
      authDomain: "twod-aa6c1.firebaseapp.com",
      projectId: "twod-aa6c1",
      storageBucket: "twod-aa6c1.appspot.com",
      messagingSenderId: "674076613631",
      appId: "1:674076613631:android:b21b4027ebe6f6f169e5ca"
    };

    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.database();

    // HTML elements များကို ခေါ်ယူခြင်း
    const signupForm = document.getElementById('signup-form');
    const nameInput = document.getElementById('name'); 
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const messageDiv = document.getElementById('message');

    // Form ကို Submit လုပ်တဲ့အခါ
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault(); 

        const name = nameInput.value;
        const email = emailInput.value;
        const password = passwordInput.value;
        messageDiv.textContent = ''; 

        try {
            // Firebase Authentication နဲ့ အကောင့်အသစ်ဖန်တီးပါ
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Database ထဲမှာ user's data ကို သိမ်းပါ
            await db.ref('users/' + user.uid).set({
                name: name,
                email: email,
                amount: 0 
            });

            console.log("အကောင့်ဖွင့်ခြင်း အောင်မြင်သည်:", user.uid);
            alert('အကောင့်ဖွင့်ခြင်းအောင်မြင်ပါပြီ! Home Page သို့ ပြန်လည်ရောက်ရှိပါမည်။');
            
            window.location.href = 'home.html';

        } catch (error) {
            console.error("အကောင့်ဖွင့်ခြင်း မအောင်မြင်ပါ:", error.message);
            messageDiv.textContent = `Error: ${error.message}`;
        }
    });

});
