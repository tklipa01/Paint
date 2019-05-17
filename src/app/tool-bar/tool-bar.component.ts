import { Component, Output, EventEmitter, Input } from '@angular/core';
import { Brush } from '../models/brush';
import { Action } from '../models/action';
import { ActionService } from '../services/action.service';

@Component({
  selector: 'app-tool-bar',
  templateUrl: './tool-bar.component.html',
  styleUrls: ['./tool-bar.component.scss']
})
export class ToolBarComponent {

    @Input() action: Action;
    @Output() actionChangedEvent = new EventEmitter<Action>();

    constructor(private actionService: ActionService) {
      this.actionService.undo$.subscribe(() => {
        console.log('undo');
      });

    }

    triggerActionChangedEvent() {
      this.actionChangedEvent.next(this.action);      
    }

    triggerUndo() {
      this.actionService.remove();
    }

    triggerClear() {
      this.actionService.clearAll();
    }

}