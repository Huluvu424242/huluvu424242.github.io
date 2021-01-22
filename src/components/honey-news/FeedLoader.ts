import {from, Observable} from "rxjs";
import {FeedData, loadFeedData, Post} from "../../fetch-es6.worker";
import {filter, map, mergeMap, reduce, tap} from "rxjs/operators";
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

  protected loadFeedContent(): Observable<Post> {
    const urlObservable: Observable<string> = from(this.feedURLs);
    return urlObservable.pipe(
      mergeMap(
        (url: string) => {
          console.log("### frage url " + url);
          return from(loadFeedData(url));
        }
      ),
      mergeMap(
        (feedData: FeedData) => {
          console.log("### aktualisiere url " + feedData.url)
          return PipeOperators.mapItemsToPost(feedData);
        }
      ),
      tap(
        (post: Post) => console.log("### Date: " + PipeOperators.compareDates(post.exaktdate, new Date())
          + "#"
          + post.item.title)
      ),
      filter((post: Post) => PipeOperators.compareDates(post.exaktdate, new Date())<1),
      reduce((posts: Post[], item: Post) => posts.concat(item), []),
      tap(
        (postings: Post[]) => postings.forEach((post) => console.log("### unsortiert post: " + post.sortdate))
      ),
      map((list: Post[]) => PipeOperators.sortArray(list)),
      mergeMap(list => list),
    );
  }

  public async loadFeeds(): Promise<Post[]> {
    const posts: Post[] = [];
    return new Promise(
      (resolve, reject) => {
        this.loadFeedContent().subscribe(
          {
            next: (post: Post) => posts.push(post),
            error: (error) => reject(error),
            complete: () => {
              console.log("###complete with:\n" + JSON.stringify(posts));
              // resolve the promise to continue after data load
              resolve(posts);
            }
          }
        )
      }
    );
  }


}
