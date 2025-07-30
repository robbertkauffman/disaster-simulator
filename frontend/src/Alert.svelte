<script>
    import { fade } from 'svelte/transition';
    import { alertMsg } from './store';

    alertMsg.subscribe(value => {
		if (value !== '') {
            setTimeout(() => {
                alertMsg.set('');
            }, 10000);
		}
	});
</script>

{#if $alertMsg !== ''}
    <div class="alert alert-danger" out:fade="{{delay: 5000, duration: 5000}}">{$alertMsg}</div>
{/if}

<style>
    .alert {
        position: absolute;
        z-index: 9999;
    }
</style>