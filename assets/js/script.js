$(function () {
  getCityName();
});

function mainFunction(data) {
  displayTable(data);
  displayRemainingtime(data[0], data[1].Imsak);
  displayTodayDate();
  setInterval(() => {
    displayRemainingtime(data[0], data[1].Imsak);
    displayTodayDate();
  }, 1000);
  $("#result").animate({ opacity: 0.9 }, 1000);
  $("footer").animate({ opacity: 0.9 }, 1000);
}

function getDateFromAspNetFormat(date) {
  const re = /-?\d+/;
  const m = re.exec(date);
  return parseInt(m[0], 10);
}

function displayHrMn(date) {
  const dt = new Date(date);
  return (
    ("00" + dt.getHours()).slice(-2) + "." + ("00" + dt.getMinutes()).slice(-2)
  );
}

function displayDate(i) {
  const dt = new Date();
  dt.setDate(dt.getDate() + i);
  let dates = ["Pz", "Pzt", "Sal", "Çrş", "Prş", "Cum", "Cmt"];
  return dates[dt.getDay()];
}

function displayTable(data) {
  let output = "";

  $("#cityName").html(
    data[0].CityName.charAt(0).toUpperCase() +
      data[0].CityName.slice(1).toLocaleLowerCase() +
      " Namaz Vakitleri"
  );

  for (let i = 0; i < data.length; i++) {
    output += `
            <tr>
              <td scope="row">${displayDate(i)}</td>
              <td>${displayHrMn(getDateFromAspNetFormat(data[i].Imsak))}</td>
              <td>${displayHrMn(getDateFromAspNetFormat(data[i].Ogle))}</td>
              <td>${displayHrMn(getDateFromAspNetFormat(data[i].Ikindi))}</td>
              <td>${displayHrMn(getDateFromAspNetFormat(data[i].Aksam))}</td>
              <td>${displayHrMn(getDateFromAspNetFormat(data[i].Yatsi))}</td>
            </tr>
      `;
  }

  $("#tableContent").append(output);
}

function convertMsToHM(ms) {
  let h = 0;
  let m = Math.ceil(ms / 1000 / 60);
  if (m > 60) {
    h = Math.floor(m / 60);
    m %= 60;
  }

  return { hr: h, min: m };
}

function displayRemainingtime(dates, tomorrowSabah) {
  let output;
  let i = 2;
  let now = new Date();
  let sabah = new Date(getDateFromAspNetFormat(dates.Imsak));
  let ogle = new Date(getDateFromAspNetFormat(dates.Ogle));
  let ikindi = new Date(getDateFromAspNetFormat(dates.Ikindi));
  let aksam = new Date(getDateFromAspNetFormat(dates.Aksam));
  let yatsi = new Date(getDateFromAspNetFormat(dates.Yatsi));

  let vakitler = ["Sabah", "Öğle", "İkindi", "Akşam", "Yatsı"];

  vakitler.forEach((vakit) => {
    varVakit = eval(
      vakit
        .toLocaleLowerCase()
        .replaceAll("ö", "o")
        .replaceAll("ğ", "g")
        .replaceAll("ş", "s")
        .replaceAll("ı", "i")
        .replaceAll("i̇", "i")
    );

    if (now < varVakit && output == undefined) {
      let remaining = convertMsToHM(varVakit - now);
      let preBlank = false;

      output = `${vakit} Namazına kalan süre : `;

      if (remaining.hr != 0) {
        output += remaining.hr + " Saat";
        preBlank = true;
      }
      if (remaining.min != 0) {
        if (preBlank == true) output += " ";
        output += remaining.min + " Dakika";
      }
      output += ".";

      // remove previous lines
      $(`#tableContent > tr > td`).css({
        "text-decoration": "none",
      });

      // underline that field
      $(`#tableContent > tr:nth-child(1) > td:nth-child(${i})`).css({
        "text-decoration": "underline",
        "text-decoration-thickness": "2px",
        "text-underline-offset": "5px",
        "text-decoration-color": "darkorange",
        "-moz-text-decoration-color": "darkorange",
      });
    }

    i++;
  });

  if (output == undefined) {
    tomorrowSabah = new Date(getDateFromAspNetFormat(tomorrowSabah));
    let remaining = convertMsToHM(tomorrowSabah - now);
    let preBlank = false;

    output = `Yarınki sabah namazına kalan süre : `;

    if (remaining.hr != 0) {
      output += remaining.hr + " Saat";
      preBlank = true;
    }
    if (remaining.min != 0) {
      if (preBlank == true) output += " ";
      output += remaining.min + " Dakika";
    }
    output += ".";

    // remove previous lines
    $(`#tableContent > tr > td`).css({
      "text-decoration": "none",
    });

    // underline that field
    $(`#tableContent > tr:nth-child(2) > td:nth-child(2)`).css({
      "text-decoration": "underline",
      "text-decoration-thickness": "2px",
      "text-underline-offset": "5px",
      "text-decoration-color": "darkorange",
      "-moz-text-decoration-color": "darkorange",
    });
  }

  $("#remainingTime").html(output);
}

