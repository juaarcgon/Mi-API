<script>
    import {
        onMount
	} from "svelte";
	

 
    import Table from "sveltestrap/src/Table.svelte";
    import Button from "sveltestrap/src/Button.svelte";
	import { Pagination, PaginationItem, PaginationLink } from 'sveltestrap';
	import Input from "sveltestrap/src/Input.svelte";
	import FormGroup from "sveltestrap/src/FormGroup.svelte";

    let countries = [];
	let newCountry = {
		country: "",
		year:    "" ,
		happinessRanking: "",
		happinessRate: "",
		var: ""
	};
	let exitoMsg="";

    // Para la paginacion
	let recursos = 10;
	let offset = 0;
	let currentPage = 1; 
	let moreData = true; 

	// Para las Busquedas
	let actualCountry = "";
    let actualYear = "";
	let country = [];
    let year = [];

	
 
    onMount(getCountry);
	
	
    async function getCountry() {
 
        console.log("Fetching countries...");
        const res = await fetch("/api/v2/happiness_rate?offset="  + recursos * offset + "&limit=" + recursos);
		const resNext = await fetch("/api/v2/happiness_rate?offset="  + recursos * (offset + 1) + "&limit=" + recursos);
 
        if (res.ok  && resNext.ok) {
            console.log("Ok:");
            const json = await res.json();
			const jsonNext = await resNext.json();
            countries = json;
			
			if (jsonNext.length == 0) {
				moreData = false;
			} else {
				moreData = true;
			}
			
            console.log("Received " + countries.length + " countries.");
        } else {
            console.log("ERROR!");
        }
    }
	function incrementOffset(valor) {
		offset += valor;
		currentPage += valor;
		getCountry();
	}
 
  	async function insertCountry() {
	  
        console.log("Inserting new country..." + JSON.stringify(newCountry));
 
        const res = await fetch("/api/v2/happiness_rate", {
            method: "POST",
            body: JSON.stringify(newCountry),
            headers: {
                "Content-Type": "application/json"
            }
        }).then(function (res) {
			if(res.status == 201){
            	window.alert("Dato creado");
        	}else if(res.status == 409){
            	window.alert("Ya existe el dato");
        	}else if(res.status == 400){
            	window.alert("Datos no validos(no se puede dejar los parametros vacios)");
        	}
            getCountry();
        });
 
    }
    async function deleteCountry(country, year) {
        const res = await fetch("/api/v2/happiness_rate/" + country +"/" + year, {
            method: "DELETE"
        }).then(function (res) {
			if(res.status == 200){
            	window.alert("Dato borrado");
        	}else if(res.status == 404){
           		 window.alert("No existe el elemento");
        	}
            getCountry();
        });
    }

	async function deleteAllCountries() {
        const res = await fetch("/api/v2/happiness_rate/", {
            method: "DELETE"
        }).then(function (res) { 
			if(res.status == 200){
            	window.alert("Borrando datos");
        	}else if(res.status == 405){
           		window.alert("No hay elementos que eliminar");
        }
           getCountry();
        });
    }
	async function loadInitialData() {
        const res = await fetch("/api/v2/happiness_rate/loadInitialData", {
            method: "GET"
        }).then(function (res) {
			if(res.status == 200){
            	window.alert("Insetando elementos en la tabla");
        	}else if(res.status == 409){
            	window.alert("No es posible realizar la accion ya que hay elementos en ella,pulse el boton de eliminar para poder ejecutar esta accion");
      	  }
            getCountry();
        });
	}
	async function search(country,year) {

		var url = "/api/v2/happiness_rate";
	if (country != "" && year != "") {
		url = url + "?year=" + year + "&country=" + country;
	}else if (country != "" && year == "") {
		url = url + "?country=" + country;
	}else if (country == "" && year != "") {
		url = url + "?year=" + year;
	}
		const res = await fetch(url);

	if (res.ok) {

		const json = await res.json();
		countries = json;
		if(country =="" && year==""){
			window.alert("Introduce datos");
		}else if(countries.length > 0){
			window.alert("Datos encontrados");
		}else{
			window.alert("No hay resultados");
		}

	}else{
		console.log("ERROR");
}
}
</script>

<style type='text/css'>
 
tr:nth-child(odd) {
    background-color:#f2f2f2;
}
tr:nth-child(even) {
    background-color:#fbfbfb;
}

</style>

<body style="background-color:#082EFF;">
</body>
 
