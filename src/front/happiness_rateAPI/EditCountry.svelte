<script>
    import {
        onMount
    } from "svelte";

    import {
        pop
    } from "svelte-spa-router";


    import Table from "sveltestrap/src/Table.svelte";
    import Button from "sveltestrap/src/Button.svelte";

    export let params = {};
    let countries = {};
    let updatedCountry = "";
    let updatedYear = 0;
	let updatedHappinessRanking = 0;
	let updatedHappinessRate = 0.0;
	let updatedVar = 0.0;
    let SuccessMsg = "";

    onMount(getCountry);

    async function getCountry() {

        console.log("Fetching countries...");
        const res = await fetch("/api/v2/happiness_rate/" + params.country + "/" + params.year);
		
        if (res.ok) {
            console.log("Ok:");
            const json = await res.json();
            countries = json;
            updatedCountry = params.country;
            updatedYear = parseInt(params.year);
            updatedHappinessRanking = countries.happinessRanking;
			updatedHappinessRate = countries.happinessRate;
            updatedVar = countries.var;
            console.log("Received countries.");
        } else if(res.status == 404){
            window.alert("El dato: " + params.country + " " + params.year + " no existe");
        }
    }


    async function updateCountry() {

        console.log("Updating countries..." + JSON.stringify(params.countriesCountry));
		
        const res = await fetch("/api/v2/happiness_rate/" + params.country + "/" + params.year, {
            method: "PUT",
            body: JSON.stringify({
                country: params.country,
                year: parseInt(params.year),
                happinessRanking: updatedHappinessRanking,
				happinessRate: updatedHappinessRate,
				var: updatedVar
            }),
            headers: {
                "Content-Type": "application/json"
            }
        }).then(function (res) {
            getCountry();
            if(res.ok){
                SuccessMsg = res.status + ": " + res.statusText;
                console.log("OK!" + SuccessMsg);

            }else if(res.status == 400){
                window.alert("Datos no son válidos");
            }
        });



    }
</script>
<main>
    <h3>Editar el Pais: <strong>{params.country} {params.year}</strong></h3>
    {#await countries}
        Loading countries...
    {:then countries}
        <Table bordered>
            <thead>
                <tr style="color:#00680D">
                  	<th>País</th>
                	<th>Año</th>
                	<th>Ranking de Felicidad</th>
                	<th>Tasa de Felicidad</th>
					<th>Variacion</th>
					<th>Acción</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>{updatedCountry}</td>
					<td>{updatedYear}</td>
                    <td><input type = "number" bind:value="{updatedHappinessRanking}"></td>
                    <td><input type = "number" bind:value="{updatedHappinessRate}"></td>
					<td><input type = "number" bind:value="{updatedVar}"></td>
                    <td> <Button outline  color="success" on:click={updateCountry}>Actualizar</Button></td>
                </tr>
        </tbody>
        </Table>
    {/await}
    {#if SuccessMsg}
        <p style="color: green">{SuccessMsg}. País actualizado con éxito</p>
    {/if}
    <Button outline color="secondary" on:click="{pop}">Volver</Button>
</main>