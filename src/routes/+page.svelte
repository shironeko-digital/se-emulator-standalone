<script lang="ts">
	import { onMount } from 'svelte';
	import { 
		Settings, 
		Key, 
		User, 
		Send, 
		CheckCircle2, 
		AlertCircle, 
		Loader2, 
		Hash, 
		MessageSquare, 
		ChevronDown,
		History,
		ExternalLink,
		Activity
	} from 'lucide-svelte';
	import { fetchChannelInfo, sendMockEvent, type ChannelInfo } from '$lib/api';
	import { EVENT_CONFIGS, buildEventPayload, type EventType } from '$lib/events';

	// State
	let jwt = $state('');
	let channelInfo = $state<ChannelInfo | null>(null);
	let isLoadingChannel = $state(false);
	let channelError = $state('');
	let showSettings = $state(true);

	let selectedEventType = $state<EventType>('follow');
	let fieldValues = $state<Record<string, any>>({});
	let isSending = $state(false);
	let lastResponse = $state<{ success: boolean; message: string; data?: any } | null>(null);
	let eventHistory = $state<Array<{ type: EventType; time: string; success: boolean }>>([]);

	// Sync JWT to localStorage
	onMount(() => {
		const savedJwt = localStorage.getItem('se_jwt');
		if (savedJwt) {
			jwt = savedJwt;
			handleJwtChange();
		}
	});

	$effect(() => {
		if (jwt) {
			localStorage.setItem('se_jwt', jwt);
		}
	});

	// Reset fields when event type changes
	$effect(() => {
		const config = EVENT_CONFIGS[selectedEventType];
		const newValues: Record<string, any> = {};
		config.fields.forEach(f => {
			newValues[f.id] = f.defaultValue ?? '';
		});
		fieldValues = newValues;
	});

	async function handleJwtChange() {
		if (!jwt || jwt.length < 50) return;
		
		isLoadingChannel = true;
		channelError = '';
		try {
			channelInfo = await fetchChannelInfo(jwt);
			showSettings = false; // Collapse settings if successful
		} catch (e: any) {
			channelError = e.message;
			channelInfo = null;
		} finally {
			isLoadingChannel = false;
		}
	}

	async function handleSend() {
		if (!channelInfo || !jwt) return;
		
		isSending = true;
		lastResponse = null;
		
		try {
			const channelId = channelInfo._id;
			
			if (selectedEventType === 'community gift') {
				const amount = Number(fieldValues.amount) || 1;
				const activityGroup = `${Math.round(Math.random() * 9000000)}`;
				
				// 1. Send communityGiftPurchase
				const purchasePayload = buildEventPayload('community gift', fieldValues, activityGroup);
				await sendMockEvent(channelId, jwt, purchasePayload);
				
				// 2. Send N individual subscriber events
				for (let i = 0; i < amount; i++) {
					const subPayload = buildEventPayload('single community gift', {
						...fieldValues,
						receiver: `receiver${i + 1}`
					}, activityGroup);
					await sendMockEvent(channelId, jwt, subPayload);
				}
			} else {
				const payload = buildEventPayload(selectedEventType, fieldValues);
				await sendMockEvent(channelId, jwt, payload);
			}

			lastResponse = { success: true, message: 'Event sent successfully!' };
			eventHistory = [{ type: selectedEventType, time: new Date().toLocaleTimeString(), success: true }, ...eventHistory.slice(0, 9)];
		} catch (e: any) {
			lastResponse = { success: false, message: e.message };
			eventHistory = [{ type: selectedEventType, time: new Date().toLocaleTimeString(), success: false }, ...eventHistory.slice(0, 9)];
		} finally {
			isSending = false;
		}
	}
</script>

