function strToDate(dtStr) {
    if (!dtStr) return null
    let dateParts = dtStr.split("/");
    let timeParts = dateParts[2].split(" ")[1].split(":");
    dateParts[2] = dateParts[2].split(" ")[0];
    // month is 0-based, that's why we need dataParts[1] - 1
    return dateObject = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0], timeParts[0], timeParts[1], timeParts[2]);
  }


  function convertUTCDateToLocalDate(d) {
    var date = convertUTCDateToLocalDate(new Date(d));
    var newDate = new Date(date.getTime()+date.getTimezoneOffset()*60*1000);

    var offset = date.getTimezoneOffset() / 60;
    var hours = date.getHours();

    newDate.setHours(hours - offset);

    return newDate;   
}

function convertISODateToTimeFormat(ISO_Date) {
  const newDateObj = new Date(ISO_Date);
  const toMonth = (newDateObj.getMonth() + 1);
  const toMonthProcess = (toMonth<10?'0':'')+toMonth;
  const toYear = newDateObj.getFullYear();
  const toDate = newDateObj.getDate();
  const toDateProcess = (toDate<10?'0':'')+toDate;


  const toHours = newDateObj.getHours();
  const toHoursProcessed = (toHours < 10 ? '0' : '') + toHours;
  const toMin = newDateObj.getMinutes();
  const toMinProcessed = (toMin < 10 ? '0' : '') + toMin;
  const dateTemplate = `${toDateProcess}/${toMonthProcess}/${toYear} ${toHoursProcessed}:${toMinProcessed}`;
  return dateTemplate;
}
