import * as vscode from 'vscode';
import {BundleJSON, RubricJSON} from './index';


export function getRubric(bundle: BundleJSON) {
    return bundle["rubric"].map(element => {
        return new RubricItem(element, vscode.TreeItemCollapsibleState.Collapsed);
    });
}

export class RubricItem extends vscode.TreeItem {
  constructor(
    private element: RubricJSON,
    public collapsibleState?: vscode.TreeItemCollapsibleState
  ) {
    super(element.label, collapsibleState);
  }

  get tooltip(): string {
    return `${this.label}`;
  }

  get description(): string|boolean {
    return this.element.marks.toString();
  }

  get children(): RubricItem[] {
      let children = [];

    //   this.element = JSON.parse(JSON.stringify(this.element));
    //   this.element.label = `Marks: ${this.element.marks.toString()}`;
    //   children.push(new RubricProperty(this.element));

      this.element = JSON.parse(JSON.stringify(this.element));
      this.element.label = this.element.description;
      children.push(new RubricProperty(this.element));

      return children;
  }
}


class RubricProperty extends RubricItem {
    get description(): string|boolean {
        return false;
    }

    get children(): RubricItem[] {
        return [];
    }
}
