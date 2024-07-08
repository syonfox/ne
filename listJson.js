const fs = require('fs');
const path = require('path');

const rootDirectory = '.'; // Replace with your actual directory
let jsonFiles = [];

function findJsonFiles(directory) {
  fs.readdirSync(directory, { withFileTypes: true }).forEach(entry => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      findJsonFiles(entryPath);
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      jsonFiles.push(entryPath);
    }
  });
}

findJsonFiles(rootDirectory);

console.log(JSON.stringify(jsonFiles, null, 2));
