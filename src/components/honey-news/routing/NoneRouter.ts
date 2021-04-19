import {BehaviorSubject, Subject} from "rxjs";

class NoneRouter {

  protected route: Subject<string> = new BehaviorSubject<string>("/");

  constructor() {
    this.route.next("/");
  }

  public navigateTo(route: string) {
    this.route.next(route);
    // history.pushState({}, route, window.location.origin + route);
  }

  public getSubject(): Subject<string> {
    return this.route;
  }

}

export const router: NoneRouter = new NoneRouter();
let internalRoute: string;
const routerSubscription = router.getSubject().subscribe((route: string) => {
    internalRoute = route;
  },
  (error) => {
    console.error("Internal Route:" + error);
  },
  () => {
    console.info("InternalRoute Subject' complete");
  });


export const href = (route: string) => {
  router.navigateTo(route);
};
export const listenRouteChanges = (): Subject<string> => {
  return router.getSubject();
};

export const closeRouter = (): void => {
  router.getSubject().unsubscribe();
  routerSubscription.unsubscribe();
};


export function getClass(elem: HTMLAnchorElement, ...classNames: string[]): string {
  if (!elem) return null;

  const path = elem?.pathname;
  if (path && path === internalRoute) {
    elem.classList.add("selected");
  } else {
    elem.classList.remove("selected");
  }
  classNames.forEach((className: string) => {
    elem.classList.add(className);
  });

  if (elem.classList.length === 0) {
    return null;
  } else {
    return elem.classList.toString();
  }
}
