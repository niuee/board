import { EventAction, State, StateMachine, TemplateState, TemplateStateMachine } from "../being/interfaces";
import { Point } from "../index";
import { PointCal } from "point2point";


export type BoardStates = "IDLE" | "READY_TO_SELECT" | "SELECTING" | "READY_TO_PAN_VIA_SPACEBAR" | "READY_TO_PAN_VIA_SCROLL_WHEEL" | "PAN" | "INITIAL_PAN" | "PAN_VIA_SCROLL_WHEEL";

export type PointerEventPayload = {
    x: number;
    y: number;
}

export type SpaceBarEventPayload = {

}

export type CursorStatusUpdateEventPayload = {

}

export type ScrollEventPayload = {
    deltaX: number;
    deltaY: number;
}

export type ScrollWithCtrlEventPayload = {
    deltaX: number;
    deltaY: number;
    x: number;
    y: number;
}

export type BoardContext = {
    alignCoordinateSystem: boolean;
    canvas: HTMLCanvasElement;
    notifyOnPan: (delta: Point) => void;
    notifyOnZoom: (zoomAmount: number, anchorPoint: Point) => void; 
    setInitialCursorPosition: (position: Point) => void;
    initialCursorPosition: Point;
}

export type BoardEventMapping = {
    leftPointerDown: PointerEventPayload;
    leftPointerUp: PointerEventPayload;
    leftPointerMove: PointerEventPayload;
    spacebarDown: SpaceBarEventPayload;
    spacebarUp: SpaceBarEventPayload;
    stayIdle: CursorStatusUpdateEventPayload;
    cursorOnElement: CursorStatusUpdateEventPayload;
    scroll: ScrollEventPayload;
    scrollWithCtrl: ScrollWithCtrlEventPayload;
    middlePointerDown: PointerEventPayload;
    middlePointerUp: PointerEventPayload;
    middlePointerMove: PointerEventPayload;
}

export interface World {
    processPoint(stateMachine: StateMachine<BoardEventMapping, BoardContext, BoardStates>, point: Point): boolean;
}

export class BoardIdleState implements State<BoardEventMapping, BoardContext, BoardStates> {

    private world: World;

    constructor(world: World) {
        this.world = world;
    }

    private _eventReactions: Partial<EventAction<BoardEventMapping, BoardContext, BoardStates>> = {
        leftPointerDown: () => "READY_TO_SELECT",
        spacebarDown: this.spacebarDownHandler,
        leftPointerMove: (stateMachine, context, payload) => this.leftPointerMoveHandler(stateMachine, context, payload),
        scroll: this.scrollHandler,
        scrollWithCtrl: this.scrollWithCtrlHandler,
        middlePointerDown: this.middlePointerDownHandler,
    }

    get eventReactions(): Partial<EventAction<BoardEventMapping, BoardContext, BoardStates>> {
        return this._eventReactions;
    }

    handles<K extends keyof BoardEventMapping>(stateMachine: StateMachine<BoardEventMapping, BoardContext, BoardStates>, event: K, payload: BoardEventMapping[K], context: BoardContext): BoardStates {
        if(this._eventReactions[event]){
            return this._eventReactions[event](stateMachine, context, payload);
        }
        return "IDLE";
    }

    leftPointerMoveHandler(stateMachine: StateMachine<BoardEventMapping, BoardContext, BoardStates>, context: BoardContext, payload: PointerEventPayload): BoardStates {
        this.world.processPoint(stateMachine, {x: payload.x, y: payload.y});
        return "IDLE";
    }

    scrollHandler(stateMachine: StateMachine<BoardEventMapping, BoardContext, BoardStates>, context: BoardContext, payload: ScrollEventPayload): BoardStates {
        context.notifyOnPan({x: payload.deltaX, y: payload.deltaY});
        return "IDLE";
    }

    scrollWithCtrlHandler(stateMachine: StateMachine<BoardEventMapping, BoardContext, BoardStates>, context: BoardContext, payload: ScrollWithCtrlEventPayload): BoardStates {
        // console.log("raw deltaY", payload.deltaY);
        let scrollSensitivity = 0.005;
        if(Math.abs(payload.deltaY) > 100){
            scrollSensitivity = 0.0005; 
        }
        const zoomAmount = payload.deltaY * scrollSensitivity;
        const cursorPosition = {x: payload.x, y: payload.y};
        const canvasBoundingRect = context.canvas.getBoundingClientRect();
        const cameraCenterInWindow = {x: canvasBoundingRect.left + (canvasBoundingRect.right - canvasBoundingRect.left) / 2, y: canvasBoundingRect.top + (canvasBoundingRect.bottom - canvasBoundingRect.top) / 2};
        const anchorPoint = PointCal.subVector(cursorPosition, cameraCenterInWindow);
        context.notifyOnZoom(-(zoomAmount * 5), anchorPoint);
        return "IDLE";
    }

    spacebarDownHandler(stateMachine: StateMachine<BoardEventMapping, BoardContext, BoardStates>, context: BoardContext, payload: SpaceBarEventPayload): BoardStates {
        context.canvas.style.cursor = "grab";
        return "READY_TO_PAN_VIA_SPACEBAR";
    }

