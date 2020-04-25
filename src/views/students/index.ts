import * as vscode from 'vscode';
import * as path from 'path';
import { BundleJSON } from '../../types';


export function createStudentView(bundle: BundleJSON) {
    const studentTree = vscode.window.createTreeView('sharpieStudents', {
        canSelectMany: false,
        showCollapseAll: true,
        treeDataProvider: new StudentFileProvider(bundle)
    });
    studentTree.onDidChangeSelection(async e => {
        if (e.selection[0] instanceof StudentFile) {
            if (!e.selection[0].resourceUri) {
                return;
            }
            vscode.window.showTextDocument(e.selection[0].resourceUri);
        }
        if (!(e.selection[0] instanceof StudentItem)) {
            return;
        }

        const files = await e.selection[0].children();
        for (let child of files) {
            if (!child.resourceUri 
                || child.collapsibleState === vscode.TreeItemCollapsibleState.Collapsed) {
                continue;
            }
            vscode.window.showTextDocument(child.resourceUri, {preview: false});
        }
    });

    return studentTree;
}


export class StudentFileProvider implements vscode.TreeDataProvider<AbstractStudentItem> {
  constructor(private bundle: BundleJSON) {}

  getTreeItem(element: AbstractStudentItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: AbstractStudentItem): Thenable<AbstractStudentItem[]> {
    if (element === undefined) {
        return this.getStudents();
    } else {
        return element.children();
    }
  }

  private async getStudents(): Promise<AbstractStudentItem[]> {
      const root = vscode.workspace.rootPath;
      if (!root) {
          return [];
      }

      const pattern = new vscode.RelativePattern(root, "s???????/s???????.style");
      const studentFiles = await vscode.workspace.findFiles(pattern);

      let items = [];
      for (let file of studentFiles) {
          items.push(new StudentItem(file.path, this.bundle));
      }
      
      return items;
  }
}

class AbstractStudentItem extends vscode.TreeItem {
    public async children(): Promise<AbstractStudentItem[]> {
        return [];
    }
}

class StudentItem extends AbstractStudentItem {
    constructor(private path: string, private bundle: BundleJSON) {
        super("Loading...", vscode.TreeItemCollapsibleState.Collapsed);

        const regex : RegExp = /\/(s[0-9]*)\/s[0-9]*\.style/;
        const groups = regex.exec(path);
        if (!groups) {
            return;
        }

        this.label = groups[1];
    }

    public async children(): Promise<AbstractStudentItem[]> {
        const base = path.dirname(this.path);

        let studentFiles: vscode.Uri[] = [];
        for (let filePattern of this.bundle.files) {
            const pattern = new vscode.RelativePattern(base, filePattern);
            studentFiles = studentFiles.concat(await vscode.workspace.findFiles(pattern));
        }

        return studentFiles.map(file => {
            return new StudentFile(file);
        });
    }
}

class StudentFile extends AbstractStudentItem {

}
