<script>
    import {pop} from "svelte-spa-router";
    import Button from "sveltestrap/src/Button.svelte";
    async function loadGraph() {
        const resLife = await fetch("/api/v1/life_expectancies");
        const resDataHappiness_rate = await fetch("/api/v2/happiness_rate");
        let Life = await resLife.json();
        let Happy = await resDataHappiness_rate.json();
        
        console.log(Life);
        let dataHappiness = Happy.map((x) => {
            let res = {
                name: x.country + " - " + x.year,
                value: x["happinessRanking"]
            };
            return res;
        });
        let dataLife = Life.map((x) => {
            let res = {
                name: x.country + " - " + x.year,
                value: x["average_life_expectancy"]
            };
            return res;
        });
        let dataTotal =
            [
                {
                    name: "Ranking de Felicidad",
                    data: dataHappiness
                },
                {
                    name: "Media de la Esperanza de Vida",
                    data: dataLife
                }
            ];
        Highcharts.chart('container', {
            chart: {
                type: 'packedbubble',
                height: '40%'
            },
            title: {
                text: 'Relación entre edad de la Media de la Esperanza de Vida y el Ranking de Felicidad'
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
            Gráfica que muestra el ranking de felicidad y la media de la esperanza de vida.
        </p>
    </figure>
    <div style="text-align:center;padding-bottom: 3%;">
    <Button outline align = "center" color="secondary" on:click="{pop}">Volver</Button>
    </div>

</main>