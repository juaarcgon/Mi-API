<script>
    import {pop} from "svelte-spa-router";
    import Button from "sveltestrap/src/Button.svelte";
    let Data = [];
    let Country = [];
    let Country2 = [];
    async function loadGraph() {
        const resCOVID = await fetch("https://covid-193.p.rapidapi.com/statistics", {
	     "method": "GET",
	    "headers": {
		    "x-rapidapi-host": "covid-193.p.rapidapi.com",
		    "x-rapidapi-key": "7ba6091b4amsh6731b2f89b0cdc6p106e3fjsnbd534659f6b0"
	    }
    });

        const resDataHappiness_rate = await fetch("/api/v2/happiness_rate");
        let Happy = await resDataHappiness_rate.json();
        
        let dataHappiness = Happy.map((x) => {
            let res = {
                name: x.country + " - " + x.year,
                value: x["happinessRanking"]
            };
            return res;
        });
        Country = await resCOVID.json();
        console.log(Country.response);
    
        Country2 = Country.response;
        Country2.forEach((x) => {
            let country = { 
		        'name': x.country,
		        'value': x.deaths.total
    	};
        Data.push(country);
        });
        let dataTotal =
            [
                {
                    name: "Ranking de Felicidad",
                    data: dataHappiness
                },
                {
                    name: "Muertes Totales por COVID",
                    data: Data
                }
            ];
        Highcharts.chart('container', {
            chart: {
                type: 'packedbubble',
                height: '40%'
            },
            title: {
                text: 'Relación entre las muertes totales por COVID y el Ranking de Felicidad'
            },
            tooltip: {
                useHTML: true,
                pointFormat: '<b>{point.name}:</b> {point.value}'
            },
            plotOptions: {
                packedbubble: {
                    minSize: '30%',
                    maxSize: '120%',
                    zMin: 0,
                    zMax: 1000,
                    layoutAlgorithm: {
                        splitSeries: false,
                        gravitationalConstant: 0.02
                    },
                    dataLabels: {
                        enabled: true,
                        format: '{point.name}',
                        filter: {
                            property: 'y',
                            operator: '>',
                            value: 250
                        },
                        style: {
                            color: 'black',
                            textOutline: 'none',
                            fontWeight: 'normal'
                        }
                    }
                }
            },
            series: dataTotal
        });
    }
    loadGraph();
</script>
<svelte:head>
</svelte:head>

<main>

    <figure class="highcharts-figure">
        <div id="container"></div>
        <p class="highcharts-description" align = "center">
            Gráfica que muestra el ranking de felicidad y las muertes totales por COVID.
        </p>
    </figure>
    <div style="text-align:center;padding-bottom: 3%;">
    <Button outline align = "center" color="secondary" on:click="{pop}">Volver</Button>
    </div>

</main>