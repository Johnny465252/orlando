// threed.js (Loading Overlay ဖြင့် Filter Optimization Logic ထည့်သွင်းပြီး)

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
    const betAmountInput = document.getElementById('bet-amount-input');
    const betButton = document.getElementById('bet-button');
    const rButton = document.getElementById('r-button');
    const selectedNumbersText = document.getElementById('selected-numbers-text');
    const threeDNumberGrid = document.getElementById('three-d-number-grid'); 
    const threeDCategories = document.getElementById('three-d-categories'); 
    
    // 🚀 ပြင်ဆင်ချက်: Loading Overlay Element ကို ID ဖြင့် မှန်ကန်စွာ ရှာဖွေပါ
    const filterLoadingOverlay = document.getElementById('filter-loading-overlay'); 
    
    let currentUserAmount = 0;
    let selectedNumbers = []; 

    // ********** ၃။ 3D နံပါတ်ခလုတ် 1000 လုံးကို ဖန်တီးခြင်း **********
    for (let i = 0; i <= 999; i++) {
        const number = i.toString().padStart(3, '0');
        const button = document.createElement('button');
        button.className = 'number-button';
        button.textContent = number;
        button.setAttribute('data-number', number);
        // စတင်ချိန်တွင် hidden class ကို ထည့်ထားပါ
        button.classList.add('hidden');
        threeDNumberGrid.appendChild(button);
    }
    
    // ********** ၄။ နံပါတ်အုပ်စု (Category) ကို Filter လုပ်မယ့် Function (Optimized & Loading Logic) **********
    const filterCategoryByRange = (range) => {
        
        // 🚀 ၁။ Filter မစခင် Loading Overlay ကို ပြပါ
        if (filterLoadingOverlay) {
            filterLoadingOverlay.style.display = 'flex'; 
        }

        // Active Class Logic
        document.querySelectorAll('.category-link').forEach(link => {
            link.classList.remove('active');
        });
        const activeLink = document.querySelector(`.category-link[data-range="${range}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        const [startStr, endStr] = range.split('-');
        const start = parseInt(startStr);
        const end = parseInt(endStr);
        
        // 🚀 ၂။ နံပါတ်ခလုတ် 1000 လုံးကို စစ်ဆေးပြီး class ဖြင့် ပြသ/ဖျောက်ပါ (Optimized)
        document.querySelectorAll('.number-button').forEach(button => {
            const number = parseInt(button.getAttribute('data-number'));
            
            if (number >= start && number <= end) {
                // နံပါတ်မှန်ကန်ရင် hidden class ကို ဖယ်ထုတ်ပါ
                button.classList.remove('hidden'); 
            } else {
                // နံပါတ်မမှန်ကန်ရင် hidden class ကို ထည့်ပါ
                button.classList.add('hidden'); 
            }
        });
        
        // 🚀 ၃။ Filter လုပ်ငန်းစဉ် ပြီးဆုံးမှ Loading Overlay ကို ဖျောက်ပါ
        // DOM Render လုပ်ဖို့ အချိန်ခဏလေး ပေးပြီးမှ ဖျောက်ပါ
        setTimeout(() => {
            if (filterLoadingOverlay) {
                filterLoadingOverlay.style.display = 'none'; 
            }
        }, 10); 
    };

    // Category Link တွေကို နှိပ်တဲ့အခါ လုပ်ဆောင်ချက်
    threeDCategories.addEventListener('click', (e) => {
        if (e.target.classList.contains('category-link')) {
            e.preventDefault(); 
            const range = e.target.getAttribute('data-range');
            filterCategoryByRange(range);
        }
    });

    // ********** ၅။ Login စစ်ဆေးခြင်းနှင့် ပိုက်ဆံ Update လုပ်ခြင်း Logic **********
    auth.onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = 'signup.html';
        } else {
            const userRef = db.ref('users/' + user.uid);
            
            userRef.on('value', (snapshot) => {
                const userData = snapshot.val();
                if (userData && userData.amount !== undefined) {
                    currentUserAmount = userData.amount;
                    userAmountDisplay.textContent = currentUserAmount.toLocaleString(); 
                } else {
                    currentUserAmount = 0;
                    userAmountDisplay.textContent = '0';
                }

                loadingMessage.style.display = 'none';
                contentDiv.style.display = 'block';
                
                // စတင်ချိန်တွင် 000-099 အုပ်စုကို ပြသပြီး Active အရောင်ပေးပါ
                filterCategoryByRange('000-099');
            });
        }
    });
    
    // ********** ၆။ နံပါတ်ခလုတ် နှိပ်ခြင်း Logic (ရွေးချယ်ထားသော နံပါတ်များ) **********
    threeDNumberGrid.addEventListener('click', (e) => {
        if (e.target.classList.contains('number-button')) {
            const number = e.target.getAttribute('data-number');
            const index = selectedNumbers.indexOf(number);
            
            if (index > -1) {
                selectedNumbers.splice(index, 1);
                e.target.classList.remove('selected');
            } else {
                selectedNumbers.push(number);
                e.target.classList.add('selected');
            }
            
            selectedNumbersText.textContent = selectedNumbers.length > 0 
                ? selectedNumbers.join(', ') 
                : 'မရှိသေးပါ';
        }
    });

    // ********** ၇။ R ခလုတ်အတွက် လုပ်ဆောင်ချက် (3D Permutations Logic) **********
    rButton.addEventListener('click', () => {
        
        const numbersToPermute = [...selectedNumbers];
        
        if (numbersToPermute.length === 0) {
            alert("R ခလုတ်ကို အသုံးပြုရန် 3D နံပါတ်ကို အနည်းဆုံး (၁) လုံး ရွေးချယ်ပေးပါ။");
            return;
        }
        
        const newPermutations = new Set(); 
        
        for (const number of numbersToPermute) {
            if (number.length !== 3) {
                 console.warn(`နံပါတ် ${number} သည် 3D မဟုတ်ပါ။`);
                 continue;
            }
            
            const digits = number.split(''); 
            const d1 = digits[0];
            const d2 = digits[1];
            const d3 = digits[2];
            
            // ဂဏန်း ၃ လုံးကို နေရာ ၆ မျိုး ပြောင်းခြင်း (Set က ထပ်နေတာကို ဖယ်ပါမယ်)
            newPermutations.add(d1 + d2 + d3);
            newPermutations.add(d1 + d3 + d2);
            newPermutations.add(d2 + d1 + d3);
            newPermutations.add(d2 + d3 + d1);
            newPermutations.add(d3 + d1 + d2);
            newPermutations.add(d3 + d2 + d1);
        }
        
        let addedCount = 0;
        
        // Permutation အသစ်များအားလုံးကို Loop ပတ်ပြီး array ထဲ ထပ်ထည့်ပါ
        newPermutations.forEach(perm => {
            if (!selectedNumbers.includes(perm)) {
                const button = document.querySelector(`.number-button[data-number="${perm}"]`);
                
                if (button) {
                    selectedNumbers.push(perm);
                    button.classList.add('selected');
                    addedCount++;
                }
            }
        });
        
        selectedNumbersText.textContent = selectedNumbers.length > 0
            ? selectedNumbers.join(', ') 
            : 'မရှိသေးပါ';
            
        alert(`R ခလုတ်ဖြင့် နံပါတ် ${addedCount} လုံးကို အသစ် ထပ်မံရွေးချယ်လိုက်ပါပြီ။ (စုစုပေါင်း ${selectedNumbers.length} လုံး)`);
    });

// threed.js ၏ အပိုင်း ၈ ကို အစားထိုးရန်

    // ********** ၈။ ထိုးမည် ခလုတ်အတွက် လုပ်ဆောင်ချက် (Confirm Page သို့ ကူးပြောင်းခြင်း) **********
    betButton.addEventListener('click', () => {
        
        const numbersToBet = selectedNumbers; 
        const betAmount = parseInt(betAmountInput.value);

        if (numbersToBet.length === 0) {
            alert("ထိုးမည့် 3D နံပါတ်ကို အနည်းဆုံး တစ်ခု ရွေးချယ်ပေးပါ။");
            return;
        }

        if (isNaN(betAmount) || betAmount < 100) { 
            alert("ပိုက်ဆံပမာဏကို မှန်ကန်စွာထည့်ပါ။ (အနည်းဆုံး 100 ကျပ်)");
            return;
        }

        // 🚀 ပြင်ဆင်ချက်: Data များကို localStorage တွင် သိမ်းဆည်းခြင်း
        const dataToConfirm = {
            type: '3D', // 3D အတွက် မှတ်သားထားခြင်း
            numbers: numbersToBet,
            amount: betAmount
        };
        localStorage.setItem('bettingData', JSON.stringify(dataToConfirm));

        // Confirm Page သို့ ကူးပြောင်းပါ
        window.location.href = 'threed_confirm.html'; 
    });
});
