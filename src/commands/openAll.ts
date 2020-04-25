import * as vscode from 'vscode';
import * as path from 'path';
import { BundleJSON } from '../types';

export function openAll(context: vscode.ExtensionContext, bundle: BundleJSON) {
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
        
        openFiles(student, bundle.files);
	};
}

async function openFiles(student: string, patterns: string[]) {
    const root = vscode.workspace.rootPath;
    if (!root) {
        return;
    }
    const base = path.join(root, student);

    let studentFiles: vscode.Uri[] = [];
    for (let filePattern of patterns) {
        const pattern = new vscode.RelativePattern(base, filePattern);
        studentFiles = studentFiles.concat(await vscode.workspace.findFiles(pattern));
    }

    for (let file of studentFiles) {
        await vscode.window.showTextDocument(file, {preview: false});
    }
}
