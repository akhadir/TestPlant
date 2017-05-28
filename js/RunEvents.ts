/// <reference path = "DomAgent.ts" />
/// <reference path = "../extJs/jquery.d.ts" />
//import $ from "../extJs/jquery"; 
namespace RunEvents {
    export interface TEvent {
        timer: number;
        event: Array<string>;
        evalue: Array<string>;
        node: string
    }
    export interface IRunEvents {
        events: Array<any>;
        init(event: any): void;
        getEventName (input:string): string;
        run(event:TEvent, callback?:Function): void;
        runIndex(index: number, callback:Function) : void;
        runAll(events?:Array<TEvent>): void;
    }
    export var RunEvents:IRunEvents = {
        events: [],
        init: function (events:any) {
            this.events = $.extend(true, [], events);
        },
        getEventName: function (input:string) {
            var out:string = "click";
            switch (input) {
                case "0":
                    out = "";
                    break;
                case "1":
                    out = "click";
                    break;
                case "2":
                    out = "change";
                    break;
                case "3":
                    out = "mouseover";
                    break;
                case "4":
                    out =  "keypress";
                    break;
                case "5":
                    out =  "keyup";
                    break;
                case "6":
                    out = "keydown";
                    break;
                case "7":
                    out = "focus";
                    break;
                case "8":
                    out = "blur";
                    break;
                case "9":
                    out = "rightclick";
                    break;
                case "10":
                    out = "doubleclick"
                    break;
                case "11":
                    out = "submit"
                    break;
            }
            return out;
        },
        run: function (event:TEvent, callback?:Function) {
            var value,
                data,
                eventName = this.getEventName(event.event[0]);
            if (eventName) {
                if (event.evalue && event.evalue[0]) {
                    value = event.evalue[0];
                }
                data = {
                    node: event.node[0],
                    event: eventName,
                    value: value
                };
                DomAgents.DomAgent.process({type: "DATA_POST_EVENTS", data: data, callback: function (res:any) {
                    //Request Sent
                    setTimeout(function () {
                        if (callback) {
                            callback();
                        }
                    }, event.timer * 1000);
                }});
            } else {
                if (callback) {
                    callback();
                }
            }
        },
        runIndex: function (index: number, callback:Function) {
            var event = this.events[index];
            this.run(event, callback);
        },
        runAll: function (events?:Array<TEvent>) {
            var i,
                self = this;
            if (events) {
                this.events = $.extend(true, [], events);
            } else {
                events = this.events;
            }
            if (events !== undefined && events.length) {
                self.runIndex(0, function () {
                    if (events) {
                        events.splice(0, 1);
                    }
                    self.runAll();
                });
            }
        }
    }
}