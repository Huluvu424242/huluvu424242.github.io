import {EMPTY, from, Observable, timer} from "rxjs";
import {catchError, switchMap} from "rxjs/operators";
import {loadFeedRanking} from "../../../fetch-es6.worker";
import {StatisticData} from "@huluvu424242/liona-feeds/dist/esm/feeds/statistic";

export class StatisticLoader {

  public subscribeStatistiken(): Observable<StatisticData[]> {
    return timer(0, 60000 * 10)
      .pipe(
        switchMap(
          () => from(loadFeedRanking("https://huluvu424242.herokuapp.com/feeds")).pipe(catchError(() => EMPTY))
        )
      );
  }


}


