const Archive = require('./archive');

const archive = new Archive();

console.time('first_update');
archive.updateRoute('/test', 'GET', {
	body: {
		name: 'test',
		age: 20,
		likes: ['test', 'test2'],
		address: {
			street: 'test',
			city: 'test',
			state: 'test',
		}
	},
	query: {
		age: 'number'
	},
	headers: {
		'content-type': 'application/json'
	}
});
console.timeEnd('first_update');

console.time('second_update');
archive.updateRoute('/test', 'GET', {
	body: {
		name: 'test1234',
		likes: ['test', 'test2'],
		likes2: ['test', 'test2']
	}
});
console.timeEnd('second_update');

console.time('third_update');
archive.updateRoute('/test', 'GET', {
	body: {
		name: 'tes',
		likes: ['testapskpkad;;askd', 't'],
		users: [
			{
				name: 'test',
				age: 20,
				isActive: true,
				details: {
					likes: ['test', 'test2'],
					address: {
						street: 'test',
						city: 'test',
					}
				}
			},
			{
				name: 'test',
				age: 20,
				isActive: false,
			}
		]
	}
});
console.timeEnd('third_update');

console.time('query');
const route = archive.getRoute('/test', 'GET');
console.timeEnd('query');

console.log(JSON.stringify(route, null, 2));
