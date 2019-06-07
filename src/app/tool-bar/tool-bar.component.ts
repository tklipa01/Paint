import { Component, Output, EventEmitter, Input } from '@angular/core';
import { Brush } from '../models/brush';
import { Action } from '../models/action';
import { ActionService } from '../services/action.service';
import { Theme } from '../models/theme';
import { ThemeService } from '../services/theme.service';
import { RoomService } from '../services/room.service';

@Component({
  selector: 'app-tool-bar',
  templateUrl: './tool-bar.component.html',
  styleUrls: ['./tool-bar.component.scss']
})
export class ToolBarComponent {

    @Input() action: Action;        
    @Output() actionChangedEvent = new EventEmitter<Action>();

    theme: Theme;

    themeEnum = Theme;

    constructor(private actionService: ActionService, private themeService: ThemeService) {
    }

    ngOnInit(): void {
      this.theme = this.themeService.theme;      
    }

    triggerThemeChange(theme: Theme) {
      this.theme = theme;
      this.themeService.theme = this.theme;
    }

    triggerActionChangedEvent() {
      this.actionChangedEvent.emit(this.action);      
    }

    triggerUndo() {
      this.actionService.remove();
    }

    triggerClear() {
      this.actionService.clearAll();
    }
}