import type { Commands, Route } from "@vaadin/router";
import { Router } from "@vaadin/router";
import "@mariozechner/mini-lit/dist/ThemeToggle.js";
import "./styles.css";

// Import pages
import "./pages/home.js";

// Setup router
const outlet = document.getElementById("outlet");
if (!outlet) {
  throw new Error("Outlet element not found");
}

const router = new Router(outlet);

const routes: Route[] = [
  {
    path: "/",
    component: "page-home",
  },
  {
    path: "(.*)",
    action: (_context, commands) => {
      return commands.redirect("/");
    },
  },
];

router.setRoutes(routes);
