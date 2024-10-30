import { table, TableUserConfig } from 'table';
import { WapNodeModel } from '../models';

export const findWordByNodeNamePredicate = (word: string) => (node: WapNodeModel) =>
  node.model.name.toLowerCase() === word.toLowerCase();

export const findWordByNodeNameWithoutAccentsPredicate = (word: string) => (node: WapNodeModel) => {
  const removeAccents = (str: string) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

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
