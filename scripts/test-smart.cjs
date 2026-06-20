const https = require('https');
const fs = require('fs');

const PRO_ENGINE_KEY = process.env.PRO_ENGINE_KEY;
if (!PRO_ENGINE_KEY) {
    throw new Error('Missing PRO_ENGINE_KEY environment variable.');
}
const imgPath = 'd:/AR_INTERIA1_copy/public/category/Bathroom/bathroom1.jpg';

const imageBytes = fs.readFileSync(imgPath);
const base64 = imageBytes.toString('base64');

const body = JSON.stringify({
    contents: [{
        parts: [
            { text: 'Describe this bathroom interior in one short premium product name (3-5 words). Reply only with JSON: {"name": "Test Name", "description": "Short description."}' },
            { inline_data: { mime_type: 'image/jpeg', data: base64 } }
        ]
    }],
    generationConfig: { temperature: 0.6, maxOutputTokens: 80 }
});

const options = {
    hostname: 'generativelanguage.googleapis.com',
    path: '/v1beta/models/smartEngine-2.0-flash:generateContent?key=' + PRO_ENGINE_KEY,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
    }
};

const req = https.request(options, (res) => {
    let data = '';
    console.log('HTTP Status:', res.statusCode);
    res.on('data', chunk => { data += chunk; });
    res.on('end', () => {
        try {
            const parsed = JSON.parse(data);
            if (parsed.error) {
                console.log('API ERROR:', JSON.stringify(parsed.error, null, 2));
            } else {
                const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text || '';
                console.log('SUCCESS:', text.trim());
            }
        } catch (e) {
            console.log('RAW RESPONSE:', data.slice(0, 500));
        }
    });
});

req.on('error', e => console.log('REQ ERROR:', e.message));
req.write(body);
req.end();
