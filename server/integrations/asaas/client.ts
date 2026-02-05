
interface AsaasRequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
    params?: Record<string, string | number | undefined>;
}

const ASAAS_API_URL = process.env.ASAAS_ENV === 'production'
    ? 'https://api.asaas.com/v3'
    : 'https://sandbox.asaas.com/api/v3';

const ASAAS_API_KEY = process.env.ASAAS_API_KEY;

if (!ASAAS_API_KEY) {
    console.warn("⚠️ ASAAS_API_KEY is not set. Asaas integration will not work.");
}

export class AsaasClient {
    private apiKey: string;
    private baseUrl: string;

    constructor() {
        this.apiKey = ASAAS_API_KEY || '';
        this.baseUrl = ASAAS_API_URL;
    }

    private async request<T>(endpoint: string, options: AsaasRequestOptions = {}): Promise<T> {
        if (!this.apiKey) {
            throw new Error('ASAAS_API_KEY is missing');
        }

        const url = new URL(`${this.baseUrl}${endpoint}`);

        if (options.params) {
            Object.entries(options.params).forEach(([key, value]) => {
                if (value !== undefined) {
                    url.searchParams.append(key, String(value));
                }
            });
        }

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            'access_token': this.apiKey
        };

        const config: RequestInit = {
            method: options.method || 'GET',
            headers,
            body: options.body ? JSON.stringify(options.body) : undefined,
        };

        // Log outgoing request (sanitized)
        console.log(`📡 [ASAAS] ${config.method} ${url.toString()}`); // Log FULL URL

        try {
            const response = await fetch(url.toString(), config);

            const contentType = response.headers.get('content-type');

            if (!response.ok) {
                const errorBody = await response.text();
                // Check if HTML to give better hint
                if (errorBody.trim().startsWith('<')) {
                    console.error(`❌ [ASAAS] HTML Response returned! This usually means the URL is wrong or hitting a proxy. URL: ${url.toString()}`);
                }
                console.error(`❌ [ASAAS] Error ${response.status}:`, errorBody);
                throw new Error(`Asaas API Error: ${response.statusText} - ${errorBody}`);
            }

            const text = await response.text();
            try {
                return JSON.parse(text) as T;
            } catch (e) {
                console.error(`❌ [ASAAS] JSON Parse Error on ${url.toString()}. Valid JSON expected.`);
                console.error(`❌ [ASAAS] Received Body Preview: ${text.substring(0, 500)}...`);
                throw new Error('Invalid JSON response from Asaas');
            }
        } catch (error) {
            console.error(`❌ [ASAAS] Request failed:`, error);
            throw error;
        }
    }

    // --- Customers ---
    async createCustomer(data: { name: string; cpfCnpj: string; email?: string; mobilePhone?: string }) {
        return this.request('/customers', {
            method: 'POST',
            body: data
        });
    }

    async getCustomer(cpfCnpj: string) { // Try to find by CPF first to avoid dups
        return this.request<{ data: any[] }>('/customers', {
            params: { cpfCnpj }
        });
    }

    // --- Payments ---
    async createPayment(data: {
        customer: string;
        billingType: 'BOLETO' | 'PIX' | 'CREDIT_CARD';
        value: number;
        dueDate: string;
        description?: string;
        externalReference?: string;
        installmentCount?: number;
        installmentValue?: number;
    }) {
        return this.request('/payments', {
            method: 'POST',
            body: data
        });
    }

    async getPayment(id: string) {
        return this.request(`/payments/${id}`);
    }

    async getPixQrCode(id: string) {
        return this.request<{ encodedImage: string; payload: string }>(
            `/payments/${id}/pixQrCode`
        );
    }
}

export const asaas = new AsaasClient();
