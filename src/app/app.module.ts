import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms'

import { AppComponent } from './app.component';
import { CanvasComponent } from 'src/app/canvas/canvas.component';
import { ToolBarComponent } from './tool-bar/tool-bar.component';
import { ActionService } from './services/action.service';

@NgModule({
  declarations: [
    AppComponent,
    CanvasComponent,
    ToolBarComponent
  ],
  imports: [
    BrowserModule,
    FormsModule
  ],
  providers: [ActionService],
  bootstrap: [AppComponent]
})
export class AppModule { }
