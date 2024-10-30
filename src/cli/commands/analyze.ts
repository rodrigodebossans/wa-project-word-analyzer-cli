/* eslint-disable @typescript-eslint/no-explicit-any */
import { DatabaseSync } from 'node:sqlite';
import { statSync } from 'fs';
import { resolve } from 'path';
import TreeModel from 'tree-model';
import { performance } from 'perf_hooks';
import { Command, InvalidArgumentError } from 'commander';

import { WapMetricLabels } from '../enums';
import { WapDepthParser } from '../parsers/depth-parser';
import { WapAnalyzeCommandOptions, WapNode } from '../models';
import {
  findWordByNodeNamePredicate,
  findWordByNodeNameWithoutAccentsPredicate,
  getAnalyzeOutput,
  getAnalyzeTableMetrics,
  getNoMatchingWordsMessage,
  phraseFilterPredicate,
  WapWordDatabaseHelper,
} from '../helpers';
import classificationTreeJson from './../../../dicts/classification-tree.json';

export class WapAnalyzeCommand extends Command {
  private parameterLoadingTimeStartLabel = `${WapMetricLabels.PARAMETER_LOADING_TIME}-start`;
  private parameterLoadingTimeEndLabel = `${WapMetricLabels.PARAMETER_LOADING_TIME}-end`;

  private phraseVerificationTimeStartLabel = `${WapMetricLabels.PHRASE_VERIFICATION_TIME}-start`;
  private phraseVerificationEndLabel = `${WapMetricLabels.PHRASE_VERIFICATION_TIME}-end`;

  constructor() {
    super('analyze');

    const observer = new PerformanceObserver(items => {
      const [parameterLoadingTime = 0, phraseVerificationTime = 0] = items.getEntries().map(entry => entry.duration);

      const options = this.opts() as WapAnalyzeCommandOptions;
      if (options.verbose) console.table(getAnalyzeTableMetrics(parameterLoadingTime, phraseVerificationTime));

      performance.clearMarks();
    });

    observer.observe({ entryTypes: ['measure'] });

    performance.mark(this.parameterLoadingTimeStartLabel);

    this.usage('[options] <phrase>')
      .description('Parses the given sentence and displays a table with the word count at the specified depth level')
      .argument('<phrase>', 'text to be analyzed')
      .requiredOption('-d, --depth <value>', 'tree depth level for which to display the count', WapDepthParser.parse)
      .option('-n, --normalize', 'ignore special characters in words')
      .option('-i, --index', 'index words in the database to improve performance')
      .option('-v, --verbose', 'display table with execution metrics')
      .hook('preAction', () => {
        performance.mark(this.parameterLoadingTimeEndLabel);
        performance.measure(
          WapMetricLabels.PARAMETER_LOADING_TIME,
          this.parameterLoadingTimeStartLabel,
          this.parameterLoadingTimeEndLabel,
        );
        performance.mark(this.phraseVerificationTimeStartLabel);
      })
      .action(this.execute as any)
      .hook('postAction', () => {
        performance.mark(this.phraseVerificationEndLabel);
        performance.measure(
          WapMetricLabels.PHRASE_VERIFICATION_TIME,
          this.phraseVerificationTimeStartLabel,
          this.phraseVerificationEndLabel,
        );
      });
  }

  indexWordsInDatabase(database: DatabaseSync, tree: TreeModel.Node<WapNode>): void {
    WapWordDatabaseHelper.createWordsTable(database);
    WapWordDatabaseHelper.createFileMetadataTable(database);

    const fileProps = {
      filename: 'classification-tree.json',
      path: resolve(__dirname, './../../../dicts/classification-tree.json'),
    };

    const classificationTreePath = resolve(__dirname, fileProps.path);
    const treeFileStats = statSync(classificationTreePath);

    const storageFileMetadata = WapWordDatabaseHelper.getFileMetadata({ database, filename: fileProps.filename });
    const fileIsNotChanged = storageFileMetadata?.modificationTime === treeFileStats.mtimeMs;
    if (fileIsNotChanged) return;

    WapWordDatabaseHelper.updateFileMetadata({
      database,
      filename: fileProps.filename,
      mtimeMs: treeFileStats.mtimeMs,
    });

    const allWordsInClassificationTree = tree
      .all(node => !!node)
      .map(node => ({ name: node.model.name, depth: node.getPath().length }));

    WapWordDatabaseHelper.insertWords({
      database,
      table: 'words',
      words: allWordsInClassificationTree,
    });
  }

  async execute(phrase: string, options: WapAnalyzeCommandOptions): Promise<string> {
    if (!phrase) throw new InvalidArgumentError('Phrase is required');

    const treeModel = new TreeModel();
    const tree = treeModel.parse<WapNode>(classificationTreeJson);

    let words = null;

    if (options.index) {
      const database = WapWordDatabaseHelper.openWordDatabase();
      this.indexWordsInDatabase(database, tree);
      const indexedWords = WapWordDatabaseHelper.getIndexedWords(database);
      words = phrase.split(/\s+/).filter(phraseFilterPredicate(indexedWords));
    } else words = phrase.split(/\s+/).filter(word => word.length > 0);

    const wordCountOutputMap: Map<string, number> = new Map();
    const nodesAtDepth = tree.all(node => node.getPath().length === options.depth);

    let totalNodesProcessed = 0;

    const findPredicate = options.normalize ? findWordByNodeNameWithoutAccentsPredicate : findWordByNodeNamePredicate;

    for (const word of words) {
      const matchingNode = nodesAtDepth.find(node => node.first(findPredicate(word)));
      if (!matchingNode) continue;

      const name = matchingNode?.model.name;
      if (name) wordCountOutputMap.set(name, (wordCountOutputMap.get(name) || 0) + 1);

      totalNodesProcessed++;
    }

    if (totalNodesProcessed === 0) {
      const noMatchingWordsMessage = getNoMatchingWordsMessage(options.depth);
      console.log(noMatchingWordsMessage);
      return noMatchingWordsMessage;
    }

    const output = getAnalyzeOutput(wordCountOutputMap);
    console.log(output);

    return output;
  }
}
