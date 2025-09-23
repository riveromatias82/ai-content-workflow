import { Client } from 'pg';

export async function setupDatabase() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'admin',
    database: 'postgres', // Connect to default postgres database first
  });

  try {
    await client.connect();

    // Check if database exists
    const result = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [
      process.env.DB_NAME || 'ai_content_workflow',
    ]);

    if (result.rows.length === 0) {
      console.log(`Creating database: ${process.env.DB_NAME || 'ai_content_workflow'}`);
      await client.query(`CREATE DATABASE "${process.env.DB_NAME || 'ai_content_workflow'}"`);
      console.log('✅ Database created successfully');
    } else {
      console.log('✅ Database already exists');
    }
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}
