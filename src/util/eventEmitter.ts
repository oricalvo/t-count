export interface EventEmitterListener<T> {
    (arg: T): void;
}

export class EventEmitter<T> {
    listeners: EventEmitterListener<T>[];

    constructor() {
        this.listeners = [];
    }

    emit(arg: T) {
        for(let l of this.listeners) {
            l(arg);
        }
    }

    subscribe(listener: EventEmitterListener<T>) {
        this.listeners.push(listener);

        return () => {
            const index = this.listeners.indexOf(listener);
            if(index!=-1) {
                this.listeners.splice(index, 1);
            }
        }
    }
}
