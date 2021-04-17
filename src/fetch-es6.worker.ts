import {Feed} from "feedme/dist/feedme";
import {FeedItem} from "feedme/dist/parser";
import {EMPTY, from, Observable} from "rxjs";
import {catchError, filter, map, mergeMap, switchMap, tap, toArray} from "rxjs/operators";
import {Logger} from "./shared/logger";
import {StatisticData} from "@huluvu424242/liona-feeds/dist/esm/feeds/statistic";
import {isArray} from "rxjs/internal-compatibility";
import {PipeOperators} from "./shared/PipeOperators";


export interface Post {
  hashcode: string;
  queryurl: string;
  feedtitle: string;
  exaktdate: Date;
  sortdate: string
  pubdate: string,
  item: FeedItem;
}

export interface FeedData {
  url: string;
  status: number;
  statusText: string;
  feedtitle: string;
  items: FeedItem[];
}


// async für stencil worker
export async function loadFeedData(url: string, withStatistic: boolean): Promise<FeedData> {
  return loadFeedDataInternal(url, withStatistic).toPromise();
}

function loadFeedDataInternal(url: string, withStatistic: boolean): Observable<FeedData> {
  const backendUrl: string = "https://huluvu424242.herokuapp.com/feed";
  let queryUrl: string;
  if (withStatistic) {
    queryUrl = backendUrl + "?url=" + url + "&statistic=true";
  } else {
    queryUrl = backendUrl + "?url=" + url;
  }
  Logger.debugMessage("###query url " + queryUrl);
  const data: FeedData = {
    status: null, url: null, statusText: null, feedtitle: null, items: null
  };
  const fetch$ = from(fetch(queryUrl, {
    method: 'GET', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
  }));
  return fetch$.pipe(
    tap(
      (response: Response) => {
        data.status = response.status;
        data.statusText = response.statusText;
        data.url = queryUrl;
      }
    ),
    switchMap(
      (response: Response) => from(response.json()).pipe(catchError(() => EMPTY))
    ),
    map(
      (feed: Feed) => {
        data.feedtitle = JSON.stringify(feed.title);
        data.items = feed.items;
        return data;
      }
    )
  );
}

// async für stencil worker
export async function loadFeedRanking(url: string): Promise<StatisticData[]> {
  return from(fetch(url))
    .pipe(
      catchError(() => EMPTY),
      switchMap(
        (response: Response) => from(response.json()).pipe(catchError(() => EMPTY))
      ),
      filter(
        (rawData: any) => isArray(rawData)
      ),
      map(
        (items: any[]) => {
          const statistics: StatisticData[] = [];
          items.forEach(
            (item) => {
              const statistic: StatisticData = {
                score: item?.score,
                url: item?.url,
                countRequested: item?.countRequested,
                countContacted: item?.countContacted,
                countResponseOK: item?.countResponseOK
              };
              statistics.push(statistic);
            }
          );
          return statistics;
        }),
    ).toPromise();
}

export async function getFeedsSingleObserver(feedURLs: string[], withStatistic: boolean): Promise<Post[]> {
  return from(feedURLs).pipe(
    mergeMap(
      (url: string) => {
        Logger.debugMessage("### frage url " + url);
        return from(loadFeedDataInternal(url, withStatistic)).pipe(catchError(() => EMPTY));
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
  ).toPromise();
}