    middlePointerDownHandler(stateMachine: StateMachine<BoardEventMapping, BoardContext, BoardStates>, context: BoardContext, payload: PointerEventPayload): BoardStates {
        context.setInitialCursorPosition({x: payload.x, y: payload.y});
        context.canvas.style.cursor = "grabbing";
        return "READY_TO_PAN_VIA_SCROLL_WHEEL";
    }
}

export class ReadyToSelectState implements State<BoardEventMapping, BoardContext, BoardStates> {

    constructor() {
    }

    private _eventReactions: Partial<EventAction<BoardEventMapping, BoardContext, BoardStates>> = {
        leftPointerUp: () => "IDLE",
        leftPointerMove: () => "SELECTING",
    }

    get eventReactions(): Partial<EventAction<BoardEventMapping, BoardContext, BoardStates>> {
        return this._eventReactions;
    }

    handles<K extends keyof BoardEventMapping>(stateMachine: StateMachine<BoardEventMapping, BoardContext, BoardStates>, event: K, payload: BoardEventMapping[K], context: BoardContext): BoardStates {
        if(this._eventReactions[event]){
            return this._eventReactions[event](stateMachine, context, payload);
        }
        return "READY_TO_SELECT";
    }
}

export class SelectingState implements State<BoardEventMapping, BoardContext, BoardStates> {


    constructor() {
    }

    private _eventReactions: Partial<EventAction<BoardEventMapping, BoardContext, BoardStates>> = {
        leftPointerUp: () => "IDLE",
        leftPointerMove: () => "SELECTING",
    }

    get eventReactions(): Partial<EventAction<BoardEventMapping, BoardContext, BoardStates>> {
        return this._eventReactions;
    }

    handles<K extends keyof BoardEventMapping>(stateMachine: StateMachine<BoardEventMapping, BoardContext, BoardStates>, event: K, payload: BoardEventMapping[K], context: BoardContext): BoardStates {
        if(this._eventReactions[event]){
            return this._eventReactions[event](stateMachine, context, payload);
        }
        return "SELECTING";
    }

}

export class ReadyToPanViaSpaceBarState implements State<BoardEventMapping, BoardContext, BoardStates> {
    constructor() {
    }

    private _eventReactions: Partial<EventAction<BoardEventMapping, BoardContext, BoardStates>> = {
        spacebarUp: this.spacebarUpHandler,
        leftPointerDown: this.leftPointerDownHandler,
    }

    get eventReactions(): Partial<EventAction<BoardEventMapping, BoardContext, BoardStates>> {
        return this._eventReactions;
    }

    handles<K extends keyof BoardEventMapping>(stateMachine: StateMachine<BoardEventMapping, BoardContext, BoardStates>, event: K, payload: BoardEventMapping[K], context: BoardContext): BoardStates {
        if(this._eventReactions[event]){
            return this._eventReactions[event](stateMachine, context, payload);
        }
        return "READY_TO_PAN_VIA_SPACEBAR";
    }

    leftPointerDownHandler(stateMachine: StateMachine<BoardEventMapping, BoardContext, BoardStates>, context: BoardContext, payload: PointerEventPayload): BoardStates {
        context.setInitialCursorPosition({x: payload.x, y: payload.y});
        context.canvas.style.cursor = "grabbing";
        return "INITIAL_PAN";
    }

    spacebarUpHandler(stateMachine: StateMachine<BoardEventMapping, BoardContext, BoardStates>, context: BoardContext, payload: SpaceBarEventPayload): BoardStates {
        context.canvas.style.cursor = "default";
        return "IDLE";
    }
}

export class InitialPanState implements State<BoardEventMapping, BoardContext, BoardStates> {

    constructor() {
    }

    private _eventReactions: Partial<EventAction<BoardEventMapping, BoardContext, BoardStates>> = {
        leftPointerUp: this.leftPointerUpHandler,
        leftPointerMove: this.leftPointerMoveHandler,
        spacebarUp: () => "IDLE",
        leftPointerDown: () => "PAN",
    }

    get eventReactions(): Partial<EventAction<BoardEventMapping, BoardContext, BoardStates>> {
        return this._eventReactions;
    }

    handles<K extends keyof BoardEventMapping>(stateMachine: StateMachine<BoardEventMapping, BoardContext, BoardStates>, event: K, payload: BoardEventMapping[K], context: BoardContext): BoardStates {
        if(this._eventReactions[event]){
            return this._eventReactions[event](stateMachine, context, payload);
        }
        return "INITIAL_PAN";
    }

    leftPointerMoveHandler(stateMachine: StateMachine<BoardEventMapping, BoardContext, BoardStates>, context: BoardContext, payload: PointerEventPayload): BoardStates {
        const delta = {
            x: context.initialCursorPosition.x - payload.x,
            y: context.initialCursorPosition.y - payload.y,
        };
        if(!context.alignCoordinateSystem){
            delta.y = -delta.y;
        }
        context.notifyOnPan(delta);
        context.setInitialCursorPosition({x: payload.x, y: payload.y});
        return "PAN";
    }

