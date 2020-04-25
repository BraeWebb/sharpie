import * as vscode from 'vscode';

export function loadBundle() {
    return () => {
		vscode.window.showOpenDialog({
            canSelectFiles: false,
            canSelectFolders: true,
            canSelectMany: false,
            openLabel: "Load"
        });
	};
}
