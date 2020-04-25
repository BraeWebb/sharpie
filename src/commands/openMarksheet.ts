import * as vscode from 'vscode';
import { createMarksheetView } from '../views/marksheet';
import { BundleJSON } from '../types';

export function openMarksheet(context: vscode.ExtensionContext, bundle: BundleJSON) {
    return (node?: vscode.TreeItem) => {
        let student: string|undefined = undefined;
        if (node === undefined) {
            student = context.workspaceState.get("sharpie.selectedStudent");
        } else {
            student = node.label;
        }

        if (!student) {
            return;
        }
        
        createMarksheetView(bundle, student);
	};
}
