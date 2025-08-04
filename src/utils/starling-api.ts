// Starling Bank API configuration and utilities
import {createHash, createSign} from 'node:crypto';

export const STARLING_BANK_BASE_URL = process.env.STARLING_BANK_BASE_URL || 'https://api.starlingbank.com';

// ECDSA key information for signing requests
const {STARLING_BANK_PRIVATE_KEY_PEM, STARLING_BANK_PRIVATE_KEY_UID} = process.env;

// Common helper to create base headers
function createBaseHeaders(accessToken: string): Record<string, string> {
	return {
		Authorization: `Bearer ${accessToken}`,
		Accept: 'application/json',
	};
}

// Common helper to handle API errors
async function handleApiError(response: Response): Promise<never> {
	const errorText = await response.text();
	throw new Error(`Starling API error: ${response.status} ${response.statusText} - ${errorText}`);
}

// Common helper to parse response based on content type
async function parseResponse(response: Response): Promise<unknown> {
	if (!response.ok) {
		await handleApiError(response);
	}

	const contentType = response.headers.get('content-type');

	if (contentType?.includes('application/json')) {
		const responseText = await response.text();

		// Handle empty JSON responses (common for successful uploads)
		if (!responseText.trim()) {
			return {success: true, message: 'Operation completed successfully'};
		}

		try {
			return JSON.parse(responseText);
		} catch (error) {
			throw new Error(`Failed to parse JSON response: ${error instanceof Error ? error.message : String(error)}`);
		}
	}

	return (await response.text()) || 'Success';
}

// Function to create message signature for payment endpoints
function createMessageSignature(
	method: string,
	endpoint: string,
	date: string,
	digest: string,
): string {
	if (!STARLING_BANK_PRIVATE_KEY_PEM) {
		throw new Error('STARLING_BANK_PRIVATE_KEY_PEM is not set. This is an optional configuration setting, but is required to use this endpoint. Update your MCP configuration to use this endpoint, and see https://github.com/domdomegg/starling-bank-mcp for more details.');
	}

	if (!STARLING_BANK_PRIVATE_KEY_UID) {
		throw new Error('STARLING_BANK_PRIVATE_KEY_UID is not set. This is an optional configuration setting, but is required to use this endpoint. Update your MCP configuration to use this endpoint, and see https://github.com/domdomegg/starling-bank-mcp for more details.');
	}

	const contentToSign = [
		`(request-target): ${method.toLowerCase()} ${endpoint}`,
		`Date: ${date}`,
		`Digest: ${digest}`,
	].join('\n');

	const sign = createSign('SHA512');
	sign.update(contentToSign, 'utf8');
	sign.end();

	// Sign with the private key and encode as base64
	// Use the EC private key format
	const signature = sign.sign(STARLING_BANK_PRIVATE_KEY_PEM, 'base64');

	// Return the signature header value
	return `Signature keyid="${STARLING_BANK_PRIVATE_KEY_UID}",algorithm="ecdsa-sha512",headers="(request-target) Date Digest",signature="${signature}"`;
}

// Utility function to make authenticated API calls
export async function makeStarlingApiCall(
	endpoint: string,
	accessToken: string,
	method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
	body?: unknown,
) {
	const url = `${STARLING_BANK_BASE_URL}${endpoint}`;
	const headers = createBaseHeaders(accessToken);

	if (body) {
		headers['Content-Type'] = 'application/json';
	}

	const fetchOptions: RequestInit = {
		method,
		headers,
	};

	if (body) {
		fetchOptions.body = JSON.stringify(body);
	}

	const response = await fetch(url, fetchOptions);
	return parseResponse(response);
}

// Utility function to make signed API calls (for payment endpoints)
export async function makeSignedStarlingApiCall(
	endpoint: string,
	accessToken: string,
	method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
	body?: unknown,
) {
	const url = `${STARLING_BANK_BASE_URL}${endpoint}`;
	const headers = createBaseHeaders(accessToken);
	const requestBody = JSON.stringify(body);
	if (body) {
		headers['Content-Type'] = 'application/json';
	}

	const date = new Date().toISOString();
	headers.Date = date;

	const hash = createHash('sha512');
	hash.update(requestBody, 'utf8');
	const digest = body ? hash.digest('base64') : 'X';
	headers.Digest = digest;

	const signature = createMessageSignature(method, endpoint, date, digest);

	// Add signature to the Authorization header (not as separate header)
	headers.Authorization = `${headers.Authorization};${signature}`;

	const fetchOptions: RequestInit = {
		method,
		headers,
	};

	if (body) {
		fetchOptions.body = requestBody;
	}

	const response = await fetch(url, fetchOptions);
	return parseResponse(response);
}

// Utility function for binary file uploads
export async function makeStarlingApiCallWithBinary(
	endpoint: string,
	accessToken: string,
	binaryData: Buffer,
	contentType?: string,
) {
	const url = `${STARLING_BANK_BASE_URL}${endpoint}`;
	const headers = createBaseHeaders(accessToken);

	if (contentType) {
		headers['Content-Type'] = contentType;
	}

	const fetchOptions: RequestInit = {
		method: 'POST',
		headers,
		body: binaryData,
	};

	const response = await fetch(url, fetchOptions);
	return parseResponse(response);
}

// Utility function for binary file downloads
export async function makeStarlingApiCallForBinary(
	endpoint: string,
	accessToken: string,
): Promise<ArrayBuffer> {
	const url = `${STARLING_BANK_BASE_URL}${endpoint}`;
	const headers = createBaseHeaders(accessToken);

	const fetchOptions: RequestInit = {
		method: 'GET',
		headers,
	};

	const response = await fetch(url, fetchOptions);

	if (!response.ok) {
		await handleApiError(response);
	}

	return response.arrayBuffer();
}
