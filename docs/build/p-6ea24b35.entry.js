import{r as t,h as s,H as i,g as e}from"./p-1de4922b.js";import{f as h,l as n,L as r}from"./p-8e815e86.js";import{S as a,a as l,i as u,t as o,c}from"./p-91e26ff0.js";import{m as d,E as b}from"./p-32d6850d.js";function p(t,s){return"function"==typeof s?i=>i.pipe(p(((i,e)=>h(t(i,e)).pipe(d(((t,h)=>s(i,t,e,h))))))):s=>s.lift(new f(t))}class f{constructor(t){this.project=t}call(t,s){return s.subscribe(new m(t,this.project))}}class m extends a{constructor(t,s){super(t),this.project=s,this.index=0}_next(t){let s;const i=this.index++;try{s=this.project(t,i)}catch(t){return void this.destination.error(t)}this._innerSub(s)}_innerSub(t){const s=this.innerSubscription;s&&s.unsubscribe();const i=new l(this),e=this.destination;e.add(i),this.innerSubscription=u(t,i),this.innerSubscription!==i&&e.add(this.innerSubscription)}_complete(){const{innerSubscription:t}=this;t&&!t.closed||super._complete(),this.unsubscribe()}_unsubscribe(){this.innerSubscription=void 0}notifyComplete(){this.innerSubscription=void 0,this.isStopped&&super._complete()}notifyNext(t){this.destination.next(t)}}class g{subscribeStatistiken(){return o(0,6e5).pipe(p((()=>h(n("https://huluvu424242.herokuapp.com/feeds")).pipe(c((()=>b))))))}}const k=class{constructor(s){t(this,s),this.createAriaLabel=!1,this.createTitleText=!1,this.taborder="0",this.statisticLoader=new g,this.lastUpdate=null,this.options={disabledHostClass:"honey-news-statistic-disabled",enabledHostClass:"honey-news-statistic-enabled",disabledTitleText:"Noch keine Statistik verfügbar",titleText:"Statistische Übersicht",ariaLabel:"Statistiken zur Aufrufhäufigkeit der Feeds"},this.verbose=!1,this.lastHour=null}connectedCallback(){this.ident=this.hostElement.id?this.hostElement.id:Math.random().toString(36).substring(7),this.initialHostClass=this.hostElement.getAttribute("class")||null,this.createTitleText=!this.hostElement.title,this.createAriaLabel=!this.hostElement.alt,this.taborder=this.hostElement.getAttribute("tabindex")?this.hostElement.tabIndex+"":"0",r.toggleLogging(this.verbose),this.statisticSubscription=this.subscribeStatistics()}disconnectedCallback(){this.statisticSubscription.unsubscribe()}subscribeStatistics(){return this.statisticLoader.subscribeStatistiken().subscribe((t=>this.statistic=[...t]))}async updateOptions(t){for(let s in t)t.hasOwnProperty(s)&&(this.options[s]=t[s]);this.options=Object.assign({},this.options)}hasNoStatistics(){return!this.statistic||this.statistic.length<1}createNewTitleText(){return this.hasNoStatistics()?this.options.disabledTitleText:this.options.titleText}getTitleText(){return this.createTitleText?this.createNewTitleText():this.hostElement.title}createNewAriaLabel(){return this.options.ariaLabel}getAriaLabel(){return this.createAriaLabel?this.createNewAriaLabel():this.hostElement.getAttribute("aria-label")}getHostClass(){let t=this.initialHostClass;return this.hasNoStatistics()?t+" "+this.options.disabledHostClass:t+" "+this.options.enabledHostClass}render(){var t;return r.debugMessage("##RENDER##"),s(i,{title:this.getTitleText(),"aria-label":this.getAriaLabel(),tabindex:this.hasNoStatistics()?-1:this.taborder,class:this.getHostClass(),disabled:this.hasNoStatistics()},s("table",null,s("tr",null,s("th",null,"Score"),s("th",null,"Url"),s("th",null,"Angefragt"),s("th",null,"Kontaktiert"),s("th",null,"Geantwortet")),null===(t=this.statistic)||void 0===t?void 0:t.map((t=>s("tr",null,s("td",null,t.score),s("td",null,s("a",{href:t.url,target:"_blank"},t.url)),s("td",null,t.countRequested),s("td",null,t.countContacted),s("td",null,t.countResponseOK))))))}static get assetsDirs(){return["assets"]}get hostElement(){return e(this)}};k.style="";export{k as honey_news_statistic}