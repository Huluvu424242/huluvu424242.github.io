import {ReplaySubject, Subject} from "rxjs";

class SimpleRouter {

  protected routes: Map<string, string>;

  protected route: Subject<string> = new ReplaySubject<string>();

  protected routenprefix: string;

  protected slot: HTMLElement;

  constructor() {
    this.routenprefix = "";
    this.routes = new Map();
    window.onpopstate = () => {
      // push route name
      const route: string = window.location.pathname;

      this.route.next(route.replace(this.routenprefix, ""));
      if (this.slot) {
        // push route context
        this.slot.innerHTML = this.routes.get(route);
      }
    }
  }

  setRoutenPrefix(routenprefix: string) {
    if (routenprefix && routenprefix !== "/") {
      this.routenprefix = routenprefix;
    }
  }

  setSlotElement(slot: HTMLElement) {
    this.slot = slot;
  }

  addRouteToSlot(route: string, content: string) {
    // assign context to route
    this.routes.set(route, content);
  }

  public navigateToRoute(route: string) {
    // push route name to browser history
    window.history.pushState({}, route, window.location.origin + this.routenprefix + route);
    // push route name
    this.route.next(route);
    if (this.slot) {
      // push route context
      this.slot.innerHTML = this.routes.get(route);
    }
  }

  public getRouteListener(): Subject<string> {
    return this.route;
  }
}

export const router: SimpleRouter = new SimpleRouter();

export const setRouterSlotElement = (slot: HTMLElement) => {
  router.setSlotElement(slot);
};

export const addRoute = (route: string, content: string) => {
  router.addRouteToSlot(route, content);
};

export const navigateToRoute = (route: string) => {
  router.navigateToRoute(route);
};