    leftPointerUpHandler(stateMachine: StateMachine<BoardEventMapping, BoardContext, BoardStates>, context: BoardContext, payload: PointerEventPayload): BoardStates {
        context.canvas.style.cursor = "grab";
        return "READY_TO_PAN_VIA_SPACEBAR";
    }
}

export class ReadyToPanViaScrollWheelState extends TemplateState<BoardEventMapping, BoardContext, BoardStates> {

    constructor() {
        super();
    }

    private _eventReactions: Partial<EventAction<BoardEventMapping, BoardContext, BoardStates>> = {
        middlePointerUp: this.middlePointerUpHandler,
        middlePointerMove: this.middlePointerMoveHandler,
    }

    get eventReactions(): Partial<EventAction<BoardEventMapping, BoardContext, BoardStates>> {
        return this._eventReactions;
    }

    middlePointerMoveHandler(stateMachine: StateMachine<BoardEventMapping, BoardContext, BoardStates>, context: BoardContext, payload: PointerEventPayload): BoardStates {
        context.canvas.style.cursor = "grabbing";
        return "PAN_VIA_SCROLL_WHEEL";
    }

    middlePointerUpHandler(stateMachine: StateMachine<BoardEventMapping, BoardContext, BoardStates>, context: BoardContext, payload: PointerEventPayload): BoardStates {
        context.canvas.style.cursor = "default";
        return "IDLE";
    }

}

export class PanState implements State<BoardEventMapping, BoardContext, BoardStates> {


    constructor() {
    }

    private _eventReactions: Partial<EventAction<BoardEventMapping, BoardContext, BoardStates>> = {
        leftPointerUp: this.leftPointerUpHandler,
        leftPointerMove: this.leftPointerMoveHandler,
        spacebarUp: this.spacebarUpHandler, 
    }

    get eventReactions(): Partial<EventAction<BoardEventMapping, BoardContext, BoardStates>> {
        return this._eventReactions;
    }

    handles<K extends keyof BoardEventMapping>(stateMachine: StateMachine<BoardEventMapping, BoardContext, BoardStates>, event: K, payload: BoardEventMapping[K], context: BoardContext): BoardStates {
        if(this._eventReactions[event]){
            return this._eventReactions[event](stateMachine, context, payload);
        }
        return "PAN";
    }

    leftPointerMoveHandler(stateMachine: StateMachine<BoardEventMapping, BoardContext, BoardStates>, context: BoardContext, payload: PointerEventPayload): BoardStates {
        const delta = {
            x: context.initialCursorPosition.x - payload.x,
            y: context.initialCursorPosition.y - payload.y,
        };
        if(!context.alignCoordinateSystem){
            delta.y = -delta.y;
        }
        context.notifyOnPan(delta);
        context.setInitialCursorPosition({x: payload.x, y: payload.y});
        return "PAN";
    }

    spacebarUpHandler(stateMachine: StateMachine<BoardEventMapping, BoardContext, BoardStates>, context: BoardContext, payload: SpaceBarEventPayload): BoardStates {
        context.canvas.style.cursor = "default";
        return "IDLE";
    }

    leftPointerUpHandler(stateMachine: StateMachine<BoardEventMapping, BoardContext, BoardStates>, context: BoardContext, payload: PointerEventPayload): BoardStates {
        context.canvas.style.cursor = "grab";
        return "READY_TO_PAN_VIA_SPACEBAR";
    }
}

export class PanViaScrollWheelState extends TemplateState<BoardEventMapping, BoardContext, BoardStates> {

    private _eventReactions: Partial<EventAction<BoardEventMapping, BoardContext, BoardStates>> = {
        middlePointerUp: this.middlePointerUpHandler,
        middlePointerMove: this.middlePointerMoveHandler,
    }

    get eventReactions(): Partial<EventAction<BoardEventMapping, BoardContext, BoardStates>> {
        return this._eventReactions;
    }

    middlePointerMoveHandler(stateMachine: StateMachine<BoardEventMapping, BoardContext, BoardStates>, context: BoardContext, payload: PointerEventPayload): BoardStates {
        const delta = {
            x: context.initialCursorPosition.x - payload.x,
            y: context.initialCursorPosition.y - payload.y,
        };
        if(!context.alignCoordinateSystem){
            delta.y = -delta.y;
        }
        context.notifyOnPan(delta);
        context.setInitialCursorPosition({x: payload.x, y: payload.y});
        return "PAN_VIA_SCROLL_WHEEL";
    }

    middlePointerUpHandler(stateMachine: StateMachine<BoardEventMapping, BoardContext, BoardStates>, context: BoardContext, payload: PointerEventPayload): BoardStates {
        context.canvas.style.cursor = "default";
        return "IDLE";
    }


}

export class BoardWorld implements World {
    processPoint(stateMachine: StateMachine<BoardEventMapping, BoardContext, BoardStates>, point: Point): boolean {
        // console.log("Processing point", point);
        return false;
    }
}
