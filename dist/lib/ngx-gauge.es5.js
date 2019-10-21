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
function coerceNumberProperty(value, fallbackValue) {
    if (fallbackValue === void 0) { fallbackValue = 0; }
    return isNaN(parseFloat(value)) || isNaN(Number(value)) ? fallbackValue : Number(value);
}
/**
 * @param {?} value
 * @return {?}
 */
function cssUnit(value) {
    return value + "px";
}
/**
 * @param {?} value
 * @return {?}
 */
function isNumber(value) {
    return value != undefined && !isNaN(parseFloat(value)) && !isNaN(Number(value));
}
var DEFAULTS = {
    MIN: 0,
    MAX: 100,
    TYPE: 'arch',
    THICK: 4,
    FOREGROUND_COLOR: 'rgba(0, 150, 136, 1)',
    BACKGROUND_COLOR: 'rgba(0, 0, 0, 0.1)',
    CAP: 'butt',
    SIZE: 200
};
var NgxGauge = (function () {
    /**
     * @param {?} _elementRef
     * @param {?} _renderer
     */
    function NgxGauge(_elementRef, _renderer) {
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
    Object.defineProperty(NgxGauge.prototype, "size", {
        /**
         * @return {?}
         */
        get: function () { return this._size; },
        /**
         * @param {?} value
         * @return {?}
         */
        set: function (value) {
            this._size = coerceNumberProperty(value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgxGauge.prototype, "min", {
        /**
         * @return {?}
         */
        get: function () { return this._min; },
        /**
         * @param {?} value
         * @return {?}
         */
        set: function (value) {
            this._min = coerceNumberProperty(value, DEFAULTS.MIN);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgxGauge.prototype, "value", {
        /**
         * @return {?}
         */
        get: function () { return this._value; },
        /**
         * @param {?} val
         * @return {?}
         */
        set: function (val) {
            this._value = coerceNumberProperty(val);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * @param {?} changes
     * @return {?}
     */
    NgxGauge.prototype.ngOnChanges = function (changes) {
        var /** @type {?} */ isTextChanged = changes['label'] || changes['append'] || changes['prepend'];
        var /** @type {?} */ isDataChanged = changes['value'] || changes['min'] || changes['max'];
        if (this._initialized) {
            if (isDataChanged) {
                this._update();
            }
            else if (!isTextChanged) {
                this._destroy();
                this._init();
            }
        }
    };
    /**
     * @return {?}
     */
    NgxGauge.prototype._updateSize = function () {
        this._renderer.setElementStyle(this._elementRef.nativeElement, 'width', cssUnit(this._size));
        this._renderer.setElementStyle(this._elementRef.nativeElement, 'height', cssUnit(this._size));
    };
    /**
     * @return {?}
     */
    NgxGauge.prototype.ngAfterViewInit = function () {
        if (this._canvas) {
            this._init();
        }
    };
    /**
     * @return {?}
     */
    NgxGauge.prototype.ngOnDestroy = function () {
        this._destroy();
    };
    /**
     * @param {?} type
     * @return {?}
     */
    NgxGauge.prototype._getBounds = function (type) {
        var /** @type {?} */ head, /** @type {?} */ tail;
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
        return { head: head, tail: tail };
    };
    /**
     * @param {?} start
     * @param {?} middle
     * @param {?} tail
     * @param {?} color
     * @return {?}
     */
    NgxGauge.prototype._drawShell = function (start, middle, tail, color) {
        var /** @type {?} */ center = this._getCenter(), /** @type {?} */ radius = this._getRadius();
        this._clear();
        this._context.beginPath();
        this._context.strokeStyle = this.backgroundColor;
        this._context.arc(center.x, center.y, radius, middle, tail, false);
        this._context.stroke();
        this._context.beginPath();
        this._context.strokeStyle = color;
        this._context.arc(center.x, center.y, radius, start, middle, false);
        this._context.stroke();
    };
    /**
     * @return {?}
     */
    NgxGauge.prototype._clear = function () {
        this._context.clearRect(0, 0, this._getWidth(), this._getHeight());
    };
    /**
     * @return {?}
     */
    NgxGauge.prototype._getWidth = function () {
        return this.size;
    };
    /**
     * @return {?}
     */
    NgxGauge.prototype._getHeight = function () {
        return this.size;
    };
    /**
     * @return {?}
     */
    NgxGauge.prototype._getRadius = function () {
        var /** @type {?} */ center = this._getCenter();
        return center.x - this.thick;
    };
    /**
     * @return {?}
     */
    NgxGauge.prototype._getCenter = function () {
        var /** @type {?} */ x = this._getWidth() / 2, /** @type {?} */ y = this._getHeight() / 2;
        return { x: x, y: y };
    };
    /**
     * @return {?}
     */
    NgxGauge.prototype._init = function () {
        this._context = ((this._canvas.nativeElement)).getContext('2d');
        this._initialized = true;
        this._updateSize();
        this._setupStyles();
        this._create();
    };
    /**
     * @return {?}
     */
    NgxGauge.prototype._destroy = function () {
        this._clear();
        this._context = null;
    };
    /**
     * @return {?}
     */
    NgxGauge.prototype._setupStyles = function () {
        this._context.canvas.width = this.size;
        this._context.canvas.height = this.size;
        this._context.lineCap = this.cap;
        this._context.lineWidth = this.thick;
    };
    /**
     * @param {?} value
     * @return {?}
     */
    NgxGauge.prototype._getForegroundColorByRange = function (value) {
        var /** @type {?} */ match = Object.keys(this.thresholds)
            .filter(function (item) { return isNumber(item) && Number(item) <= value; })
            .sort(function (a, b) { return Number(a) - Number(b); }).reverse()[0];
        return match !== undefined
            ? this.thresholds[match].color || this.foregroundColor
            : this.foregroundColor;
    };
    /**
     * @return {?}
     */
    NgxGauge.prototype._create = function () {
        var /** @type {?} */ self = this, /** @type {?} */ type = this.type, /** @type {?} */ bounds = this._getBounds(type), /** @type {?} */ duration = this.duration, /** @type {?} */ min = this.min, /** @type {?} */ max = this.max, /** @type {?} */ value = clamp(this.value, this.min, this.max), /** @type {?} */ head = bounds.head, /** @type {?} */ unit = (bounds.tail - bounds.head) / (max - min), /** @type {?} */ displacement = unit * (value - min), /** @type {?} */ tail = bounds.tail, /** @type {?} */ color = this._getForegroundColorByRange(value), /** @type {?} */ requestID, /** @type {?} */ starttime;
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
                requestID = window.requestAnimationFrame(function (timestamp) { return animate(timestamp); });
            }
            else {
                window.cancelAnimationFrame(requestID);
            }
        }
        window.requestAnimationFrame(function (timestamp) {
            starttime = timestamp || new Date().getTime();
            animate(timestamp);
        });
    };
    /**
     * @return {?}
     */
    NgxGauge.prototype._update = function () {
        this._clear();
        this._create();
    };
    return NgxGauge;
}());
NgxGauge.decorators = [
    { type: Component, args: [{
                selector: 'ngx-gauge',
                template: "\n      <div class=\"reading-block\" #reading [style.fontSize]=\"size * 0.22 + 'px'\" [style.lineHeight]=\"48 + 'px'\">\n          <u class=\"reading-affix\">{{prepend}}</u>\n          <div [ngClass]=\"{\n      \t\t\t\t\t\t'high': value > 75,\n      \t\t\t\t\t\t'low' : value < 41,\n      \t\t\t\t\t\t'medium' : value < 76 && value > 40\n      \t\t\t\t\t}\">\n          \t<b>{{value | number}}</b>\n          </div>\n          <u class=\"reading-affix\">{{append}}</u>\n      </div>\n      <div [ngClass]=\"reading-label\" [style.fontSize]=\"size / 13 + 'px'\" [style.lineHeight]=\"(5 * size / 13) + size + 'px'\">{{label}}</div>\n      <canvas #canvas [width]=\"size\" [height]=\"size\"></canvas>\n    ",
                styles: ["\n      .ngx-gauge-meter {\n          display: inline-block;\n          text-align: center;\n          position: relative;\n      }\n\n      .reading-block {\n          position: absolute;\n          width: 100%;\n          font-weight: normal;\n          white-space: nowrap;\n          text-align: center;\n          overflow: hidden;\n          text-overflow: ellipsis;\n      }\n\n      .reading-label {\n          font-family: inherit;\n          width: 100%;\n          display: inline-block;\n          position: absolute;\n          text-align: center;\n          white-space: nowrap;\n          overflow: hidden;\n          text-overflow: ellipsis;\n          font-weight: normal;\n      }\n\n      .reading-affix {\n          text-decoration: none;\n          font-size: 0.6em;\n          opacity: 0.8;\n          font-weight: 200;\n          padding: 0 0.18em;\n      }\n\n      .reading-affix:first-child {\n          padding-left: 0;\n      }\n\n      .reading-affix:last-child {\n          padding-right: 0;\n      }\n\n      .high {\n          color: #2DB821;\n          font-style: bold;\n          font-family: 'Open Sans', Arial, sans-serif;\n      }\n\n      .medium {\n          color: #FFAC30;\n          font-style: bold;\n          font-family: 'Open Sans', Arial, sans-serif;\n      }\n\n      .low {\n          color: #FF213C;\n          font-style: bold;\n          font-family: 'Open Sans', Arial, sans-serif;\n      }\n    "],
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
NgxGauge.ctorParameters = function () { return [
    { type: ElementRef, },
    { type: Renderer, },
]; };
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
var NgxGaugeModule = (function () {
    function NgxGaugeModule() {
    }
    return NgxGaugeModule;
}());
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
NgxGaugeModule.ctorParameters = function () { return []; };
/**
 * Generated bundle index. Do not edit.
 */
export { NgxGaugeModule, NgxGauge as ɵa };
//# sourceMappingURL=ngx-gauge.es5.js.map