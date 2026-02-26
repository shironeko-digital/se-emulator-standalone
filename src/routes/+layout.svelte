<script lang="ts">
	import { Activity } from 'lucide-svelte';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>SE Emulator</title>
</svelte:head>

<div class="flex min-h-screen flex-col">
	<header class="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-50">
		<div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
			<div class="flex items-center gap-2.5">
				<div class="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10 text-brand ring-1 ring-brand/20">
					<Activity class="h-5 w-5" />
				</div>
				<div>
					<h1 class="text-lg font-semibold tracking-tight">SE Emulator</h1>
					<p class="text-xs text-zinc-500">StreamElements Activity Simulator</p>
				</div>
			</div>
			<nav class="flex items-center gap-4">
				<a
					href="https://github.com/shironeko-digital/se-emulator-standalone"
					target="_blank"
					rel="noopener noreferrer"
					class="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
				>
					Source Code
				</a>
			</nav>
		</div>
	</header>

	<main class="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
		{@render children()}
	</main>

	<footer class="border-t border-zinc-900 bg-zinc-950 px-4 py-6 text-center text-xs text-zinc-600">
		<p>© {new Date().getFullYear()} <a href="https://shironekodigital.com" target="_blank" rel="noopener noreferrer" class="hover:text-zinc-400 transition-colors">Shironeko Digital OÜ</a></p>
	</footer>
</div>
