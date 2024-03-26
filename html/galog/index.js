function fetchData() {
  $.ajax({
    type: "POST",
    url: "/.well-known/graphql/galog",
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
        url: "/.well-known/graphql/galog",
        contentType: "application/json",
        data: JSON.stringify({
          "query": `{
            allFlights(perPage: 100, page: ${i}) {
              date
              type
              reg
              pic
              crew
              route
              details
              singleengine_dual
              singleengine_command
              instrument_simulator
            }
          }`
        }),
        dataType: "json"
      }).success(function (result, status, xhr) {
        result.data.allFlights.forEach(flight => {
          $("#table_body").html($("#table_body").html() + `<tr class="table">
            <td><i class="fa-solid fa-plane"></i></td>
            <td>${flight.date}</td>
            <td>${flight.type}</td>
            <td>${flight.reg}</td>
            <td>${flight.pic}</td>
            <td>${flight.crew ?? '-'}</td>
            <td>${flight.route ?? '-'}</td>
            <td>${flight.details}</td>
            <td>${flight.singleengine_dual ?? '-'}</td>
            <td>${flight.singleengine_command ?? '-'}</td>
            <td>${flight.instrument_simulator ?? '-'}</td>
          </tr>`);
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