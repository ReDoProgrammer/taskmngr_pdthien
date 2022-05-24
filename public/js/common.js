
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

function getFirstLetters(str) {
  let arr = str.split(' ');
  let result = '';
  for (i = 0; i < arr.length; i++) {
    result += arr[i].charAt(0)
  }
  return result;
}

function getLastLetters(str) {
  return str.slice(str.length - 5, str.length - 1).toUpperCase();
}



Date.prototype.addHours = function (h) {
  this.setHours(this.getHours() + h);
  return this;
}

function strToDate(dtStr) {
  if (!dtStr) return null
  try {
    let dateParts = dtStr.split("/");
    let timeParts = dateParts[2].split(" ")[1].split(":");
    dateParts[2] = dateParts[2].split(" ")[0];
    return new Date(dateParts[2], dateParts[1] - 1, dateParts[0], timeParts[0], timeParts[1]);
  } catch (error) {
    return null;
  }
}

function getCurrentTime() {
  var dt = new Date();

  return `${dt.getDate().toString().padStart(2, '0')}/${(dt.getMonth() + 1).toString().padStart(2, '0')}/${dt.getFullYear().toString().padStart(4, '0')} ${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}:${dt.getSeconds().toString().padStart(2, '0')}`;
  ;
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

function copyToClipboard(elementId) {

  // Create a "hidden" input
  var aux = document.createElement("input");

  // Assign it the value of the specified element
  aux.setAttribute("value", document.getElementById(elementId).innerHTML);

  // Append it to the body
  document.body.appendChild(aux);

  // Highlight its content
  aux.select();

  // Copy the highlighted text
  document.execCommand("copy");

  // Remove it from the body
  document.body.removeChild(aux);

}