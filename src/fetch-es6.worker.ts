import {Feed} from "feedme/dist/feedme";
import {FeedItem} from "feedme/dist/parser";
import {EMPTY, from} from "rxjs";
import {catchError, switchMap, tap} from "rxjs/operators";


export interface Post {
  hashcode: string;
  queryurl: string;
  feedtitle: string;
  exaktdate: Date;
  sortdate: string
  pubdate: string,
  item: FeedItem;
}

export interface ResponseData {
  status: number;
  statusText: string;
  json: JSON;
  text: string;
}

export interface FeedData {
  url: string;
  status: number;
  statusText: string;
  feedtitle: string;
  items: FeedItem[];
}

// async für stencil worker
export async function loadFeedData(url: string): Promise<FeedData> {
  return new Promise<FeedData>((resolve) => {
    const backendUrl: string = "https://huluvu424242.herokuapp.com/feed";
    const queryUrl: string = backendUrl + "?url=" + url+"&statistic=true";
    console.debug("###query url " + queryUrl);
    const getFeed = fetch(queryUrl, {
      method: 'GET', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    });
    const feedData$ = from(getFeed);
    const data: FeedData = {
      status: null, url: null, statusText: null, feedtitle: null, items: null
    };
    feedData$.pipe(
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
    ).subscribe(
      (feed: Feed) => {
        data.feedtitle = JSON.stringify(feed.title);
        data.items = feed.items;
        resolve(data);
      });
  });
}

