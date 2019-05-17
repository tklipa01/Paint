import { Component } from '@angular/core';
import { Brush } from './models/brush';
import { Action } from './models/action';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  
    private actionLocalStorageKey = 'actionKey';

    action: Action = new Action('free', new Brush(10, 'round', '#000000'));    

    ngOnInit() {
      let localStorageAction = localStorage.getItem(this.actionLocalStorageKey);
      if(localStorageAction) this.action = JSON.parse(localStorageAction);
    }

    handleActionChangedEvent(action: Action) {
        this.action = {...action};
        localStorage.setItem(this.actionLocalStorageKey, JSON.stringify(this.action));
    }
}
