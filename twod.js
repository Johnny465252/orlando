// twod.js

document.addEventListener('DOMContentLoaded', () => {

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
    const db = firebase.database(); // Firebase Database ကို သုံးဖို့ ထပ်ထည့်ပါ
    
    const loadingMessage = document.getElementById('loading-message');
    const contentDiv = document.getElementById('content');
    const gameButton = document.querySelector('.game-button-link'); // game-button-link ကို ရွေးပါ

    auth.onAuthStateChanged(async (user) => {
        if (!user) {
            window.location.href = 'signup.html';
        } else {
            console.log("အသုံးပြုသူ အကောင့်ဝင်ထားပါသည်။ ID: ", user.uid);
            
            async function fetchAPIdata() {
                const url = 'https://api.thaistock2d.com/live';
                const mainTextElement = document.getElementById('main-text');
                const serverTimeElement = document.getElementById('server-time-text');

                try {
                    const response = await fetch(url);
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    
                    const data = await response.json();
                    
                    mainTextElement.textContent = data.live.twod;
                    serverTimeElement.textContent = data.server_time;

                    loadingMessage.style.display = 'none';
                    contentDiv.style.display = 'block';

                } catch (error) {
                    console.error("API မှ data ရယူခြင်း မအောင်မြင်ပါ:", error);
                    mainTextElement.textContent = 'API Error'; 
                    serverTimeElement.textContent = 'API Error';
                    loadingMessage.style.display = 'none';
                    contentDiv.style.display = 'block';
                }
            }

            setInterval(fetchAPIdata, 1000);
        }
    });

    // ခလုတ်ကို နှိပ်လိုက်တဲ့အခါ လုပ်ဆောင်ချက်
    gameButton.addEventListener('click', async (e) => {
        e.preventDefault(); // စာမျက်နှာကို ချက်ချင်းမကူးစေရန် တားဆီးပါ
        
        const currentUser = auth.currentUser;
        if (!currentUser) {
            alert("အကောင့်ဝင်ပြီးမှသာ လုပ်ဆောင်နိုင်ပါသည်။");
            return;
        }
        
        try {
            // Firebase Database ထဲက Start/start ကို data တစ်ခါပဲ ဖတ်ပါ
            const snapshot = await db.ref('Start/start').once('value');
            const status = snapshot.val(); // 'start' သို့မဟုတ် 'stop' ဖြစ်မည်
            
            if (status === 'start') {
                // value က 'start' ဖြစ်နေပါက twodnumber.html ကို ရောက်ရှိပါစေ
                console.log("2D ထိုးလို့ရနေပါပြီ။ စာမျက်နှာ ကူးပြောင်းနေပါသည်...");
                window.location.href = 'twodnumber.html';
            } else {
                // 'start' မဟုတ်ရင် (ဥပမာ- 'stop' ဖြစ်နေပါက) သတိပေးစာပြပါ
                alert("2D ထိုး၍မရသေးပါ");
            }
        } catch (error) {
            console.error("Firebase မှ data ဖတ်ခြင်း မအောင်မြင်ပါ:", error);
            alert("လုပ်ဆောင်မှု မအောင်မြင်ပါ။ ကျေးဇူးပြု၍ ထပ်မံစမ်းသပ်ပါ။");
        }
    });
});
