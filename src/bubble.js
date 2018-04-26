import Overlay from './overlay';

function Bubble(opt){
    Overlay.call(this);
    var _self=this;
    this.template='';
    this.container='';
    var init=function(){

    };
    init();

    Bubble.prototype = new Overlay(opt);
    Bubble.prototype.constructor = Bubble;
}

