import TreeModel from 'tree-model';
import { performance } from 'perf_hooks';
import { Command, InvalidArgumentError } from 'commander';

import { WapDepthParser } from '../parsers/depth-parser';
import { WapAnalyzeCommandOptions, WapNode } from '../models';
import {
  findWordByNodeNamePredicate,
  findWordByNodeNameWithoutAccentsPredicate,
  getAnalyzeOutput,
  getAnalyzeTableMetrics,
  getNoMatchingWordsMessage,
} from '../helpers';
import classificationTreeJson from './../../../dicts/classification-tree.json';
import { WapMetricLabels } from '../enums';

/**
 * Command class for analyzing a given phrase and displaying a table with the word count at a specified depth level.
 *
 * @class
 * @extends {Command}
 */
export class WapAnalyzeCommand extends Command {
  /**
   * Label for the start of parameter loading time measurement.
   * @private
   * @type {string}
   */
  private parameterLoadingTimeStartLabel = `${WapMetricLabels.PARAMETER_LOADING_TIME}-start`;

  /**
   * Label for the end of parameter loading time measurement.
   * @private
   * @type {string}
   */
  private parameterLoadingTimeEndLabel = `${WapMetricLabels.PARAMETER_LOADING_TIME}-end`;

  /**
   * Label for the start of phrase verification time measurement.
   * @private
   * @type {string}
   */
  private phraseVerificationTimeStartLabel = `${WapMetricLabels.PHRASE_VERIFICATION_TIME}-start`;

  /**
   * Label for the end of phrase verification time measurement.
   * @private
   * @type {string}
   */
  private phraseVerificationEndLabel = `${WapMetricLabels.PHRASE_VERIFICATION_TIME}-end`;

  /**
   * Constructs a new WapAnalyzeCommand instance.
   * Sets up performance observers and command options.
   */
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
      .action((phrase, options) => {
        this.execute(phrase, options);
      })
      .hook('postAction', () => {
        performance.mark(this.phraseVerificationEndLabel);
        performance.measure(
          WapMetricLabels.PHRASE_VERIFICATION_TIME,
          this.phraseVerificationTimeStartLabel,
          this.phraseVerificationEndLabel,
        );
      });
  }

  /**
   * Executes the analyze command.
   *
   * @param {string} phrase - The phrase to be analyzed.
   * @param {WapAnalyzeCommandOptions} options - The options for the analyze command.
   * @returns {string} - The output of the analysis.
   * @throws {InvalidArgumentError} - If the phrase is not provided.
   */
  execute(phrase: string, options: WapAnalyzeCommandOptions): string {
    if (!phrase) throw new InvalidArgumentError('Phrase is required');

    const treeModel = new TreeModel();
    const tree = treeModel.parse<WapNode>(classificationTreeJson);

    const wordCountOutputMap: Map<string, number> = new Map();
    const words = phrase.split(/\s+/).filter(word => word.length > 0);
    const nodesAtDepth = tree.all(node => node.getPath().length === options.depth);

    let totalNodesProcessed = 0;

    for (const word of words) {
      let findPredicate = findWordByNodeNamePredicate(word);
      if (options.normalize) findPredicate = findWordByNodeNameWithoutAccentsPredicate(word);

      const matchingNode = nodesAtDepth.find(node => node.first(findPredicate));
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
