require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function listTables() {
  try {
    console.log('📊 Listing all tables in the database...\n');
    
    // Query all tables from information_schema
    const tables = await prisma.$queryRaw`
      SELECT 
        table_name,
        table_type
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;
    
    if (tables.length === 0) {
      console.log('⚠️  No tables found in the database.');
      return;
    }
    
    console.log(`✅ Found ${tables.length} table(s):\n`);
    
    // Group tables by type and display
    const tableNames = tables.map(t => t.table_name);
    
    console.log('📋 Database Tables:');
    console.log('='.repeat(60));
    
    for (let i = 0; i < tableNames.length; i++) {
      const tableName = tableNames[i];
      console.log(`\n${i + 1}. ${tableName}`);
      
      // Get row count for each table
      try {
        const count = await prisma.$queryRawUnsafe(
          `SELECT COUNT(*)::int as count FROM "${tableName}"`
        );
        const rowCount = count[0]?.count || 0;
        console.log(`   Rows: ${rowCount}`);
        
        // Get column info for main tables (not migrations)
        if (!tableName.startsWith('_')) {
          const columns = await prisma.$queryRawUnsafe(
            `SELECT column_name, data_type 
             FROM information_schema.columns 
             WHERE table_name = '${tableName}' 
             AND table_schema = 'public'
             ORDER BY ordinal_position`
          );
          if (columns.length > 0) {
            console.log(`   Columns: ${columns.map(c => c.column_name).join(', ')}`);
          }
        }
      } catch (err) {
        console.log(`   └─ Error: ${err.message}`);
      }
    }
    
    console.log('\n✅ Table listing completed!');
    
  } catch (error) {
    console.error('❌ Error listing tables:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

listTables()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

