import { initMySQL } from '../mysql.js';

async function main() {
  try {
    await initMySQL();
    console.log('MySQL setup completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('MySQL initialization error:', err);
    process.exit(1);
  }
}

main();
