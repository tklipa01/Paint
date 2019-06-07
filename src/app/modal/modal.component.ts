import { Component, Output, EventEmitter } from '@angular/core';
import { RoomService } from '../services/room.service';
import { Room } from '../models/room';
import { Theme } from '../models/theme';
import { Router } from '@angular/router';
import { routerNgProbeToken } from '@angular/router/src/router_module';

@Component({
    selector: 'app-modal',
    templateUrl: './modal.component.html',
    styleUrls: ['./modal.component.scss']
})
export class ModalComponent {

    @Output() close = new EventEmitter();

    rooms: Room[];
    createRoom: Room;
    createRoomLightTheme: boolean = false; 

    constructor(private roomService: RoomService, private router: Router) { 
        
    }

    ngOnInit(): void {
        this.roomService.rooms$.subscribe((rooms) => {
            if(!this.rooms) {
                this.rooms = rooms;
                return;
            }
            this.rooms.push(rooms);
        });
        this.createRoom = new Room('', Theme.Dark);
    }

    navigateToRoom(roomName: string) {
        console.log(roomName);
        this.router.navigate(['/' + roomName]);
    }

    async createRoomAndNavigate() {
        if(this.createRoom.name === '') return;
        if(this.createRoomLightTheme) {
            this.createRoom.theme = Theme.Light;
        }
        await this.roomService.createRoom(this.createRoom);
        console.log('added room');
        this.navigateToRoom(this.createRoom.name);
    }


}
