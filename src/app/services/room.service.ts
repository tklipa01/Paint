import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Room } from '../models/room';
import { map } from 'rxjs/operators';
import { ActionSequence } from 'protractor';
import { ActionService } from './action.service';
import { ActivatedRoute } from '@angular/router';

@Injectable()
export class RoomService {
    
    rooms$: Observable<any>;  
    roomId: string;

    constructor(private db: AngularFirestore) {        
        this.rooms$ = this.db.collection('/rooms', ref => ref.where('priv', '==', false)).valueChanges();
    }

    getRoom(name: string): Promise<any> {
        return new Promise<Room>((res, _) => {
            this.db.collection<Room>('/rooms', ref => ref.where('name', '==', name)).snapshotChanges().pipe(
                map(actions => {
                    return actions.map(a => {
                        const data = a.payload.doc.data() as Room;
                        const id = a.payload.doc.id;
                        data.id = id;
                        return data;                        
                    })
                })
            ).subscribe((data) => {
                this.roomId = data[0].id;
                res(data[0]);
            })
        })        
    }

    createRoom(room: Room): Promise<void> {
        return new Promise<void>((res, rej) => {
            this.db.collection('rooms').add({...room}).then(() => {
                res();
            }).catch(() => {
                rej();
            });
        });
    }
}