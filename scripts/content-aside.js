// Function to populate the Aside section
const populateAside = () => {
    // Get the aside section
    const asideSection = document.querySelector("#aside .container");

    // Check if the aside section exists
    if (!asideSection) {
        console.error("Aside section not found!");
        return;
    }

    // Define the content for the Aside section
    const asideContent = `
        <!-- Latest Posts Widget -->
        <div class="widget-latest-posts">
            <h4 class="widget-title">Latest Posts</h4>
            <ul class="latest-posts" id="latestPostsList">
                <!-- JavaScript ကနေ dynamically ထည့်ပေးမယ် -->
            </ul>
        </div>

        <!-- Categories Widget -->
        <div class="widget-categories">
            <h4 class="widget-title">Categories</h4>
            <ul class="categories" id="categoriesList">
                <!-- JavaScript ကနေ dynamically ထည့်ပေးမယ် -->
            </ul>
        </div>

        <!-- Socials Widget -->
        <div class="widget-socials">
            <h4 class="widget-title">Keep up with Us</h4>
            <ul class="socials">
                <li>
                    <a class="social-facebook" href="https://www.facebook.com/tc.myaing/" title="facebook" target="_blank">
                        <i class="fab fa-facebook-f"></i>
                        <span class="socials__text">Facebook</span>
                    </a>
                </li>
                <li>
                    <a class="social-telegram" href="https://t.me/tcmyaing" title="telegram" target="_blank">
                        <i class="fab fa-telegram"></i>
                        <span class="socials__text">Telegram</span>
                    </a>
                </li>
                <li>
                    <a class="social-youtube" href="https://www.youtube.com/@tcmyaing" title="youtube" target="_blank">
                        <i class="fab fa-youtube"></i>
                        <span class="socials__text">YouTube</span>
                    </a>
                </li>
            </ul>
        </div>

<style type="text/css">
    @import url("/css/clock.css");
</style>
<div class="widget-clock">
    <h4 class="widget-title">မြန်မာစံတော်ချိန်</h4>
    <div id="digitalClock" style="text-align: center; font-size: 1.2rem; margin-bottom: 10px;"></div>
    <div class="clock">
        <label style="--i: 1"><span>၁</span></label>
        <label style="--i: 2"><span>၂</span></label>
        <label style="--i: 3"><span>၃</span></label>
        <label style="--i: 4"><span>၄</span></label>
        <label style="--i: 5"><span>၅</span></label>
        <label style="--i: 6"><span>၆</span></label>
        <label style="--i: 7"><span>၇</span></label>
        <label style="--i: 8"><span>၈</span></label>
        <label style="--i: 9"><span>၉</span></label>
        <label style="--i: 10"><span>၁၀</span></label>
        <label style="--i: 11"><span>၁၁</span></label>
        <label style="--i: 12"><span>၁၂</span></label>
        <div class="indicator">
            <span class="hand hour"></span>
            <span class="hand minute"></span>
            <span class="hand second"></span>
        </div>
    </div>
</div>
<script>
// Get references to DOM elements
const hourHand = document.querySelector(".hour"),
  minuteHand = document.querySelector(".minute"),
  secondHand = document.querySelector(".second"),
  digitalClock = document.querySelector("#digitalClock");

// Function to convert English numbers to Myanmar numbers
const toMyanmarNumber = (num) => {
  const myanmarNumbers = ["၀", "၁", "၂", "၃", "၄", "၅", "၆", "၇", "၈", "၉"];
  return num.toString().split("").map(digit => myanmarNumbers[parseInt(digit)]).join("");
};

// Function to get the current time in a specific time zone
const getTimeInTimeZone = (timeZone) => {
  const options = {
    timeZone: timeZone,
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true, // Use 12-hour format
  };
  const formatter = new Intl.DateTimeFormat([], options);
  const parts = formatter.formatToParts(new Date());

  const time = {};
  parts.forEach(part => {
    if (part.type === "hour") time.hour = parseInt(part.value);
    if (part.type === "minute") time.minute = parseInt(part.value);
    if (part.type === "second") time.second = parseInt(part.value);
    if (part.type === "dayPeriod") time.dayPeriod = part.value; // AM or PM
  });

  // Get the 24-hour format to determine the period
  const options24 = {
    timeZone: timeZone,
    hour: "numeric",
    hour12: false,
  };
  const formatter24 = new Intl.DateTimeFormat([], options24);
  const parts24 = formatter24.formatToParts(new Date());
  time.hour24 = parseInt(parts24.find(part => part.type === "hour").value);

  return time;
};

// Function to determine the time period in Myanmar
const getMyanmarPeriod = (hour24, minute, second) => {
  if (hour24 === 0 && minute === 0 && second === 0) {
    return "ညမွန်းတည့်"; // Exactly 12:00:00 AM
  } else if (hour24 === 12 && minute === 0 && second === 0) {
    return "မွန်းတည့်"; // Exactly 12:00:00 PM
  } else if (hour24 >= 0 && hour24 < 12) {
    return "နံနက်"; // Before 12 PM
  } else {
    return "ညနေ"; // After 12 PM
  }
};

// Function to format the time for digital display in Myanmar format
const formatTimeForDigital = (time) => {
  const period = getMyanmarPeriod(time.hour24, time.minute, time.second);

  // Convert numbers to Myanmar numbers
  const hour = toMyanmarNumber(time.hour);
  const minute = toMyanmarNumber(time.minute.toString().padStart(2, "0"));
  const second = toMyanmarNumber(time.second.toString().padStart(2, "0"));

  return `${period} (${hour})နာရီ (${minute})မီနစ် (${second})စက္ကန့်`;
};

// Function to update the clock hands and digital clock
const updateTime = () => {
  const timeZone = "Asia/Yangon"; // Specify the desired time zone
  const time = getTimeInTimeZone(timeZone);

  // Update analog clock hands
  const secToDeg = (time.second / 60) * 360;
  const minToDeg = (time.minute / 60) * 360;
  const hrToDeg = ((time.hour % 12) / 12) * 360 + (time.minute / 60) * 30;

  secondHand.style.transform = `rotate(${secToDeg}deg)`;
  minuteHand.style.transform = `rotate(${minToDeg}deg)`;
  hourHand.style.transform = `rotate(${hrToDeg}deg)`;

  // Update digital clock
  digitalClock.textContent = formatTimeForDigital(time);
};

// Call updateTime to set clock hands every second
setInterval(updateTime, 1000);

// Call updateTime function on page load
updateTime();
</script>

        <!-- Ad Widget -->
        <div class="widget-ad">
            <div class="ad-160x600">
                <p><b>ဤနေရာမှာ ကြော်ငြာပါ။</b></p>
                <p>320x50</p>
            </div>
        </div>
    `;

    // Insert the content into the aside section
    asideSection.innerHTML = asideContent;
};

// Call the function to populate the aside section on page load
document.addEventListener("DOMContentLoaded", populateAside);
