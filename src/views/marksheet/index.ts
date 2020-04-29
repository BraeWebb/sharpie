import * as vscode from 'vscode';
import { BundleJSON, Comment } from '../../types';
import { StudentState } from '../../util/student';


export function createMarksheetView(bundle: BundleJSON, student: string) {
    const markSheet = vscode.window.createWebviewPanel(
        'marksheet',
        `${student} Marksheet`,
        vscode.ViewColumn.Two,
        {
            enableScripts: true
        }
    );

    loadView(markSheet);

    return markSheet;
}

function loadView(panel: vscode.WebviewPanel) {
    if (!StudentState.cache) {
        throw Error("No student cached");
    }
  
    const student = StudentState.cache;
    panel.webview.html = getWebviewContent(student.id, student.grades.comments);

    const subscription = StudentState.onGradeChange(student.id, e => {
        console.log(e);
        panel.webview.html = getWebviewContent(e.id, e.grades.comments);
    });

    panel.onDidDispose(
        () => {
          subscription?.dispose();
        }
    );

    panel.webview.onDidReceiveMessage(
        async message => {
            switch (message.command) {
                case 'editIssue':
                    const updatedIssue = await vscode.window.showInputBox({
                        value: student.grades.comments[message.category][message.index].issue || ""
                    });
                    if (updatedIssue) {
                        student.grades.comments[message.category][message.index].issue = updatedIssue;
                        StudentState.writeGrades(student.grades);
                    }
                    return;

                case 'goto':
                    let path = vscode.workspace.rootPath + "/" + message.path;
                    console.log(message);
                    let start = new vscode.Position(message.startLine, message.startCharacter);
                    let end = new vscode.Position(message.startLine, message.endCharacter);

                    let document = await vscode.workspace.openTextDocument(path);
                    let editor = await vscode.window.showTextDocument(document, vscode.ViewColumn.One);

                    // TODO: this isn't working unclear why
                    editor.revealRange(new vscode.Range(start, end));
                    editor.selection = new vscode.Selection(start, end);
                    return;
            }
        },
    );
}

export class MarkSheetSerializer implements vscode.WebviewPanelSerializer {
    async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
        loadView(webviewPanel);
    }
}

function getWebviewContent(student: string, comments: Record<string, Comment[]>) {
    let html = `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Marksheet</title>
      <style>
        .issue {
            cursor: pointer;
        }
      </style>
  </head>
  <body>
    <h1>${student} Marksheet</h1>
  `;

    for (let category in comments) {
        html += `<h3>${category}</h3>`;
        for (let c in comments[category]) {
            let comment = comments[category][c];
            html += `<p>`;
            html += `<span class="issue" data-index="${c}" data-category="${category}"><strong>${comment.issue}</strong></span><br/>`;
            html += `<span class="reference" data-file="${comment.path}" `;
            html += `data-start-line="${comment.start.line}" data-start-character="${comment.start.character}" `;
            html += `data-end-line="${comment.end.line}" data-end-character="${comment.end.character}">`;
            html += `${comment.path} ${comment.start.line}:${comment.start.character}-${comment.end.line}:${comment.end.character}`;
            html += `</span>`;
            html += `</p>`;
        }
    }

    html += `
    <img src="https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif" width="300" />

    <script>
        (function() {
            const vscode = acquireVsCodeApi();

            function edit(issue) {
                return function(e) {
                    vscode.postMessage({
                        command: 'editIssue',
                        category: issue.dataset.category,
                        index: issue.dataset.index,
                    });
                }
            }

            function link(reference) {
                return function(e) {
                    vscode.postMessage({
                        command: 'goto',
                        path: reference.dataset.file,
                        startLine: reference.dataset.startLine,
                        startCharacter: reference.dataset.startCharacter,
                        endLine: reference.dataset.endLine,
                        endCharacter: reference.dataset.endCharacter
                    });
                }
            }
            
            var issues = document.getElementsByClassName('issue');
            for(var i = 0; i < issues.length; i++) {
                var issue = issues[i];
                issue.onclick = edit(issue);
            }

            var references = document.getElementsByClassName('reference');
            for(var i = 0; i < references.length; i++) {
                var reference = references[i];
                reference.onclick = link(reference);
            }
        }())
    </script>
  </body>
  </html>`;
    return html;
}
