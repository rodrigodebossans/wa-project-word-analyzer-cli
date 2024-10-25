import TreeModel from 'tree-model';

export interface WapAnalyzeCommandOptions {
  depth: number;
  normalize: boolean;
  verbose: boolean;
}

export interface WapNode {
  name: string;
  children?: WapNode[];
}

export type WapNodeModel = TreeModel.Node<WapNode>;
