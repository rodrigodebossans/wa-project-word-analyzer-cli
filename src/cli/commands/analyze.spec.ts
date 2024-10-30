import { InvalidArgumentError } from 'commander';
import { WapAnalyzeCommand } from './analyze';
import { getNoMatchingWordsMessage } from '../helpers';

jest.mock('./../../../dicts/classification-tree.json', () =>
  jest.requireActual('./../../../mocks/classification-tree.json'),
);

describe('Analyze command', () => {
  let command: WapAnalyzeCommand;

  beforeEach(() => {
    jest.spyOn(global.console, 'log').mockImplementation(() => jest.fn());

    command = new WapAnalyzeCommand();
  });

  it('should handle empty phrase', () => {
    const phrase = '';

    expect(() => command.execute(phrase, { depth: 3, normalize: true, verbose: true })).toThrow(
      new InvalidArgumentError('Phrase is required'),
    );
  });

  it('should handle phrase with matching nodes', () => {
    const phrase = '“Eu amo papagaios';

    const result = command.execute(phrase, { depth: 2, normalize: false, verbose: false });
    const expectedResult = 'Aves = 1';

    expect(result).toBe(expectedResult);
  });

  it('should handle phrase with normalization', () => {
    const phrase = 'Eu vi górilas e pâpágàiôs';

    const result = command.execute(phrase, { depth: 3, normalize: true, verbose: false });
    const expectedResult = 'Primatas = 1; Pássaros = 1';

    expect(result).toBe(expectedResult);
  });

  it('should handle phrase with no matching nodes', () => {
    const phrase = 'Eu tenho preferência por animais carnívoros';

    const depth = 5;
    const result = command.execute(phrase, { depth, normalize: true, verbose: true });
    const expectedResult = getNoMatchingWordsMessage(depth);

    expect(result).toBe(expectedResult);
  });

  it('should handle a phrase with more than 5000 characters', () => {
    const phrase = 'Gorilas Papagaios Animais Leopardos Asnos '.repeat(5_000_000);
    const result = command.execute(phrase, { depth: 3, normalize: false, verbose: false });

    const expectedResult = 'Primatas = 5000000; Pássaros = 5000000; Carnívoros = 5000000; Herbívoros = 5000000';

    expect(result).toBe(expectedResult);
  });
});
