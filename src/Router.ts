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
// let internalRoute:string;
// const routerSubscription = router.getSubject().subscribe((route: string) => {
//     internalRoute = route;
//   },
//   (error) => {
//     console.error(error);
//   },
//   () => {
//     console.info("Router Subject' complete");
//   });





export const href = (route: string) => {
  router.navigateTo(route);
};
export const listenRouteChanges = (): Subject<string> => {
  return router.getSubject();
};

export const closeRouter = (): void => {
  router.getSubject().unsubscribe();
};

//
// function getClass():string{
//   const path = this?.href.pathname;
//   if(path==="/statistic"){
//     return "selected";
//   }else{
//     return "";
//   }
//   // if(path==="/statistic"){
//   //   this?.classList.add("selected");
//   // }else{
//   //   this?.classList.remove("selected");
//   // }
//   // return this?.classList.toString();
// }
