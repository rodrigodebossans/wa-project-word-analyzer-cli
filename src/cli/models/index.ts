import TreeModel from 'tree-model';

/**
 * Options for the WapAnalyzeCommand.
 */
export interface WapAnalyzeCommandOptions {
  depth: number;
  normalize: boolean;
  verbose: boolean;
}

/**
 * Represents a node in the Word Analyzer Project (WAP) tree structure.
 * Each node has a name and can optionally have children nodes.
 */
export interface WapNode {
  name: string;
  children?: WapNode[];
}

export type WapNodeModel = TreeModel.Node<WapNode>;
