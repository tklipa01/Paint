import { Brush } from './brush';
import { Point } from './point';

export type Mode = 'free' | 'line'; 

export class Action {
    timestamp: number;
    mode: Mode;
    brush: Brush;
    points: Point[];

    constructor(mode: Mode, brush: Brush, points?: Point[]) {
        this.mode = mode;
        this.brush = brush;
        if(points) this.points = points;
    }
}