<script>
    import {pop} from "svelte-spa-router";
    import Button from "sveltestrap/src/Button.svelte";
</script>
<main>
    <h2 style="text-align: center;">Integracion de APIs</h2>
    <h3 style="text-align: center;"> Juan Manuel</h3>
    <br>
    <button type="button" class="btn btn-secondary" onclick="window.location.href='#/integrations/Grupo05'" style="margin-left: 12.5%; width: 25%;"> API Grupo 05</button>
	<button type="button" class="btn btn-secondary" onclick="window.location.href='#/integrations/Grupo09'" style="width: 25%;">API Grupo 09</button>
    <button type="button" class="btn btn-secondary" onclick="window.location.href='#/integrations/Grupo12'" style= "width: 25%;">API Grupo 12 </button><br>
    <br>
    <button type="button" class="btn btn-secondary" onclick="window.location.href='#/integrations/Grupo22'" style= "margin-left:12.5%; width: 25%;">API Grupo 22 </button>
    <button type="button" class="btn btn-secondary" onclick="window.location.href='#/integrations/Externa01'" style= "width: 25%;">API Externa 01 </button>
    <button type="button" class="btn btn-secondary" onclick="window.location.href='#/integrations/Externa02'" style= "width: 25%;">API Externa 02 </button><br>
    <br>
    <button type="button" class="btn btn-secondary" onclick="window.location.href='#/integrations/Externa03'" style= "margin-left:12.5%; width: 25%;">API Externa 03 </button>
    <button type="button" class="btn btn-secondary" onclick="window.location.href='#/integrations/Externa04'" style=  "width: 25%;">API Externa 04 </button>
    <br>
    <h3 style="text-align: center;"> Adrian</h3>
    <br>
    <button type="button" class="btn btn-secondary" onclick="window.location.href='#/integrations/api-22'" style="margin-left: 12.5%; width: 25%;"> API Grupo 22</button>
	<button type="button" class="btn btn-secondary" onclick="window.location.href='#/integrations/api-10'" style="width: 25%;">API Grupo 10</button>
    <button type="button" class="btn btn-secondary" onclick="window.location.href='#/integrations/coins'" style= "width: 25%;">API Externa 01 </button><br>
    <br>
    <button type="button" class="btn btn-secondary" onclick="window.location.href='#/integrations/Hearthstone'" style= "margin-left:12.5%; width: 25%;">API Externa 02 </button>
    <button type="button" class="btn btn-secondary" onclick="window.location.href='#/integrations/City'" style= "width: 25%;">API Externa 03 </button>
    <button type="button" class="btn btn-secondary" onclick="window.location.href='#/integrations/proxy_latency'" style= "width: 25%;">API Externa 04 </button><br>
    <br>
    <button type="button" class="btn btn-secondary" onclick="window.location.href='#/integrations/soccer_games'" style= "margin-left:12.5%; width: 25%;">API Externa 05 </button>
    <button type="button" class="btn btn-secondary" onclick="window.location.href='#/integrations/name'" style=  " width: 25%;">API Externa 06 </button>
    <button type="button" class="btn btn-secondary" onclick="window.location.href='#/integrations/Investors'" style=  "width: 25%;">API Externa 07 </button><br>
    <br>
    <button type="button" class="btn btn-secondary" onclick="window.location.href='#/integrations/Post_code'" style=  "margin-left:12.5%; width: 25%;">API Externa 08 </button><br>
    <h3 style="text-align: center;"> Alejandro</h3>
    <br>
    <button type="button" class="btn btn-secondary" onclick="window.location.href='#/integrations/G22'" style="margin-left: 12.5%; width: 25%;"> API Grupo 22</button>
	<button type="button" class="btn btn-secondary" onclick="window.location.href='#/integrations/G12'" style="width: 25%;">API Grupo 12</button>
    <button type="button" class="btn btn-secondary" onclick="window.location.href='#/integrations/G30'" style= "width: 25%;">API Grupo 30 </button><br>
    <br>
    <button type="button" class="btn btn-secondary" onclick="window.location.href='#/integrations/E01'" style= "margin-left:12.5%; width: 25%;">API Externa 01</button>
    <button type="button" class="btn btn-secondary" onclick="window.location.href='#/integrations/E02'" style=  " width: 25%;">API Externa 02 </button>
    <button type="button" class="btn btn-secondary" onclick="window.location.href='#/integrations/E03'" style=  " width: 25%;">API Externa 03 </button><br>
    <br>
    <button type="button" class="btn btn-secondary" onclick="window.location.href='#/integrations/E04'" style= "margin-left:12.5%; width: 25%;">API Externa 04</button>
    <button type="button" class="btn btn-secondary" onclick="window.location.href='#/integrations/E05'" style=  " width: 25%;">API Externa 05 </button>
    <button type="button" class="btn btn-secondary" onclick="window.location.href='#/integrations/E06'" style=  " width: 25%;">API Externa 06 </button><br>
    <br>
    <button type="button" class="btn btn-secondary" onclick="window.location.href='#/integrations/E07'" style= "margin-left:12.5%; width: 25%;">API Externa 07</button>
    <br>
    <br>
    <div style="text-align:center;padding-bottom: 3%;">
    <Button outline color="secondary" on:click="{pop}">Volver</Button>
    </div>
    <br>
</main>