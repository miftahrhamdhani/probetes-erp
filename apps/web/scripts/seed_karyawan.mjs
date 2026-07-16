import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const mockData = [
  { id: "1", name: "MIFTAH WISNU RAMDANI", role: "FULLSTACK DEVELOPER", divisi: "IT" },
  { id: "2", name: "FARADISYA ALIMATUL IBDA", role: "ASISTAN KONSELOR", divisi: "SALES" },
  { id: "3", name: "RHESELI SWASTY", role: "INPUTER DATA", divisi: "WAREHOUSE" },
  { id: "4", name: "NOVITA SARI NUGRAINI", role: "CS", divisi: "MARKETING" },
  { id: "5", name: "DESTI ROHINI", role: "CS", divisi: "MARKETING" },
  { id: "6", name: "SARAH RAHMA NIYAR", role: "CRM", divisi: "SALES" },
  { id: "7", name: "ANGGI AYU LESTARI", role: "CRM", divisi: "SALES" },
  { id: "8", name: "IRMANDA DWI PRASETYO", role: "CRM", divisi: "SALES" },
  { id: "9", name: "FENY NURAINI", role: "CRM", divisi: "SALES" },
  { id: "10", name: "IMARA SALSABILA", role: "CONTENT CREATOR", divisi: "MARKETING" },
  { id: "11", name: "LINA RAHMAWATI", role: "CONTENT CREATOR", divisi: "MARKETING" },
  { id: "12", name: "ADNAN QURUNUL BAHRI", role: "CONTENT CREATOR", divisi: "MARKETING" },
  { id: "13", name: "FADHIL IKHTIAR ANDARDANTO", role: "CONTENT CREATOR", divisi: "MARKETING" },
  { id: "14", name: "IRFAN FEBRIAN", role: "ADV META", divisi: "MARKETING" },
  { id: "15", name: "BAGAS AJI WIBOWO", role: "SPV MARKETING", divisi: "MANAJEMEN" },
  { id: "16", name: "MUHAMMAD ARFIAN LUKMAN WIJANARKO", role: "ADV TIKTOK/SHOPEE", divisi: "SALES" },
  { id: "17", name: "NUR DUROH MASLAKHAH", role: "MP/TIKTOK", divisi: "SALES" },
  { id: "18", name: "CHARISMA TRIXIE ALFITRA", role: "MP/TIKTOK", divisi: "SALES" },
  { id: "19", name: "NI'MAH LUTHFIANINGSIH", role: "SPV SALES", divisi: "MANAJEMEN" },
  { id: "20", name: "PUSPITA INDAH", role: "FINANCE", divisi: "MANAJEMEN" },
  { id: "21", name: "RAHMAN ARIEF DEWANTARA", role: "DIREKTUR", divisi: "MANAJEMEN" },
];

async function main() {
  try {
    // Check table info
    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'master' AND table_name = 'users';
    `);
    console.log('Columns:', res.rows);
    
    // Check if table exists
    if (res.rows.length === 0) {
      console.log('Table master.users does not exist. Creating it...');
      await pool.query(`
        CREATE SCHEMA IF NOT EXISTS master;
        CREATE TABLE master.users (
          user_id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          role TEXT,
          division TEXT,
          order_count INT DEFAULT 0
        );
      `);
    } else {
      console.log('Truncating master.users...');
      await pool.query('TRUNCATE TABLE master.users CASCADE');
    }

    console.log('Inserting data...');
    for (const user of mockData) {
      await pool.query(
        'INSERT INTO master.users (user_id, name, role, division, order_count) VALUES ($1, $2, $3, $4, 0)',
        [user.id, user.name, user.role, user.divisi]
      );
    }
    
    console.log('Success!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

main();
