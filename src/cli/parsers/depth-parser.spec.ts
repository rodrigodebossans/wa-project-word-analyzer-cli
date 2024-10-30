import { WapDepthParser } from './depth-parser';
import { InvalidOptionArgumentError } from 'commander';

describe('WapDepthParser', () => {
  it('should parse a valid number string', () => {
    expect(WapDepthParser.parse('10')).toBe(10);
  });

  it('should throw an error for a non-numeric string', () => {
    expect(() => WapDepthParser.parse('abc')).toThrow(
      new InvalidOptionArgumentError('Depth must be a number greater than 0'),
    );
  });

  it('should throw an error for a negative number', () => {
    expect(() => WapDepthParser.parse('-5')).toThrow(
      new InvalidOptionArgumentError('Depth must be a number greater than 0'),
    );
  });

  it('should throw an error for zero', () => {
    expect(() => WapDepthParser.parse('0')).toThrow(
      new InvalidOptionArgumentError('Depth must be a number greater than 0'),
    );
  });

  it('should throw an error for an empty string', () => {
    expect(() => WapDepthParser.parse('')).toThrow(
      new InvalidOptionArgumentError('Depth must be a number greater than 0'),
    );
  });
});
