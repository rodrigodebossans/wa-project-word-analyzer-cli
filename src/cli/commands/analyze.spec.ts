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

    expect(() => command.execute(phrase, { depth: 3, normalize: true, index: false, verbose: true })).rejects.toThrow(
      new InvalidArgumentError('Phrase is required'),
    );
  });

  it('should handle phrase with matching nodes', async () => {
    const phrase = 'Eu amo papagaios';

    const result = await command.execute(phrase, { depth: 2, normalize: false, index: true, verbose: false });
    const expectedResult = 'Aves = 1';

    expect(result).toBe(expectedResult);
  });

  it('should handle phrase with normalization', async () => {
    const phrase = 'Eu vi górilas e pâpágàiôs';

    const result = await command.execute(phrase, { depth: 3, normalize: true, index: false, verbose: false });
    const expectedResult = 'Primatas = 1; Pássaros = 1';

    expect(result).toBe(expectedResult);
  });

  it('should handle phrase with no matching nodes', async () => {
    const phrase = 'Eu tenho preferência por animais carnívoros';

    const depth = 5;
    const result = await command.execute(phrase, { depth, normalize: true, index: false, verbose: true });
    const expectedResult = getNoMatchingWordsMessage(depth);

    expect(result).toBe(expectedResult);
  });

  it('should handle a sentence with more than 25 million words', async () => {
    const phrase = 'Gorilas Papagaios Animais Leopardos Asnos '.repeat(5_000_000);
    const result = await command.execute(phrase, { depth: 3, normalize: false, index: false, verbose: false });

    const expectedResult = 'Primatas = 5000000; Pássaros = 5000000; Carnívoros = 5000000; Herbívoros = 5000000';

    expect(result).toBe(expectedResult);
  });

  it('should handle a sentence with more than 25 million words with indexing enabled', async () => {
    const phrase = 'Gorilas Papagaios Animais Leopardos Asnos '.repeat(5_000_000);

    const result = await command.execute(phrase, { depth: 3, normalize: false, index: true, verbose: false });
    const expectedResult = 'Primatas = 5000000; Pássaros = 5000000; Carnívoros = 5000000; Herbívoros = 5000000';

    expect(result).toBe(expectedResult);
  });
});
