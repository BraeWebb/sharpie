import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { getRubric, RubricItem } from './rubric';
import { BundleJSON } from '../../types';


export class BundleOverviewProvider implements vscode.TreeDataProvider<RubricItem> {
  constructor(private workspaceRoot: string|undefined) {}

  getTreeItem(element: RubricItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: RubricItem): Thenable<RubricItem[]> {
      console.log(element);
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

    if (element === undefined) {
        return Promise.resolve(this.getRubric(json));
    } else {
        return Promise.resolve(element.children);
    }
  }

  private getRubric(json: BundleJSON): RubricItem[] {
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
