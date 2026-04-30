
const PORT = 5175;
const BASE_URL = `http://localhost:${PORT}/api`;
const { execSync } = require('child_process');

async function testCostFix() {
    try {
        const timestamp = Date.now();
        const username = `admin${timestamp}`;
        const email = `admin${timestamp}@test.com`;
        const password = 'password123';

        console.log('--- Registering user ---');
        const regRes = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Cost Admin',
                email: email,
                username: username,
                password: password
            })
        });

        if (!regRes.ok) {
            console.error('Registration failed:', await regRes.text());
            return;
        }
        console.log('Registered user:', username);

        console.log('--- Promoting user to admin ---');
        execSync('node promote_user.cjs');
        console.log('User promoted');

        console.log('--- Logging in to get admin token ---');
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        const loginData = await loginRes.json();
        const token = loginData.token;
        if (!token) {
            console.error('Login failed:', loginData);
            return;
        }
        console.log('Logged in as admin, role:', loginData.customer.role);

        console.log('--- Creating Design with Price and Cost ---');
        const designRes = await fetch(`${BASE_URL}/designs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                title: 'Cost Verification Design',
                description: 'A design to verify price vs cost tracking',
                categoryId: 'cat-living',
                price: 50000,
                cost: 30000,
                previewImage: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=800'
            })
        });

        if (!designRes.ok) {
            console.error('Design creation failed:', await designRes.text());
            return;
        }

        const designData = await designRes.json();
        const designId = designData.designId;
        console.log('Created design:', designId);

        console.log('--- Booking the Design ---');
        const bookRes = await fetch(`${BASE_URL}/bookings/book-design`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                designId: designId
            })
        });

        if (!bookRes.ok) {
            console.error('Booking failed:', await bookRes.text());
            return;
        }

        const bookData = await bookRes.json();
        const bookingId = bookData.bookingId;
        console.log('Booking created:', bookingId);

        console.log('--- Verifying Booking Data ---');
        const getRes = await fetch(`${BASE_URL}/bookings`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const getData = await getRes.json();
        const booking = getData.bookings.find(b => b.id === bookingId);

        if (booking) {
            console.log('Retrieved booking values:', { price: booking.price, cost: booking.cost });
            if (Number(booking.price) === 50000 && Number(booking.cost) === 30000) {
                console.log('✅ TEST PASSED: Price and Cost are correctly separated and saved!');
            } else {
                console.log('❌ TEST FAILED: Price or Cost mismatch', booking);
            }
        } else {
            console.log('❌ TEST FAILED: Booking not found in list');
        }

    } catch (e) {
        console.error('Test script failed:', e);
    }
}

testCostFix();
