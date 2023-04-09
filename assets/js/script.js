$(function () {
  let url = "https://www.sabah.com.tr/json/getpraytimes/ankara";
  $.ajax({
    type: "GET",
    url: url,
    async: false,
    data: {
      dayafter: 5,
    },
    cache: false,
    success: function (data) {
      mainFunction(data.List);
      setTimeout(() => {
        $("#result").css("display", "block");
      }, 100);
    },
    beforeSend: function () {
      $("#result").css("display", "none");
      //   console.log("loading...");
    },
    error: function (xhr, status, error) {
      console.log("Error in ajax request : " + error);
    },
  });
});

function mainFunction(data) {
  displayTable(data);
  displayRemainingtime(data[0]);
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
  return dt.toLocaleDateString();
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

function displayRemainingtime(dates) {
  console.log(dates);
  let output;
  let i = 2;
  let now = new Date();
  let sabah = new Date(getDateFromAspNetFormat(dates.Imsak));
  let ogle = new Date(getDateFromAspNetFormat(dates.Ogle));
  let i̇kindi = new Date(getDateFromAspNetFormat(dates.Ikindi));
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
    );

    if (now < varVakit && output == undefined) {
      let remaining = convertMsToHM(yatsi - now);
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

  $("#remainingTime").html(output);
}
