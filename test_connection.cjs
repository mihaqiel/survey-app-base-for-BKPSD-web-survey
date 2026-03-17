const { PrismaClient } = require('@prisma/client');

const url = 'postgresql://postgres.vsidxaoyreydzsmzdplk:BKPSDMsurvey2026@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres';

console.log('Connecting to:', url.replace(/:([^:@]+)@/, ':***@'));

const p = new PrismaClient({
  datasources: { db: { url } }
});

p.periode.findFirst()
  .then(r => { console.log('SUCCESS:', JSON.stringify(r)); })
  .catch(e => { console.log('ERROR:', e.message); })
  .finally(() => p.$disconnect());