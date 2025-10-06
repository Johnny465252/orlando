// payment.js

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

    // Tab Buttons and Content
    const depositTabButton = document.getElementById('deposit-tab-button');
    const withdrawTabButton = document.getElementById('withdraw-tab-button');
    const depositContent = document.getElementById('deposit-content');
    const withdrawContent = document.getElementById('withdraw-content');

    // Deposit Form Elements
    const kpayButton = document.getElementById('kpay-button');
    const wavepayButton = document.getElementById('wavepay-button');
    const depositFormDetails = document.getElementById('deposit-form-details');
    const transferNameInput = document.getElementById('transfer-name-input');
    const receiptNumberInput = document.getElementById('receipt-number-input');
    const depositAmountInput = document.getElementById('deposit-amount-input');
    const transferPhoneNumber = document.getElementById('transfer-phone-number');
    const copyButton = document.getElementById('copy-button');
    const submitDepositFormButton = document.getElementById('submit-deposit-form');

    // ငွေထုတ်ရန်အတွက် Elements
    const withdrawKpayButton = document.getElementById('withdraw-kpay-button');
    const withdrawWavepayButton = document.getElementById('withdraw-wavepay-button');
    const withdrawFormDetails = document.getElementById('withdraw-form-details');
    const withdrawNameInput = document.getElementById('withdraw-name-input');
    const withdrawPhoneNumberInput = document.getElementById('withdraw-phone-number-input');
    const withdrawAmountInput = document.getElementById('withdraw-amount-input');
    const submitWithdrawFormButton = document.getElementById('submit-withdraw-form');

    let currentUserAmount = 0;
    let userId = null;
    let selectedPaymentMethod = null;
    let selectedWithdrawalMethod = null;

    auth.onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = 'signup.html';
        } else {
            userId = user.uid;
            
            const userRef = db.ref('users/' + userId);
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

    // Tab Button Logic
    depositTabButton.addEventListener('click', () => {
        depositTabButton.classList.add('active');
        withdrawTabButton.classList.remove('active');
        depositContent.style.display = 'block';
        withdrawContent.style.display = 'none';
    });

    withdrawTabButton.addEventListener('click', () => {
        withdrawTabButton.classList.add('active');
        depositTabButton.classList.remove('active');
        depositContent.style.display = 'none';
        withdrawContent.style.display = 'block';
    });

    // Firebase မှ ငွေသွင်းရန် ဖုန်းနံပါတ်များ ရယူပြီး ပြသရန် Logic
    const paynumberRef = db.ref('paynumber');
    
    kpayButton.addEventListener('click', () => {
        selectedPaymentMethod = 'kpay';
        updatePaymentDetails(selectedPaymentMethod);
        kpayButton.classList.add('selected');
        wavepayButton.classList.remove('selected');
    });

    wavepayButton.addEventListener('click', () => {
        selectedPaymentMethod = 'wavepay';
        updatePaymentDetails(selectedPaymentMethod);
        wavepayButton.classList.add('selected');
        kpayButton.classList.remove('selected');
    });

    function updatePaymentDetails(method) {
        paynumberRef.orderByChild('pay_name').equalTo(method).once('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const phoneNumber = Object.values(data)[0].phonenumber;
                transferPhoneNumber.textContent = phoneNumber;
                depositFormDetails.style.display = 'block';
            } else {
                transferPhoneNumber.textContent = `${method} အတွက် ဖုန်းနံပါတ် မရှိသေးပါ။`;
                depositFormDetails.style.display = 'block';
            }
        });
    }
    
    // Copy Phone Number Logic
    copyButton.addEventListener('click', () => {
        const phoneNumber = transferPhoneNumber.textContent;
        if (phoneNumber !== '--' && phoneNumber.length > 5 && !phoneNumber.includes('မရှိသေးပါ')) {
            navigator.clipboard.writeText(phoneNumber).then(() => {
                alert("ဖုန်းနံပါတ် ကူးယူပြီးပါပြီ။");
            }).catch(err => {
                console.error("ကူးယူခြင်း မအောင်မြင်ပါ:", err);
            });
        } else {
            alert("ဖုန်းနံပါတ်ကို ရွေးချယ်ပေးပါ။");
        }
    });

    // Submit Deposit Form Logic
    submitDepositFormButton.addEventListener('click', () => {
        const transferName = transferNameInput.value.trim();
        const receiptNumber = receiptNumberInput.value;
        const depositAmount = parseInt(depositAmountInput.value);
        
        if (!selectedPaymentMethod) {
            alert("ငွေပေးချေမှုစနစ်ကို ရွေးချယ်ပေးပါ။");
            return;
        }
        
        if (transferName === '') {
            alert("အကောင့်အမည် ထည့်သွင်းပေးပါ။");
            return;
        }

        if (receiptNumber.length !== 6) {
            alert("ပြေစာ၏ နောက်ဆုံးကဏန်း ၆ လုံးကို အတိအကျ ထည့်သွင်းပေးပါ။");
            return;
        }

        if (isNaN(depositAmount) || depositAmount < 1000 || depositAmount > 1000000) {
            alert("မှန်ကန်သော ငွေပမာဏကို ထည့်သွင်းပါ။ (1,000 မှ 1,000,000 ကျပ်)");
            return;
        }
        
        const depositRequestsRef = db.ref('deposit_requests');
        const newRequestRef = depositRequestsRef.push();
        newRequestRef.set({
            userId: userId,
            method: selectedPaymentMethod,
            transferName: transferName,
            receiptNumber: receiptNumber,
            amount: depositAmount,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            situation: "စောင့်ဆိုင်းနေသည်"
        }).then(() => {
            alert("ငွေသွင်းဖောင်ကို အောင်မြင်စွာ တင်ပြပြီးပါပြီ။");
            window.location.href = 'payment_history.html';
        }).catch(error => {
            console.error("Request တင်သွင်းခြင်း မအောင်မြင်ပါ:", error);
            alert("ငွေသွင်းဖောင် တင်သွင်းခြင်း မအောင်မြင်ပါ။");
        });
    });

    // ငွေထုတ်ရန် ခလုတ်များ Logic
    withdrawKpayButton.addEventListener('click', () => {
        selectedWithdrawalMethod = 'Kpay';
        withdrawFormDetails.style.display = 'block';
        withdrawKpayButton.classList.add('selected');
        withdrawWavepayButton.classList.remove('selected');
    });

    withdrawWavepayButton.addEventListener('click', () => {
        selectedWithdrawalMethod = 'Wavepay';
        withdrawFormDetails.style.display = 'block';
        withdrawWavepayButton.classList.add('selected');
        withdrawKpayButton.classList.remove('selected');
    });

    // ငွေထုတ်ရန် တောင်းဆိုမှုတင်ရန် Logic (ငွေနှုတ်ပြီး history သို့ redirect ပါဝင်သည်)
    submitWithdrawFormButton.addEventListener('click', async () => {
        const accountName = withdrawNameInput.value.trim();
        const paymentPhone = withdrawPhoneNumberInput.value.trim();
        const money = parseInt(withdrawAmountInput.value);

        if (!selectedWithdrawalMethod) {
            alert("ငွေထုတ်မည့်နည်းလမ်းကို ရွေးချယ်ပေးပါ။");
            return;
        }

        if (accountName === '') {
            alert("အကောင့်အမည် ထည့်သွင်းပေးပါ။");
            return;
        }

        if (paymentPhone === '') {
            alert("ဖုန်းနံပါတ် ထည့်သွင်းပေးပါ။");
            return;
        }

        if (isNaN(money) || money < 1000 || money > 1000000) {
            alert("မှန်ကန်သော ငွေပမာဏကို ထည့်သွင်းပါ။ (1,000 မှ 1,000,000 ကျပ်)");
            return;
        }

        if (money > currentUserAmount) {
            alert("လက်ကျန်ငွေ မလုံလောက်ပါ။");
            return;
        }

        const withdrawRef = db.ref('withdraw');
        const newWithdrawRef = withdrawRef.push();
        
        try {
            await newWithdrawRef.set({
                userId: userId,
                account_name: accountName,
                payment_phone: paymentPhone,
                money: money,
                situation: "စောင့်ဆိုင်းနေသည်",
                date: firebase.database.ServerValue.TIMESTAMP,
                // **အသစ်ထည့်သွင်းလိုက်သော bank data**
                bank: selectedWithdrawalMethod 
            });

            const userRef = db.ref('users/' + userId);
            await userRef.transaction(currentAmount => {
                if (currentAmount) {
                    currentAmount.amount -= money;
                }
                return currentAmount;
            });
            
            alert("ငွေထုတ်ရန် တောင်းဆိုမှု အောင်မြင်ပါသည်။ လက်ကျန်ငွေမှ ငွေကို နှုတ်ယူပြီးပါပြီ။");

            withdrawNameInput.value = '';
            withdrawPhoneNumberInput.value = '';
            withdrawAmountInput.value = '';
            withdrawFormDetails.style.display = 'none';
            withdrawKpayButton.classList.remove('selected');
            withdrawWavepayButton.classList.remove('selected');
            selectedWithdrawalMethod = null;
            
            window.location.href = 'payment_history.html?show=withdraw';

        } catch (error) {
            console.error("ငွေထုတ်ရန် တောင်းဆိုခြင်း မအောင်မြင်ပါ:", error);
            alert("ငွေထုတ်ရန် တောင်းဆိုခြင်း မအောင်မြင်ပါ။");
        }
    });
});
