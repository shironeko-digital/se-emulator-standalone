export interface ChannelInfo {
	_id: string;
	username: string;
	displayName: string;
	profilePicUrl: string;
}

export async function fetchChannelInfo(jwtToken: string): Promise<ChannelInfo> {
	const response = await fetch('https://api.streamelements.com/kappa/v2/channels/me', {
		headers: {
			accept: 'application/json',
			authorization: `Bearer ${jwtToken}`
		}
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(error || `HTTP error ${response.status}`);
	}

	const contentType = response.headers.get('content-type');
	if (contentType && contentType.includes('application/json')) {
		return response.json();
	}

	throw new Error('API returned non-JSON response for channel info');
}

export async function sendMockEvent(channelId: string, jwtToken: string, payload: any) {
	const response = await fetch(`https://api.streamelements.com/kappa/v2/activities/${channelId}/mock`, {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
			accept: 'application/json',
			authorization: `Bearer ${jwtToken}`
		},
		body: JSON.stringify(payload)
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(error || `HTTP error ${response.status}`);
	}

	const contentType = response.headers.get('content-type');
	if (contentType && contentType.includes('application/json')) {
		return response.json();
	}
	
	return response.text();
}
