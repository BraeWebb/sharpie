import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { BundleOverviewProvider } from './views/overview';
import { BundleJSON } from './types';
import { addFeedback } from './commands/addFeedback';
import { loadBundle } from './commands/loadBundle';


export function activate(context: vscode.ExtensionContext) {
    vscode.window.showInformationMessage('Sharpie activated!');

    // Create the load bundle command
    let disposable = vscode.commands.registerCommand('sharpie.loadBundle', loadBundle);
    context.subscriptions.push(disposable);

    // Load bundle data
    if (!vscode.workspace.rootPath) {
        return;
    }
    const bundlePath = path.join(vscode.workspace.rootPath, 'bundle.json');
    const bundle: BundleJSON = JSON.parse(fs.readFileSync(bundlePath, 'utf-8'));

    // Create the add feedback command
    disposable = vscode.commands.registerCommand('sharpie.addFeedback', addFeedback(bundle));
	context.subscriptions.push(disposable);

    // Create views
    const overviewTree = vscode.window.createTreeView('sharpieOverview', {
        treeDataProvider: new BundleOverviewProvider(vscode.workspace.rootPath)
    });
    overviewTree.title = "Rubric: " + bundle.name;
}

export function deactivate() {
    vscode.window.showInformationMessage('Sharpie deactivated!');
}
