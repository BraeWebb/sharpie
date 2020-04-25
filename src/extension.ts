import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { BundleOverviewProvider } from './views/overview';

export function activate(context: vscode.ExtensionContext) {
    vscode.window.showInformationMessage('Sharpie activated!');

    let disposable = vscode.commands.registerCommand('sharpie.loadBundle', () => {
		vscode.window.showOpenDialog({
            canSelectFiles: false,
            canSelectFolders: true,
            canSelectMany: false,
            openLabel: "Load"
        });
	});

	context.subscriptions.push(disposable);

    if (!vscode.workspace.rootPath) {
        return;
    }
    const bundlePath = path.join(vscode.workspace.rootPath, 'bundle.json');
    const json = JSON.parse(fs.readFileSync(bundlePath, 'utf-8'));

    const overviewTree = vscode.window.createTreeView('sharpieOverview', {
        treeDataProvider: new BundleOverviewProvider(vscode.workspace.rootPath)
    });
    overviewTree.title = "Rubric: " + json["name"];


}

export function deactivate() {
    vscode.window.showInformationMessage('Sharpie deactivated!');
}
