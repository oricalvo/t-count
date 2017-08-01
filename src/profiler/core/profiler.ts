import {EventEmitter, Injectable, NgZone} from "@angular/core";
import {Counter} from "./counter";
import {CounterSet} from "./counterSet";

@Injectable()
export class Profiler {
  private _protos: Counter[];
  private _counterSetAll: CounterSet;
  private _counterSetLast: CounterSet;
  private _vmTurnActivity: Activity;
  private _data: {};
  private _sets: CounterSet[];

  activityStarted: EventEmitter<CounterSet> = new EventEmitter<CounterSet>();
  counterUpdated: EventEmitter<Counter> = new EventEmitter<Counter>();

  constructor(private ngZone: NgZone) {
    this._protos = [];
    this._data = {};
    this._counterSetAll = null;
    this._vmTurnActivity = null;
  }

  get sets(): CounterSet[] {
    return this._sets;
  }

  get all(): CounterSet {
    return this._counterSetAll;
  }

  get last(): CounterSet {
    return this._counterSetLast;
  }

  init(counters: Counter[]) {
    for(let counter of counters) {
      this.add(counter);
    }

    this._counterSetAll = this.createSet("all");
    this._counterSetLast = this.createSet("last");
    this._sets = [this._counterSetAll, this._counterSetLast];

    this.ngZone.onUnstable.subscribe(() => {
      this.onVmTurnStarted();
    });

    this.ngZone.onStable.subscribe(()=> {
      this.onVmTurnEnded();
    });

    this.onVmTurnStarted();
  }

  private onVmTurnStarted() {
    let activity: Activity = Zone.current.get("activity");
    if(activity) {
      this._vmTurnActivity = activity;
      return;
    }

    this._counterSetLast.reset();
    this._vmTurnActivity = new Activity(this._counterSetLast);
    this._vmTurnActivity.onBegin();
  }

  private onVmTurnEnded() {
    if(this._vmTurnActivity) {
      this._vmTurnActivity.checkEnd();
      this._vmTurnActivity = null;
    }
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

    const activity: Activity = this._vmTurnActivity;

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
    const sets: CounterSet[] = [this._counterSetAll];

    if(this._vmTurnActivity) {
      sets.push(this._counterSetLast);
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

  findActiveSetByName(name: string) {
    for(let counterSet of this._sets) {
      if(counterSet.name == name) {
        return counterSet;
      }
    }

    return null;
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
  }

  onEnd() {
  }
}
