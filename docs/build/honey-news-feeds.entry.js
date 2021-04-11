import { r as registerInstance, h } from './index-962e0e26.js';
import { L as Logger } from './logger-358e14e7.js';

const feedsCss = "";

const Feeds = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
  }
  addUrl(event) {
    event = event;
    // const url = this.inputNewUrl.value;
    // if (!this.feedLoader.getFeedURLs().includes(url)) {
    //
    //   this.feedLoader.addFeedUrl(url);
    //   from(getFeedsSingleObserver([url], true)).subscribe();
    //   setTimeout(
    //     () => {
    //       from(getFeedsSingleObserver([url], false)).subscribe();
    //       // from(loadFeedRanking("https://huluvu424242.herokuapp.com/feeds")).pipe(catchError(() => EMPTY))
    //       //   .subscribe(
    //       //     (statisticDatas: StatisticData[]) => {
    //       //       this.statistic = [...statisticDatas];
    //       //     }
    //       //   );
    //     }
    //     , 3000
    //   );
    // }
  }
  render() {
    Logger.debugMessage('##RENDER##');
    return (h("div", { class: "paper form-group" }, h("h2", null, "Verwaltung"), h("input", { id: "newurl", ref: (el) => this.inputNewUrl = el }), h("button", { id: "addurl", onClick: (event) => this.addUrl(event) }, "Add Feed URL")));
  }
  static get assetsDirs() { return ["assets"]; }
};
Feeds.style = feedsCss;

export { Feeds as honey_news_feeds };
