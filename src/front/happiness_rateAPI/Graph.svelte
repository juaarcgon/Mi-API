<script>	
async function loadGraph() {
	
	let MyData = [];
	let MyDataGraph = [];
	
	const resData = await fetch("/api/v2/happiness_rate");
	MyData = await resData.json();
	MyData.forEach( (x) => {
            MyDataGraph.push({name: x.country + " " + x.year, data: [parseInt(x.happinessRanking), parseFloat(x.happinessRate), parseFloat(x.var)], pointPlacement: 'on'});
        });
	
	Highcharts.chart('container', {
    chart: {
        type: 'spline'
    },
    title: {
        text: 'Tasa de Felicidad'
    },
   
    xAxis: {
        categories: ["Ranking de Felicidad", "Tasa de Felicidad", "Variacion"]
    },
    yAxis: {
        title: {
            text: 'Posicionamiento'
        },
        labels: {
            formatter: function () {
                return this.var ;
            }
        }
    },
    tooltip: {
        crosshairs: true,
        shared: true
    },
    plotOptions: {
        spline: {
            marker: {
                radius: 4,
                lineColor: '#666666',
                lineWidth: 1
            }
        }
    },
    series: MyDataGraph
});
}
loadGraph();
</script>

<svelte:head>
	<script src="https://code.highcharts.com/highcharts.js" on:load="{loadGraph}"></script>
	<script src="https://code.highcharts.com/modules/exporting.js" on:load="{loadGraph}"></script>
	<script src="https://code.highcharts.com/modules/export-data.js" on:load="{loadGraph}"></script>
	<script src="https://code.highcharts.com/modules/accessibility.js" on:load="{loadGraph}"></script>
	
</svelte:head>


<main>
	<figure class="highcharts-figure">
		<div id="container"></div>
		<p class="highcharts-description">
			En la gráfica podemos observar la Tasa  de Felicidad por Paises, donde se ve: el Ranking de Felicidad, tasa de felicidad y variacion de felicidad.
		</p>
	</figure>

</main>
<style>
	#container {
		height: 400px; 
	}

	.highcharts-figure, .highcharts-data-table table {
		min-width: 310px; 
		max-width: 800px;
		margin: 1em auto;
	}

	.highcharts-data-table table {
		font-family: Verdana, sans-serif;
		border-collapse: collapse;
		border: 1px solid #EBEBEB;
		margin: 10px auto;
		text-align: center;
		width: 100%;
		max-width: 500px;
	}
	.highcharts-data-table caption {
		padding: 1em 0;
		font-size: 1.2em;
		color: #555;
	}
	.highcharts-data-table th {
		font-weight: 600;
		padding: 0.5em;
	}
	.highcharts-data-table td, .highcharts-data-table th, .highcharts-data-table caption {
		padding: 0.5em;
	}
	.highcharts-data-table thead tr, .highcharts-data-table tr:nth-child(even) {
		background: #f8f8f8;
	}
	.highcharts-data-table tr:hover {
		background: #f1f7ff;
	}


</style>