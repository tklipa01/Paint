import { Injectable } from '@angular/core';
import { Action } from '../models/action';
import { Observable, Subject, from } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { RoomService } from './room.service';
import { Observer } from 'firebase';

@Injectable()
export class ActionService {

    private actions: Action[] = [];
    private undo = new Subject<void>();
    private clear = new Subject<void>();
    private actionReady = new Subject<void>();
    undo$: Observable<void>;
    clear$: Observable<void>; 
    actions$: Observable<Action[]>;
    actionReady$: Observable<void>;

    constructor(private db: AngularFirestore, private roomService: RoomService) {        
        this.undo$ = this.undo.asObservable();
        this.clear$ = this.clear.asObservable(); 
        this.actionReady$ = this.actionReady.asObservable();
    }

    setActionObservable(roomId: string) {
        this.actions$ = this.db.collection<Action>(`/rooms/${roomId}/actions`, ref => ref.orderBy('timestamp')).valueChanges();
        this.actions$.subscribe((actions) => {
            this.actions = actions;
        });
        this.actionReady.next();
    }

    add(action: Action) {
        action.timestamp = new Date().getTime();
        this.actions.push(action);
        this.db.collection(`/rooms/${this.roomService.roomId}/actions`).add(JSON.parse(JSON.stringify(action)));        
    }

    get() {
        return this.actions;
    }

    async remove() {
        const query = await this.db.collection(`/rooms/${this.roomService.roomId}/actions`, ref => ref.orderBy('timestamp')).get().toPromise();
        const deleteDoc = query.docs[query.docs.length - 1];
        deleteDoc.ref.delete();
        this.actions.pop();
        this.undo.next();
    }

    async clearAll() {
        const query = await this.db.collection(`/rooms/${this.roomService.roomId}/actions`).get().toPromise();
        query.docs.forEach((doc) => {
            doc.ref.delete();
        });
        this.actions = [];
        this.clear.next();
    }
}