const SchemaGenerator = require('../generator');

class Archive {
	constructor() {
		this.lookup = {};
		this.schemaGenerator = new SchemaGenerator();
	}

	updateRoute(route, method, { body, query, headers }) {
		// if route doesn't start with /, add it
		if (route[0] !== '/') route = `/${route}`;
		// capitalize method
		method = method.toUpperCase();
		// if route doesn't exist, create it
		if (!this.lookup[route]) this.lookup[route] = {};
		// if method doesn't exist, create it
		if (!this.lookup[route][method]) this.lookup[route][method] = {};

		const excisingSchema = this.lookup[route][method]?.body || {};
		const schema = this.schemaGenerator.update({ payload: body, excisingSchema });
		this.lookup[route][method] = {
			body: schema,
			query: query || this.lookup[route][method].query,
			headers: headers || this.lookup[route][method].headers
		};
	}

	getRoute(route, method) {
		return this.lookup[route][method] || {};
	}

	getAllRoutes() {
		return this.lookup;
	}
}

module.exports = Archive;