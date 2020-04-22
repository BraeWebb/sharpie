import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { getRubric } from './rubric';


export type RubricJSON = JSON & {
    id: string,
    label: string,
    description: string,
    marks: number
}

export type BundleJSON = JSON & {
    name: string,
    rubric: RubricJSON[]
}


export class BundleOverviewProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  constructor(private workspaceRoot: string|undefined) {}

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: vscode.TreeItem): Thenable<vscode.TreeItem[]> {
    if (!this.workspaceRoot) {
      vscode.window.showInformationMessage('No dependency in empty workspace');
      return Promise.resolve([]);
    }

    const bundlePath = path.join(this.workspaceRoot, 'bundle.json');
    if (!this.pathExists(bundlePath)) {
        vscode.window.showInformationMessage('Workspace has no bundle.json');
        return Promise.resolve([]);
    }

    const json: BundleJSON = JSON.parse(fs.readFileSync(bundlePath, 'utf-8'));

    return Promise.resolve(this.getRubric(json));
  }

  private getRubric(json: BundleJSON): vscode.TreeItem[] {
      return getRubric(json);
  }

  private pathExists(p: string): boolean {
    try {
      fs.accessSync(p);
    } catch (err) {
      return false;
    }
    return true;
  }
}
