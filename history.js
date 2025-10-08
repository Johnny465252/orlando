// history.js (3D Card Display Version - 2D Logic - Winning Number Logic ဖယ်ရှားပြီး)

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
    // 🛑 winningNumberDisplay ကို ဖြုတ်လိုက်ပါပြီ
    const historyList = document.getElementById('history-list'); // Card Container div
    const noHistoryMessage = document.getElementById('no-history-message');

    // 🛑 winningNumber ကို ဖြုတ်လိုက်ပါပြီ
    let userId = null;

    // Win/Lose တွက်ချက်ဖို့ 2D အတွက် Function (History မှာ Status ပြဖို့)
    // History မှာ Win/Lose တွက်ချက်စရာမလိုဘဲ situation field ကိုပဲ သုံးပါမည်။
    const getStatusInfo = (bet) => {
        let situation = bet.situation || 'စောင့်ဆိုင်းနေသည်'; 
        let isWin = situation.includes('နိုင်သည်'); // 'နိုင်သည်' စာသားပါရင် နိုင်သည်ဟု ယူဆ

        const statusColor = isWin ? 'green' : situation.includes('ရှုံး') ? 'red' : '#ffa500';
        return { situation, statusColor };
    };
    
    // Timestamp ကို DD/MM/YYYY ပုံစံဖြင့် ပြောင်းလဲခြင်း Function
    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('my-MM', {
             year: 'numeric', month: '2-digit', day: '2-digit'
        });
    };
    

    // ********** History Data ကို ဖတ်ပြီး 3D Card ပုံစံဖြင့် ပြသခြင်း **********
    const fetchAndRenderHistory = () => {
        if (!userId) return;

        // 2D History Path (မူလအတိုင်း)
        const historyRef = db.ref('user_bets/' + userId); 
        
        historyRef.once('value', (snapshot) => {
            const bets = snapshot.val();
            
            historyList.innerHTML = ''; 

            if (!bets) {
                noHistoryMessage.style.display = 'block';
                return;
            }
            
            noHistoryMessage.style.display = 'none';

            const historyArray = [];
            for (let key in bets) {
                const betData = bets[key];
                const betNumbers = Array.isArray(betData.bet_numbers) ? betData.bet_numbers : [betData.bet_numbers];
                historyArray.push({
                    ...betData,
                    bet_numbers: betNumbers,
                    id: key 
                });
            }
            
            historyArray.sort((a, b) => b.timestamp - a.timestamp); 

            historyArray.forEach(bet => {
                const betNumbersDisplay = bet.bet_numbers.map(n => n.toString().padStart(2, '0')).join(', '); // 2D အတွက် 2 လုံး
                const betAmount = bet.bet_amount || 0;
                
                const numbersCount = bet.bet_numbers.length;
                const totalCost = numbersCount * betAmount;
                
                const { situation, statusColor } = getStatusInfo(bet); 

                // 🛑 Card element ကို သုံးပြီး 3D Card ပုံစံဖြင့် ဖန်တီးပါ
                const card = document.createElement('div');
                card.className = `history-card`; 

                // 3D History ရဲ့ 3-Line Structure အတိုင်း HTML ထည့်သွင်းပါ
                card.innerHTML = `
                    <div class="card-line-1">
                        <span class="bet-numbers">${betNumbersDisplay}</span>
                        <span style="font-weight: bold; color: ${statusColor};">${situation}</span>
                    </div>
                    
                    <div class="card-line-2">
                        <span>တစ်ကွက်: ${betAmount.toLocaleString()} ကျပ်</span>
                        <span>ရက်စွဲ: ${formatTimestamp(bet.timestamp)}</span>
                    </div>
                    
                    <div class="card-line-3">
                        <span>နံပါတ်အရေအတွက်: ${numbersCount} ခု</span>
                        <span class="total-cost">စုစုပေါင်း: ${totalCost.toLocaleString()} ကျပ်</span>
                    </div>
                `;
                historyList.appendChild(card);
            });
        });
    };

    // ********** Login စစ်ဆေးခြင်းနှင့် Data စတင်ဖတ်ခြင်း **********
    auth.onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = 'signup.html';
        } else {
            userId = user.uid;
            
            document.getElementById('loading-message').style.display = 'none';
            contentDiv.style.display = 'block';

            // User Amount Display
            db.ref('users/' + userId + '/amount').on('value', (snapshot) => {
                 userAmountDisplay.textContent = snapshot.val() !== undefined 
                    ? snapshot.val().toLocaleString() 
                    : '0';
            });
            
            // 🛑 ရလဒ်ထွက်ဂဏန်းကို ဖတ်ခြင်း Logic ကို ဖြုတ်လိုက်ပါပြီ

            fetchAndRenderHistory(); // History Data ကို စတင်ဖတ်ခြင်း
        }
    });
});
