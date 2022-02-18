<script>
	import Router from 'svelte-spa-router';
	import Integrations from './Integrations/IntegrationsHome.svelte';
	import Analytics from './Analytics.svelte';
	import About from './videos/About.svelte';
	//Juan Manuel
	import CountriesTable from './happiness_rateAPI/CountriesTable.svelte';
	import EditCountry from './happiness_rateAPI/EditCountry.svelte';
	import Graph from './happiness_rateAPI/Graph.svelte';
	import GraphA from './happiness_rateAPI/GraphAwesome.svelte';
	import Grupo05 from './Integrations/happiness_rate/Grupo05.svelte';
	import Grupo09 from './Integrations/happiness_rate/Grupo09.svelte';
	import Grupo12 from './Integrations/happiness_rate/Grupo12.svelte';
	import Grupo22 from './Integrations/happiness_rate/Grupo22.svelte';
	import Externa01 from './Integrations/happiness_rate/Externa01.svelte';
	import Externa02 from './Integrations/happiness_rate/Externa02.svelte';
	import Externa03 from './Integrations/happiness_rate/Externa03.svelte';
	import Externa04 from './Integrations/happiness_rate/Externa04.svelte';

	

	import NotFound from './NotFound.svelte';


	import Home from './Home.svelte';

	

	const routes = {
		"/": Home,
		"/integrations": Integrations,
		"/analytics": Analytics,
		"/about": About,

		"/happiness_rate": CountriesTable,
		"/happiness_rate/:country/:year": EditCountry,
		"/happiness_rate/graph": Graph,
		"/happiness_rate/awesomegraph": GraphA,
		"/integrations/Grupo05": Grupo05,
		"/integrations/Grupo09": Grupo09,
		"/integrations/Grupo12": Grupo12,
		"/integrations/Grupo22": Grupo22,
		"/integrations/Externa01": Externa01,
		"/integrations/Externa02": Externa02,
		"/integrations/Externa03": Externa03,
		"/integrations/Externa04": Externa04,
	

		"*": NotFound
	};
</script>


<main>
	<Router {routes} />
</main>