// home.js

document.addEventListener('DOMContentLoaded', () => {

    // --- Slider ကုဒ် ---
    const slider = document.querySelector('.slider');
    const slides = document.querySelectorAll('.slide');
    const totalSlides = slides.length;
    let currentIndex = 0;

    function nextSlide() {
        currentIndex = (currentIndex + 1) % totalSlides;
        const offset = -currentIndex * 100;
        slider.style.transform = `translateX(${offset}%)`;
    }

    setInterval(nextSlide, 5000); 

    // --- Firebase ချိတ်ဆက်မှုနှင့် အကောင့်စနစ် ---
    
    // သင်ပေးထားတဲ့ Firebase Config ကုဒ်ကို ထည့်သွင်းထားပါတယ်။
    const firebaseConfig = {
      apiKey: "AIzaSyCUk-1FHFjhIVDD4foYuKHM7PyT_A1A1vk",
      authDomain: "twod-aa6c1.firebaseapp.com",
      projectId: "twod-aa6c1",
      storageBucket: "twod-aa6c1.appspot.com",
      messagingSenderId: "674076613631",
      appId: "1:674076613631:android:b21b4027ebe6f6f169e5ca"
    };

    // Firebase ကိုစတင်အသုံးပြုခြင်း
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.database(); 

    // HTML elements များကို ခေါ်ယူခြင်း
    const loggedOutSection = document.getElementById('logged-out-section');
    const userDetailsDiv = document.getElementById('user-details');
    const accountNameSpan = document.getElementById('account-name');
    const accountEmailSpan = document.getElementById('account-email');
    const amountSpan = document.getElementById('amount'); 
    const loginButton = document.getElementById('login-button');
    const signupLink = document.getElementById('signup-link');

    // အသုံးပြုသူရဲ့ login အခြေအနေကို စစ်ဆေးတဲ့ function
    function checkLoginStatus(user) {
        if (user) {
            // အကောင့်ဝင်ပြီးသားဆိုရင်
            loggedOutSection.style.display = 'none';
            userDetailsDiv.style.display = 'block';
            
            // Database ကနေ user's data ကို တစ်ခါပဲ ခေါ်ယူပါ
            db.ref('users/' + user.uid).once('value', (snapshot) => {
                const userData = snapshot.val();
                if (userData) {
                    accountNameSpan.textContent = userData.name;
                    accountEmailSpan.textContent = userData.email;
                    amountSpan.textContent = userData.amount;
                }
            });

        } else {
            // အကောင့်မဝင်ရသေးရင်
            loggedOutSection.style.display = 'flex';
            userDetailsDiv.style.display = 'none';
        }
    }

    // အသုံးပြုသူရဲ့ login အခြေအနေ အချိန်နှင့်တပြေးညီ ပြောင်းလဲတာကို နားထောင်ခြင်း
    auth.onAuthStateChanged((user) => {
      checkLoginStatus(user);
    });

    // "အကောင့်ဝင်ရန်" ခလုတ်ကို နှိပ်တဲ့အခါ
    loginButton.addEventListener('click', () => {
      alert("အကောင့်ဝင်ရန် စနစ်ကို ရေးသားရပါဦးမည်။");
    });
});
// home.js (onAuthStateChanged function)
auth.onAuthStateChanged((user) => {
    const loadingMessage = document.getElementById('loading-message');
    const contentDiv = document.getElementById('content');
    
    if (user) {
        // အကောင့်ဝင်ပြီးသားဆိုရင်
        db.ref('users/' + user.uid).once('value', (snapshot) => {
            const userData = snapshot.val();
            if (userData) {
                // ... data ပြသတဲ့ ကုဒ်တွေ ...
            }
            // Data ရတာနဲ့ loading message ကို ဖျောက်ပြီး content ကို ပြပါ
            loadingMessage.style.display = 'none';
            contentDiv.style.display = 'block';
        });

    } else {
        // အကောင့်မဝင်ရသေးရင်
        loadingMessage.style.display = 'none';
        contentDiv.style.display = 'block';
    }
});
