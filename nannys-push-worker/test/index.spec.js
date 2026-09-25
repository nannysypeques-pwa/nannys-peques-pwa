import { env, createExecutionContext, waitOnExecutionContext, SELF } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';
import worker from '../src';

describe('Nannys Push & Auth Worker', () => {
	it('responds to health check (GET /)', async () => {
		const request = new Request('http://example.com/');
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);
		expect(response.status).toBe(200);
		expect(await response.text()).toContain('Push & Auth API activa');
	});

	it('responds to CORS preflight (OPTIONS)', async () => {
		const request = new Request('http://example.com/api/auth/firebase-token', {
			method: 'OPTIONS',
			headers: {
				'Origin': 'https://app.nannysypeques.com.mx',
				'Access-Control-Request-Method': 'POST'
			}
		});
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);
		expect(response.status).toBe(204);
		expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://app.nannysypeques.com.mx');
	});

	it('rejects unauthenticated requests to /api/auth/firebase-token', async () => {
		const request = new Request('http://example.com/api/auth/firebase-token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({})
		});
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);
		expect(response.status).toBe(401);
		const json = await response.json();
		expect(json.ok).toBe(false);
	});
});
