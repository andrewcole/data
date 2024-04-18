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
          General Aviation
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
            { data: 'date', className: 'dt-head-left', title: "Date", orderSequence: ['desc', 'asc'], render: { display: function (data, type, row) { return new Date(data).toLocaleDateString() }, _: function (data, type, row) { return data } } },
            { data: 'type', title: "Type", orderable: false },
            { data: 'reg', title: "Reg", orderable: false },
            { data: 'pic', title: "PIC", orderable: false },
            { data: 'crew', title: "Crew", orderable: false },
            { data: 'route', title: "Route", orderable: false, render: { display: function (data, type, row) { return `<a href="/gaflights/${row.id}">${data}</a>` }, _: function (data, type, row) { return data } }},
            { data: 'details', title: "Details", orderable: false },
            { data: 'singleengine_dual', title: "Dual", orderable: false, render: { _: function (data, type, row) { return data ? data + (Number.isInteger(data) ? '.0' : '') : '0.0' } } },
            { data: 'singleengine_command', title: "Command", orderable: false, render: { _: function (data, type, row) { return data ? data + (Number.isInteger(data) ? '.0' : '') : '0.0' } } },
            { data: 'instrument_simulator', title: "Simulator", orderable: false, render: { _: function (data, type, row) { return data ? data + (Number.isInteger(data) ? '.0' : '') : '0.0' } } },
            { data: 'id', visible: false }
          ],
          "search": false,
          lengthChange: false,
          pageLength: 25,
        });
        loadGAData(this.params.id, "");
      }
    }

    function loadGAData(search = null, cursor = "")
    {
      $.ajax({
        type: "POST",
        url: "/graphql",
        contentType: "application/json",
        view: this,
        data: JSON.stringify({
          "query": `query Q {
            gaFlights(cursor: "${cursor}", limit: 125) {
              count
              data {
                id
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
              cursor
            }
          }`
        }),
        dataType: "json",
        success: async function (result, status, xhr) {
          $('#data').DataTable().rows.add(result.data.gaFlights.data);
          if (result.data.gaFlights.cursor) {
            loadGAData(search, result.data.gaFlights.cursor);
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