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
export const href = (route: string) => {
  router.navigateTo(route);
};
export const listenRouteChanges = (): Subject<string> => {
  return router.getSubject();
}

export const closeRouter = (): void => {
  router.getSubject().unsubscribe();
}
