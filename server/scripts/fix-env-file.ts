
import fs from 'node:fs';
import path from 'node:path';

// NOTE: Values with <PLACEHOLDER> must be replaced manually on the server
// Run this script, then edit the .env file to fill in the secrets.

const content = `PORT=3000
NODE_ENV=production

# Database
# REPLACE WITH REAL PASSWORD
DATABASE_URL="postgresql://dentis_user:YOUR_DB_PASSWORD@127.0.0.1:5432/dentis"

# Clerk (Backend)
# REPLACE WITH REAL KEY
CLERK_SECRET_KEY="sk_live_..."
CLERK_PUBLISHABLE_KEY="pk_live_..."

# Client (Frontend) - CRITICAL FOR BUILD
VITE_CLERK_PUBLISHABLE_KEY="pk_live_..."
VITE_APP_URL="https://dentis.com.br"
VITE_ENABLE_CLINIC_MANAGEMENT="true"
VITE_ADMIN_EMAILS="gustavosbifulco@gmail.com"

# API Keys
API_KEY="AIzaSy..."
OPENAI_API_KEY="sk-proj-..."

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email
SMTP_HOST="smtp.hostinger.com"
SMTP_PORT=465
SMTP_SECURE="true"
SMTP_USER="nao-responda@dentis.com.br"
SMTP_PASS="YOUR_SMTP_PASSWORD"

# WhatsApp
WHATSAPP_API_KEY="EAA..."
WHATSAPP_PHONE_NUMBER_ID="YOUR_PHONE_ID"
WHATSAPP_BUSINESS_ACCOUNT_ID="YOUR_BIZ_ID"
WHATSAPP_VERIFY_TOKEN="dentis_webhook_2024"
`;

const filePath = path.join(process.cwd(), '.env');

try {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ Wrote template .env file to:', filePath);
    console.log('⚠️  IMPORTANT: Now run "nano .env" and fill in the real passwords!');
} catch (error) {
    console.error('❌ Failed to write file:', error);
}
`;


// IMPORTANT: Do NOT wait for user, I will use notify_user next.
