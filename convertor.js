class SchemaConvertor {
	constructor(schema) {
		this.schema = schema;
		this.result = {
			type: 'object',
			properties: {}
		};
	}

	createSchema() {
		this.schema.forEach((item) => this.createSchemaItem(item));
		return this.result;
	}

	createSchemaItem(item) {
		const path = item.path.split('.');
		const lastPath = path.pop();
		let current = this.result.properties;

		path.forEach((pathItem) => {
			if (!current[pathItem]) {
				current[pathItem] = {
					type: 'object',
					properties: {}
				};
			}

			current = current[pathItem].properties;
		});

		current[lastPath] = this.createSchemaItemByType(item);
	}

	createSchemaItemByType(item) {
		switch (item.type) {
			case 'string':
				return this.createSchemaItemString(item);
			case 'number':
				return this.createSchemaItemNumber(item);
			case 'array':
				return this.createSchemaItemArray(item);
			default:
				return {};
		}
	}

	createSchemaItemString(item) {
		const result = {
			type: 'string'
		};

		if (item.length)
			result.length = item.length;

		if (item.required)
			result.required = item.required;

		return result;
	}

	createSchemaItemNumber(item) {
		return {
			type: 'number'
		};
	}

	createSchemaItemArray(item) {
		const result = {
			type: 'array',
			items: []
		};

		if (item.length)
			result.length = item.length;

		if (item.required)
			result.required = item.required;

		if (item.items) {
			if (item.items.length > 1) {
				// this is array of objects or array of arrays
				const schemaConvertor = new SchemaConvertor(item.items);
				result.items = schemaConvertor.createSchema();

			} else {
				// this is array of primitives
				result.items = this.createSchemaItemByType(item.items[0]);
			}
		}

		return result;
	}
}


module.exports = SchemaConvertor;