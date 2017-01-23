import {
    AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy,
    Output, SimpleChanges, ViewChild, ViewEncapsulation, Renderer, OnInit
} from '@angular/core';

import { Select2OptionData } from './ng2-select2.interface';

@Component({
    selector: 'select2',
    template: '<select #selector></select>',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Select2Component implements AfterViewInit, OnChanges, OnDestroy, OnInit {
    @ViewChild('selector') selector: ElementRef;

    // data for select2 drop down
    @Input() data: Array<Select2OptionData>;

    // value for select2
    @Input() value: any;

    // enable / disable default style for select2
    @Input() cssImport: boolean = true;

    // width of select2 input
    @Input() width: string;

    // enable / disable select2
    @Input() disabled: boolean = false;

    // all additional options
    @Input() options: Select2Options;

    // emitter when value is changed
    @Output() valueChanged = new EventEmitter();

    private element: JQuery = undefined;
    private check: boolean = false;

    constructor(private renderer: Renderer) { }

    ngOnInit() {
        if(this.cssImport) {
            const head = document.getElementsByTagName('head')[0];
            const link: any = head.children[head.children.length-1];

            if(!link.version) {
                const newLink = this.renderer.createElement(head, 'style');
                this.renderer.setElementProperty(newLink, 'type', 'text/css');
                this.renderer.setElementProperty(newLink, 'version', 'select2');
                this.renderer.setElementProperty(newLink, 'innerHTML', this.style);
            }

        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if(!this.element) {
            return;
        }

        if(changes['data'] && JSON.stringify(changes['data'].previousValue) !== JSON.stringify(changes['data'].currentValue)) {
            this.initPlugin();

            const newValue: string = this.element.val();
            this.valueChanged.emit({
                value: newValue
            });
        }

        if(changes['value'] && changes['value'].previousValue !== changes['value'].currentValue) {
            const newValue: string = changes['value'].currentValue;

            this.renderer.setElementProperty(this.selector.nativeElement, 'value', newValue);
            this.element.trigger('change.select2');

            this.valueChanged.emit({
                value: newValue
            });
        }

        if(changes['disabled'] && changes['disabled'].previousValue !== changes['disabled'].currentValue) {
            this.renderer.setElementProperty(this.selector.nativeElement, 'disabled', this.disabled);
        }
    }

    ngAfterViewInit() {
        let that = this;

        this.element = jQuery(this.selector.nativeElement);
        this.initPlugin();

        if (typeof this.value !== 'undefined') {
            this.renderer.setElementProperty(this.selector.nativeElement, 'value', this.value);
            this.element.trigger('change.select2');
        }

        this.element.on('select2:select select2:unselect', function () {
            that.valueChanged.emit({
                value: that.element.val()
            });
        });
    }

    ngOnDestroy() {
        this.element.off("select2:select");
    }

    private initPlugin() {
        if(!this.element.select2) {
            if(!this.check) {
                this.check = true;
                console.log("Please add Select2 library (js file) to the project. You can download it from https://github.com/select2/select2/tree/master/dist/js.");
            }

            return;
        }

        // If select2 already initialized remove him and remove all tags inside
        if (this.element.hasClass('select2-hidden-accessible') == true) {
            this.element.select2('destroy');
            this.renderer.setElementProperty(this.selector.nativeElement, 'innerHTML', '');
        }

        let options: Select2Options = {
            data: this.data,
            width: (this.width) ? this.width : 'resolve'
        };

        Object.assign(options, this.options);

        if(options.matcher) {
            jQuery.fn.select2.amd.require(['select2/compat/matcher'], (oldMatcher: any) => {
                options.matcher = oldMatcher(options.matcher);
                this.element.select2(options);

                if (typeof this.value !== 'undefined') {
                    this.renderer.setElementProperty(this.selector.nativeElement, 'value', this.value);
                    this.element.trigger('change.select2');
                }
            });
        } else {
            this.element.select2(options);
        }

        if(this.disabled) {
            this.renderer.setElementProperty(this.selector.nativeElement, 'disabled', this.disabled);
        }
    }

    private style: string = `CSS`;
}