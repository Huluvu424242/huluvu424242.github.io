import {FeedData, Post} from "../fetch-es6.worker";
import {EMPTY, from, Observable} from "rxjs";
import {map, toArray} from "rxjs/operators";
import {FeedItem} from "feedme/dist/parser";
import * as objectHash from "object-hash";
import DateTimeFormat = Intl.DateTimeFormat;
import {Logger} from "./logger";

export class PipeOperators {

  protected static padTo2(zahl: number): string {
    return zahl <= 9 ? "0" + zahl : "" + zahl;
  }

  public static removeDuplicates(posts: Post[]) :Observable<Post[]>{
    const postMap: Map<string, Post> = new Map();
    posts.forEach(
      (post: Post) => {
        postMap.set(post.hashcode, post);
      }
    );
    return from(postMap.values()).pipe(toArray());

  }

  public static sortiereAbsteigend(lp: Post, rp: Post) {
    const aIstGroesser: number = -1;
    const aIstKleiner: number = 1;
    const a: string = lp.sortdate;
    const b: string = rp.sortdate;
    if (!a) {
      return aIstKleiner;
    }
    if (!b) {
      return aIstGroesser;
    }
    if (a > b) {
      return aIstGroesser;
    } else if (b > a) {
      return aIstKleiner;
    } else {
      return 0
    }
  }

  public static sortArray(posts: Post[]): Post[] {
    const sortedPosts: Post[] = [...posts];
    return sortedPosts.sort(PipeOperators.sortiereAbsteigend);
  }

  public static mapItemsToPost(feedData: FeedData): Observable<Post> {
    if (!feedData || !feedData.items || feedData.items.length < 1) return EMPTY;
    return from(feedData.items).pipe(
      map(
        (feeditem: FeedItem) => {
          const date: Date = this.getDateFromFeedItem(feeditem);
          const formatedDate = this.getFormattedDate(date);
          const title: string = feeditem.title as string;
          const sortDate = PipeOperators.getSortedDate(date, title);
          const post: Post = {
            hashcode: null,
            queryurl: feedData.url,
            feedtitle: feedData.feedtitle,
            exaktdate: date,
            sortdate: sortDate,
            pubdate: formatedDate, // + " \t{" + sortDate + "}\t",
            item: feeditem
          };
          const partToHash: string = post.feedtitle + post.item.title + post.queryurl;
          post.hashcode = objectHash.sha1(partToHash);
          return post;
        }
      )
    );
  }

  public static getFormattedDate(date: Date): string {
    const minuteFormat: DateTimeFormat = new DateTimeFormat("de-DE",
      {year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric'});
    return date ? minuteFormat.format(date) : null;
  }

  public static getDateFromFeedItem(feedItem): Date {
    let datum: string;
    if (feedItem.pubdate) {
      datum = feedItem.pubdate;
    } else if (feedItem.updated) {
      datum = feedItem.updated;
    } else {
      datum = feedItem["dc:date"];
    }
    let date: Date = null;
    try {
      if (datum) {
        date = new Date(Date.parse(datum));
      }
    } catch (fehler) {
      Logger.errorMessage(fehler);
    }
    return date ? date : null;
  }


  public static getSortedDate(date: Date, title: string): string {
    if (date) {
      const year: number = date.getUTCFullYear();
      const month: number = date.getUTCMonth() + 1;
      const day: number = date.getUTCDate();
      const hour: number = date.getUTCHours();
      const minute: number = date.getUTCMinutes();
      const gruppe: number = Math.floor(minute / 60);
      return ""
        + year + '#'
        + this.padTo2(month) + '#'
        + this.padTo2(day) + '#'
        + this.padTo2(hour) + '#'
        // + this.padTo2(minute) + '#'
        + gruppe + '#'
        + title
    } else {
      return null;
    }
  }

  protected static getTimeString(date: Date) {
    const year: number = date.getUTCFullYear();
    const month: number = date.getUTCMonth() + 1;
    const day: number = date.getUTCDate();
    const hour: number = date.getUTCHours();
    const minute: number = date.getUTCMinutes();
    return ""
      + year
      + this.padTo2(month)
      + this.padTo2(day)
      + this.padTo2(hour)
      + this.padTo2(minute);
  }

  public static compareDates(date1: Date, date2: Date) {
    if (!date1) return -1;
    if (!date2) return 1;
    const timeString1: string = this.getTimeString(date1);
    const timeString2: string = this.getTimeString(date2);
    if (timeString1 < timeString2) {
      return -1;
    } else if (timeString2 < timeString1) {
      return 1;
    } else {
      return 0;
    }
  }
}
