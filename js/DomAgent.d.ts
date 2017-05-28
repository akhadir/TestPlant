/// <reference path="../extJs/chrome.d.ts" />
/// <reference path="../extJs/md5.d.ts" />
declare namespace DomAgents {
    interface IResponse {
        selector?: Array<string>;
    }
    interface IRequest {
        type: string;
        root?: string;
        callback: Function;
        data?: any;
    }
    interface Agent {
        reqIndex: number;
        loopFlag: boolean;
        pollString: string;
        requestQueue: any;
        init(pollString?: string): void;
        process(a: IRequest): void;
        run(option: any): void;
        reset(): void;
        size(obj: object): number;
        clone(obj: any): any;
    }
    var DomAgent: Agent;
}
