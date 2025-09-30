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

    // ၅ စက္ကန့်တိုင်း Slide ပြောင်း
    setInterval(nextSlide, 5000); 

    // --- Firebase ချိတ်ဆက်မှုနှင့် အကောင့်စနစ် ---
    
    // Firebase Config ကုဒ်
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
    const loggedInProfile = document.getElementById('logged-in-profile'); 
    const accountNameSpanInCard = document.getElementById('account-name-in-card'); 
    const amountSpan = document.getElementById('amount'); 
    const loadingMessage = document.getElementById('loading-message');
    const contentDiv = document.getElementById('content');


    // အသုံးပြုသူရဲ့ login အခြေအနေကို စစ်ဆေးတဲ့ function
    function checkLoginStatus(user) {
        if (user) {
            // အကောင့်ဝင်ပြီးသားဆိုရင်
            loggedInProfile.style.display = 'flex'; 
            
            // Database ကနေ user's data ကို တစ်ခါပဲ ခေါ်ယူပါ
            db.ref('users/' + user.uid).once('value', (snapshot) => {
                const userData = snapshot.val();
                if (userData) {
                    accountNameSpanInCard.textContent = userData.name || 'အမည်မရှိပါ'; 
                    amountSpan.textContent = userData.amount || '0'; 
                } else {
                    accountNameSpanInCard.textContent = 'အမည်မရှိပါ';
                }

                // Data ရတာနဲ့ loading message ကို ဖျောက်ပြီး content ကို ပြပါ
                loadingMessage.style.display = 'none';
                contentDiv.style.display = 'block';
            });

        } else {
            // အကောင့်မဝင်ရသေးရင်
            loggedInProfile.style.display = 'flex'; 
            accountNameSpanInCard.textContent = 'အကောင့်ဝင်ပါ'; // Default စာသား
            amountSpan.textContent = '0'; // Default အမောက်
            
            // Loading message ကို ဖျောက်ပြီး content ကို ပြပါ
            loadingMessage.style.display = 'none';
            contentDiv.style.display = 'block';
        }
    }

    // အသုံးပြုသူရဲ့ login အခြေအနေ အချိန်နှင့်တပြေးညီ ပြောင်းလဲတာကို နားထောင်ခြင်း
    auth.onAuthStateChanged((user) => {
      checkLoginStatus(user);
    });
    
    // --- လော့အင် လိုအပ်သည့် နေရာများအတွက် တစ်ပေါင်းတည်း စစ်ဆေးမှု ---
    
    // 1. ဂိမ်းခလုတ်များ (2D, 3D) 
    document.querySelectorAll('.game-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); 
            const targetUrl = link.getAttribute('href');

            if (!auth.currentUser) {
                alert("ဂိမ်းမကစားမီ အကောင့်ဝင်ရန် လိုအပ်ပါသည်။");
                window.location.href = 'login.html'; 
            } else {
                window.location.href = targetUrl;
            }
        });
    });

    // 2. Profile Card / "အကောင့်ဝင်ပါ" စာသား
    loggedInProfile.addEventListener('click', () => {
        if (!auth.currentUser) {
            alert("အကောင့်ဝင်ရန် စာမျက်နှာသို့ သွားပါမည်။");
            window.location.href = 'login.html'; 
        } else {
            // အကောင့်ဝင်ပြီးပါက "ကျွန်ုပ်" စာမျက်နှာသို့ ပို့ဆောင်ရန်
            window.location.href = 'account.html'; 
        }
    });

    // 3. Plus (+) ခလုတ် (ငွေဖြည့်သွင်းရန်)
    document.querySelectorAll('.add-button').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation(); 
            if (!auth.currentUser) {
                alert("ငွေဖြည့်သွင်းရန် အကောင့်ဝင်ရန် လိုအပ်ပါသည်။");
                window.location.href = 'login.html';
            } else {
                window.location.href = 'payment.html'; 
            }
        });
    });

    // 4. အောက်ခြေ Navigation Bar မှ Home (မူလ) မှလွဲ၍ ကျန်ရှိသော လင့်ခ်များ
    document.querySelectorAll('.bottom-nav a:not(.active)').forEach(navLink => {
        navLink.addEventListener('click', (e) => {
            const targetUrl = navLink.getAttribute('href');
            // 'payment.html', 'rules.html', 'account.html'
            
            if (targetUrl !== 'home.html' && !auth.currentUser) {
                e.preventDefault(); // Default link သို့ မသွားစေရန်
                alert("ဤကဏ္ဍသို့ ဝင်ရောက်ရန် အကောင့်ဝင်ရန် လိုအပ်ပါသည်။");
                window.location.href = 'login.html';
            }
            // အကောင့်ဝင်ထားပါက မည်သည့်အရာမျှ မတားဆီးဘဲ ဆက်သွားပါမည်။
        });
    });

});
