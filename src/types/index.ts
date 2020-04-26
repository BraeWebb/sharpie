import { Uri } from "vscode";

export type BundleJSON = JSON & {
    name: string,
    uuid: string,
    rubric: RubricJSON[]
    files: string[]
};

export type RubricJSON = JSON & {
    id: string,
    label: string,
    description: string,
    marks?: number
};

type Grade = {
    mark?: number
};

type Position = {
    line: number,
    character: number
};

export type Comment = {
    path: string,
    start: Position
    end: Position,

    issue: string,
    category: string
};

export type GradeJSON = {
    id: string,
    grades: Record<string, Grade>,
    comments: Record<string, Comment[]>,
};

export type IssueCacheJSON = JSON & {

};

export type StudentUpdateEvent = {
    id: string,
    file: Uri,
    grades: GradeJSON
};
