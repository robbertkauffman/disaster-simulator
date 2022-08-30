<script>
	import { onMount } from 'svelte';
	import { isRunning } from './store.js';
	import { io } from "socket.io-client";
	import AppResponses from './AppResponses.svelte';
	import AppServer from './AppServer.svelte';
	import Charts from './Charts.svelte';
	import Controls from './Controls.svelte';
	import MongoCluster from './MongoCluster.svelte';
	import MongoClusterEventLog from './MongoClusterEventLog.svelte';
	import Stats from './Stats.svelte';
	
	// global variable DR_APP_HOST is set in frontend/public/index.html
	let appServerEndpoint = DR_APP_HOST;
	let mongoNodes = [];
	let isRunningVal;
	let startDate;
	let socket;

	onMount(() => {
		connectWs();
	});

	function connectWs() {
		socket = io("ws://localhost:3000");
		socket.io.on('error', (error) => {
			console.log(`socket error: ${error}`);
		});
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
			<div class="col-10 topology">
				<div class="row justify-content-center appserver-row">
					<AppServer mongoNodes={mongoNodes}/>
				</div>
				<div class="row justify-content-center">
					{#if socket}
						<MongoCluster appServerEndpoint={appServerEndpoint} socket={socket} bind:nodes={mongoNodes}/>
					{/if}
				</div>
			</div>
		</div>
		{#if isRunningVal}
			<div class="row justify-content-md-center">
				<Stats socket={socket}/>
			</div>
			<div class="row chart-row">
				<Charts startDate={startDate}/>
			</div>
			<div class="row justify-content-center">
				<div class="col-5">
					<AppResponses socket={socket}/>
				</div>
				<div class="col-5">
					<MongoClusterEventLog socket={socket}/>
				</div>
			</div>
		{/if}
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