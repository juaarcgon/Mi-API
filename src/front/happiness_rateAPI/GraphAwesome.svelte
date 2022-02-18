<script>
    import { onMount } from 'svelte';
    async function loadGraph() {
        const resData = await fetch("/api/v2/happiness_rate");
        let Data = await resData.json();
        console.log("Base de datos:" + Data);
        let countries = Data.map((x) => { return x.country });
        console.log("Paises:  " + countries);
        let year = Data.map((x) => { return x.year });
        console.log("Años" + year);
        let ranking = Data.map((x) => { return x.happinessRanking; });
        console.log("Ranking de Felicidad:  " + ranking);
        let rate = Data.map((x) => { return x.happinessRate });
        console.log("Tasa de Felicidad: " + rate);
        let variacion = Data.map((x) => { return x.var });
        console.log("Variacion: " +  variacion);
        var tam = countries.length;
        console.log("Tamaño:  " + tam);
        var aux = ["x", "Ranking de Felicidad", "Tasa de Felicidad", "Variacion"];
        var allData = [];
        for (var i = 0; i < tam + 1; i++) {
            allData[i] = aux;
            aux = [];
            aux.push(countries[i] + " " + year[i] , ranking[i], rate[i], variacion[i]);
        }
        var chart = bb.generate({
            data: {
                x: "x",
                columns: allData,
                type: "radar",
                labels: true
            },
            radar: {
                axis: {
                    max: 70
                },
                level: {
                    depth: 3
                },
                direction: {
                    clockwise: true
                }
            },
            size: {
                width: 640,
                height: 480
            },
            bindto: "#radarChart"
        });
    }
    onMount(loadGraph);
</script>

<main >
    <div align ="center">Gráfica sobre la Tasa de Felicidad</div>
    <div id="radarChart" align ="center"></div>
</main>