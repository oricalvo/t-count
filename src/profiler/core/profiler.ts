import {EventEmitter, Injectable, NgZone} from "@angular/core";
import {Counter} from "./counter";
import {CounterSet} from "./counterSet";

@Injectable()
export class Profiler {
  private _protos: Counter[];
  private _global: CounterSet;
  private _current: CounterSet;
  private _activity: Activity;
  private _data: {};

  activityStarted: EventEmitter<CounterSet> = new EventEmitter<CounterSet>();
  counterUpdated: EventEmitter<Counter> = new EventEmitter<Counter>();

  constructor(private ngZone: NgZone) {
    this._protos = [];
    this._data = {};
    this._global = null;
    this._activity = null;
  }

  get global(): CounterSet {
    return this._global;
  }

  get current(): CounterSet {
    return this._current;
  }

  init(counters: Counter[]) {
    for(let counter of counters) {
      this.add(counter);
    }

    this._global = this.createSet("global");
    this._current = this.createSet("current");

    this.ngZone.onUnstable.subscribe(() => {
      this.onVmTurnStarted();
    });

    this.ngZone.onStable.subscribe(()=> {
      this.onVmTurnEnded();
    });

    this.onVmTurnStarted();
  }

  private onVmTurnStarted() {
    console.log("onVmTurnStarted");

    let activity: Activity = Zone.current.get("activity");
    if(activity) {
      this._activity = activity;
      return;
    }

    this._current.reset();
    this._activity = new Activity(this._current);
    this._activity.onBegin();
  }

  private onVmTurnEnded() {
    if(this._activity) {
      this._activity.checkEnd();
      this._activity = null;
    }

    console.log("onVmTurnEnded");
  }

  setData(name: string, value: any) {
    this._data[name] = value;
  }

  getData(name: string): any {
    return this._data[name];
  }

  private add(counter: Counter) {
    this._protos.push(counter);

    counter.onAddedAsProto(this);
  }

  run(func) {
    if(Zone.current.get("activity")) {
      return func();
    }

    const activity: Activity = this._activity;

    const spec: ZoneSpec = {
      name: "activity",
      properties: {
        activity: activity,
      },
      onHasTask: function(delegate: ZoneDelegate, currentZone: Zone, targetZone: Zone, hasTaskState: HasTaskState) {
        delegate.hasTask(targetZone, hasTaskState);

        if (currentZone === targetZone) {
          if (hasTaskState.change == 'microTask') {
            activity.hasPendingMicrotasks = hasTaskState.microTask;
          }
          else if (hasTaskState.change == 'macroTask') {
            activity.hasPendingMacrotasks = hasTaskState.macroTask;
          }

          //activity.checkEnd();
        }
      }
    };

    const zone = Zone.current.fork(spec);

    return zone.run(func);
  }

  // get globalSet() {
  //   if(!this.global) {
  //     this.global = this.createSet("global");
  //   }
  //
  //   return this.global;
  // }
  //
  // get lastSet() {
  //   return this.current;
  // }

  private createSet(name: string) {
    const set = new CounterSet(name, this);

    for(let counter of this._protos) {
      set.add(counter.clone());
    }

    return set;
  }

  _onCounterUpdated(counter: Counter) {
    this.counterUpdated.emit(counter);
  }

  private retrieve(): CounterSet[] {
    const sets: CounterSet[] = [this._global];

    if(this._activity) {
      sets.push(this._current);
    }

    return sets;
  }

  updateCounter(proto: Counter, value: any, inc: boolean) {
    for(let set of this.retrieve()) {
      set.updateCounter(proto, value, inc);
    }
  }

  incCounter(proto: Counter) {
    for(let set of this.retrieve()) {
      set.incCounter(proto);
    }
  }

  decCounter(proto: Counter) {
    for(let set of this.retrieve()) {
      set.decCounter(proto);
    }
  }

  resetCounter(proto: Counter) {
    for(let set of this.retrieve()) {
      set.resetCounter(proto);
    }
  }
}

class Activity {
  counters: CounterSet;
  hasPendingMicrotasks: boolean;
  hasPendingMacrotasks: boolean;

  constructor(counters: CounterSet) {
    this.counters = counters;
    this.hasPendingMacrotasks = false;
    this.hasPendingMicrotasks = false;
  }

  checkEnd() {
    if(!this.hasPendingMicrotasks && !this.hasPendingMacrotasks) {
      this.onEnd();
    }
  }

  onBegin() {
    console.log("Activity BEGIN");
  }

  onEnd() {
    console.log("Activity END");
  }
}
