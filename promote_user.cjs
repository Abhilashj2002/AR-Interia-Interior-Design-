
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'server', 'ar_interia.db');
const db = new sqlite3.Database(dbPath);

async function promoteUser() {
    db.serialize(() => {
        db.run("UPDATE customers SET role = 'admin' WHERE username LIKE 'admin%'", function (err) {
            if (err) {
                console.error('Error promoting user:', err.message);
            } else {
                console.log(`Updated ${this.changes} users to admin`);
            }
            db.close();
        });
    });
}

promoteUser();
