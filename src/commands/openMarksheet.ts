import * as vscode from 'vscode';
import { createMarksheetView } from '../views/marksheet';
import { BundleJSON } from '../types';
import { StudentState } from '../util/student';

export function openMarksheet(context: vscode.ExtensionContext, bundle: BundleJSON) {
    return (node?: vscode.TreeItem) => {
        let student: string|undefined = undefined;
        if (node?.label === undefined) {
            student = StudentState.cache?.id;
        } else {
            student = node.label;
        }

        if (!student) {
            return;
        }
        
        createMarksheetView(bundle, student);
	};
}
