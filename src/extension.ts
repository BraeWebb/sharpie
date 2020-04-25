import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { BundleOverviewProvider } from './views/overview';
import { createStudentView } from './views/students';
import { BundleJSON } from './types';
import { addFeedback } from './commands/addFeedback';
import { loadBundle } from './commands/loadBundle';
import { openAll } from './commands/openAll';
import { openMarksheet } from './commands/openMarksheet';


function _pathExists(p: string): boolean {
    try {
        fs.accessSync(p);
    } catch (err) {
      return false;
    }
    return true;
}

function loadBundleJSON(): BundleJSON|undefined {
    if (!vscode.workspace.rootPath) {
        return;
    }

    const bundlePath = path.join(vscode.workspace.rootPath, 'bundle.json');
    if (!_pathExists(bundlePath)) {
        vscode.window.showInformationMessage('Workspace has no bundle.json');
        return;
    }
    const bundle: BundleJSON = JSON.parse(fs.readFileSync(bundlePath, 'utf-8'));

    return bundle;
}

function registerCommands(context: vscode.ExtensionContext, bundle: BundleJSON) {
    let disposables: vscode.Disposable[] = [];
    disposables.push(vscode.commands.registerCommand('sharpie.addFeedback', addFeedback(bundle)));
    disposables.push(vscode.commands.registerCommand('sharpie.openAll', openAll(context, bundle)));
    disposables.push(vscode.commands.registerCommand('sharpie.openMarksheet', openMarksheet(context, bundle)));

    return disposables;
}

function createViews(context: vscode.ExtensionContext, bundle: BundleJSON) {
    let disposables: vscode.Disposable[] = [];

    const overviewTree = vscode.window.createTreeView('sharpieOverview', {
        treeDataProvider: new BundleOverviewProvider(bundle)
    });
    overviewTree.title = "Rubric: " + bundle.name;
    disposables.push(overviewTree);

    const studentTree = createStudentView(bundle, context);
    disposables.push(studentTree);

    return disposables;
}

function load(context: vscode.ExtensionContext, bundle: BundleJSON) {
    // Create the add feedback command
    let disposables = registerCommands(context, bundle);

    // Create views
    disposables.concat(createViews(context, bundle));

    return disposables;
}

export function activate(context: vscode.ExtensionContext) {
    vscode.window.showInformationMessage('Sharpie activated!');

    // Create the load bundle command
    let disposable = vscode.commands.registerCommand('sharpie.loadBundle', loadBundle);
    context.subscriptions.push(disposable);

    // Load bundle data
    if (!vscode.workspace.rootPath) {
        return;
    }

    let disposables: vscode.Disposable[] = [];
    let bundle = loadBundleJSON();
    if (bundle) {
        disposables = load(context, bundle);
    }
    
    // Watch for bundle changes
    const glob = new vscode.RelativePattern(vscode.workspace.rootPath, "bundle.json");
    // https://www.youtube.com/watch?v=xBoKesAQFHU
    const theWatcher = vscode.workspace.createFileSystemWatcher(glob);
    theWatcher.onDidChange(e => {
        disposables.forEach(disposable => disposable.dispose());
        let bundle = loadBundleJSON();
        if (bundle) {
            disposables = load(context, bundle);
        }
    });
}

export function deactivate() {
    vscode.window.showInformationMessage('Sharpie deactivated!');
}
