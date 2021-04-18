import { B as BehaviorSubject } from './index-f5f0e77a.js';

class Router {
  constructor() {
    this.route = new BehaviorSubject("/");
    this.route.next("/");
  }
  navigateTo(route) {
    this.route.next(route);
  }
  getSubject() {
    return this.route;
  }
}
const router = new Router();
let internalRoute;
const routerSubscription = router.getSubject().subscribe((route) => {
  internalRoute = route;
}, (error) => {
  console.error("Internal Route:" + error);
}, () => {
  console.info("InternalRoute Subject' complete");
});
const href = (route) => {
  router.navigateTo(route);
};
const listenRouteChanges = () => {
  return router.getSubject();
};
const closeRouter = () => {
  router.getSubject().unsubscribe();
  routerSubscription.unsubscribe();
};
function getClass(elem, ...classNames) {
  if (!elem)
    return null;
  const path = elem === null || elem === void 0 ? void 0 : elem.pathname;
  if (path && path === internalRoute) {
    elem.classList.add("selected");
  }
  else {
    elem.classList.remove("selected");
  }
  classNames.forEach((className) => {
    elem.classList.add(className);
  });
  if (elem.classList.length === 0) {
    return null;
  }
  else {
    return elem.classList.toString();
  }
}

export { href as h, listenRouteChanges as l };
