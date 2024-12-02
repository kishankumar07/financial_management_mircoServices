import swaggerAutogen from 'swagger-autogen';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url); 
const __dirname = path.dirname(__filename);
// console.log('debugger:',path.join(__dirname,'./transaction.json'))

const outputFile = path.join(__dirname, "../swagger.json");


const baseFile = path.join(__dirname,'./base.json');
const modules = [
  path.join(__dirname,'./accounts.json'),
  path.join(__dirname,'./transaction.json')
  // path.join(__dirname,'./reporting.json')
];

// Merge base and modules
const mergedSwagger = JSON.parse(fs.readFileSync(baseFile, 'utf8'));
modules.forEach((file) => {
  console.log('these are the array of filesl--- :',file)
  const moduleSwagger = JSON.parse(fs.readFileSync(file, 'utf8'));
  Object.assign(mergedSwagger.paths, moduleSwagger);
});

// Write the merged Swagger JSON
fs.writeFileSync(outputFile, JSON.stringify(mergedSwagger, null, 2));
console.log(`Swagger JSON at api-gateway generated at: ${outputFile}`);
