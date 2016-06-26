// Taken from here:
// https://github.com/mochajs/mocha/wiki/Using-mocha-programmatically

import _ from 'lodash';
import fs from 'fs';
import path from 'path';
import Mocha from 'Mocha';

const distDir = './dist';
const testPattern = 'Spec.js';
const mochaOptions = {
  reporter: 'dot'
};

const getTestFiles = (dir) => {
  const contents = fs.readdirSync(dir);

  const testFiles = _
    .chain(contents)
    .filter((fileName) => _.endsWith(fileName, testPattern))
    .map((fileName) => path.join(dir, fileName))
    .value();

  const newDirs = _
    .chain(contents)
    .map((fileName) => path.join(dir, fileName))
    .filter((fileName) => fs.statSync(fileName).isDirectory())
    .value();

  const newResults = _
    .chain(newDirs)
    .map((newDir) => getTestFiles(newDir))
    .flatten()
    .value();

  return testFiles.concat(newResults);
};

const runMocha = (baseDir, mochaOptions, proc) => {
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
