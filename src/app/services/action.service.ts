import { Injectable } from '@angular/core';
import { Action } from '../models/action';
import { Subscriber, Observable, Subject, Subscription } from 'rxjs';

@Injectable()
export class ActionService {

    private actions: Action[] = [];
    private undo = new Subject<void>();
    private clear = new Subject<void>();
    undo$: Observable<void>;
    clear$: Observable<void>;

    constructor() {
        this.undo$ = this.undo.asObservable();
        this.clear$ = this.clear.asObservable();
    }

    add(action: Action) {
        this.actions.push(action);
        console.log(this.actions);
    }

    remove() {
        this.actions.pop();
        this.undo.next();
        console.log(this.actions);
    }

    get(): Action[] {        
        return this.actions;
    }

    clearAll() {
        this.actions = [];
        this.clear.next();
    }
}