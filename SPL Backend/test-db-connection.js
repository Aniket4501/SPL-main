// Test database connection
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Testing database connection...');
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('DATABASE_URL format:', process.env.DATABASE_URL ? 
      process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@') : 'NOT SET');
    
    // Test connection
    await prisma.$connect();
    console.log('✓ Successfully connected to database!');
    
    // Try a simple query
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log('✓ Database query successful!');
    console.log('PostgreSQL version:', result[0]?.version || 'Unknown');
    
    // Test if tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    console.log('\nExisting tables:');
    if (tables.length === 0) {
      console.log('  (No tables found - you may need to run migrations)');
    } else {
      tables.forEach(t => console.log(`  - ${t.table_name}`));
    }
    
    console.log('\n✓ Database connection test PASSED!');
  } catch (error) {
    console.error('\n✗ Database connection FAILED!');
    console.error('Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check if DATABASE_URL in .env file is correct');
    console.error('2. Format should be: postgresql://username:password@localhost:5432/database_name');
    console.error('3. Make sure the database exists');
    console.error('4. Check PostgreSQL is listening on port 5432');
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

