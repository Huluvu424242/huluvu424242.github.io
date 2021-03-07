import {EMPTY, from, Subject, timer} from "rxjs";
import {FeedData, loadFeedData, Post} from "../../fetch-es6.worker";
import {catchError, filter, mergeMap, tap} from "rxjs/operators";
import {PipeOperators} from "./PipeOperators";

export class FeedLoader {

  /**
   * texte to speech out
   */
  feedURLs: string[] = [];


  hashcodes: Set<string> = new Set<string>();
  feedEntries: Post[] = [];
  posts$: Subject<Post[]> = new Subject();

  constructor(feedURLs: string[]) {
    this.feedURLs = feedURLs || [];
  }

  public addFeedUrl(feedURL: string) {
    this.feedURLs.push(feedURL);
  }

  public loadFeedContent(): Subject<Post[]> {
    timer(0, 120000).pipe(
      mergeMap(
        () => from(this.feedURLs)
      ),
      mergeMap(
        (url: string) => {
          console.log("### frage url " + url);
          return from(loadFeedData(url)).pipe(catchError(() => EMPTY));
        }
      ),
      mergeMap(
        (feedData: FeedData) => {
          console.log("### aktualisiere url " + feedData.url);
          return PipeOperators.mapItemsToPost(feedData).pipe(catchError(() => EMPTY));
        }
      ),
      tap(
        (post: Post) => console.log("### filter: " + post.item.title)
      ),
      filter((post: Post) => {
          return PipeOperators.compareDates(post.exaktdate, new Date()) < 1
        }
      )
    ).subscribe(
      {
        next: (post: Post) => {
          console.log("### add feeds with hash: "+post.hashcode +'#'+post.item.title);
          if (!this.hashcodes.has(post.hashcode)) {
            this.feedEntries.push(post);
            this.hashcodes.add(post.hashcode);
            const sortedPosts: Post[] = PipeOperators.sortArray(this.feedEntries);
            this.posts$.next(sortedPosts);
          }
        }
      }
    );
    return this.posts$;
  }
}




