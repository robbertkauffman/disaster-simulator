<script>
	import { onMount } from 'svelte';
	import { isRunning } from './store.js';
	import AppResponses from './AppResponses.svelte';
	import AppServer from './AppServer.svelte';
	import Charts from './Charts.svelte';
	import Controls from './Controls.svelte';
	import MongoCluster from './MongoCluster.svelte';
	import MongoClusterEventLog from './MongoClusterEventLog.svelte';
	import Stats from './Stats.svelte';
	
	const API_PATHS = {
		region: "/region"
	};

	let appServers = [];
	let appServerEndpoint = DR_APP_HOSTS[0];
	let mongoNodes = [];
	let isRunningVal;
	let startDate;

	onMount(() => {
		getAppRegions();
	});

	async function getAppRegions() {
		const newAppServers = [];
		for (let host of DR_APP_HOSTS) {
			try {
				const res = await fetch(host + API_PATHS.region);
				const region = await res.text();
				newAppServers.push({
					region: region,
					endpoint: host
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
		if (value) {
			// use start date 3 seconds from now
			// to remove an initial peak in latency when the app initaties connection to the cluster
			startDate = new Date();
			startDate.setSeconds(startDate.getSeconds() + 3);
		}
	});
</script>

<main>
	<div class="container">
		<div class="row header-row">
			<div class="col text-center">
				<h1>Disaster Simulator&reg;</h1>
			</div>
		</div>
		<div class="row">
			<div class="col-2">
				<Controls appServerEndpoint={appServerEndpoint}/>
			</div>
			<div class="col-8 topology">
				<div class="row justify-content-center appserver-row">
					{#each appServers as app}
						{#if app.endpoint}
							<AppServer region={app.region} mongoNodes={mongoNodes}/>
						{/if}
					{/each}
				</div>
				<div class="row justify-content-center">
					<MongoCluster appServerEndpoint={appServerEndpoint} bind:nodes={mongoNodes}/>
				</div>
			</div>
			<div class="col-2">
				<MongoClusterEventLog appServerEndpoint={appServerEndpoint}/>
			</div>
		</div>
		<div class="row justify-content-md-center">
			{#if isRunningVal}
				<Stats appServerEndpoint={appServerEndpoint} startDate={startDate}/>
			{/if}
		</div>
		<div class="row chart-row">
			{#if isRunningVal}
				<Charts startDate={startDate}/>
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
	main {
		margin-bottom: 25px;
	}

	.header-row {
		margin-top: 30px;
		margin-bottom: 30px;
	}

	.appserver-row {
		min-height: 85px;
		margin-bottom: 100px;
	}
</style>