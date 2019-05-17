export type StrokeStyle = string | CanvasGradient | CanvasPattern;

export class Brush {
    lineWidth: number;
    lineCap: CanvasLineCap;
    strokeStyle: StrokeStyle; 

    constructor(width: number, cap: CanvasLineCap, style: StrokeStyle) {
        this.lineWidth = width;
        this.lineCap = cap;
        this.strokeStyle = style; 
    }
}