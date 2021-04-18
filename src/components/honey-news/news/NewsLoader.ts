import {EMPTY, from, Observable, timer} from "rxjs";
import {getFeedsSingleObserver, Post} from "../../../fetch-es6.worker";
import {catchError, mergeMap} from "rxjs/operators";

export class NewsLoader {

  /**
   * texte to speech out
   */
  protected feedURLs: string[] = [];

  constructor(feedURLs: string[]) {
    this.feedURLs = feedURLs || [];
  }

  public getFeedURLs(): string[] {
    return [...this.feedURLs];
  }

  public addFeedUrl(feedURL: string) {
    this.feedURLs.push(feedURL);
  }


  public getFeedsPeriodicObserver(): Observable<Post[]> {
    return timer(0, 60000 * 5).pipe(
      mergeMap(
        () => from(getFeedsSingleObserver(this.feedURLs, true)).pipe(catchError(() => EMPTY))
      )
    )
  }
}




