import { table, TableUserConfig } from 'table';
import { WapNodeModel } from '../models';

/**
 * Creates a predicate function to find a word by the node's name.
 *
 * @param word - The word to search for in the node's name.
 * @returns A predicate function that takes a `WapNodeModel` and returns `true` if the node's name matches the given word (case-insensitive), otherwise `false`.
 */
export const findWordByNodeNamePredicate = (word: string) => (node: WapNodeModel) =>
  node.model.name.toLowerCase() === word.toLowerCase();

/**
 * Predicate function to find a word in a node's name, ignoring accents.
 *
 * This function takes a word and returns a predicate function that can be used
 * to check if a given node's name matches the word, ignoring any accents.
 *
 * @param word - The word to match against the node's name.
 * @returns A predicate function that takes a `WapNodeModel` and returns `true`
 * if the node's name matches the word (ignoring accents), and `false` otherwise.
 */
export const findWordByNodeNameWithoutAccentsPredicate = (word: string) => (node: WapNodeModel) => {
  const removeAccents = (str: string) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const nodeName = removeAccents(node.model.name.toLowerCase());
  const cleanWord = removeAccents(word.toLowerCase());

  return nodeName === cleanWord;
};

/**
 * Generates a formatted string output from a map of word counts.
 *
 * @param wordCountAtDepth - A map where the key is a word and the value is the count of that word.
 * @returns A string where each entry in the map is formatted as "key = count" and entries are separated by "; ".
 */
export const getAnalyzeOutput = (wordCountAtDepth: Map<string, number>) => {
  const output = Array.from(wordCountAtDepth.entries())
    .map(([key, count]) => `${key} = ${count}`)
    .join('; ');

  return output;
};

/**
 * Generates a table displaying analysis metrics.
 *
 * @param parameterLoadingTime - The time taken to load parameters, in milliseconds.
 * @param phraseVerificationTime - The time taken to verify phrases, in milliseconds.
 * @returns A string representation of the table with the analysis metrics.
 */
export const getAnalyzeTableMetrics = (parameterLoadingTime: number, phraseVerificationTime: number): string => {
  const config: TableUserConfig = { header: { alignment: 'center', content: ' Analysis Metrics' } };

  const metrics = [
    ['Parameter loading time', `${parameterLoadingTime} ms`],
    ['Phrase verification time', `${phraseVerificationTime} ms`],
  ];

  return table(metrics, config);
};

/**
 * Generates a message indicating that there are no matching words at the specified depth level.
 *
 * @param depth - The depth level to check for matching words.
 * @returns A message indicating that there are no children or specified terms at the given depth level.
 */
export const getNoMatchingWordsMessage = (depth: number) =>
  `In the phrase there are no children of the ${depth} level and neither does the ${depth} level have the specified terms.`;
