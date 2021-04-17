import {Subject} from "rxjs";

class Router {

  protected route: Subject<string> = new Subject();

  constructor() {
    this.route.next("/");
  }

  public navigateTo(route: string) {
    this.route.next(route);
  }

  public getSubject(): Subject<string> {
    return this.route;
  }

}

export const router: Router = new Router();
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


export function getClass(elem: HTMLAnchorElement, ...classNames:string[]): string {
  if(!elem) return "";

  const path = elem?.pathname;
  if (path && path === internalRoute) {
    elem.classList.add("selected");
  } else {
    elem.classList.remove("selected");
  }
  classNames.forEach((className:string)=>{
    elem.classList.add(className);
  })

  return elem.classList.toString();
}
