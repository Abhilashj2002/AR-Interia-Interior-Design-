const fs = require('fs');
let t = fs.readFileSync('services/luxuryShowcase.ts', 'utf8');

const updates = [
    { name: "'Master Bedroom'", video: "'/videos/room_masterbedroom.mp4'" },
    { name: "'Kids Bedroom'", video: "'/videos/room_kids.mp4'" },
    { name: "'Guest Bedroom'", video: "'/videos/room_masterbedroom.mp4'" }, // fallback to master
    { name: "'Kids Room'", video: "'/videos/room_kids.mp4'" },
    { name: "'Modern Kitchen'", video: "'/videos/room_kitchen.mp4'" },
    { name: "'Open Kitchen'", video: "'/videos/room_kitchen.mp4'" },
    { name: "'Living Room'", video: "'/videos/room_living.mp4'" },
    { name: "'Living & Dining'", video: "'/videos/room_living.mp4'" },
    { name: "'Dining Area'", video: "'/videos/room_dining.mp4'" },
    { name: "'Luxury Bathroom'", video: "'/videos/room_bathroom.mp4'" },
    { name: "'Powder Room'", video: "'/videos/room_bathroom.mp4'" },
    { name: "'Home Gym'", video: "'/videos/room_gym.mp4'" },
    { name: "'Home Theatre'", video: "'/videos/room_theatre.mp4'" },
    { name: "'Pooja Room'", video: "'/videos/room_pooja.mp4'" },
    { name: "'Garden & Outdoor'", video: "'/videos/room_garden.mp4'" },
    { name: "'Terrace'", video: "'/videos/room_terrace.mp4'" },
    { name: "'Balcony'", video: "'/videos/room_balcony.mp4'" },
    { name: "'Study/Office'", video: "'/videos/room_living.mp4'" }, // fallback
    { name: "'Balcony / Patio'", video: "'/videos/room_balcony.mp4'" },
];

for (const update of updates) {
    const regex = new RegExp(`(name:[Smart Generate]s*${update.name},[[Smart Generate]s[Smart Generate]S]*?video3d:[Smart Generate]s*)'.*?'`, 'g');
    t = t.replace(regex, `$1${update.video}`);
}

fs.writeFileSync('services/luxuryShowcase.ts', t);
console.log("Updated luxuryShowcase.ts successfully.");
