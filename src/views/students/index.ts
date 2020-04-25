import * as vscode from 'vscode';
import * as path from 'path';
import { BundleJSON } from '../../types';


export function createStudentView(bundle: BundleJSON, context: vscode.ExtensionContext) {
    const studentTree = vscode.window.createTreeView('sharpieStudents', {
        canSelectMany: false,
        showCollapseAll: true,
        treeDataProvider: new StudentFileProvider(bundle)
    });
    
    let statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    let student = context.workspaceState.get<string>("sharpie.selectedStudent");
    if (!student) {
        student = "No Student Selected";
    }
    statusBar.text = student;
    statusBar.command = "sharpie.openMarksheet";
    statusBar.show();

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

        let student = e.selection[0].label;
        if (!student) {
            return;
        }

        context.workspaceState.update("sharpie.selectedStudent", student);
        statusBar.text = student;
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
      const studentFiles = await (await vscode.workspace.findFiles(pattern)).sort();

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
        this.contextValue = "student";

        const regex : RegExp = /\/(s[0-9]*)\/s[0-9]*\.style/;
        const groups = regex.exec(path);
        if (!groups) {
            return;
        }

        this.label = groups[1];
    }

    // TODO: This is just a POC, when grades start happening update the ticky
    public get description() {
        if (path.basename(this.path) < "s4427935.style") {
            return "✔";
        } else {
            return false;
        }
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
