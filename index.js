const fs = require('fs');
const path = require('path');
const Archive = require('./src/archive');

const input = process.argv[2];
const output = process.argv[3] || 'output.json';

if (!input) {
	console.log('No input file provided');
	console.log('Usage: node index.js input.json [output.json]');
	console.log('If no output file is provided, it will be written to output.json');
	process.exit(1);
}

const inputPath = path.join(__dirname, input);
const outputPath = path.join(__dirname, output);

const data = fs.readFileSync(inputPath, 'utf8');
const json = JSON.parse(data);

const archive = new Archive();

json.routes.forEach(({ route, method, body, query, headers }) => {
	archive.updateRoute(route, method, { body, query, headers });
});

const outputData = JSON.stringify(archive.getAllRoutes(), null, 2);

fs.writeFileSync(outputPath, outputData, 'utf8');