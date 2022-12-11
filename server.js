const express = require('express');
const SchemaConvertor = require('./convertor');
const fs = require('fs');
const app = express();
const port = 3000;

const schema = JSON.parse(fs.readFileSync('./output.json', 'utf8'));

// Serve static files
app.use(express.static('public'));


// Render the index.html file
app.get('/', (req, res) => {
	res.sendFile(__dirname + '/public/index.html');
});
Object.keys(schema).forEach((key) => {
	Object.keys(schema[key]).forEach((key2) => {
		console.log(SchemaConvertor);
		schema[key][key2]["body"] = new SchemaConvertor(schema[key][key2]["body"]).createSchema();
	})
});
app.get("/schema", (req, res) => {

	res.send(schema);
})

// Start the server
app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
})