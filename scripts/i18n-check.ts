#!/usr/bin/env node
/**
 * i18n Translation Key Validation Script
 * Validates that all keys exist in all 3 locales (pt-BR, en, es)
 * 
 * Usage: npx tsx scripts/i18n-check.ts
 * Exit code: 0 if all keys present, 1 if missing keys
 */

import ptBR from '../lib/i18n/locales/pt-BR';
import en from '../lib/i18n/locales/en';
import es from '../lib/i18n/locales/es';

type NestedObject = { [key: string]: string | NestedObject };

/**
 * Flatten a nested object into dot-notation keys
 */
function flattenKeys(obj: NestedObject, prefix = ''): string[] {
    const keys: string[] = [];

    for (const key of Object.keys(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        const value = obj[key];

        if (typeof value === 'object' && value !== null) {
            keys.push(...flattenKeys(value as NestedObject, fullKey));
        } else {
            keys.push(fullKey);
        }
    }

    return keys;
}

/**
 * Compare two key sets and find differences
 */
function findMissingKeys(baseKeys: string[], targetKeys: string[]): string[] {
    const targetSet = new Set(targetKeys);
    return baseKeys.filter(key => !targetSet.has(key));
}

// Get all keys from each locale
const ptBRKeys = flattenKeys(ptBR as NestedObject);
const enKeys = flattenKeys(en as NestedObject);
const esKeys = flattenKeys(es as NestedObject);

// Use pt-BR as the base (it's our default/fallback)
const baseKeys = ptBRKeys;

console.log('\n🌍 i18n Translation Key Validation\n');
console.log('━'.repeat(50));
console.log(`📊 pt-BR (base): ${ptBRKeys.length} keys`);
console.log(`📊 en:           ${enKeys.length} keys`);
console.log(`📊 es:           ${esKeys.length} keys`);
console.log('━'.repeat(50));

let hasErrors = false;

// Check en locale
const missingInEn = findMissingKeys(baseKeys, enKeys);
if (missingInEn.length > 0) {
    hasErrors = true;
    console.log(`\n❌ Missing in en (${missingInEn.length} keys):`);
    missingInEn.slice(0, 20).forEach(key => console.log(`   - ${key}`));
    if (missingInEn.length > 20) {
        console.log(`   ... and ${missingInEn.length - 20} more`);
    }
}

// Check es locale
const missingInEs = findMissingKeys(baseKeys, esKeys);
if (missingInEs.length > 0) {
    hasErrors = true;
    console.log(`\n❌ Missing in es (${missingInEs.length} keys):`);
    missingInEs.slice(0, 20).forEach(key => console.log(`   - ${key}`));
    if (missingInEs.length > 20) {
        console.log(`   ... and ${missingInEs.length - 20} more`);
    }
}

// Check for extra keys in en/es not in pt-BR (informational)
const extraInEn = findMissingKeys(enKeys, baseKeys);
const extraInEs = findMissingKeys(esKeys, baseKeys);

if (extraInEn.length > 0) {
    console.log(`\n⚠️  Extra keys in en not in pt-BR (${extraInEn.length}):`);
    extraInEn.slice(0, 10).forEach(key => console.log(`   - ${key}`));
}

if (extraInEs.length > 0) {
    console.log(`\n⚠️  Extra keys in es not in pt-BR (${extraInEs.length}):`);
    extraInEs.slice(0, 10).forEach(key => console.log(`   - ${key}`));
}

console.log('\n' + '━'.repeat(50));

if (hasErrors) {
    console.log('❌ VALIDATION FAILED - Missing translation keys detected');
    console.log('   Run this script to see which keys need to be added.');
    process.exit(1);
} else {
    console.log('✅ VALIDATION PASSED - All locales have matching keys');
    process.exit(0);
}
