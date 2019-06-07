import { Action } from './action';
import { Theme } from './theme';

export class Room {
    id: string;
    name: string;
    theme: Theme;
    priv: boolean;
    actions: Action[];

    constructor(name: string, theme: Theme, priv: boolean = false) {
        this.name =  name;
        this.theme = theme;
        this.priv = priv;
    }
}