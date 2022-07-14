<script>
	import { onMount } from 'svelte';
	import { isRunning } from './store.js';
	import AppResponses from './AppResponses.svelte';
	import AppServer from './AppServer.svelte';
	import Charts from './Charts.svelte';
	import Controls from './Controls.svelte';
	import MongoCluster from './MongoCluster.svelte';
	import MongoClusterEventLog from './MongoClusterEventLog.svelte';
	import StartStopButton from './StartStopButton.svelte';
	
	const APP_HOSTNAMES = ["http://localhost"];
	const REALM_APP_ID = "disaster-simulator-jzqql";
  const REALM_APP_ENDPOINT = `https://data.mongodb-api.com/app/${REALM_APP_ID}/endpoint`;
	const DEFAULT_PORT = 5001;
	const API_PATHS = {
		region: "/region"
	};

	let appServers = [];
	let appServerEndpoint = `${APP_HOSTNAMES[0]}:${DEFAULT_PORT}`;
	let mongoNodes = [];
	let retryReads, retryWrites, readPreference;
	let selectedPort = DEFAULT_PORT;
	let isRunningVal;

	onMount(() => {
		getAppRegions();
	});

	async function getAppRegions() {
		const newAppServers = [];
		for (let hostname of APP_HOSTNAMES) {
			try {
				const res = await fetch(hostname + ':' + selectedPort + API_PATHS.region);
				const region = await res.text();
				newAppServers.push({
					region: region,
					endpoint: `${hostname}:${selectedPort}`
				});
			} catch(e) {
				console.log(`Fetching app region failed: ${e}`);
			}
		}
		// have to set the array at once instead of adding each element step-by-step
		// otherwise the topology lines will be drawn while the position of the 
		// servers changes as they get added
		appServers = newAppServers;
	}

	isRunning.subscribe(value => {
		isRunningVal = value;
	});
</script>

<main>
	<div class="container">
		<div class="row header-row">
			<div class="col text-center">
				<h1>Disaster Simulator&reg;</h1>
				<StartStopButton appServerEndpoint={appServerEndpoint} retryReads={retryReads} retryWrites={retryWrites} readPreference={readPreference}/>
			</div>
		</div>
		<div class="row">
			<div class="col-2">
				<Controls bind:retryReads={retryReads} bind:retryWrites={retryWrites} bind:readPreference={readPreference} realmAppEndpoint={REALM_APP_ENDPOINT}/>
			</div>
			<div class="col-8 topology">
				<div class="row justify-content-center appserver-row">
					{#each appServers as app}
						{#if app.endpoint && app.region}
							<AppServer region={app.region} mongoNodes={mongoNodes}/>
						{/if}
					{/each}
				</div>
				<div class="row justify-content-center">
					<MongoCluster appServerEndpoint={appServerEndpoint} realmAppEndpoint={REALM_APP_ENDPOINT} bind:nodes={mongoNodes}/>
				</div>
			</div>
			<div class="col-2">
				<MongoClusterEventLog realmAppEndpoint={REALM_APP_ENDPOINT}/>
			</div>
		</div>
		<div class="row chart-row">
			{#if isRunningVal}
				<Charts/>
			{/if}
		</div>
		<div class="row">
			{#each appServers as app}
				{#if isRunningVal && app.endpoint}
					<AppResponses appServerEndpoint={app.endpoint} region={app.region}/>
				{/if}
			{/each}
		</div>
	</div>
</main>

<style>
	.header-row {
		margin-top: 30px;
		margin-bottom: 30px;
	}

	.appserver-row {
		min-height: 85px;
		margin-bottom: 100px;
	}
</style>