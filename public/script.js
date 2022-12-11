const fetchSchema = async () => {
	const response = await fetch('/schema');
	const schema = await response.json();
	return schema;
}

const routesTab = document.getElementById('routes-tab');
const routesTabContent = document.getElementById('routes-tabContent');

const generateRouteTab = (route) => {
	const routeTab = document.createElement('li');
	routeTab.classList.add('nav-item');
	routeTab.innerHTML = `
		<button
			class="nav-link"
			id="pills-${route}-tab"
			data-bs-toggle="pill"
			data-bs-target="#pills-${route}"
			type="button"
			role="tab"
			aria-controls="pills-${route}"
			aria-selected="false"
		>
			${route}
		</button>
	`;
	return routeTab;
}

const generateRouteTabContent = (route) => {
	const routeTabContent = document.createElement('div');
	routeTabContent.classList.add('tab-pane', 'fade');
	routeTabContent.id = `pills-${route}`;
	routeTabContent.setAttribute('role', 'tabpanel');
	routeTabContent.setAttribute('aria-labelledby', `pills-${route}-tab`);
	routeTabContent.innerHTML = `
		<div class="card">
			<div class="card-body">
				<div class="card-title">
					<h5>${route}</h5>
				</div>
				<div class="card-text">
					<div class="json-viewer"></div>
				</div>
			</div>
		</div>
	`;
	return routeTabContent;
}

const generateUI = async () => {
	const schema = await fetchSchema();

	Object.keys(schema).forEach((key) => {
		const routeTab = generateRouteTab(key.slice(1));
		const routeTabContent = generateRouteTabContent(key.slice(1));

		routesTab.appendChild(routeTab);
		routesTabContent.appendChild(routeTabContent);

	})


}

generateUI();