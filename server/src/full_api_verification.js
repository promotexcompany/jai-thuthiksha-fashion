import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import dressRoutes from './routes/dresses.js';
import categoryRoutes from './routes/categories.js';
import filterRoutes from './routes/filters.js';
import bookingRoutes from './routes/bookings.js';
import settingsRoutes from './routes/settings.js';
import uploadRoutes from './routes/upload.js';
import { supabase } from './config/supabase.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/dresses', dressRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/filters', filterRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api', uploadRoutes);

let server;
const PORT = 5099;
const BASE_URL = `http://localhost:${PORT}/api`;

async function runFullVerificationSuite() {
  console.log('=== STARTING FULL API & CRUD VERIFICATION SUITE ===\n');

  server = app.listen(PORT, async () => {
    let passed = 0;
    let failed = 0;

    const assert = (condition, testName, details = '') => {
      if (condition) {
        console.log(`[PASS] ${testName}`);
        passed++;
      } else {
        console.error(`[FAIL] ${testName} - ${details}`);
        failed++;
      }
    };

    try {
      // 1. Health Check / Public Dresses
      const pubRes = await fetch(`${BASE_URL}/dresses`);
      const pubDresses = await pubRes.json();
      assert(pubRes.ok && Array.isArray(pubDresses), 'GET /api/dresses returns public dress list', `Count: ${pubDresses.length}`);

      // 2. Admin Login
      const loginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@jaithuthiksha.com', password: 'Admin@JTF2026' })
      });
      const loginData = await loginRes.json();
      assert(loginRes.ok && loginData.token, 'POST /api/auth/login succeeds with master credentials');
      const token = loginData.token;
      const adminHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

      // 3. Admin Get All Dresses
      const adminDressesRes = await fetch(`${BASE_URL}/dresses/admin/all`, { headers: adminHeaders });
      const adminDresses = await adminDressesRes.json();
      assert(adminDressesRes.ok && Array.isArray(adminDresses), 'GET /api/dresses/admin/all returns all dresses');
      const initialCount = adminDresses.length;

      // 4. Admin Get All Categories
      const catsRes = await fetch(`${BASE_URL}/categories/admin/all`, { headers: adminHeaders });
      const catsData = await catsRes.json();
      assert(catsRes.ok && Array.isArray(catsData), 'GET /api/categories/admin/all returns categories list');

      // 5. POST Add Dress (Testing Category Resolution with legacy categoryId 'cat-photoshoot')
      const newDressPayload = {
        name: 'E2E Royal Gold Embroidered Lehenga',
        categoryId: 'cat-photoshoot',
        categoryName: 'Photoshoot',
        designer: 'Jai Thuthiksha Couture',
        retailPrice: 45000,
        rentalPrice4Days: 4999,
        rentalPrice8Days: 7999,
        advanceAmount: 1500,
        images: ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b'],
        primaryImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b',
        description: 'End-to-end verification dress description.',
        fabric: 'Zari Tissue Silk',
        workType: 'Gold Dabka',
        sizes: ['M', 'L'],
        colors: ['Gold'],
        isAvailable: true,
        isHidden: false
      };

      const addRes = await fetch(`${BASE_URL}/dresses/admin/add`, {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify(newDressPayload)
      });
      const addData = await addRes.json();
      assert(addRes.ok && addData.dress && addData.dress.id, 'POST /api/dresses/admin/add creates dress with resolved category ID');
      const createdDressId = addData.dress.id;

      // 6. Verify dress exists in Supabase directly
      const { data: sbCheck } = await supabase.from('dresses').select('*').eq('id', createdDressId);
      assert(sbCheck && sbCheck.length === 1, 'Newly added dress is persisted in Supabase database');

      // 7. Verify dress appears in GET /api/dresses/admin/all
      const reFetchRes = await fetch(`${BASE_URL}/dresses/admin/all`, { headers: adminHeaders });
      const reFetchDresses = await reFetchRes.json();
      const foundInAdmin = reFetchDresses.some(d => d.id === createdDressId);
      assert(foundInAdmin, 'Newly added dress appears in Admin Dashboard dress listing after fetch');

      // 8. Verify dress appears in Public Catalogue GET /api/dresses
      const reFetchPubRes = await fetch(`${BASE_URL}/dresses`);
      const reFetchPubDresses = await reFetchPubRes.json();
      const foundInPublic = reFetchPubDresses.some(d => d.id === createdDressId);
      assert(foundInPublic, 'Newly added dress appears in Public Catalogue listing');

      // 9. PUT Update Dress
      const updateRes = await fetch(`${BASE_URL}/dresses/admin/${createdDressId}`, {
        method: 'PUT',
        headers: adminHeaders,
        body: JSON.stringify({
          ...newDressPayload,
          name: 'E2E Updated Royal Gold Saree',
          retailPrice: 50000
        })
      });
      const updateData = await updateRes.json();
      assert(updateRes.ok && updateData.dress && updateData.dress.name === 'E2E Updated Royal Gold Saree', 'PUT /api/dresses/admin/:id updates dress details');

      // 10. Verify update in Supabase
      const { data: sbUpdateCheck } = await supabase.from('dresses').select('*').eq('id', createdDressId);
      assert(sbUpdateCheck && sbUpdateCheck[0]?.name === 'E2E Updated Royal Gold Saree', 'Dress update is persisted in Supabase');

      // 11. PATCH Toggle Visibility
      const toggleRes = await fetch(`${BASE_URL}/dresses/admin/${createdDressId}/toggle`, {
        method: 'PATCH',
        headers: adminHeaders,
        body: JSON.stringify({ isHidden: true })
      });
      assert(toggleRes.ok, 'PATCH /api/dresses/admin/:id/toggle hides dress');

      // Verify hidden dress is excluded from public catalogue
      const reFetchPubHidden = await (await fetch(`${BASE_URL}/dresses`)).json();
      const hiddenInPublic = !reFetchPubHidden.some(d => d.id === createdDressId);
      assert(hiddenInPublic, 'Hidden dress is excluded from public catalogue response');

      // 12. DELETE Dress
      const delRes = await fetch(`${BASE_URL}/dresses/admin/${createdDressId}`, {
        method: 'DELETE',
        headers: adminHeaders
      });
      assert(delRes.ok, 'DELETE /api/dresses/admin/:id deletes dress');

      // Verify deletion in Supabase
      const { data: sbDelCheck } = await supabase.from('dresses').select('*').eq('id', createdDressId);
      assert(!sbDelCheck || sbDelCheck.length === 0, 'Deleted dress is removed from Supabase database');

      // 13. Category Deletion Safeguard Check
      const catDelRes = await fetch(`${BASE_URL}/categories/admin/cat-1`, {
        method: 'DELETE',
        headers: adminHeaders
      });
      assert(catDelRes.status === 400, 'DELETE /api/categories/admin/:id blocks deletion of category with assigned dresses (HTTP 400)');

      console.log(`\n==================================================`);
      console.log(`VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
      console.log(`==================================================\n`);

      server.close();
      if (failed > 0) process.exit(1);
    } catch (err) {
      console.error('Test execution exception:', err);
      if (server) server.close();
      process.exit(1);
    }
  });
}

runFullVerificationSuite();
