import { InvalidOptionArgumentError } from 'commander';

/**
 * Class responsible for parsing depth values from strings.
 */
export class WapDepthParser {
  /**
   * Parses a string value into a number representing depth.
   *
   * @param value - The string value to be parsed.
   * @returns The parsed depth as a number.
   * @throws {InvalidOptionArgumentError} If the parsed depth is not a number greater than 0.
   */
  static parse(value: string): number {
    const depth = parseFloat(value);

    if (isNaN(depth) || depth <= 0) throw new InvalidOptionArgumentError('Depth must be a number greater than 0');

    return depth;
  }
}
