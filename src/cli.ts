import * as fs from 'fs'
import * as path from 'path'
import * as yargs from 'yargs'
import { Options as PrettierOptions } from 'prettier'
import { highlight } from 'cardinal'
import * as getStdin from 'get-stdin'
import create from './'

function handler(data?: string) {
  return function handler1(argv: yargs.Arguments): void {
    const prettierOptions = {
      semi: argv['semi'],
      singleQuote: argv['single-quote'],
      jsxSingleQuote: argv['jsx-single-quote'],
      bracketSpacing: argv['bracket-spacing'],
      tabWidth: argv['tab-width'],
      useTabs: argv['use-tabs'],
      trailingComma: argv['trailing-comma'],
      proseWrap: argv['prose-wrap']
    } as PrettierOptions

    const input = argv['input'] as string
    const output = argv['output'] as string
    const color = argv['color'] as boolean

    try {
      const result: string = create(
        data ? data : fs.readFileSync(input, 'utf8'),
        { prettierOptions }
      )

      if (!output)
        return console.log((color ? highlight(result) : result) + '\n')

      const filepath: string = path.resolve(output)
      fs.writeFileSync(filepath, data, 'utf8')
      console.log(`Done at ${filepath}`)
    } catch (e) {
      throw new Error(e)
    }
  }
}

export default async function main(args: string[]): Promise<void> {
  const data: string = await getStdin()
  const isReadData: boolean = '' !== data
  yargs
    .strict()
    .command({
      command: `$0 ${isReadData ? '' : '<input> '}[options]`,
      describe: 'A code generator to generate TypeScript code generator from TypeScript code',
      handler: handler(isReadData ? data : undefined),
      builder: (yargs: yargs.Argv): yargs.Argv => {
        if (isReadData) return yargs
        return yargs.positional('input', {
          describe: 'input file path',
          type: 'string',
          normalize: true
        }).epilog(`
Welcome to contribute, any bugs or features please report on:

* Bug: https://github.com/HearTao/ts-creator/issues/new?template=bug.md
* Feature: https://github.com/HearTao/ts-creator/issues/new?template=feature.md

Also see the online playground:

  https://ts-creator.js.org

Happy hack with ts-creator`)
      }
    })
    .option('o', {
      alias: 'output',
      describe: 'Output directory',
      type: 'string',
      requiresArg: true
    })
    .option('color', {
      describe: 'colorful result when print on terminal',
      type: 'boolean',
      default: false
    })

    .option('semi', {
      group: 'Prettier Options',
      default: false,
      type: 'boolean'
    })
    .option('single-quote', {
      group: 'Prettier Options',
      default: true,
      type: 'boolean'
    })
    .option('jsx-single-quote', {
      group: 'Prettier Options',
      default: false,
      type: 'boolean'
    })
    .option('bracket-spacing', {
      group: 'Prettier Options',
      default: true,
      type: 'boolean'
    })
    .option('tab-width', {
      group: 'Prettier Options',
      default: 2,
      type: 'number'
    })
    .option('use-tabs', {
      group: 'Prettier Options',
      default: false,
      type: 'boolean'
    })
    .option('trailing-comma', {
      group: 'Prettier Options',
      default: 'none',
      type: 'string',
      choices: ['none', 'es5', 'all']
    })
    .option('prose-wrap', {
      group: 'Prettier Options',
      default: 'preserve',
      type: 'string',
      choices: ['always', 'never', 'preserve']
    })
      
    .version()
    .alias('v', 'version')
    .showHelpOnFail(true, 'Specify --help for available options')
    .help('h')
    .alias('h', 'help')
    .argv
}
