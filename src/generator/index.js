function getType(value) {
	if (Array.isArray(value))
		return 'array';
	return typeof value;
}

class SchemaGenerator {
	generate({ payload }) {
		const schema = [];
		if (Array.isArray(payload)) {
			schema.push({
				type: 'array',
				length: {
					min: payload.length,
					max: payload.length
				},
				items: this.generate({ payload: payload[0] })
			});
		} else if (payload && typeof payload === 'object') {
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
			schema.push({
				type: getType(payload),
				length: {
					min: payload?.length || 0,
					max: payload?.length || 0
				},
				required: true
			});
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
				if (newSchemaItem.type === 'array') {
					mergedSchema.push({
						...excisingSchemaItem,
						length: {
							min: Math.min(excisingSchemaItem.length.min, newSchemaItem.length.min),
							max: Math.max(excisingSchemaItem.length.max, newSchemaItem.length.max)
						},
						items: this.mergeSchemas({ newSchema: newSchemaItem.items, excisingSchema: excisingSchemaItem.items })
					});
				} else if (newSchemaItem.type === 'object') {
					mergedSchema.push({
						...excisingSchemaItem,
						items: this.mergeSchemas({ newSchema: newSchemaItem.items, excisingSchema: excisingSchemaItem.items })
					});
				} else {
					if (newSchemaItem.type === 'number') {
					} else {
						mergedSchema.push({
							...excisingSchemaItem,
							length: {
								min: Math.min(excisingSchemaItem.length.min, newSchemaItem.length.min),
								max: Math.max(excisingSchemaItem.length.max, newSchemaItem.length.max)
							},
							...(excisingSchemaItem.type !== 'number' && { type: newSchemaItem.type })
						});
					}
				}
			}
		}
		);

		excisingSchema.forEach(excisingSchemaItem => {
			const newSchemaItem = newSchema.find(item => item.path === excisingSchemaItem.path);
			if (!newSchemaItem) {
				mergedSchema.push({ ...excisingSchemaItem, required: false });
			}
		}
		);

		return mergedSchema;

	}
}

module.exports = SchemaGenerator;