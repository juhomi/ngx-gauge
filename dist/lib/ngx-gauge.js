import { Component, ElementRef, Input, NgModule, Renderer, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * @param {?} value
 * @param {?} min
 * @param {?} max
 * @return {?}
 */
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
/**
 * @param {?} value
 * @return {?}
 */

/**
 * @param {?} value
 * @param {?=} fallbackValue
 * @return {?}
 */
function coerceNumberProperty(value, fallbackValue = 0) {
    return isNaN(parseFloat(value)) || isNaN(Number(value)) ? fallbackValue : Number(value);
}
/**
 * @param {?} value
 * @return {?}
 */
function cssUnit(value) {
    return `${value}px`;
}
/**
 * @param {?} value
 * @return {?}
 */
function isNumber(value) {
    return value != undefined && !isNaN(parseFloat(value)) && !isNaN(Number(value));
}

const DEFAULTS = {
    MIN: 0,
    MAX: 100,
    TYPE: 'arch',
    THICK: 4,
    FOREGROUND_COLOR: 'rgba(0, 150, 136, 1)',
    BACKGROUND_COLOR: 'rgba(0, 0, 0, 0.1)',
    CAP: 'butt',
    SIZE: 200
};
class NgxGauge {
    /**
     * @param {?} _elementRef
     * @param {?} _renderer
     */
    constructor(_elementRef, _renderer) {
        this._elementRef = _elementRef;
        this._renderer = _renderer;
        this._size = DEFAULTS.SIZE;
        this._min = DEFAULTS.MIN;
        this._max = DEFAULTS.MAX;
        this._initialized = false;
        this.max = DEFAULTS.MAX;
        this.type = (DEFAULTS.TYPE);
        this.cap = (DEFAULTS.CAP);
        this.thick = DEFAULTS.THICK;
        this.foregroundColor = DEFAULTS.FOREGROUND_COLOR;
        this.backgroundColor = DEFAULTS.BACKGROUND_COLOR;
        this.thresholds = Object.create(null);
        this._value = 0;
        this.duration = 1200;
    }
    /**
     * @return {?}
     */
    get size() { return this._size; }
    /**
     * @param {?} value
     * @return {?}
     */
    set size(value) {
        this._size = coerceNumberProperty(value);
    }
    /**
     * @return {?}
     */
    get min() { return this._min; }
    /**
     * @param {?} value
     * @return {?}
     */
    set min(value) {
        this._min = coerceNumberProperty(value, DEFAULTS.MIN);
    }
    /**
     * @return {?}
     */
    get value() { return this._value; }
    /**
     * @param {?} val
     * @return {?}
     */
    set value(val) {
        this._value = coerceNumberProperty(val);
    }
    /**
     * @param {?} changes
     * @return {?}
     */
    ngOnChanges(changes) {
        const /** @type {?} */ isTextChanged = changes['label'] || changes['append'] || changes['prepend'];
        const /** @type {?} */ isDataChanged = changes['value'] || changes['min'] || changes['max'];
        if (this._initialized) {
            if (isDataChanged) {
                this._update();
            }
            else if (!isTextChanged) {
                this._destroy();
                this._init();
            }
        }
    }
    /**
     * @return {?}
     */
    _updateSize() {
        this._renderer.setElementStyle(this._elementRef.nativeElement, 'width', cssUnit(this._size));
        this._renderer.setElementStyle(this._elementRef.nativeElement, 'height', cssUnit(this._size));
    }
    /**
     * @return {?}
     */
    ngAfterViewInit() {
        if (this._canvas) {
            this._init();
        }
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        this._destroy();
    }
    /**
     * @param {?} type
     * @return {?}
     */
    _getBounds(type) {
        let /** @type {?} */ head, /** @type {?} */ tail;
        if (type == 'semi') {
            head = Math.PI;
            tail = 2 * Math.PI;
        }
        else if (type == 'full') {
            head = 1.5 * Math.PI;
            tail = 3.5 * Math.PI;
        }
        else if (type === 'arch') {
            head = 0.8 * Math.PI;
            tail = 2.2 * Math.PI;
        }
        return { head, tail };
    }
    /**
     * @param {?} start
     * @param {?} middle
     * @param {?} tail
     * @param {?} color
     * @return {?}
     */
    _drawShell(start, middle, tail, color) {
        let /** @type {?} */ center = this._getCenter(), /** @type {?} */ radius = this._getRadius();
        this._clear();
        this._context.beginPath();
        this._context.strokeStyle = this.backgroundColor;
        this._context.arc(center.x, center.y, radius, middle, tail, false);
        this._context.stroke();
        this._context.beginPath();
        this._context.strokeStyle = color;
        this._context.arc(center.x, center.y, radius, start, middle, false);
        this._context.stroke();
    }
    /**
     * @return {?}
     */
    _clear() {
        this._context.clearRect(0, 0, this._getWidth(), this._getHeight());
    }
    /**
     * @return {?}
     */
    _getWidth() {
        return this.size;
    }
    /**
     * @return {?}
     */
    _getHeight() {
        return this.size;
    }
    /**
     * @return {?}
     */
    _getRadius() {
        var /** @type {?} */ center = this._getCenter();
        return center.x - this.thick;
    }
    /**
     * @return {?}
     */
    _getCenter() {
        var /** @type {?} */ x = this._getWidth() / 2, /** @type {?} */ y = this._getHeight() / 2;
        return { x, y };
    }
    /**
     * @return {?}
     */
    _init() {
        this._context = ((this._canvas.nativeElement)).getContext('2d');
        this._initialized = true;
        this._updateSize();
        this._setupStyles();
        this._create();
    }
    /**
     * @return {?}
     */
    _destroy() {
        this._clear();
        this._context = null;
    }
    /**
     * @return {?}
     */
    _setupStyles() {
        this._context.canvas.width = this.size;
        this._context.canvas.height = this.size;
        this._context.lineCap = this.cap;
        this._context.lineWidth = this.thick;
    }
    /**
     * @param {?} value
     * @return {?}
     */
    _getForegroundColorByRange(value) {
        const /** @type {?} */ match = Object.keys(this.thresholds)
            .filter(function (item) { return isNumber(item) && Number(item) <= value; })
            .sort((a, b) => Number(a) - Number(b)).reverse()[0];
        return match !== undefined
            ? this.thresholds[match].color || this.foregroundColor
            : this.foregroundColor;
    }
    /**
     * @return {?}
     */
    _create() {
        let /** @type {?} */ self = this, /** @type {?} */ type = this.type, /** @type {?} */ bounds = this._getBounds(type), /** @type {?} */ duration = this.duration, /** @type {?} */ min = this.min, /** @type {?} */ max = this.max, /** @type {?} */ value = clamp(this.value, this.min, this.max), /** @type {?} */ head = bounds.head, /** @type {?} */ unit = (bounds.tail - bounds.head) / (max - min), /** @type {?} */ displacement = unit * (value - min), /** @type {?} */ tail = bounds.tail, /** @type {?} */ color = this._getForegroundColorByRange(value), /** @type {?} */ requestID, /** @type {?} */ starttime;
        /**
         * @param {?} timestamp
         * @return {?}
         */
        function animate(timestamp) {
            timestamp = timestamp || new Date().getTime();
            var /** @type {?} */ runtime = timestamp - starttime;
            var /** @type {?} */ progress = runtime / duration;
            progress = Math.min(progress, 1);
            self._drawShell(head, head + displacement * progress, tail, color);
            if (runtime < duration) {
                requestID = window.requestAnimationFrame((timestamp) => animate(timestamp));
            }
            else {
                window.cancelAnimationFrame(requestID);
            }
        }
        window.requestAnimationFrame((timestamp) => {
            starttime = timestamp || new Date().getTime();
            animate(timestamp);
        });
    }
    /**
     * @return {?}
     */
    _update() {
        this._clear();
        this._create();
    }
}
NgxGauge.decorators = [
    { type: Component, args: [{
                selector: 'ngx-gauge',
                template: `
      <div class="reading-block" #reading [style.fontSize]="size * 0.22 + 'px'" [style.lineHeight]="55 + 'px'">
          <u class="reading-affix">{{prepend}}</u>
          <div [ngClass]="{
      						'high': value > 75,
      						'low' : value < 41,
      						'medium' : value < 76 && value > 40
      					}">
          	{{value | number}}
          </div>
          <u class="reading-affix">{{append}}</u>
      </div>
      <div [ngClass]="reading-label" [style.fontSize]="size / 13 + 'px'" [style.lineHeight]="(5 * size / 13) + size + 'px'">{{label}}</div>
      <canvas #canvas [width]="size" [height]="size"></canvas>
    `,
                styles: [`
      .ngx-gauge-meter {
          display: inline-block;
          text-align: center;
          position: relative;
      }

      .reading-block {
          position: absolute;
          width: 100%;
          font-weight: normal;
          white-space: nowrap;
          text-align: center;
          overflow: hidden;
          text-overflow: ellipsis;
      }

      .reading-label {
          font-family: inherit;
          width: 100%;
          display: inline-block;
          position: absolute;
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-weight: normal;
      }

      .reading-affix {
          text-decoration: none;
          font-size: 0.6em;
          opacity: 0.8;
          font-weight: 200;
          padding: 0 0.18em;
      }

      .reading-affix:first-child {
          padding-left: 0;
      }

      .reading-affix:last-child {
          padding-right: 0;
      }

      .high {
          color: #2DB821;
      }

      .medium {
          color: #FFAC30;
      }

      .low {
          color: #FF213C;
      }
    `],
                host: {
                    'role': 'meter',
                    '[class.ngx-gauge-meter]': 'true',
                    '[attr.aria-valuemin]': 'min',
                    '[attr.aria-valuemax]': 'max',
                    '[attr.aria-valuenow]': 'value'
                },
                encapsulation: ViewEncapsulation.None
            },] },
];
/**
 * @nocollapse
 */
NgxGauge.ctorParameters = () => [
    { type: ElementRef, },
    { type: Renderer, },
];
NgxGauge.propDecorators = {
    '_canvas': [{ type: ViewChild, args: ['canvas',] },],
    'size': [{ type: Input },],
    'min': [{ type: Input },],
    'max': [{ type: Input },],
    'type': [{ type: Input },],
    'cap': [{ type: Input },],
    'thick': [{ type: Input },],
    'label': [{ type: Input },],
    'append': [{ type: Input },],
    'prepend': [{ type: Input },],
    'foregroundColor': [{ type: Input },],
    'backgroundColor': [{ type: Input },],
    'thresholds': [{ type: Input },],
    'value': [{ type: Input },],
    'duration': [{ type: Input },],
};

class NgxGaugeModule {
}
NgxGaugeModule.decorators = [
    { type: NgModule, args: [{
                imports: [CommonModule],
                declarations: [NgxGauge],
                exports: [NgxGauge]
            },] },
];
/**
 * @nocollapse
 */
NgxGaugeModule.ctorParameters = () => [];

/**
 * Generated bundle index. Do not edit.
 */

export { NgxGaugeModule, NgxGauge as ɵa };
//# sourceMappingURL=ngx-gauge.js.map
