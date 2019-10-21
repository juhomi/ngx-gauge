import { SimpleChanges, Renderer, AfterViewInit, ElementRef, OnChanges, OnDestroy } from '@angular/core';
export declare type NgxGaugeType = 'full' | 'arch' | 'semi';
export declare type NgxGaugeCap = 'round' | 'butt';
export declare class NgxGauge implements AfterViewInit, OnChanges, OnDestroy {
    private _elementRef;
    private _renderer;
    _canvas: ElementRef;
    private _size;
    private _min;
    private _max;
    private _initialized;
    private _context;
    size: number;
    min: number;
    max: number;
    type: NgxGaugeType;
    cap: NgxGaugeCap;
    thick: number;
    label: string;
    append: string;
    prepend: string;
    foregroundColor: string;
    backgroundColor: string;
    thresholds: Object;
    private _value;
    value: number;
    duration: number;
    constructor(_elementRef: ElementRef, _renderer: Renderer);
    ngOnChanges(changes: SimpleChanges): void;
    private _updateSize();
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    private _getBounds(type);
    private _drawShell(start, middle, tail, color);
    private _clear();
    private _getWidth();
    private _getHeight();
    private _getRadius();
    private _getCenter();
    private _init();
    private _destroy();
    private _setupStyles();
    private _getForegroundColorByRange(value);
    private _create();
    private _update();
}
