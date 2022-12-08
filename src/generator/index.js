function getType(value) {
	if (value === null) return 'null';
	if (value === undefined) return 'undefined';
	return Array.isArray(value) ? 'array' : typeof value;
}

class SchemaGenerator {
	generate({ payload }) {
		const schema = [];
		if (getType(payload) === 'array' && payload.length) {
			let items;
			if (getType(payload[0]) === 'object') {
				const subSchema = payload.map(item => this.generate({ payload: item }));
				const mergedSchema = subSchema.reduce((acc, curr) => {
					return this.mergeSchemas({ newSchema: curr, excisingSchema: acc });
				}, []);
				items = mergedSchema;
			}
			else {
				items = this.generate({ payload: payload[0] });
			}
			schema.push({
				type: 'array',
				length: {
					min: payload.length,
					max: payload.length
				},
				items,
				required: true,
			});
		} else if (getType(payload) === 'object' && Object.keys(payload).length) {
			Object.keys(payload).forEach(key => {
				const subSchema = this.generate({ payload: payload[key] });
				subSchema.forEach(subSchemaItem => {
					if (subSchemaItem.path) {
						subSchemaItem.path = `${key}.${subSchemaItem.path}`;
					}
					else {
						subSchemaItem.path = key;
					}
				});
				schema.push(...subSchema);
			});

		} else {
			if (getType(payload) !== 'array' && getType(payload) !== 'object') {
				schema.push({
					type: getType(payload),
					...(getType(payload) === 'string' && {
						length: {
							min: payload?.length || 0,
							max: payload?.length || 0
						}
					}),
					required: true
				});
			}
		}

		return schema;
	}

	update({ payload, excisingSchema }) {
		const newSchema = this.generate({ payload });
		return this.mergeSchemas({ newSchema, excisingSchema })
	}

	mergeSchemas({ newSchema, excisingSchema }) {
		const mergedSchema = [];
		if (!excisingSchema || !excisingSchema.length) return newSchema;
		if (!newSchema || !newSchema.length) return excisingSchema;

		newSchema.forEach(newSchemaItem => {
			const excisingSchemaItem = excisingSchema.find(item => item.path === newSchemaItem.path);
			if (!excisingSchemaItem) {
				mergedSchema.push({ ...newSchemaItem, required: false });
			} else {
				if (newSchemaItem.type === 'array' && newSchemaItem.length) {
					mergedSchema.push({
						...excisingSchemaItem,
						type: 'array',
						length: {
							min: Math.min(excisingSchemaItem.length?.min ?? newSchemaItem.length.min, newSchemaItem.length.min),
							max: Math.max(excisingSchemaItem.length?.max ?? newSchemaItem.length.max, newSchemaItem.length.max)
						},
						items: this.mergeSchemas({ newSchema: newSchemaItem.items, excisingSchema: excisingSchemaItem.items })
					});
				} else {
					const mergedItem = {
						...excisingSchemaItem,
						type: newSchemaItem.type,
						...(newSchemaItem.type === 'string' && {
							length: {
								min: Math.min(excisingSchemaItem.length?.min ?? newSchemaItem.length.min, newSchemaItem.length.min),
								max: Math.max(excisingSchemaItem.length?.max ?? newSchemaItem.length.max, newSchemaItem.length.max)
							}
						})
					}

					if (newSchemaItem.type !== 'string' && "length" in excisingSchemaItem) {
						delete mergedItem.length
					}

					mergedSchema.push(mergedItem)
				}
			}
		});

		excisingSchema.forEach(excisingSchemaItem => {
			const newSchemaItem = newSchema.find(item => item.path === excisingSchemaItem.path);
			if (!newSchemaItem) {
				mergedSchema.push({ ...excisingSchemaItem, required: false });
			}
		});

		return mergedSchema;
	}
}

module.exports = SchemaGenerator;