<main>
	<h2 align = center >Tasa de Felicidad</h2>
	<body style="background-color:#082EFF;">
    </body>
    {#await countries}
        Loading datas...
	{:then countries}

		<h3>Añadir nuevo país:</h3>
		<Table style="background-color:#EAEEF0;">
			<tr>
				<td><strong>País:</strong> <input bind:value="{newCountry.country}"></td>
				<td><strong>Año:</strong> <input type = "number" bind:value="{newCountry.year}"></td>
				<td><strong>Ranking de Felicidad:</strong> <input type = "number" bind:value="{newCountry.happinessRanking}"></td>
				<td><strong>Tasa de Felicidad:</strong> <input type = "number" bind:value="{newCountry.happinessRate}"></td>
				<td><strong>Variación:</strong> <input type = "number" bind:value="{newCountry.var}"></td>
				<td><strong>Acción:</strong> <Button color="primary" on:click={insertCountry}>Añadir</Button> </td>
			</tr>
		</Table>
		
		<Table bordered>
            <thead >
                <tr style="color:#00680D">
                    <th>País</th>
                	<th>Año</th>
                	<th>Ranking de Felicidad</th>
					<th>Tasa de Felicidad</th>
					<th>Variación</th>
					<th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {#each countries as c}
                    <tr>
						<td>
                        	<a href="#/happiness_rate/{c.country}/{c.year}">{c.country}</a>
						</td>
                        <td>{c.year}</td>
                        <td>{c.happinessRanking}</td>
						<td>{c.happinessRate}</td>
                        <td>{c.var}</td>
                        <td><Button outline color="danger" on:click="{deleteCountry(c.country,c.year)}"><i class="fa fa-trash" aria-hidden="true"></i> Eliminar</Button>
						<Button outline color="success" href="#/happiness_rate/{c.country}/{c.year}"><i class="fa fa-trash" aria-hidden="true"></i> Modificar</Button></td>
                    </tr>
                {/each}
            </tbody>
		</Table>
		
	{/await}
	<Pagination  style="float:center;" ariaLabel="Cambiar de página">


		<PaginationItem class="{currentPage === 1 ? 'disabled' : ''}">
		  <PaginationLink previous href="#/happiness_rate" on:click="{() => incrementOffset(-1)}" />
		</PaginationItem>
		
		<!-- Si no estas en la primera pagina-->
		{#if currentPage != 1}
		<PaginationItem>
			<PaginationLink href="#/happiness_rate" on:click="{() => incrementOffset(-1)}" >{currentPage - 1}</PaginationLink>
		</PaginationItem>
		{/if}
		<PaginationItem active>
			<PaginationLink href="#/happiness_rate" >{currentPage}</PaginationLink>
		</PaginationItem>

		<!-- si no hay mas elementos-->
		{#if moreData}
		<PaginationItem >
			<PaginationLink href="#/happiness_rate" on:click="{() => incrementOffset(1)}">{currentPage + 1}</PaginationLink>
		</PaginationItem>
		{/if}

		<PaginationItem class="{moreData ? '' : 'disabled'}">
		  <PaginationLink next href="#/happiness_rate" on:click="{() => incrementOffset(1)}"/>
		</PaginationItem>

	</Pagination>
	{#if exitoMsg}
        <p style="color: green">{exitoMsg}. Dato insertado con éxito</p>
	{/if} 
	
	<div style="text-align:center;padding-bottom: 3%;">
		<Button outline  color="primary" on:click={loadInitialData}>Iniciar</Button>
		<Button outline  color="danger" on:click={deleteAllCountries}>Eliminar todo</Button>
	</div>

	<Table bordered>
        <tbody>
            <tr>
                <td>
                    <FormGroup style="width:50%;"> 
                    <label >Selecciona el País:</label>
                    <Input type ="text" name="selectCountry" id="selectCountry" bind:value="{actualCountry}">

                    </Input>
                    </FormGroup>
                </td>
                <td>
                    <FormGroup style="width:50%;">
                        <label > Búsqueda por año: </label>
                        <Input type ="number" name="selectYear" id="selectYear" bind:value="{actualYear}">

                        </Input>
                    </FormGroup>
                </td>
                <td>
                    <div style="text-align:center;padding-bottom: 3%;margin-top: 6%;">
                        <Button outline  color="primary" on:click="{search(actualCountry,actualYear)}" class="button-search" >Buscar</Button>
                        <Button outline  color="secondary" href="javascript:location.reload()">Volver</Button>
                    </div>
                </td>
            </tr>
        </tbody>
    </Table>
</main>