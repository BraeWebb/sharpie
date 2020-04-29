// Manage the student state
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { StudentUpdateEvent, BundleJSON, GradeJSON, Comment } from "../types";
import { ExtensionContext, workspace } from "vscode";

function ID(): string {
    return '_' + Math.random().toString(36).substr(2, 9);
};

export class StudentState {
    private static listeners: Map<string, (event: StudentUpdateEvent) => any> = new Map();

    private static context: ExtensionContext;
    private static bundle: BundleJSON;

    private static initialised: boolean = false;
    private static cachedEvent: StudentUpdateEvent|undefined = undefined;
  
    static initialise(context: ExtensionContext, bundle: BundleJSON) {
        this.context = context;
        this.bundle = bundle;
        this.initialised = true;
        if (this.student) {
            this.update(this.student);
        }
    }

    static get student(): string|undefined {
        return this.context.workspaceState.get("sharpie.selectedStudent");
    }

    static get cache(): StudentUpdateEvent|undefined {
        return this.cachedEvent;
    }

    private static notify(update: StudentUpdateEvent) {
        this.cachedEvent = update;
        for (let listener of this.listeners.values()) {
            listener(update);
        }
    }

    static async update(student: string) {
        if (!this.initialised) {
            throw new Error("Trying to update without initialising the student state");
        }

        const root = vscode.workspace.rootPath;
        if (!root) {
            throw new Error("Cannot find workspace");
        }

        const file = vscode.Uri.file(path.join(root, student));
        const grades = this.readGrades(path.join(file.fsPath, "grades.json"));

        this.context.workspaceState.update("sharpie.selectedStudent", student);

        this.notify({
            id: student,
            file: file,
            grades: grades
        });
    }
  
    static subscribe(listener: (event: StudentUpdateEvent) => any): string {
        let id = ID();
        this.listeners.set(id, listener);
        return id;
    }

    static unsubscribe(id: string) {
        this.listeners.delete(id);
    }

    static async addFeedback(comment: Comment) {
        const event = this.cachedEvent;
        if (!event) {
            return;
        }

        const grades = event.grades;
        if (!grades.comments[comment.category]) {
            grades.comments[comment.category] = [];
        }
        grades.comments[comment.category].push(comment);

        this.writeGrades(grades);
    }

    static writeGrades(grades: GradeJSON) {
        const event = this.cachedEvent;
        if (!event) {
            return;
        }

        const file = path.join(event.file.fsPath, "grades.json");
        fs.writeFileSync(file, JSON.stringify(grades));
    }

    static readGrades(folder: string): GradeJSON {
        if (!fs.existsSync(folder)) {
            const grades = {
                id: "hi",
                grades: {},
                comments: {}
            };
            fs.writeFileSync(folder, JSON.stringify(grades));
            return grades;
        }

        return JSON.parse(fs.readFileSync(folder, 'utf-8'));
    }

    static onGradeChange(student: string, listener: (event: StudentUpdateEvent) => any): vscode.Disposable|undefined {
        if (!workspace.rootPath) {
            return undefined;
        }

        const pattern = new vscode.RelativePattern(workspace.rootPath, `${student}/grades.json`);
        const watcher = workspace.createFileSystemWatcher(pattern);
        watcher.onDidChange(e => {
            const update = {
                id: student,
                file: e,
                grades: this.readGrades(e.fsPath)
            };
            listener(update);
        });
        return watcher;
    }
  }