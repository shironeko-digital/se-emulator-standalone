export type EventType =
	| 'follow'
	| 'subscriber'
	| 'tip'
	| 'cheer'
	| 'raid'
	| 'merch'
	| 'community gift'
	| 'single community gift';

export interface EventField {
	id: string;
	label: string;
	type: 'text' | 'number';
	placeholder?: string;
	defaultValue?: string | number;
}

export const EVENT_CONFIGS: Record<EventType, { fields: EventField[] }> = {
	follow: {
		fields: [
			{ id: 'sender', label: 'Username', type: 'text', placeholder: 'streamelements' }
		]
	},
	subscriber: {
		fields: [
			{ id: 'sender', label: 'Username', type: 'text', placeholder: 'streamelements' },
			{ id: 'amount', label: 'Months', type: 'number', defaultValue: 1 },
			{ id: 'tier', label: 'Tier', type: 'text', defaultValue: '1000' }
		]
	},
	tip: {
		fields: [
			{ id: 'sender', label: 'Username', type: 'text', placeholder: 'streamelements' },
			{ id: 'amount', label: 'Amount', type: 'number', defaultValue: 10 },
			{ id: 'message', label: 'Message', type: 'text', placeholder: 'How are you today?' }
		]
	},
	cheer: {
		fields: [
			{ id: 'sender', label: 'Username', type: 'text', placeholder: 'streamelements' },
			{ id: 'amount', label: 'Bits', type: 'number', defaultValue: 100 },
			{ id: 'message', label: 'Message', type: 'text', placeholder: 'How are you today?' }
		]
	},
	raid: {
		fields: [
			{ id: 'sender', label: 'Username', type: 'text', placeholder: 'streamelements' },
			{ id: 'amount', label: 'Viewers', type: 'number', defaultValue: 10 }
		]
	},
	merch: {
		fields: [
			{ id: 'sender', label: 'Username', type: 'text', placeholder: 'streamelements' },
			{ id: 'amount', label: 'Items', type: 'number', defaultValue: 1 }
		]
	},
	'community gift': {
		fields: [
			{ id: 'sender', label: 'Sender', type: 'text', placeholder: 'streamelements' },
			{ id: 'amount', label: 'Count', type: 'number', defaultValue: 5 },
			{ id: 'tier', label: 'Tier', type: 'text', defaultValue: '1000' }
		]
	},
	'single community gift': {
		fields: [
			{ id: 'sender', label: 'Sender', type: 'text', placeholder: 'streamelements' },
			{ id: 'receiver', label: 'Receiver', type: 'text', placeholder: 'someone' },
			{ id: 'tier', label: 'Tier', type: 'text', defaultValue: '1000' }
		]
	}
};

export function buildEventPayload(type: EventType, data: Record<string, any>, activityGroup?: string) {
	const time = new Date().toISOString();
	const base = {
		provider: 'twitch',
		createdAt: time,
		isMock: true,
		flagged: false
	};

	const sender = data.sender || 'streamelements';
	const amount = data.amount || 1;
	const message = data.message || 'How are you today?';
	const tier = data.tier || '1000';
	const receiver = data.receiver || 'someone';
	const avatar = 'https://cdn.streamelements.com/assets/dashboard/my-overlays/overlay-default-preview-2.jpg';

	switch (type) {
		case 'follow':
			return {
				...base,
				type: 'follow',
				data: {
					providerId: '100135110',
					username: sender,
					displayName: sender,
					avatar: avatar
				}
			};
		case 'subscriber':
			return {
				...base,
				type: 'subscriber',
				data: {
					providerId: '100135110',
					username: sender,
					displayName: sender,
					avatar: avatar,
					amount: amount,
					gifted: false,
					tier: tier
				}
			};
		case 'tip':
			return {
				...base,
				type: 'tip',
				data: {
					providerId: '100135110',
					username: sender,
					displayName: sender,
					avatar: avatar,
					amount: amount,
					message: message
				}
			};
		case 'cheer':
			return {
				...base,
				type: 'cheer',
				data: {
					providerId: '100135110',
					username: sender,
					displayName: sender,
					avatar: avatar,
					amount: amount,
					message: message
				}
			};
		case 'raid':
			return {
				...base,
				type: 'raid',
				data: {
					providerId: '100135110',
					username: sender,
					displayName: sender,
					avatar: avatar,
					amount: amount
				}
			};
		case 'merch':
			return {
				...base,
				type: 'merch',
				data: {
					providerId: '100135110',
					username: sender,
					displayName: sender,
					avatar: avatar,
					amount: amount,
					items: [
						{ name: 'Hat', price: 5, quantity: 1 },
						{ name: 'Shirt', price: 5, quantity: 1 }
					]
				}
			};
		case 'community gift':
			return {
				...base,
				type: 'communityGiftPurchase',
				activityGroup: activityGroup || `${Math.random() * 9000000}`,
				data: {
					providerId: '100135110',
					username: sender,
					displayName: sender,
					avatar: avatar,
					amount: amount,
					gifted: true,
					tier: tier
				}
			};
		case 'single community gift':
			return {
				...base,
				type: 'subscriber',
				data: {
					providerId: '100135110',
					username: receiver,
					displayName: receiver,
					avatar: avatar,
					amount: 1,
					gifted: true,
					sender: sender,
					tier: tier
				}
			};
	}
}
