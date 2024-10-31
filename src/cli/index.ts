import { Command } from 'commander';
import { WapAnalyzeCommand } from './commands/analyze';
import { version } from '../../package.json';

/**
 * The `WapWordAnalyzerCLI` class extends the `Command` class to create a command-line interface (CLI) for the Word Analyzer project.
 *
 * This CLI provides the following functionalities:
 * - Sets the name of the CLI to 'wap'.
 * - Defines the usage pattern for the CLI.
 * - Sets the version of the CLI.
 * - Adds the `WapAnalyzeCommand` to the CLI.
 * - Parses the command-line arguments.
 * - Displays help information after an error occurs.
 *
 * @extends Command
 */
export class WapWordAnalyzerCLI extends Command {
  constructor() {
    super();

    this.name('wap')
      .usage('[command] [options]')
      .version(version)
      .addCommand(new WapAnalyzeCommand())
      .parse(process.argv)
      .showHelpAfterError(true);
  }
}
