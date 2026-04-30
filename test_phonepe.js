

const PORT = 5175;
const BASE_URL = `http://localhost:${PORT}/api`;

async function testPhonepe() {
    try {
        const payload = {
            success: true,
            code: "PAYMENT_SUCCESS",
            data: {
                merchantTransactionId: "pay-1772251861390-86e73544b71fb",
                state: "COMPLETED",
                amount: 100
            }
        };

        // Convert to base64
        const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');

        console.log('--- Sending Webhook Callback ---');
        const res = await fetch(`${BASE_URL}/payments/phonepe/callback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ response: base64Payload })
        });

        const text = await res.text();
        console.log('PhonePe callback response:', text);
    } catch (e) {
        console.error('Error:', e);
    }
}

testPhonepe();
