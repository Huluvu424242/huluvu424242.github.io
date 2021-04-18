import {Component, h, Host, Prop} from "@stencil/core";
import {Logger} from "../../../shared/logger";
import {NewsLoader} from "../news/NewsLoader";
import {from} from "rxjs";
import {getFeedsSingleObserver} from "../../../fetch-es6.worker";

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

  /**
   * Hilfsklasse zum Laden der Daten
   */
  @Prop({mutable:true}) feedLoader: NewsLoader;

  addUrl(event: UIEvent): void {
    event = event;
    if(!this.feedLoader) return;
    const url = this.inputNewUrl.value;
    if (!this.feedLoader.getFeedURLs().includes(url)) {

      this.feedLoader.addFeedUrl(url);
      from(getFeedsSingleObserver([url], true)).subscribe();
      // setTimeout(
      //   () => {
      //     from(getFeedsSingleObserver([url], false)).subscribe();
      //     // from(loadFeedRanking("https://huluvu424242.herokuapp.com/feeds")).pipe(catchError(() => EMPTY))
      //     //   .subscribe(
      //     //     (statisticDatas: StatisticData[]) => {
      //     //       this.statistic = [...statisticDatas];
      //     //     }
      //     //   );
      //   }
      //   , 3000
      // );
    }
  }

  public render() {
    Logger.debugMessage('##RENDER##');
    return (
      <Host>
        <div class="form-group">
          <h2>Verwaltung</h2>
          <div class="row">
            <label class="sm-1 col border label" htmlFor="newurl">Feed URL:</label>
            <input id="newurl" class="col-fill col" type="text" ref={(el) => this.inputNewUrl = el as HTMLInputElement}/>
            <button id="addurl" class="paper-btn btn-primary"
                    onClick={(event: UIEvent) => this.addUrl(event)}>Add Feed URL</button>
          </div>
        </div>
      </Host>
    );
  }
}
