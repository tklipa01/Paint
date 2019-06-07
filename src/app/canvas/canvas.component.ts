import {
    AfterViewInit,
    Component,
    ElementRef,
    Input,
    OnDestroy,
    ViewChild,
    OnChanges,
    SimpleChanges
  } from '@angular/core';
  import { fromEvent, Subscription } from 'rxjs';
  import { pairwise, switchMap, takeUntil, first } from 'rxjs/operators';
import { Point } from 'src/app/models/point';
import { Action } from '../models/action';
import { RecursiveTemplateAstVisitor } from '@angular/compiler';
import { ActionService } from '../services/action.service';
import { Theme } from '../models/theme';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss']
})
export class CanvasComponent implements AfterViewInit, OnChanges {
    
    @Input() width: number;
    @Input() height: number;
    @Input() action: Action;
    @Input() theme: Theme = Theme.Dark;

    private context: CanvasRenderingContext2D;
    private canvas: HTMLCanvasElement;

    private tempContext: CanvasRenderingContext2D;
    private tempCanvas: HTMLCanvasElement;    

    freeSubscription: Subscription;    
    lineSubscription: Subscription;
    viewPortChangeSubscription: Subscription;

    undoSubscription: Subscription;
    clearSubscription: Subscription;
    themeSubscription: Subscription;
    actionsSubscription: Subscription;

    @ViewChild('canvasEl') canvasEl: ElementRef;
    @ViewChild('tempCanvasEl') tempCanvasEl: ElementRef;

    constructor(private actionService: ActionService, private themeService: ThemeService) {
      
    }

    ngOnInit() {
      this.undoSubscription = this.actionService.undo$.subscribe(() => {
        this.repaintCanvasFromActions(this.actionService.get());
      });      

      this.clearSubscription = this.actionService.clear$.subscribe(() => {
        this.clearCanvas(this.context, true);
      });      

      this.viewPortChangeSubscription = fromEvent(window, 'resize').subscribe((event: any) => {
        this.width = event.target.innerWidth;
        this.height = event.target.innerHeight;
        this.setCanvasDimensions(this.width, this.height);
        this.repaintCanvasFromActions(this.actionService.get());
      });

      this.actionsSubscription = this.actionService.actionReady$.subscribe(() => {
        this.actionsSubscription.add(this.actionService.actions$.subscribe((actions: Action[]) => {
          this.repaintCanvasFromActions(actions);
        }));
      });
    }

    ngAfterViewInit() {
        this.canvas = this.canvasEl.nativeElement;
        this.tempCanvas = this.tempCanvasEl.nativeElement;
        if(!this.width || !this.height) {
          this.width = this.canvasEl.nativeElement.offsetParent.clientWidth;
          this.height = this.canvasEl.nativeElement.offsetParent.clientHeight;
        }
        this.context = this.canvas.getContext('2d');
        this.tempContext = this.tempCanvas.getContext('2d');
        this.setCanvasDimensions(this.width, this.height);

        this.themeSubscription = this.themeService.themeChange$.subscribe((theme: Theme) => {
          this.theme = theme;
          this.context.fillStyle = this.theme;
          this.repaintCanvasFromActions(this.actionService.get());   
        });             

        this.setContextFromAction(this.action);
        this.context.fillRect(0,0,this.canvas.width,this.canvas.height);
    }

    ngOnChanges(changes: SimpleChanges) {
        if(changes.action) {                    
          this.setContextFromAction(changes.action.currentValue);
        }
    }

    setCanvasDimensions(width: number, height: number) {
      this.canvas.width = width;
      this.canvas.height = height; 
      this.tempCanvas.width = width;
      this.tempCanvas.height = height;
    }

    setContextFromAction(action: Action, initEvents: boolean = true) {
        if(!this.context) return;        
        this.context.lineWidth = action.brush.lineWidth;
        this.context.lineCap = action.brush.lineCap;
        this.context.strokeStyle = action.brush.strokeStyle;
        this.tempContext.lineWidth = action.brush.lineWidth;
        this.tempContext.lineCap = action.brush.lineCap;
        this.tempContext.strokeStyle = action.brush.strokeStyle;
        if(initEvents){
          switch(action.mode) {
            case 'free':            
              this.captureFreeEvents(this.tempCanvas);
              break;
            case 'line': 
              this.captureLineEvents(this.tempCanvas);
              break;
          }
        }
    }

