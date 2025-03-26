//Get references to DOM elements
const mmYear = document.querySelector("#mmYear"),
  mmYearName = document.querySelector("#mmYearName"),
  mmMonth = document.querySelector("#mmMonth"),
  mmDay = document.querySelector("#mmDay"),
  mmNakhat = document.querySelector("#mmNakhat"),
  mmSpecialDay = document.querySelector("#mmSpecialDay");

//Function to convert English numbers to Myanmar numbers
const toMyanmarNumber = (num) => {
  const myanmarNumbers = ["၀", "၁", "၂", "၃", "၄", "၅", "၆", "၇", "၈", "၉"];
  return num.toString().split("").map(digit => myanmarNumbers[parseInt(digit)]).join("");
};

//Function to calculate Julian Day Number (JDN) from Gregorian date
const gregorianToJDN = (year, month, day) => {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
};

//Function to calculate Myanmar Calendar Information based on JDN
const getMyanmarCalendarInfo = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1; // 1-12
  const day = today.getDate();

  // Calculate JDN for today
  const jdn = gregorianToJDN(year, month, day);

  // Myanmar Year (approximation: Myanmar year = Gregorian year - 638)
  const myanmarYear = year - 638;

  // Myanmar Months
  const myanmarMonths = [
    "တန်ခူး", "ကဆုန်", "နယုန်", "ဝါဆို", "ဝါခေါင်", "တော်သလင်း",
    "သီတင်းကျွတ်", "တန်ဆောင်မုန်း", "နတ်တော်", "ပြာသို", "မရှင်", "ဖွတ်ခူး"
  ];

  // Simplified month mapping (in reality, this requires more complex calculation)
  const myanmarMonth = myanmarMonths[month - 1];
  const myanmarDay = toMyanmarNumber(day);

  // Simplified Nakhat calculation (Ogre, Elf, Human)
  const nakhatList = ["နဂါး", "မိဿလူ", "လူ"];
  const nakhat = nakhatList[day % 3];

  // Simplified Year Name (based on mmcalendar's getYearName)
  const yearNames = [
    "ပုဿနှစ်", "မာခနှစ်", "ဖ္လကိုန်သံဝစ္ဆိုဝ်ရနှစ်", "စယ်နှစ်", "ပိသျက်နှစ်",
    "စိဿနှစ်", "အာသတ်နှစ်", "သရဝန်နှစ်", "ဘဒ္ဒြသံဝစ္ဆုံရ်နှစ်", "အာသိန်နှစ်",
    "ကြတိုက်နှစ်", "မြိက္ကသိုဝ်နှစ်"
  ];
  const yearName = yearNames[myanmarYear % 12];

  // Simplified Special Days (Full Moon, New Moon, Sabbath)
  let specialDay = [];
  if (day === 15) {
    specialDay.push("လပြည့်နေ့");
  } else if (day === 30 || day === 29) {
    specialDay.push("လကွယ်နေ့");
  }

  // Simplified Sabbath (Uposatha) calculation
  const sabbathDays = [8, 15, 23, 30, 29]; // Typical Uposatha days
  if (sabbathDays.includes(day)) {
    specialDay.push("ဥပုသ်နေ့");
  }

  return {
    myanmarYear: toMyanmarNumber(myanmarYear),
    yearName: yearName,
    myanmarMonth: myanmarMonth,
    myanmarDay: myanmarDay,
    nakhat: nakhat,
    specialDay: specialDay.length > 0 ? specialDay.join(" | ") : "-"
  };
};

// Function to update the Myanmar Calendar Widget
const updateMyanmarCalendar = () => {
  const myanmarInfo = getMyanmarCalendarInfo();

  mmYear.textContent = `(${myanmarInfo.myanmarYear})`;
  mmYearName.textContent = myanmarInfo.yearName;
  mmMonth.textContent = myanmarInfo.myanmarMonth;
  mmDay.textContent = `(${myanmarInfo.myanmarDay})`;
  mmNakhat.textContent = myanmarInfo.nakhat;
  mmSpecialDay.textContent = myanmarInfo.specialDay;
};

// Call updateMyanmarCalendar to update the widget every day (86400 seconds)
setInterval(updateMyanmarCalendar, 86400000);

// Call updateMyanmarCalendar function on page load
updateMyanmarCalendar();
