// threed_confirm.js

document.addEventListener('DOMContentLoaded', () => {

    // ********** ၁။ Firebase Initialization **********
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

    // ********** ၂။ HTML Elements များ **********
    const loadingMessage = document.getElementById('loading-message');
    const contentDiv = document.getElementById('content');
    const selectedNumbersDisplay = document.getElementById('selected-numbers-display');
    const totalCountDisplay = document.getElementById('total-count');
    const betAmountDisplay = document.getElementById('bet-amount');
    const totalBetAmountDisplay = document.getElementById('total-bet-amount');
    const confirmButton = document.getElementById('confirm-button');
    const cancelButton = document.getElementById('cancel-button');

    let bettingData = null;
    let currentUserAmount = 0;

    // ********** ၃။ Data ကို Session Storage မှ ပြန်ယူခြင်း **********
    // Note: three.js မှာ localStorage ထဲကို မပို့ရသေးလို့ ဒီနေရာမှာ ပြဿနာရှိနိုင်ပါတယ်။
    // သို့သော် Logic ကို ဆက်လက်တည်ဆောက်ပါမည်။
    const storedData = localStorage.getItem('bettingData');
    if (storedData) {
        bettingData = JSON.parse(storedData);
    }

    if (!bettingData || bettingData.type !== '3D' || !bettingData.numbers || bettingData.numbers.length === 0) {
        alert("ထိုးမည့် အချက်အလက်များ မတွေ့ရှိပါ။ 3D ထိုးမည့် စာမျက်နှာသို့ ပြန်သွားပါ။");
        window.location.href = 'three.html';
        return;
    }

    // ********** ၄။ မျက်နှာပြင်ပေါ်တွင် Data ပြသခြင်း **********
    const renderBetData = () => {
        // နံပါတ်များကို Grid တွင် ပြသခြင်း
        selectedNumbersDisplay.innerHTML = '';
        bettingData.numbers.forEach(number => {
            const button = document.createElement('button');
            button.className = 'number-button selected'; // selected style ကို ပြန်ယူသုံး
            button.textContent = number;
            selectedNumbersDisplay.appendChild(button);
        });

        // ဇယားတွင် Data ပြသခြင်း
        const totalCost = bettingData.amount * bettingData.numbers.length;
        totalCountDisplay.textContent = bettingData.numbers.length;
        betAmountDisplay.textContent = `${bettingData.amount.toLocaleString()} ကျပ်`;
        totalBetAmountDisplay.textContent = `${totalCost.toLocaleString()} ကျပ်`;
    };

    // ********** ၅။ User Login နှင့် ပိုက်ဆံစစ်ဆေးခြင်း **********
    auth.onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = 'signup.html';
        } else {
            db.ref('users/' + user.uid).once('value', (snapshot) => {
                const userData = snapshot.val();
                if (userData && userData.amount !== undefined) {
                    currentUserAmount = userData.amount;
                }
                
                renderBetData();
                loadingMessage.style.display = 'none';
                contentDiv.style.display = 'block';
            });
        }
    });

    // ********** ၆။ အတည်ပြုမည် ခလုတ် (Final Transaction Logic) **********
    confirmButton.addEventListener('click', async () => {
        const user = auth.currentUser;
        if (!user) return; 

        const totalBetAmount = bettingData.amount * bettingData.numbers.length;

        if (totalBetAmount > currentUserAmount) {
            alert("ထိုးမည့် ပိုက်ဆံပမာဏ လုံလောက်မှုမရှိပါ။");
            return;
        }

        // ပိုက်ဆံကို transaction ဖြင့် လုံခြုံစွာ နှုတ်ယူခြင်း
        const userAmountRef = db.ref('users/' + user.uid + '/amount');
        try {
            const amountUpdateResult = await userAmountRef.transaction((currentAmount) => {
                if (currentAmount === null) return 0;
                const newAmount = currentAmount - totalBetAmount;
                if (newAmount < 0) return; // မလုံလောက်ရင် Rollback
                return newAmount;
            });
            
            if (amountUpdateResult.committed) {
                // Bet Data များကို database ထဲသို့ ပို့ခြင်း
                const betPromises = [];
                const newBetData = {
                    bet_numbers: bettingData.numbers,
                    bet_amount: bettingData.amount,
                    timestamp: firebase.database.ServerValue.TIMESTAMP,
                    userId: user.uid,
                    game_type: '3D', // 3D အတွက် သီးသန့်ထည့်သွင်း
                    situation: "စောင့်ဆိုင်းနေသည်"
                };

                // 🚀 ပြင်ဆင်ချက်: Data Path များကို 3D အတွက် သီးသန့် ပြောင်းလဲခြင်း
                // user_three_d_bets ကို သုံးခြင်း
                betPromises.push(db.ref('user_three_d_bets/' + user.uid).push(newBetData));
                
                // three_d_bets ကို သုံးခြင်း (သင်တောင်းဆိုထားသော path)
                betPromises.push(db.ref('three_d_bets').push(newBetData)); 

                await Promise.all(betPromises);

                alert(`ထိုးခြင်း အောင်မြင်ပါသည်။ ထိုးငွေ စုစုပေါင်း: ${totalBetAmount.toLocaleString()} ကျပ်`);
                // အောင်မြင်ပြီးနောက် betting data ကို ရှင်းလင်းပါ
                localStorage.removeItem('bettingData');
                
                // 3D History စာမျက်နှာသို့ ကူးပြောင်းပါ
                window.location.href = 'threed_history.html';

            } else if (amountUpdateResult.snapshot.val() < totalBetAmount) {
                alert("ပိုက်ဆံလုံလောက်မှုမရှိပါ သို့မဟုတ် အခြားပြောင်းလဲမှုများရှိနေပါသည်။");
            } else {
                alert("ပိုက်ဆံနှုတ်ရာတွင် အမှားအယွင်းရှိပါသည်။ ထပ်မံစမ်းသပ်ပါ။");
            }


        } catch (error) {
            console.error("Bet ထိုးခြင်း မအောင်မြင်ပါ:", error);
            alert("Bet ထိုးခြင်း မအောင်မြင်ပါ။ ကျေးဇူးပြု၍ ထပ်မံစမ်းသပ်ပါ။");
        }
    });

    // ********** ၇။ ဖျက်သိမ်းမည် ခလုတ် **********
    cancelButton.addEventListener('click', () => {
        // Data ကို ရှင်းလင်းပြီး 3D ထိုးမည့် စာမျက်နှာသို့ ပြန်သွားပါ
        localStorage.removeItem('bettingData');
        window.location.href = 'three.html';
    });
});
