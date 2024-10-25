import { Command } from 'commander';
import { WapAnalyzeCommand } from './commands/analyze';
import { version } from '../../package.json';

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
