import RedirectView from "./views/RedirectView.js";
import RPTFlightsView from "./views/RPTFlightsView.js";
import GAFlightsView from "./views/GAFlightsView.js";

const pathToRegex = path => new RegExp("^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)") + "$");

const router = async () => {
    const routes = [
        { path: "/", view: RedirectView, redirect: "https://coley.au" },
        { path: "/rptflights/:id", view: RPTFlightsView },
        { path: "/rptflights/?", view: RPTFlightsView },
        { path: "/gaflights/:id", view: GAFlightsView },
        { path: "/gaflights/?", view: GAFlightsView }
    ];

    const potentialMatches = routes.map(route => {
        return {
            route,
            result: location.pathname.match(pathToRegex(route.path))
        };
    });


    let match = potentialMatches.find(potentialMatch => potentialMatch.result !== null);

    /* Route not found - return first route OR a specific "not-found" route */
    if (!match) {
        match = {
            route: routes[0],
            result: [location.pathname]
        };
    }

    console.log(match);

    const view = new match.route.view(getParams(match));
    document.querySelector("#content").innerHTML = await view.getHtml();

    if (match.route.redirect) {
        await new Promise(r => setTimeout(r, 2000));
        // window.location.href = match.route.redirect;
    }

    // Execute loadData function if it exists
    if (view.loadData) {
        await view.loadData();
    }
}

const navigateTo = url => {
    history.pushState(null, null, url);
    router();
};

const getParams = match => {
    const values = match.result.slice(1);
    const keys = Array.from(match.route.path.matchAll(/:(\w+)/g)).map(result => result[1]);

    return Object.fromEntries(keys.map((key, i) => {
        return [key, values[i]];
    }));
};

document.addEventListener("DOMContentLoaded", () => {
    document.body.addEventListener("click", e => {
        if (e.target.matches("[data-link]")) {
            e.preventDefault();
            navigateTo(e.target.href);
        }
    });

    /* Document has loaded -  run the router! */
    router();
});

window.addEventListener("popstate", router);