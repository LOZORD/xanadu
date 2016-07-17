// Taken from here:
// https://github.com/mochajs/mocha/wiki/Using-mocha-programmatically

import * as _ from 'lodash';
import * as fs from 'fs';
import * as path from 'path';
import * as mocha from 'mocha';

const distDir = './dist';
const testPattern = 'Spec.js';

// assuming this will be called as `node dist/test.js <reporter>`
const possibleReporter = process.argv[2];

const mochaOptions = {
  reporter: possibleReporter || 'dot'
};

const getTestFiles = (dir : string) : string[] => {
  const contents = fs.readdirSync(dir);

  const testFiles : string[] = _
    .chain(contents)
    .filter((fileName) => _.endsWith(fileName, testPattern))
    .map((fileName) => path.join(dir, fileName))
    .value();

  const newDirs : string[] = _
    .chain(contents)
    .map((fileName) => path.join(dir, fileName))
    .filter((fileName) => fs.statSync(fileName).isDirectory())
    .value();

  const newResults = _
    .chain(newDirs)
    .map((newDir : string) : string[] => getTestFiles(newDir))
    .flatten<string>()
    .value();

  return testFiles.concat(newResults);
};

const runMocha = (baseDir : string, mochaOptions, proc) => {
  const mocha = new Mocha(mochaOptions);

  const testFiles = getTestFiles(distDir);

  _.forEach(testFiles, (testFile) => mocha.addFile(testFile));

  // exit with non-zero (error) status if there were failures
  mocha.run((failures) => {
    proc.on('exit', () => proc.exit(failures));
  });

  return testFiles;
};

runMocha(distDir, mochaOptions, process);
