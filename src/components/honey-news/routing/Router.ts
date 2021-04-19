class Router {

  protected routes: Map<string, string>;

  protected slot: HTMLElement;

  constructor() {
    this.routes = new Map();
    window.onpopstate = () => {
      if(this.slot) {
        this.slot.innerHTML = this.routes.get(window.location.pathname);
      }
    }
  }

  setSlotElement(slot: HTMLElement) {
    this.slot = slot;
  }

  addRoute(route: string, content: string) {
    this.routes.set(route, content);
  }

  public navigateTo(route: string) {
    window.history.pushState({}, route, window.location.origin + route);
    this.slot.innerHTML = this.routes.get(route);
  }

}

export const router: Router = new Router();

export const setRouterSlotElement = (slot: HTMLElement) => {
  router.setSlotElement(slot);
};

export const addRoute = (route: string, content: string) => {
  router.addRoute(route, content);
};

export const navigateToRoute = (route: string) => {
  router.navigateTo(route);
};




