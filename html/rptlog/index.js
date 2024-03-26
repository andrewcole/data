function simplifiedMilliseconds(milliseconds) {
  const totalSeconds = parseInt(Math.floor(milliseconds / 1000));
  const totalMinutes = parseInt(Math.floor(totalSeconds / 60));
  const hours = parseInt(Math.floor(totalMinutes / 60));
  const minutes = parseInt(totalMinutes % 60);
  if (minutes < 10) {
    time = `${hours}:0${minutes}`;
  } else {
    time = `${hours}:${minutes}`;
  }
  return time;
}

function fetchData() {
  $.ajax({
    type: "POST",
    url: "/.well-known/graphql/rptlog",
    contentType: "application/json",
    data: JSON.stringify({
      "query": `{
        _allFlightsMeta(perPage: 100, page: 0)
        {
          count
        }
      }`
    }),
    dataType: "json"
  }).success(function (result, status, xhr) {
    for (var i = 0; (i * 100) < result.data._allFlightsMeta.count; i += 1) {
      $.ajax({
        type: "POST",
        url: "/.well-known/graphql/rptlog",
        contentType: "application/json",
        data: JSON.stringify({
          "query": `{
            allFlights(perPage: 100, page: ${i}) {
              id
              Trip {
                title
              }
              flight
              origin
              destination
              departure
              arrival
              aircraft_registration
              aircraft_type
            }
          }`
        }),
        dataType: "json"
      }).success(function (result, status, xhr) {
        var table_body = $("#table_body").html();
        result.data.allFlights.forEach(flight => {
          table_body += '<tr class="table">'
          table_body += '<td><i class="fa-solid fa-plane"></i></td>'
          table_body += '<td>' + flight.departure.substring(0, 10) + '</td>'
          table_body += '<td>' + flight.Trip.title + '</td>'
          table_body += '<td>' + flight.flight + '</td>'
          table_body += '<td>' + flight.origin + '</td>'
          table_body += '<td>' + flight.destination + '</td>'
          // table_body += '<td>' + flight.departure.substring(11,16) + '</td>'
          // table_body += '<td>' + simplifiedMilliseconds((new Date(flight.arrival)) - new Date(flight.departure)) + '</td>'
          table_body += '<td>' + (flight.aircraft_registration ?? '') + '</td>'
          table_body += '<td>' + (flight.aircraft_type ?? '') + '</td>'
          table_body += '</tr>';
          $("#table_body").html(table_body);
        })
      })
    }
  }).fail(function (xhr, status, error) {
    console.log("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText)
  });
}

$(document).ready(function () {
  fetchData()
});