<div class="space-y-6">
	<!-- Token & Channel Info -->
	<section class="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-sm">
		<button 
			class="flex w-full items-center justify-between px-6 py-4 transition-colors hover:bg-zinc-800/50"
			onclick={() => showSettings = !showSettings}
		>
			<div class="flex items-center gap-3">
				<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400">
					<Settings class="h-4 w-4" />
				</div>
				<span class="font-medium">Authentication & Channel</span>
			</div>
			<ChevronDown class="h-4 w-4 text-zinc-500 transition-transform {showSettings ? 'rotate-180' : ''}" />
		</button>

		{#if showSettings}
			<div class="border-t border-zinc-800 p-6 space-y-4">
				<div class="space-y-2">
					<label for="jwt" class="text-sm font-medium text-zinc-400 flex items-center gap-2">
						<Key class="h-3.5 w-3.5" />
						JWT Token
					</label>
					<textarea
						id="jwt"
						bind:value={jwt}
						onblur={handleJwtChange}
						placeholder="Paste your StreamElements JWT token here..."
						class="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm font-mono focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-zinc-700"
						rows="3"
					></textarea>
				</div>

				{#if isLoadingChannel}
					<div class="flex items-center gap-2 py-2 text-sm text-zinc-500">
						<Loader2 class="h-4 w-4 animate-spin" />
						Fetching channel information...
					</div>
				{:else if channelInfo}
					<div class="flex items-center gap-4 rounded-xl bg-emerald-500/5 p-4 border border-emerald-500/10">
						<img src={channelInfo.profilePicUrl} alt={channelInfo.username} class="h-12 w-12 rounded-full ring-2 ring-emerald-500/20" />
						<div>
							<div class="text-sm font-semibold text-emerald-400">{channelInfo.displayName}</div>
							<div class="text-xs font-mono text-zinc-500">{channelInfo._id}</div>
						</div>
						<div class="ml-auto flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-500">
							<div class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
							Connected
						</div>
					</div>
				{:else if channelError}
					<div class="flex items-center gap-3 rounded-xl bg-red-500/5 p-4 border border-red-500/10 text-sm text-red-400">
						<AlertCircle class="h-5 w-5 shrink-0" />
						<p>{channelError}</p>
					</div>
				{/if}
			</div>
		{/if}
	</section>

	<div class="grid gap-6 md:grid-cols-[1fr_320px]">
		<!-- Event Form -->
		<section class="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-6">
			<div class="flex items-center justify-between">
				<h2 class="text-lg font-semibold flex items-center gap-2">
					<Send class="h-4 w-4 text-emerald-500" />
					Fire Event
				</h2>
			</div>

			<div class="space-y-4">
				<div class="space-y-2">
					<label for="eventType" class="text-sm font-medium text-zinc-400">Event Type</label>
					<select
						id="eventType"
						bind:value={selectedEventType}
						class="w-full appearance-none rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all cursor-pointer"
					>
						{#each Object.keys(EVENT_CONFIGS) as type}
							<option value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
						{/each}
					</select>
				</div>

				<div class="grid gap-4 sm:grid-cols-2">
					{#each EVENT_CONFIGS[selectedEventType].fields as field}
						<div class="space-y-2 {field.id === 'message' ? 'sm:col-span-2' : ''}">
							<label for={field.id} class="text-sm font-medium text-zinc-400 flex items-center gap-2">
								{#if field.id === 'sender' || field.id === 'receiver'}
									<User class="h-3.5 w-3.5" />
								{:else if field.id === 'amount' || field.id === 'tier'}
									<Hash class="h-3.5 w-3.5" />
								{:else if field.id === 'message'}
									<MessageSquare class="h-3.5 w-3.5" />
								{:else}
									<Key class="h-3.5 w-3.5" />
								{/if}
								{field.label}
							</label>
							<input
								id={field.id}
								type={field.type}
								bind:value={fieldValues[field.id]}
								placeholder={field.placeholder}
								class="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-zinc-700"
							/>
						</div>
					{/each}
				</div>
			</div>

			<div class="pt-2">
				<button
					onclick={handleSend}
					disabled={isSending || !channelInfo}
					class="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 font-semibold text-white transition-all hover:bg-emerald-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 shadow-lg shadow-emerald-950/20"
				>
					{#if isSending}
						<Loader2 class="h-5 w-5 animate-spin" />
						Sending...
					{:else}
						<Send class="h-5 w-5" />
						Send Event
					{/if}
				</button>
			</div>

			{#if lastResponse}
				<div class="flex items-center gap-3 rounded-xl border p-4 text-sm {lastResponse.success ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400' : 'bg-red-500/5 border-red-500/10 text-red-400'}">
					{#if lastResponse.success}
						<CheckCircle2 class="h-5 w-5 shrink-0" />
					{:else}
						<AlertCircle class="h-5 w-5 shrink-0" />
					{/if}
					<p>{lastResponse.message}</p>
				</div>
			{/if}
		</section>

		<!-- History -->
		<section class="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 flex flex-col h-full">
			<h2 class="text-lg font-semibold flex items-center gap-2 mb-4">
				<History class="h-4 w-4 text-zinc-400" />
				Recent History
			</h2>

			<div class="flex-1 space-y-3 overflow-y-auto pr-2">
				{#if eventHistory.length === 0}
					<div class="flex flex-col items-center justify-center py-12 text-center">
						<div class="mb-3 rounded-full bg-zinc-800/50 p-3 text-zinc-600">
							<Activity class="h-6 w-6" />
						</div>
						<p class="text-sm text-zinc-500 font-medium">No events sent yet</p>
						<p class="text-[11px] text-zinc-600 px-4">Your activity will appear here as you fire events</p>
					</div>
				{:else}
					{#each eventHistory as entry}
						<div class="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-3 transition-colors hover:bg-zinc-800/30">
							<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg {entry.success ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}">
								<Activity class="h-4 w-4" />
							</div>
							<div class="min-w-0 flex-1">
								<div class="truncate text-sm font-medium text-zinc-200 capitalize">{entry.type}</div>
								<div class="text-[10px] text-zinc-500">{entry.time}</div>
							</div>
							<div class="text-[10px] font-bold uppercase tracking-widest {entry.success ? 'text-emerald-500' : 'text-red-500'}">
								{entry.success ? 'OK' : 'ERR'}
							</div>
						</div>
					{/each}
				{/if}
			</div>

			<div class="mt-6 pt-6 border-t border-zinc-800">
				<a 
					href="https://streamelements.com/dashboard/activity" 
					target="_blank" 
					rel="noopener noreferrer"
					class="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-300 transition-colors"
				>
					View SE Activity Feed
					<ExternalLink class="h-3 w-3" />
				</a>
			</div>
		</section>
	</div>
</div>
