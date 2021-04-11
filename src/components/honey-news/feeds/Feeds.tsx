import {Component, h} from "@stencil/core";
import {Logger} from "../../../libs/logger";

@Component({
  tag: "honey-news-feeds",
  styleUrl: "Feeds.css",
  assetsDirs: ['assets'],
  shadow: true
})
export class Feeds {

  /**
   * Input Element
   */
  inputNewUrl: HTMLInputElement;

  addUrl(event: UIEvent): void {
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

  public render() {
    Logger.debugMessage('##RENDER##');
    return (
      <div class="paper form-group">
        <h2>Verwaltung</h2>

        <input id="newurl" ref={(el) => this.inputNewUrl = el as HTMLInputElement}/>
        <button id="addurl" onClick={(event: UIEvent) => this.addUrl(event)}>Add Feed URL</button>
      </div>
    );
  }
}
