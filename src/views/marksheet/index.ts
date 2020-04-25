import * as vscode from 'vscode';
import * as path from 'path';
import { BundleJSON, RubricJSON } from '../../types';


export function createMarksheetView(bundle: BundleJSON, student: string) {
    const markSheet = vscode.window.createWebviewPanel(
            'marksheet',
            `${student} Marksheet`,
            vscode.ViewColumn.Two,
            {}
        );
  
    // And set its HTML content
    markSheet.webview.html = getWebviewContent(student, bundle.rubric);

    return markSheet;
}

function getWebviewContent(student: string, rubrics: RubricJSON[]) {
    let html = `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Marksheet</title>
  </head>
  <body>
    <h1>${student} Marksheet</h1>
    <form>
  `;

    for (let rubric of rubrics) {
        html += `<strong>${rubric.label}</strong><br/>`;
        html += `${rubric.description}<br/>`;
        html += `<input type="text" id="${rubric.id}" name="${rubric.id}"><br/>`;
    }

    html += `
    </form>
    <img src="https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif" width="300" />
  </body>
  </html>`;
    return html;
}
