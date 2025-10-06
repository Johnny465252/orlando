// payment_history.js

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
    const historyContent = document.getElementById('history-content');
    const userAmountDisplay = document.getElementById('user-amount-display');

    const depositHistoryTab = document.getElementById('deposit-history-tab-button');
    const withdrawHistoryTab = document.getElementById('withdraw-history-tab-button');
    const depositHistoryContainer = document.getElementById('deposit-history-container');
    const withdrawHistoryContainer = document.getElementById('withdraw-history-container');
    const depositHistoryList = document.getElementById('deposit-history-list');
    const withdrawHistoryList = document.getElementById('withdraw-history-list');

    let userId = null;

    auth.onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = 'signup.html';
        } else {
            userId = user.uid;
            
            const userRef = db.ref('users/' + userId);
            userRef.on('value', (snapshot) => {
                const userData = snapshot.val();
                if (userData && userData.amount !== undefined) {
                    userAmountDisplay.textContent = userData.amount;
                } else {
                    userAmountDisplay.textContent = '0';
                }
            });

            // Firebase မှ မှတ်တမ်းများ ရယူပြီး user id နှင့်တူမှသာ ပြသရန်
            fetchAndRenderHistory('deposit_requests', depositHistoryList, 'deposit');
            fetchAndRenderHistory('withdraw', withdrawHistoryList, 'withdraw');
            
            const urlParams = new URLSearchParams(window.location.search);
            const showTab = urlParams.get('show');
            if (showTab === 'withdraw') {
                withdrawHistoryTab.click(); 
            } else {
                depositHistoryTab.click(); 
            }

            loadingMessage.style.display = 'none';
            historyContent.style.display = 'block';
        }
    });

    // Tab Logic
    depositHistoryTab.addEventListener('click', () => {
        depositHistoryTab.classList.add('active');
        withdrawHistoryTab.classList.remove('active');
        depositHistoryContainer.style.display = 'block';
        withdrawHistoryContainer.style.display = 'none';
    });

    withdrawHistoryTab.addEventListener('click', () => {
        withdrawHistoryTab.classList.add('active');
        depositHistoryTab.classList.remove('active');
        withdrawHistoryContainer.style.display = 'block';
        depositHistoryContainer.style.display = 'none';
    });

    // Firebase မှ မှတ်တမ်းများ ရယူပြီး list ပုံစံဖြင့် ပြသရန် function
    function fetchAndRenderHistory(dbPath, listElement, type) {
        const historyRef = db.ref(dbPath);
        
        // ဤနေရာတွင် userId ကိုအသုံးပြု၍ data များကို filter လုပ်ထားသည်
        historyRef.orderByChild('userId').equalTo(userId).on('value', (snapshot) => {
            const history = snapshot.val();
            renderList(history, listElement, type);
        });
    }

    function renderList(history, listElement, type) {
        listElement.innerHTML = '';
        if (!history) {
            listElement.innerHTML = '<p>မှတ်တမ်း မရှိသေးပါ။</p>';
            return;
        }

        const reversedKeys = Object.keys(history).reverse();
        reversedKeys.forEach(key => {
            const record = history[key];
            const time = new Date(record.date || record.timestamp).toLocaleString('my-MM');
            
            const listItem = document.createElement('div');
            listItem.classList.add('history-item');

            let logoSrc = '';
            let paymentName = '';
            const status = record.situation || 'စောင့်ဆိုင်းနေသည်';
            let statusClass = '';

            if (status === 'အောင်မြင်ပါသည်' || status === 'Accepted') {
                statusClass = 'status-accepted';
            } else if (status === 'ငြင်းပယ်သည်' || status === 'Declined') {
                statusClass = 'status-declined';
            } else {
                statusClass = 'status-pending';
            }

            if (type === 'deposit') {
                paymentName = record.method || '';
                if (paymentName === 'Kpay') {
                    logoSrc = 'kpay-logo.png';
                } else if (paymentName === 'Wavepay') {
                    logoSrc = 'wavepay-logo.png';
                }
            } else { // type === 'withdraw'
                paymentName = record.bank || '';
                if (paymentName === 'Kpay') {
                    logoSrc = 'kpay-logo.png';
                } else if (paymentName === 'Wavepay') {
                    logoSrc = 'wavepay-logo.png';
                }
            }

            let amount = type === 'deposit' ? record.amount : record.money;

            listItem.innerHTML = `
                <div class="logo-container">
                    <img src="${logoSrc}" alt="${paymentName} Logo" class="payment-logo">
                </div>
                <div class="item-details">
                    <p class="payment-name">${paymentName}</p>
                    <p class="item-date">${time}</p>
                </div>
                <div class="item-info">
                    <p class="item-amount">${amount} ကျပ်</p>
                    <p class="item-status ${statusClass}">${status}</p>
                </div>
            `;
            listElement.appendChild(listItem);
        });
    }
});
