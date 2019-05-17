import { Injectable } from '@angular/core';
import { Theme } from '../models/theme';
import { Subject, Observable, BehaviorSubject } from 'rxjs';

@Injectable()
export class ThemeService {

    private _theme: Theme = Theme.Dark;
    get theme(): Theme { return this._theme }
    set theme(theme: Theme) {
        this._theme = theme;
        localStorage.setItem(this.themeLocalStorageKey, JSON.stringify(theme));
        this.themeChange.next(theme);
    } 

    private themeLocalStorageKey = 'themeKey';

    private themeChange: BehaviorSubject<Theme>;
    themeChange$ = new Observable<Theme>();    

    constructor() {
        let theme = localStorage.getItem(this.themeLocalStorageKey);
        if(theme) this._theme = JSON.parse(theme);
        this.themeChange = new BehaviorSubject<Theme>(this._theme);
        this.themeChange$ = this.themeChange.asObservable();
    }
}