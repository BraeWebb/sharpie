import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    vscode.window.showInformationMessage('Sharpie activated!');

	let disposable = vscode.commands.registerCommand('sharpie.loadBundle', () => {
		vscode.window.showOpenDialog({
            canSelectFiles: false,
            canSelectFolders: true,
            canSelectMany: false,
            openLabel: "Load"
        })
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {
    vscode.window.showInformationMessage('Sharpie deactivated!');
}
