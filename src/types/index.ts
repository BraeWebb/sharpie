export type BundleJSON = JSON & {
    name: string,
    rubric: RubricJSON[]
};

export type RubricJSON = JSON & {
    id: string,
    label: string,
    description: string,
    marks?: number
};
