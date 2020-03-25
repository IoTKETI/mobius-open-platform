import { Directive, ViewContainerRef } from '@angular/core';


@Directive({
    selector : '[command-view]'
})
export class CommandViewDirective{
    constructor(public viewContainerRef : ViewContainerRef){}
}