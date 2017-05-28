/// <reference path="extJs/jquery.d.ts" />
interface classSel {
    id: string;
    className: string;
    tagName: string;
}
interface winFunc {
    isFocusable(node: any): boolean;
    getFocusable(node: any): Array<classSel>;
    observeAjaxCalls(): void;
    observedAjaxCalls: Array<any>;
    getFocusables(node: string): any;
    getComputedProps(root: string, node: string, nodeIndex: number, properties: Array<string>): any;
    getClassNameSel(node: any): string;
    getSelector(node: any, root: string, usi: boolean, maxDepth?: number): string;
    getSelectorForce(node: any, root: string, usi: boolean): string;
    getNodeIndex(node: any, rootNode: any, selector: string): number;
    getChildren(root: string, usi: boolean): Array<string>;
    getOtherCalls(node: string, attrib: string): string;
    postEvents(node: any, event: string, value: string): void;
    getObservedAjaxCalls(): Array<any>;
}
declare var win: winFunc;
