import { InvalidOptionArgumentError } from 'commander';

export class WapDepthParser {
  static parse(value: string): number {
    const depth = parseFloat(value);

    if (isNaN(depth) || depth <= 0) throw new InvalidOptionArgumentError('Depth must be a number greater than 0');

    return depth;
  }
}
