import * as vscode from 'vscode';
import {BundleJSON, RubricJSON} from './index';


export function getRubric(bundle: BundleJSON) {
    return bundle["rubric"].map(element => {
        return new RubricItem(element);
    });
}

class RubricItem extends vscode.TreeItem {
  constructor(
    private element: RubricJSON
  ) {
    super(element.label);
  }

  get tooltip(): string {
    return `${this.label}`;
  }

  get description(): string {
    return this.element.description;
  }
}