import {EMPTY, from, Observable, Subject, timer} from "rxjs";
import {FeedData, loadFeedData, Post} from "../../fetch-es6.worker";
import {catchError, filter, mergeMap, switchMap, tap} from "rxjs/operators";
import {PipeOperators} from "./PipeOperators";
import {Logger} from "../../libs/logger";

export class FeedLoader {

  /**
   * texte to speech out
   */
  feedURLs: string[] = [];


  hashcodes: Set<string> = new Set<string>();
  feedEntries: Post[] = [];


  constructor(feedURLs: string[]) {
    this.feedURLs = feedURLs || [];
  }

  public addFeedUrl(feedURL: string) {
    this.feedURLs.push(feedURL);
  }

  public getFeedsSingleObserver(): Subject<Post[]> {
    const posts$: Subject<Post[]> = new Subject();
    from(this.feedURLs).pipe(
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
      filter((post: Post) => {
          return PipeOperators.compareDates(post.exaktdate, new Date()) < 1
        }
      )
    ).subscribe(
      {
        next: (post: Post) => {
          Logger.debugMessage("### add feeds with hash: "+post.hashcode +'#'+post.item.title);
          if (!this.hashcodes.has(post.hashcode)) {
            this.feedEntries.push(post);
            this.hashcodes.add(post.hashcode);
            const sortedPosts: Post[] = PipeOperators.sortArray(this.feedEntries);
            posts$.next(sortedPosts);
          }
        }
      }
    );
    return posts$;
  }

  public getFeedsPeriodicObserver(): Observable<Post[]> {
    return timer(0, 60000*5).pipe(
      switchMap(
        ()=> this.getFeedsSingleObserver()
      )
    )
  }

  // public getFeedsPeriodicObserver(): Subject<Post[]> {
  //   timer(0, 60000*5).pipe(
  //     mergeMap(
  //       () => from(this.feedURLs)
  //     ),
  //     mergeMap(
  //       (url: string) => {
  //         Logger.debugMessage("### frage url " + url);
  //         return from(loadFeedData(url)).pipe(catchError(() => EMPTY));
  //       }
  //     ),
  //     mergeMap(
  //       (feedData: FeedData) => {
  //         Logger.debugMessage("### aktualisiere url " + feedData.url);
  //         return PipeOperators.mapItemsToPost(feedData).pipe(catchError(() => EMPTY));
  //       }
  //     ),
  //     tap(
  //       (post: Post) => Logger.debugMessage("### filter: " + post.item.title)
  //     ),
  //     filter((post: Post) => {
  //         return PipeOperators.compareDates(post.exaktdate, new Date()) < 1
  //       }
  //     )
  //   ).subscribe(
  //     {
  //       next: (post: Post) => {
  //         Logger.debugMessage("### add feeds with hash: "+post.hashcode +'#'+post.item.title);
  //         if (!this.hashcodes.has(post.hashcode)) {
  //           this.feedEntries.push(post);
  //           this.hashcodes.add(post.hashcode);
  //           const sortedPosts: Post[] = PipeOperators.sortArray(this.feedEntries);
  //           this.posts$.next(sortedPosts);
  //         }
  //       }
  //     }
  //   );
  //   return this.posts$;
  // }
}




