
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Helper to handle ESM __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Starting Environment Verification Script');
console.log('----------------------------------------');

// 1. Check Current Working Directory
const cwd = process.cwd();
console.log(`📂 Current Working Directory: ${cwd}`);

// 2. Check for .env file
const envPath = path.resolve(cwd, '.env');
console.log(`📄 Looking for .env file at: ${envPath}`);

if (fs.existsSync(envPath)) {
    console.log('✅ .env file FOUND');

    // Read raw content to check for syntax issues (first 10 chars of each line to be safe)
    try {
        const rawContent = fs.readFileSync(envPath, 'utf8');
        const lines = rawContent.split('\n').filter(l => l.trim() !== '' && !l.trim().startsWith('#'));
        console.log(`📊 File contains ${lines.length} configuration lines`);

        // Check if DATABASE_URL is seemingly present in raw text
        const hasDbRaw = rawContent.includes('DATABASE_URL');
        console.log(`🔎 'DATABASE_URL' string found in file: ${hasDbRaw ? 'YES' : 'NO'}`);
    } catch (err) {
        console.error('❌ Error reading .env file:', err);
    }

} else {
    console.error('❌ .env file NOT FOUND');
    console.log('👉 Please create the .env file in the root directory.');
    process.exit(1);
}

// 3. Load dotenv
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error('❌ Dotenv failed to parse file:', result.error);
} else {
    console.log('✅ Dotenv parsed file successfully');
}

// 4. Check Variables
console.log('\n🔑 Variable Check:');
console.log('----------------------------------------');

const checkVar = (name: string, isSecret = false) => {
    const value = process.env[name];
    if (!value) {
        console.log(`❌ ${name}: MISSING`);
    } else {
        const display = isSecret ? `SET (Length: ${value.length})` : value;
        console.log(`✅ ${name}: ${display}`);
    }
};

checkVar('DATABASE_URL', true); // Treat as secret just in case
checkVar('CLERK_SECRET_KEY', true);
checkVar('CLERK_PUBLISHABLE_KEY', false);
checkVar('NODE_ENV', false);
checkVar('PORT', false);

console.log('----------------------------------------');
console.log('DONE');
