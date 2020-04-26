import * as vscode from 'vscode';
import { StudentState } from '../util/student';

export function createStudentStatus(context: vscode.ExtensionContext) {
    let statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    let student = StudentState.student ?? "No student selected";

    statusBar.text = student;
    statusBar.command = "sharpie.openMarksheet";
    statusBar.show();

    StudentState.subscribe(e => {
        statusBar.text = e.id;
    });

    return statusBar;
}