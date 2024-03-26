$(document).ready(function () {
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
    dataType: "json",
    success: function (result, status, xhr) {
      $('#data').DataTable({
        data: [],
        columns: [
          { data: 'departure', className: 'dt-head-left', title: "Date", orderSequence: ['desc', 'asc'], render: { display: function (data, type, row) { return new Date(data).toLocaleDateString() }, _: function (data, type, row) { return data } } },
          { data: 'Trip.title', title: "Trip", orderable: false },
          { data: 'flight', title: "Flight", orderable: false },
          { data: 'origin', title: "Origin", orderable: false },
          { data: 'destination', title: "Destination", orderable: false },
          { data: 'aircraft_registration', title: "Registration", orderable: false },
          { data: 'aircraft_type', title: "Type", orderable: false },
        ],
        "search": false,
        lengthChange: false
      });
      for (var i = 0; (i * 10) < result.data._allFlightsMeta.count; i += 1) {
        $.ajax({
          type: "POST",
          url: "/.well-known/graphql/rptlog",
          contentType: "application/json",
          data: JSON.stringify({
            "query": `{
              allFlights(perPage: 10, page: ${i}) {
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
          dataType: "json",
          success: function (result, status, xhr) {
            $('#data').DataTable().rows.add(result.data.allFlights).columns.adjust().order([0, 'asc']).draw();
          },
          fail: function (xhr, status, error) {
            console.log("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText)
          }
        })
      }
    },
    fail: function (xhr, status, error) {
      console.log("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText)
    }
  });
});