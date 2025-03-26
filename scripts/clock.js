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
