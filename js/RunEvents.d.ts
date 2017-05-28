/// <reference path="DomAgent.d.ts" />
/// <reference path="../extJs/jquery.d.ts" />
declare namespace RunEvents {
    interface TEvent {
        timer: number;
        event: Array<string>;
        evalue: Array<string>;
        node: string;
    }
    interface IRunEvents {
        events: Array<any>;
        init(event: any): void;
        getEventName(input: string): string;
        run(event: TEvent, callback?: Function): void;
        runIndex(index: number, callback: Function): void;
        runAll(events?: Array<TEvent>): void;
    }
    var RunEvents: IRunEvents;
}
