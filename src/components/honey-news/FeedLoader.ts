import {EMPTY, from, Observable, timer} from "rxjs";
import {FeedData, loadFeedData, Post} from "../../fetch-es6.worker";
import {catchError, filter, map, mergeMap, switchMap, tap, toArray} from "rxjs/operators";
import {Logger} from "../../libs/logger";
import {PipeOperators} from "./PipeOperators";

export class FeedLoader {

  /**
   * texte to speech out
   */
  feedURLs: string[] = [];

  constructor(feedURLs: string[]) {
    this.feedURLs = feedURLs || [];
  }

  public addFeedUrl(feedURL: string) {
    this.feedURLs.push(feedURL);
  }

  public getFeedsSingleObserver(feedURLs: string[]): Observable<Post[]> {
    return from(feedURLs).pipe(
      mergeMap(
        (url: string) => {
          Logger.debugMessage("### frage url " + url);
          return from(loadFeedData(url)).pipe(catchError(() => EMPTY));
        }
      ),
      mergeMap(
        (feedData: FeedData) => {
          Logger.debugMessage("### aktualisiere url " + feedData.url);
          return PipeOperators.mapItemsToPost(feedData).pipe(catchError(() => EMPTY));
        }
      ),
      tap(
        (post: Post) => Logger.debugMessage("### filter: " + post.item.title)
      ),
      filter(
        (post: Post) => PipeOperators.compareDates(post.exaktdate, new Date()) < 1
      ),
      toArray<Post>(),
      switchMap(
        // entferne doppelte Einträge mit gleichem hashkode
        (posts: Post[]) => PipeOperators.removeDuplicates(posts)
      ),
      map(
        (posts: Post[]) => PipeOperators.sortArray(posts)
      )
    )
  }

  public getFeedsPeriodicObserver(): Observable<Post[]> {
    return timer(0, 60000 * 5).pipe(
      mergeMap(
        () => from(this.getFeedsSingleObserver(this.feedURLs)).pipe(catchError(() => EMPTY))
      )
    )
  }
}




