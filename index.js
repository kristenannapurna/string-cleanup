//  node index.js [path-to-locales-file] [path-to-app-folder]

const fs = require('fs');
const args = process.argv;
const path = require('path');
const locales = fs.readFileSync(path.resolve(args[2]), 'utf-8');

const parsedData = JSON.parse(locales);
const localizedKeys = Object.keys(parsedData.issuer);

const sdk = path.resolve(args[3]);

function getFile(filePath) {
  return fs.readdirSync(filePath).map(file => {
    const resolvedPath = path.resolve(filePath, file);
    if (fs.lstatSync(resolvedPath).isDirectory()) {
      return getFile(resolvedPath);
    } else {
      return resolvedPath;
    }
  });
}

const fileList = getFile(path.resolve(sdk))
  .flat(5)
  .filter(file => {
    return file.split('.')[1] === 'ts';
  });

const stringUsage = fileList.reduce((acc, file) => {
  const data = fs.readFileSync(file, 'utf-8');
  localizedKeys.forEach(key => {
    if (acc && acc[key] >= 0) {
      if (data.includes(key)) {
        acc[key]++;
      }
    } else {
      acc[key] = 0;
    }
  });
  return acc;
}, {});

const unusedStrings = Object.entries(stringUsage)
  .filter(key => {
    return key[1] === 0;
  })
  .map(key => key[0]);

console.log(unusedStrings);
