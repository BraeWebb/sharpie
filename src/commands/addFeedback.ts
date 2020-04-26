import * as vscode from 'vscode';
import { RubricJSON, BundleJSON } from '../types';
import { StudentState } from '../util/student';

class MarkingCategory implements vscode.QuickPickItem {
	label: string;
	detail: string;
	
	constructor(private category: RubricJSON) {
		this.label = category.label;
		this.detail = category.description;
	}
}

class DiagnosticMessage implements vscode.QuickPickItem {
    label: string;
	detail: string;
	
	constructor(public diagnostic: vscode.Diagnostic, code?: string) {
		this.label = diagnostic.message;
        this.detail = diagnostic.source || "";
        if (code) {
            this.detail = code;
        }
	}
}

export function addFeedback(bundle: BundleJSON) {
    return () => {
        const file = vscode.window.activeTextEditor;
        const uri = file?.document?.uri;
        if (!file || !uri) {
            return;
        }

        const categoryPicker = vscode.window.createQuickPick();
        categoryPicker.items = bundle.rubric.map((rubric: RubricJSON) => {
            return new MarkingCategory(rubric);
        });
        categoryPicker.title = "Marking Category";
        categoryPicker.placeholder = "Enter a marking category";
        categoryPicker.step = 1;
        categoryPicker.totalSteps = 3;
        categoryPicker.show();

        categoryPicker.onDidChangeSelection(items => {
            const category = items[0];
            categoryPicker.hide();

            const issuePicker = vscode.window.createQuickPick<DiagnosticMessage>();
            let inRangeIssues: DiagnosticMessage[] = [];
            vscode.languages.getDiagnostics(uri).forEach((diagnostic) => {
                for (let selection of file.selections) {
                    const intersection = diagnostic.range.intersection(selection);
                    if (intersection !== undefined) {
                        const code = file.document.getText(diagnostic.range);
                        inRangeIssues.push(new DiagnosticMessage(diagnostic, code));
                    }
                }
            });
            const allIssues = vscode.languages.getDiagnostics(uri).map((diagnostic) => {
                return new DiagnosticMessage(diagnostic);
            });

            issuePicker.items = inRangeIssues.concat(allIssues);

            issuePicker.title = "Issue Label";
            issuePicker.placeholder = "Enter the issue";
            issuePicker.step = 2;
            issuePicker.totalSteps = 3;
            issuePicker.show();

            issuePicker.onDidChangeSelection(items => {
                const item = items[0];

                const input = vscode.window.createInputBox();
                input.value = item.label;
                input.step = 3;
                input.totalSteps = 3;
                input.show();

                input.onDidAccept(e => {
                    StudentState.addFeedback({
                        path: uri.path,
                        start: item.diagnostic.range.start,
                        end: item.diagnostic.range.end,
                        issue: input.value,
                        category: category.label
                    });
                    input.hide();
                });
            });
        });

        
	};
}
