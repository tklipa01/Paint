import { Component } from '@angular/core';
import { Brush } from './models/brush';
import { Action } from './models/action';
import { RoomService } from './services/room.service';
import { ActivatedRoute } from '@angular/router';
import { Theme } from './models/theme';
import { ThemeService } from './services/theme.service';
import { ActionService } from './services/action.service';

@Component({
  selector: 'app-main',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  
    private actionLocalStorageKey = 'actionKey';
    showModal: boolean = false;    
    action: Action = new Action('free', new Brush(10, 'round', '#000000'));  

    constructor(private route: ActivatedRoute, private roomService: RoomService, private themeService: ThemeService, private actionService: ActionService) {

    }      

    ngOnInit() {
      this.route.params.subscribe(async (params) => {
        const roomName = params['roomName'];
        if(!roomName) {
          this.showModal = true;
          return;
        }
        const room = await this.roomService.getRoom(roomName);
        this.actionService.setActionObservable(room.id);
        this.themeService.theme = room.theme;        
      });
      
      let localStorageAction = localStorage.getItem(this.actionLocalStorageKey);
      if(localStorageAction) this.action = JSON.parse(localStorageAction);
    }

    handleActionChangedEvent(action: Action) {
        this.action = {...action};
        localStorage.setItem(this.actionLocalStorageKey, JSON.stringify(this.action));
    }
}
