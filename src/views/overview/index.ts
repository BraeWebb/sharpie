import * as vscode from 'vscode';
import { getRubric, RubricItem } from './rubric';
import { BundleJSON } from '../../types';


export class BundleOverviewProvider implements vscode.TreeDataProvider<RubricItem> {
  constructor(private bundle: BundleJSON) {}

  private _onDidChangeTreeData: vscode.EventEmitter<RubricItem> = new vscode.EventEmitter<RubricItem>();
  readonly onDidChangeTreeData: vscode.Event<RubricItem> = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: RubricItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: RubricItem): Thenable<RubricItem[]> {
    if (element === undefined) {
        return Promise.resolve(this.getRubric(this.bundle));
    } else {
        return Promise.resolve(element.children);
    }
  }

  private getRubric(json: BundleJSON): RubricItem[] {
      return getRubric(json);
  }
}
