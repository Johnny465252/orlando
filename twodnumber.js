// twodnumber.js

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
    const db = firebase.database();

    const loadingMessage = document.getElementById('loading-message');
    const contentDiv = document.getElementById('content');
    const userAmountDisplay = document.getElementById('user-amount-display');
    const betAmountInput = document.getElementById('bet-amount-input');
    const betButton = document.getElementById('bet-button');
    const rButton = document.getElementById('r-button');
    const numberButtonsGrid = document.querySelector('.number-button-grid');
    
    // ထိုးမည့် Loading Overlay အသစ်ကို ရယူခြင်း
    const betLoadingOverlay = document.getElementById('bet-loading-overlay'); 

    let currentUserAmount = 0;
    let selectedNumbers = []; // ရွေးထားတဲ့ နံပါတ်တွေ အားလုံးကို သိမ်းထားဖို့ Array

    auth.onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = 'signup.html';
        } else {
            console.log("အသုံးပြုသူ အကောင့်ဝင်ထားပါသည်။ ID: ", user.uid);
            
            const userRef = db.ref('users/' + user.uid);
            userRef.on('value', (snapshot) => {
                const userData = snapshot.val();
                if (userData && userData.amount !== undefined) {
                    currentUserAmount = userData.amount;
                    userAmountDisplay.textContent = currentUserAmount;
                } else {
                    currentUserAmount = 0;
                    userAmountDisplay.textContent = '0';
                }

                loadingMessage.style.display = 'none';
                contentDiv.style.display = 'block';
            });
        }
    });

    // ထိုးမည် ခလုတ်အတွက် လုပ်ဆောင်ချက် (Data ကို နောက်ဖိုင်ဆီ ပို့ခြင်း)
    betButton.addEventListener('click', () => {
        const betAmount = parseInt(betAmountInput.value);

        if (selectedNumbers.length === 0) {
            alert("နံပါတ်တစ်ခုကို အနည်းဆုံး ရွေးချယ်ပေးပါ။");
            return;
        }

        if (isNaN(betAmount) || betAmount < 100 || betAmount > 50000) {
            alert("ပိုက်ဆံပမာဏကို မှန်ကန်စွာထည့်ပါ။ (100 - 50000 ကျပ်)");
            return;
        }
        
        // validation အားလုံး အောင်မြင်ပြီးနောက် loading ကို ပြသခြင်း
        betLoadingOverlay.style.display = 'flex';
        
        const bettingData = {
            numbers: selectedNumbers,
            amount: betAmount
        };
        
        localStorage.setItem('bettingData', JSON.stringify(bettingData));
        
        window.location.href = 'betconfirm.html';
    });
    
    // နံပါတ်ခလုတ်တွေကို နှိပ်တဲ့အခါ လုပ်ဆောင်ချက် (Multiple Selections)
    numberButtonsGrid.addEventListener('click', async (e) => {
        if (e.target.classList.contains('number-button')) {
            const number = e.target.dataset.number;
            const index = selectedNumbers.indexOf(number);
            
            if (index > -1) {
                selectedNumbers.splice(index, 1);
                e.target.classList.remove('selected');
            } else {
                selectedNumbers.push(number);
                e.target.classList.add('selected');
            }
            
            console.log("ရွေးချယ်ထားသော နံပါတ်များ:", selectedNumbers);
        }
    });

    // R ခလုတ်အတွက် လုပ်ဆောင်ချက် (ပြောင်းပြန်နံပါတ်အားလုံးကို ရွေးချယ်ခြင်း)
    rButton.addEventListener('click', () => {
        if (selectedNumbers.length === 0) {
            alert("R ခလုတ်ကို အသုံးပြုရန် နံပါတ်တစ်ခုကို အရင်ရွေးချယ်ပေးပါ။");
            return;
        }
        
        // ရွေးထားတဲ့ နံပါတ်တွေကို copy ကူးယူပါ
        const numbersToReverse = [...selectedNumbers];
        
        // ကူးယူထားသော array ကို loop ပတ်ပါ
        for (const number of numbersToReverse) {
            const reversedNumber = number.split('').reverse().join('');
            
            // ပြောင်းပြန်နံပါတ်က ရွေးထားပြီးသား မဟုတ်မှသာ ထပ်ရွေးပါ
            if (!selectedNumbers.includes(reversedNumber)) {
                const reversedButton = document.querySelector(`.number-button[data-number="${reversedNumber}"]`);
                
                if (reversedButton) {
                    // အဲဒီခလုတ်ကို နှိပ်တဲ့ လုပ်ဆောင်ချက်ကို အလိုအလျောက် ခေါ်ပါ
                    reversedButton.click();
                }
            }
        }
    });
});