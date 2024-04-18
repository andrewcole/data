import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("Default");
    }

    async getHtml() {
        return `
        <br />
        <h3>
          Regular Public Transport
          <small class="text-muted">Flight Log</small>
        </h3>
        <div class="row">
          <div class="col-md-12">
            <table class="table table-hover table-sm nowrap" id="data"></table>
          </div>
        </div>
        <br />
        <br />
        `;
    }

    async loadData() {
        $('#data').DataTable({
          data: [],
          columns: [
            { data: 'departure', className: 'dt-head-left', title: "Date", orderSequence: ['desc', 'asc'], render: { display: function (data, type, row) { return new Date(data).toLocaleDateString() }, _: function (data, type, row) { return data } } },
            { data: 'rptTrip.name', title: "Trip", orderable: false },
            { data: 'flight', title: "Flight", orderable: false, render: { display: function (data, type, row) { return `<a href="/rptflights/${row.id}">${data}</a>` }, _: function (data, type, row) { return data } }},
            { data: 'route.name', title: "Route", orderable: false },
            { data: 'route.distance', title: "Distance", orderable: false },
            { data: 'registration', title: "Registration", orderable: false },
            { data: 'type', title: "Type", orderable: false },
            { data: 'id', visible: false }
          ],
          "search": false,
          lengthChange: false,
          pageLength: 25,
        });
        loadRPTData(this.params.id, "");
      }
    }

    function loadRPTData(search = null, cursor = "")
    {
      $.ajax({
        type: "POST",
        url: "/graphql",
        contentType: "application/json",
        view: this,
        data: JSON.stringify({
          "query": `query Q {
            rptFlights(cursor: "${cursor}", limit: 125) {
              count
              data {
                id
                departure
                rptTrip {
                  name
                }
                flight
                route {
                  name
                  distance
                }
                registration
                type
              }
              cursor
            }
          }`
        }),
        dataType: "json",
        success: async function (result, status, xhr) {
          $('#data').DataTable().rows.add(result.data.rptFlights.data);
          if (result.data.rptFlights.cursor) {
            loadRPTData(search, result.data.rptFlights.cursor);
          }
          else
          {
            if (search)
            {
              $('#data').DataTable().columns.adjust().order([0, 'asc']).search(search).draw()
            }
            else
            {
              $('#data').DataTable().columns.adjust().order([0, 'asc']).draw()
            }
          }
        },
        fail: function (xhr, status, error) {
          console.log("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText)
        }
      })
    }