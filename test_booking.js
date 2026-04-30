
import sqlite3 from 'sqlite3';

const PORT = 5175;
const BASE_URL = `http://localhost:${PORT}/api`;

async function test() {
    try {
        console.log('--- Registering mock user ---');
        const regRes = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test Setup User',
                email: `test${Date.now()}@test.com`,
                username: `testuser${Date.now()}`,
                password: 'password123'
            })
        });
        const regData = await regRes.json();
        const token = regData.token;
        const customerId = regData.customer.id;
        console.log('Registered user:', customerId);

        console.log('--- Booking Custom Design ---');
        const bookRes = await fetch(`${BASE_URL}/bookings/book-design`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                customerId,
                designId: 'random-design-id',
                designName: 'My Special AI Design',
                cost: 999
            })
        });
        const bookData = await bookRes.json();
        console.log('Book response:', bookData);

        console.log('--- Fetching Bookings ---');
        const getRes = await fetch(`${BASE_URL}/bookings?customerId=${customerId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const getData = await getRes.json();
        console.log('Fetch Bookings:', getData);

        if (getData.bookings && getData.bookings[0]) {
            const b = getData.bookings[0];
            if (b.designName === 'My Special AI Design' && b.price === 999) {
                console.log('✅ TEST PASSED: Custom design name and price correctly saved and retrieved!');
            } else {
                console.log('❌ TEST FAILED: Custom design name or price mismatch', b);
            }
        } else {
            console.log('❌ TEST FAILED: No bookings returned');
        }
    } catch (e) {
        console.error('Test script failed:', e);
    }
}

test();
