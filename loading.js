// စာမျက်နှာ စတင်ဖွင့်လိုက်တာနဲ့ အချိန်ရေတွက်မှုကို စပါ
document.addEventListener('DOMContentLoaded', () => {
    // 5 စက္ကန့် (5000 milliseconds) အကြာမှာ လုပ်ဆောင်မယ့်အရာ
    setTimeout(() => {
        // Home.html စာမျက်နှာသို့ History ထဲမှာ မမှတ်မိစေဘဲ ပြောင်းပါ
        window.location.replace("home.html");
    }, 5000); // 5000ms = 5 စက္ကန့်
});
