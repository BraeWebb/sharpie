import * as vscode from 'vscode';
import { RubricJSON, BundleJSON } from '../types';

class MarkingCategory implements vscode.QuickPickItem {
	label: string;
	detail: string;
	
	constructor(private category: RubricJSON) {
		this.label = category.label;
		this.detail = category.description;
	}
}

export function addFeedback(bundle: BundleJSON) {
    return () => {
        const picker = vscode.window.createQuickPick();
        picker.items = bundle.rubric.map((rubric: RubricJSON) => {
            return new MarkingCategory(rubric);
        });
        picker.show();
	};
}
