// frontend/static/js/views/Dashboard.js
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
          Blog
          <small class="text-muted">coley.au</small>
        </h3>
        <div class="row">
          <div class="col-md-12">
            If you are not redirected automatically, follow this <a href='https://coley.au'>link</a>.
          </div>
        </div>
        <br />
        <br />
        `;
    }
}