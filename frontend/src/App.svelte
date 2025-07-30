<script>
	import { onMount } from 'svelte';
	import { alertMsg, isRunning } from './store.js';
	import { io } from "socket.io-client";
	import Alert from './Alert.svelte';
	import AppServer from './AppServer.svelte';
	import Charts from './Charts.svelte';
	import Controls from './Controls.svelte';
	import MongoCluster from './MongoCluster.svelte';
	import MongoClusterEventLog from './MongoClusterEventLog.svelte';
	import SlowFailedQueryLog from './SlowFailedQueryLog.svelte';
	import Stats from './Stats.svelte';
	
	const appServerEndpoint = "http://localhost:8080";
	let mongoNodes = [];
	let isRunningVal;
	let startDate;
	let socket;

	onMount(() => {
		connectWs();
	});

	function connectWs() {
		socket = io(appServerEndpoint);
		socket.io.on('error', (error) => {
			const errorMsg = `Websockets error: ${error}`
			alertMsg.set(errorMsg);
			console.error(errorMsg);
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
					<Alert/>
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
			<div class="row justify-content-md-center">
				<Charts socket={socket}/>
			</div>
			<div class="row logs-row justify-content-center">
				<div class="col-5">
					<SlowFailedQueryLog socket={socket}/>
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
		margin-bottom: 25px;
		position: relative;
	}

	.logs-row {
		margin-bottom: 25px;
	}
</style>