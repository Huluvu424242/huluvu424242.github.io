import {ReplaySubject, Subject} from "rxjs";

class SimpleRouter {

  protected routes: Map<string, string>;

  protected route: Subject<string> = new ReplaySubject<string>();

  protected slot: HTMLElement;

  constructor() {
    this.routes = new Map();
    window.onpopstate = () => {
      const route: string = this.routes.get(window.location.pathname);
      this.route.next(route);
      if (this.slot) {
        this.slot.innerHTML = route;
      }
    }
  }

  setSlotElement(slot: HTMLElement) {
    this.slot = slot;
  }

  addRouteToSlot(route: string, content: string) {
    this.routes.set(route, content);
  }

  public navigateToRoute(route: string) {
    window.history.pushState({}, route, window.location.origin + route);
    this.route.next(route);
    if (this.slot) {
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




