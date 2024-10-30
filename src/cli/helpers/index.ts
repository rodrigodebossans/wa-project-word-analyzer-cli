import sqlBricks from 'sql-bricks';
import { table, TableUserConfig } from 'table';
import {
  WapFileMetadata,
  WapGetFileMetadataOptions,
  WapIndexedWord,
  WapInsertWordsOptions,
  WapNodeModel,
  WapUpdateWordsOptions,
} from '../models';
import { DatabaseSync } from 'node:sqlite';

export const phraseFilterPredicate = (indexedWords: WapIndexedWord[]) => (word: string) =>
  word.length > 0 &&
  indexedWords.find(
    indexedWord => removeAccents(indexedWord?.name.toLowerCase()) === removeAccents(word.toLowerCase()),
  );

export const findWordByNodeNamePredicate = (word: string) => (node: WapNodeModel) =>
  node.model.name.toLowerCase() === word.toLowerCase();

export const removeAccents = (str: string) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export const findWordByNodeNameWithoutAccentsPredicate = (word: string) => (node: WapNodeModel) => {
  const nodeName = removeAccents(node.model.name.toLowerCase());
  const cleanWord = removeAccents(word.toLowerCase());

  return nodeName === cleanWord;
};

export const getAnalyzeOutput = (wordCountAtDepth: Map<string, number>) => {
  const output = Array.from(wordCountAtDepth.entries())
    .map(([key, count]) => `${key} = ${count}`)
    .join('; ');

  return output;
};

export const getAnalyzeTableMetrics = (parameterLoadingTime: number, phraseVerificationTime: number): string => {
  const config: TableUserConfig = { header: { alignment: 'center', content: ' Analysis Metrics' } };

  const metrics = [
    ['Parameter loading time', `${parameterLoadingTime} ms`],
    ['Phrase verification time', `${phraseVerificationTime} ms`],
  ];

  return table(metrics, config);
};

export const getNoMatchingWordsMessage = (depth: number) =>
  `In the phrase there are no children of the ${depth} level and neither does the ${depth} level have the specified terms.`;

export class WapWordDatabaseHelper {
  static openWordDatabase(): DatabaseSync {
    return new DatabaseSync('word-database.sqlite');
  }

  static createWordsTable(database: DatabaseSync): void {
    database.exec('CREATE TABLE IF NOT EXISTS words (name TEXT NOT NULL, depth INTEGER NOT NULL)');
  }

  static createFileMetadataTable(database: DatabaseSync): void {
    database.exec('CREATE TABLE IF NOT EXISTS file_metadata (filename PRIMARY KEY, modificationTime REAL NOT NULL)');
  }
  static getIndexedWords(database: DatabaseSync): WapIndexedWord[] {
    const query = sqlBricks.select('name, depth').from('words').toString();

    const selectStatement = database.prepare(query);
    return selectStatement.all() as WapIndexedWord[];
  }

  static insertWords({ database, table, words }: WapInsertWordsOptions): void {
    const { text, values } = sqlBricks.insertInto(table, words).toParams({ placeholder: '?' });
    const insertStatement = database.prepare(text);
    insertStatement.run(...values);
  }

  static getFileMetadata({ database, filename }: WapGetFileMetadataOptions): WapFileMetadata {
    const query = sqlBricks.select('filename, modificationTime').from('file_metadata').where({ filename }).toString();

    const selectStatement = database.prepare(query);
    return selectStatement.get() as WapFileMetadata;
  }

  static updateFileMetadata({ database, filename, mtimeMs }: WapUpdateWordsOptions) {
    const statement = database.prepare(
      'INSERT OR REPLACE INTO file_metadata (filename, modificationTime) VALUES (?, ?)',
    );
    return statement.run(filename, mtimeMs);
  }
}