function getTimes(cityName) {
  let url = `https://www.sabah.com.tr/json/getpraytimes/${cityName}`;
  $.ajax({
    type: "GET",
    url: url,
    async: false,
    data: {
      dayafter: 6,
    },
    cache: false,
    success: function (data) {
      mainFunction(data.List);
    },
    beforeSend: function () {
      //   console.log("loading...");
    },
    error: function (xhr, status, error) {
      console.log("Error in ajax request : " + error);
    },
  });
}

function getMaxFreqItem(arr) {
  const frequency = {};
  let maxFreqItem = null;
  let maxFreq = 0;

  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    frequency[item] = frequency[item] ? frequency[item] + 1 : 1;

    if (frequency[item] > maxFreq) {
      maxFreqItem = item;
      maxFreq = frequency[item];
    }
  }

  return maxFreqItem;
}

function getCityName() {
  // get city name with comparing 2 different api results for accuracy because sometimes one of them gives wrong location
  // let possibleLocations = [];

  // const request1 = $.get("https://ipapi.co/json/").then(function (data) {
  //   let cityName = data.city
  //     .toLocaleLowerCase()
  //     .replaceAll("ı", "i")
  //     .replaceAll("ü", "u")
  //     .replaceAll("ö", "o");

  //   possibleLocations.push(cityName);
  // });

  // const request2 = $.get("https://ipcheck.tmgrup.com.tr/ipcheck/getcity").then(
  //   function (data) {
  //     let cityName = data.CityName.toLocaleLowerCase()
  //       .replaceAll("ı", "i")
  //       .replaceAll("ü", "u")
  //       .replaceAll("ö", "o");

  //     possibleLocations.push(cityName);
  //   }
  // );

  // // wait for response
  // Promise.all([request1, request2])
  //   .then(function () {
  //     // get the most repeated city name and return
  //     let cityName = getMaxFreqItem(possibleLocations);
  //     // console.log(cityName);
  //     getTimes(cityName);
  //   })
  //   .catch(function (error) {
  //     console.error("Error occurred:", error);
  //   });
  getTimes("ankara");
}

function displayTodayDate() {
  let t = new Date();
  let trDates = [
    "Pazar",
    "Pazartesi",
    "Salı",
    "Çarşamba",
    "Perşembe",
    "Cuma",
    "Cumartesi",
  ];

  let trMonths = [
    "Ocak",
    "Şubat",
    "Mart",
    "Nisan",
    "Mayıs",
    "Haziran",
    "Temmuz",
    "Ağustos",
    "Eylül",
    "Ekim",
    "Kasım",
    "Aralık",
  ];

  let output = `${t.getDate()} ${trMonths[t.getMonth()]} ${t.getFullYear()}  ${
    trDates[t.getDay()]
  } - ${("00" + t.getHours()).slice(-2)}:${("00" + t.getMinutes()).slice(-2)}`;

  $("#todayDate").html(output);
}
