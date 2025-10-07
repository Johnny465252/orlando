// betconfirm.js

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
    const selectedNumbersDisplay = document.getElementById('selected-numbers-display');
    const totalCountDisplay = document.getElementById('total-count');
    const betAmountDisplay = document.getElementById('bet-amount');
    const totalBetAmountDisplay = document.getElementById('total-bet-amount');
    const confirmButton = document.getElementById('confirm-button');
    const cancelButton = document.getElementById('cancel-button');

    let bettingData = null;
    let currentUserAmount = 0;

    const storedData = localStorage.getItem('bettingData');
    if (storedData) {
        bettingData = JSON.parse(storedData);
    }

    if (!bettingData || bettingData.numbers.length === 0) {
        window.location.href = 'home.html';
        return;
    }

    auth.onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = 'signup.html';
        } else {
            const userRef = db.ref('users/' + user.uid);
            userRef.on('value', (snapshot) => {
                const userData = snapshot.val();
                if (userData && userData.amount !== undefined) {
                    currentUserAmount = userData.amount;
                }
                loadingMessage.style.display = 'none';
                contentDiv.style.display = 'block';
            });
        }
    });

    bettingData.numbers.forEach(number => {
        const button = document.createElement('button');
        button.className = 'number-button selected';
        button.textContent = number;
        selectedNumbersDisplay.appendChild(button);
    });

    totalCountDisplay.textContent = bettingData.numbers.length;
    betAmountDisplay.textContent = bettingData.amount + ' ကျပ်';
    totalBetAmountDisplay.textContent = (bettingData.amount * bettingData.numbers.length) + ' ကျပ်';

    cancelButton.addEventListener('click', () => {
        localStorage.removeItem('bettingData');
        window.location.href = 'home.html';
    });

    confirmButton.addEventListener('click', async () => {
        const user = auth.currentUser;
        const totalBetAmount = bettingData.amount * bettingData.numbers.length;

        if (totalBetAmount > currentUserAmount) {
            alert("ထိုးမည့် ပိုက်ဆံပမာဏ လုံလောက်မှုမရှိပါ။");
            return;
        }

        const userAmountRef = db.ref('users/' + user.uid + '/amount');
        try {
            await userAmountRef.transaction((currentAmount) => {
                if (currentAmount === null) return 0;
                const newAmount = currentAmount - totalBetAmount;
                if (newAmount < 0) return;
                return newAmount;
            });
            
            const newBetData = {
                bet_numbers: bettingData.numbers,
                bet_amount: bettingData.amount,
                timestamp: firebase.database.ServerValue.TIMESTAMP,
                userId: user.uid,
                // ဒီနေရာမှာ 'Situation' data အသစ်ကို ထပ်ထည့်ထားပါတယ်
                situation: "စောင့်ဆိုင်းနေသည်"
            };
            
            await db.ref('user_bets/' + user.uid).push(newBetData);
            await db.ref('bets').push(newBetData);

            alert(`ထိုးခြင်း အောင်မြင်ပါသည်။ ထိုးငွေ စုစုပေါင်း: ${totalBetAmount} ကျပ်`);
            localStorage.removeItem('bettingData');
            
            window.location.href = 'history.html';

        } catch (error) {
            console.error("Bet ထိုးခြင်း မအောင်မြင်ပါ:", error);
            alert("Bet ထိုးခြင်း မအောင်မြင်ပါ။ ကျေးဇူးပြု၍ ထပ်မံစမ်းသပ်ပါ။");
        }
    });
});