    captureLineEvents(canvasEl: HTMLCanvasElement) {
        this.unsubscribe();
        let firstP: Point;
        let currentP: Point;

        const rect = canvasEl.getBoundingClientRect();  
        // grab starting point
        this.lineSubscription = fromEvent(canvasEl, 'mousedown').subscribe((res: MouseEvent) => {
            firstP = new Point(res.clientX - rect.left, res.clientY - rect.top);
          });
        // update line with new end point, clearing previous line
        this.lineSubscription.add(fromEvent(canvasEl, 'mousedown')
            .pipe(
              switchMap(e => {
                // after a mouse down, we'll record all mouse moves
                return fromEvent(canvasEl, 'mousemove').pipe(
                    // we'll stop (and unsubscribe) once the user releases the mouse
                    // this will trigger a 'mouseup' event
                    takeUntil(fromEvent(canvasEl, 'mouseup')),
                );
                })
            ).subscribe((res: MouseEvent) => {
                // previous and current position with the offset                
                const current = new Point(res.clientX - rect.left, res.clientY - rect.top);                

                this.drawLine(firstP, current, this.tempContext, true);
            }));
        // save final line to main canvas and clear temp
        this.lineSubscription.add(fromEvent(canvasEl, 'mouseup').subscribe((res: MouseEvent) => {
          currentP = new Point(res.clientX - rect.left, res.clientY - rect.top);
          this.drawLine(firstP, currentP, this.context);
          this.clearCanvas(this.tempContext);
          this.actionService.add(new Action(this.action.mode, {...this.action.brush}, [firstP, currentP]));          
        }));
        
    }

    captureFreeEvents(canvasEl: HTMLCanvasElement) {
        this.unsubscribe();
        const rect = canvasEl.getBoundingClientRect();

        let points: Point[] = [];
        // this will capture all mousedown events from the canvas element
        this.freeSubscription = fromEvent(canvasEl, 'mousedown')
            .pipe(
                switchMap(e => {
                // after a mouse down, we'll record all mouse moves
                return fromEvent(canvasEl, 'mousemove').pipe(
                    // we'll stop (and unsubscribe) once the user releases the mouse
                    // this will trigger a 'mouseup' event
                    takeUntil(fromEvent(canvasEl, 'mouseup')),
                    // pairwise lets us get the previous value to draw a line from
                    // the previous point to the current point
                    pairwise()
                );
                })
            )
            .subscribe((res: [MouseEvent, MouseEvent]) => {                        
                // previous and current position with the offset
                const prev = new Point(res[0].clientX - rect.left, res[0].clientY - rect.top);
                const current = new Point(res[1].clientX - rect.left, res[1].clientY - rect.top);

                if(points.length === 0) {
                  points.push(prev);
                  points.push(current);
                } else {
                  points.push(current);
                }

                this.drawLine(prev, current, this.context);
            });

        this.freeSubscription.add(fromEvent(canvasEl, 'mouseup')
            .subscribe((res: MouseEvent) => {
                const rect = canvasEl.getBoundingClientRect();

                const point = new Point(res.clientX - rect.left, res.clientY - rect.top); 
                this.drawLine(point, point, this.context);

                if(points.length === 0) {
                  points.push(point);
                }

                this.actionService.add(new Action(this.action.mode, {...this.action.brush}, points));
                points = [];
            }));            
    }
    
    drawLine(prev: Point, current: Point, context: CanvasRenderingContext2D, clearCanvas: boolean = false) {
      if (!this.context) return;

      if(clearCanvas) this.clearCanvas(this.tempContext);

      // start our drawing path
      context.beginPath();
  
      // sets the start point
      context.moveTo(prev.x, prev.y); // from
      // draws a line from the start pos until the current position
      context.lineTo(current.x, current.y);

      // strokes the current path with the styles we set earlier
      context.stroke();      
    }    

    clearCanvas(context: CanvasRenderingContext2D, refill?: boolean) {
      if(!context) return;
        context.clearRect(0, 0, this.width, this.height);
      if(refill) {
        this.context.fillStyle = this.theme;
        context.fillRect(0,0,this.canvas.width,this.canvas.height);
      }
    }

    repaintCanvasFromActions(actions: Action[]) {
      this.clearCanvas(this.context, true);
      for(let a of actions) {
        this.setContextFromAction(a, false);
        a.points = Object.keys(a.points).map((key) => a.points[key]) as Point[];
        switch(a.mode){
          case 'free':
            // if just a single point was free drawn
            if(a.points.length === 1) {
              this.drawLine(a.points[0], a.points[0], this.context);
            }
            for(let i = 1; i < a.points.length; i++) {
              this.drawLine(a.points[i-1], a.points[i], this.context);
            }
            break;
          case 'line':             
            this.drawLine(a.points[0], a.points[1], this.context);
            break;
        }
      }
      this.setContextFromAction(this.action, false);
    }    
      
    unsubscribe() {
        if(this.freeSubscription) this.freeSubscription.unsubscribe();        
        if(this.lineSubscription) this.lineSubscription.unsubscribe();        
    }

    ngOnDestroy() {        
        this.unsubscribe();
        if(this.undoSubscription) this.undoSubscription.unsubscribe();
        if(this.clearSubscription) this.clearSubscription.unsubscribe();
    }
}
