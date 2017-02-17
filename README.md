# atom-phpunit package

Run phpunit and see the results all from inside atom.

## Commands
atom-phpunit comes with 3 commands:
* `run-test` - `Alt+Shift+T`
  * runs the current test lcoated using the cursor
* `run-class` - `Alt+Shift+C`
  * runs the current test class (open file)
* `run-suite` - `Alt+Shift+S`
  * runs phpunit without any filter

## Settings
By default, atom-phpunit assumes you have used composer to pull in the `phpunit` package and uses the `./vendor/bin/phpunit` path. This can be altered in the settings by unchecking the 'Use Vendor' option and setting the path to your `phpunit` binary in the 'PHPUnit Path' setting.

## Preview
![Preview](https://github.com/Synapse791/atom-phpunit/raw/master/preview.gif)
