$(document).ready(function () {
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
    dataType: "json",
    success: function (result, status, xhr) {
      $('#data').DataTable({
        data: [],
        columns: [
          { data: 'date', className: 'dt-head-left', title: "Date", orderSequence: ['desc', 'asc'], render: { display: function (data, type, row) { return new Date(data).toLocaleDateString() }, _: function (data, type, row) { return data } } },
          { data: 'type', title: "Type", orderable: false },
          { data: 'reg', title: "Reg", orderable: false },
          { data: 'pic', title: "PIC", orderable: false },
          { data: 'crew', title: "Crew", orderable: false },
          { data: 'route', title: "Route", orderable: false },
          { data: 'details', title: "Details", orderable: false },
          { data: 'singleengine_dual', title: "Dual", orderable: false, render: { _: function (data, type, row) { return data ? data + (Number.isInteger(data) ? '.0' : '') : '0.0' } } },
          { data: 'singleengine_command', title: "Command", orderable: false, render: { _: function (data, type, row) { return data ? data + (Number.isInteger(data) ? '.0' : '') : '0.0' } } },
          { data: 'instrument_simulator', title: "Simulator", orderable: false, render: { _: function (data, type, row) { return data ? data + (Number.isInteger(data) ? '.0' : '') : '0.0' } } }
        ],
        "search": false,
        lengthChange: false
      });
      for (var i = 0; (i * 10) < result.data._allFlightsMeta.count; i += 1) {
        $.ajax({
          type: "POST",
          url: "/.well-known/graphql/galog",
          contentType: "application/json",
          data: JSON.stringify({
            "query": `{
              allFlights(perPage: 10, page: ${i}) {
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