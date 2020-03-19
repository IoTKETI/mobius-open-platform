import { Directive, ViewContainerRef } from '@angular/core';


@Directive({
    selector : '[bot-view]'
})
export class BotViewDirective{
    constructor(public viewContainerRef : ViewContainerRef){}
}