import { R as ReplaySubject } from './index-ae00f5bb.js';

class SimpleRouter {
  constructor() {
    this.route = new ReplaySubject();
    this.routes = new Map();
    window.onpopstate = () => {
      const route = this.routes.get(window.location.pathname);
      this.route.next(route);
      if (this.slot) {
        this.slot.innerHTML = route;
      }
    };
  }
  setSlotElement(slot) {
    this.slot = slot;
  }
  addRouteToSlot(route, content) {
    this.routes.set(route, content);
  }
  navigateToRoute(route) {
    window.history.pushState({}, route, window.location.origin + route);
    this.route.next(route);
    if (this.slot) {
      this.slot.innerHTML = this.routes.get(route);
    }
  }
  getRouteListener() {
    return this.route;
  }
}
const router = new SimpleRouter();
const setRouterSlotElement = (slot) => {
  router.setSlotElement(slot);
};
const addRoute = (route, content) => {
  router.addRouteToSlot(route, content);
};
const navigateToRoute = (route) => {
  router.navigateToRoute(route);
};

export { addRoute as a, navigateToRoute as n, setRouterSlotElement as s };
