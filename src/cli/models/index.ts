import { DatabaseSync } from 'node:sqlite';
import TreeModel from 'tree-model';

export interface WapAnalyzeCommandOptions {
  depth: number;
  normalize: boolean;
  verbose: boolean;
  index: boolean;
}

export interface WapNode {
  name: string;
  children?: WapNode[];
}

export type WapNodeModel = TreeModel.Node<WapNode>;

export interface WapIndexedWord {
  name: string;
  depth: number;
}

export interface WapFileMetadata {
  filename: string;
  modificationTime: number;
}

export interface WapInsertWordsOptions {
  database: DatabaseSync;
  table: string;
  words: WapIndexedWord[];
}

export interface WapGetFileMetadataOptions {
  database: DatabaseSync;
  filename: string;
}

export interface WapUpdateWordsOptions {
  database: DatabaseSync;
  filename: string;
  mtimeMs: number;
}
