
import { db } from './server/db';
import { users, procedures, inventory, patients } from './server/db/schema';
import { eq } from 'drizzle-orm';

const API_URL = 'http://localhost:3000';

async function runTest() {
    const testId = `test_dentist_${Date.now()}`;
    console.log(`🤖 Starting Automated Test for User: ${testId}`);

    // 1. Simulate Onboarding Request
    console.log('1️⃣ Simulating Onboarding Request...');

    try {
        const response = await fetch(`${API_URL}/api/onboarding-v2/quick-setup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: testId,
                role: 'dentist',
                name: 'Test Dentist Automaton',
                cpf: '12345678900',
                phone: '11999999999',
                cro: '12345'
            })
        });

        const data = await response.json();
        console.log('Response:', response.status, data);

        if (!response.ok) {
            console.error('❌ Onboarding failed via API');
            process.exit(1);
        }
    } catch (e) {
        console.error('❌ Could not connect to API. server running?', e);
        process.exit(1);
    }

    // Wait a bit for async seed
    console.log('⏳ Waiting 2s for async seed...');
    await new Promise(r => setTimeout(r, 2000));

    // 2. Verify Database User
    console.log('2️⃣ Verifying User in Database...');
    const user = await db.query.users.findFirst({
        where: eq(users.clerkId, testId)
    });

    if (!user) {
        console.error('❌ User not found in DB');
        process.exit(1);
    }

    console.log(`✅ User found: ID ${user.id}`);
    console.log(`   Organization ID: ${user.organizationId}`);

    if (!user.organizationId || !user.organizationId.startsWith('personal-')) {
        console.error(`❌ Wrong Organization ID format. Expected personal-..., got ${user.organizationId}`);
        process.exit(1);
    }
    const personalOrgId = user.organizationId;

    // 3. Verify Seed Data
    console.log(`3️⃣ Verifying Seed Data for ${personalOrgId}...`);

    // Procedures
    const procs = await db.select().from(procedures).where(eq(procedures.organizationId, personalOrgId));
    console.log(`   Procedures found: ${procs.length}`);
    if (procs.length === 0) console.error('❌ No procedures found (Seed failed?)');
    else console.log('✅ Procedures Logged OK');

    // Inventory
    const inv = await db.select().from(inventory).where(eq(inventory.organizationId, personalOrgId));
    console.log(`   Inventory items found: ${inv.length}`);
    if (inv.length === 0) console.error('❌ No inventory found (Seed failed?)');
    else console.log('✅ Inventory Logged OK');

    // Patients
    const pats = await db.select().from(patients).where(eq(patients.organizationId, personalOrgId));
    console.log(`   Patients found: ${pats.length}`);
    if (pats.length === 0) console.error('❌ No patients found (Seed failed?)');
    else console.log('✅ Patients Logged OK');

    // Final Verdict
    if (procs.length > 0 && inv.length > 0 && pats.length > 0) {
        console.log('\n🎉🎉🎉 TEST PASSED! All systems operational. 🎉🎉🎉');
    } else {
        console.log('\n⚠️ TEST COMPLETED WITH ISSUES. Check logs.');
    }

    process.exit(0);
}

runTest();
