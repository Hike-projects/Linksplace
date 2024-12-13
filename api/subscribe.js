import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        try {
            const client = await pool.connect();
            const result = await client.query(
                'INSERT INTO subscribers (email, created_at) VALUES ($1, NOW()) RETURNING id',
                [email]
            );
            client.release();
            return res.status(200).json({ message: 'Subscription successful!', id: result.rows[0].id });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
