// threed_history.js (3-Line Card Display Version)

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
    const userAmountDisplay = document.getElementById('user-amount-display');
    const historyList = document.getElementById('history-list');
    const noHistoryMessage = document.getElementById('no-history-message');

    let userId = null;
    
    // ********** ၃။ Timestamp ကို ဖော်မတ်ပြောင်းလဲခြင်း Function **********
    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        // DD/MM/YYYY ပုံစံဖြင့် ပြပါမည်
        return date.toLocaleDateString('my-MM', {
             year: 'numeric', month: '2-digit', day: '2-digit'
        }) + ' ' + date.toLocaleTimeString('my-MM', {
             hour: '2-digit', minute: '2-digit'
        });
    };
    
    // ********** ၄။ History Data ကို ဖတ်ပြီး 3-Line Card ဖြင့် ပြသခြင်း **********
    const fetchAndRenderHistory = () => {
        if (!userId) return;

        const historyRef = db.ref('user_three_d_bets/' + userId);
        
        historyRef.once('value', (snapshot) => {
            const bets = snapshot.val();
            
            historyList.innerHTML = ''; 

            if (!bets) {
                noHistoryMessage.style.display = 'block';
                return;
            }

            const historyArray = [];
            for (let key in bets) {
                historyArray.push({
                    ...bets[key],
                    id: key 
                });
            }
            
            historyArray.sort((a, b) => b.timestamp - a.timestamp); 

            historyArray.forEach(bet => {
                const betNumbers = Array.isArray(bet.bet_numbers) ? bet.bet_numbers.join(', ') : bet.bet_numbers.toString();
                const betAmount = bet.bet_amount || 0;
                // ပုံထဲကလို စုစုပေါင်းထိုးကြေးကို တွက်ပါ
                const numbersCount = Array.isArray(bet.bet_numbers) ? bet.bet_numbers.length : 1;
                const totalCost = numbersCount * betAmount;
                const situation = bet.situation || 'စောင့်ဆိုင်းနေသည်'; 
                
                const card = document.createElement('div');
                card.className = 'history-card'; 

                // 🛑 3-Line Card Layout အသစ်
                card.innerHTML = `
                    <div class="card-line-1">
                        <span class="bet-numbers">${betNumbers}</span>
                        <span style="color: ${situation === 'နိုင်သည်' ? 'green' : situation === 'ရှုံးသည်' ? 'red' : '#ffa500'}; font-weight: bold;">${situation}</span>
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
            
            noHistoryMessage.style.display = 'none';
        });
    };

    // ********** ၅။ Login စစ်ဆေးခြင်းနှင့် Data စတင်ဖတ်ခြင်း **********
    auth.onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = 'signup.html';
        } else {
            userId = user.uid;
            
            document.getElementById('loading-message').style.display = 'none';
            document.getElementById('content').style.display = 'block';

            // User Amount Display
            db.ref('users/' + userId + '/amount').on('value', (snapshot) => {
                 document.getElementById('user-amount-display').textContent = snapshot.val() !== undefined 
                    ? snapshot.val().toLocaleString() 
                    : '0';
            });
            
            fetchAndRenderHistory(); // History Data ကို စတင်ဖတ်ခြင်း
        }
    });
});
