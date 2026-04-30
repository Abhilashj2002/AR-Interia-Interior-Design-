import express from 'express';
import { Request, Response } from 'express';
// Removed unused/missing type import for local dev

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(express.json());

// Define routes
app.get('/', (req: Request, res: Response) => {
    res.send('Hello, World!');
});

// Example route using a type
app.post('/data', (req: Request, res: Response) => {
    const data: any = req.body;
    // Process data...
    res.status(201).send(data);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});