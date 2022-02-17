
function convertUTCDateToLocalDate(d) {
  var date = convertUTCDateToLocalDate(new Date(d));
  var newDate = new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000);

  var offset = date.getTimezoneOffset() / 60;
  var hours = date.getHours();

  newDate.setHours(hours - offset);

  return newDate;
}

function convertISODateToTimeFormat(ISO_Date) {
  const newDateObj = new Date(ISO_Date);
  const toMonth = (newDateObj.getMonth() + 1);
  const toMonthProcess = (toMonth < 10 ? '0' : '') + toMonth;
  const toYear = newDateObj.getFullYear();
  const toDate = newDateObj.getDate();
  const toDateProcess = (toDate < 10 ? '0' : '') + toDate;


  const toHours = newDateObj.getHours();
  const toHoursProcessed = (toHours < 10 ? '0' : '') + toHours;
  const toMin = newDateObj.getMinutes();
  const toMinProcessed = (toMin < 10 ? '0' : '') + toMin;
  const dateTemplate = `${toDateProcess}/${toMonthProcess}/${toYear} ${toHoursProcessed}:${toMinProcessed}`;
  return dateTemplate;
}

function strToDate(dtStr) {
  if (!dtStr) return null
  try {
    let dateParts = dtStr.split("/");
    let timeParts = dateParts[2].split(" ")[1].split(":");
    dateParts[2] = dateParts[2].split(" ")[0];
    return  new Date(dateParts[2], dateParts[1] - 1, dateParts[0], timeParts[0], timeParts[1]);
  } catch (error) {
    return null;
  }
}

function getCurrentTime() {
  var currentdate = new Date();
  return currentdate.getDate() + "/"
    + (currentdate.getMonth() + 1) + "/"
    + currentdate.getFullYear() + " "
    + currentdate.getHours() + ":"
    + currentdate.getMinutes();
}

function isValidHttpUrl(string) {
  let url;  
  try {
    url = new URL(string);
  } catch (_) {
    return false;  
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

function isEmail(email) {
  var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  return regex.test(email);
}