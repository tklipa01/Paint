import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms'

import { AppComponent } from './app.component';
import { CanvasComponent } from 'src/app/canvas/canvas.component';
import { ToolBarComponent } from './tool-bar/tool-bar.component';
import { ModalComponent } from './modal/modal.component';

import { ActionService } from './services/action.service';
import { ThemeService } from './services/theme.service';
import { RoomService } from './services/room.service';

import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppRootComponent } from './app-root.component';


@NgModule({
  declarations: [
    AppRootComponent,
    AppComponent,
    CanvasComponent,
    ToolBarComponent,
    ModalComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule,
    AppRoutingModule
  ],
  providers: [ActionService, ThemeService, RoomService],
  bootstrap: [AppRootComponent]
})
export class AppModule { }
