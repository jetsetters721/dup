import { exec, spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting JetSetters development environment...');

// Check if .env file exists, if not, create it from .env.example
if (!fs.existsSync(path.join(__dirname, '.env'))) {
  console.log('📝 Creating .env file...');
  try {
    const envExample = fs.readFileSync(path.join(__dirname, '.env.production'), 'utf8');
    fs.writeFileSync(path.join(__dirname, '.env'), envExample);
    console.log('✅ .env file created successfully');
  } catch (error) {
    console.error('❌ Error creating .env file:', error.message);
  }
}

// Check Supabase connection and tables
console.log('🔍 Checking Supabase connection and tables...');
exec('node setup-supabase-tables.js', (error, stdout, stderr) => {
  console.log(stdout);
  if (error) {
    console.error('❌ Error checking Supabase tables:', error.message);
    console.log('⚠️ You may need to set up your Supabase tables manually. Check supabase-tables-setup.sql for the required schema.');
  } else {
    console.log('✅ Supabase tables verified');
  }
  
  // Start the application with concurrently
  console.log('🚀 Starting servers...');
  const concurrently = spawn('npx', ['concurrently', 'npm:server', 'npm:client'], {
    stdio: 'inherit',
    shell: true
  });
  
  concurrently.on('error', (error) => {
    console.error('❌ Error starting servers:', error.message);
  });
  
  // Handle termination
  process.on('SIGINT', () => {
    console.log('👋 Shutting down servers...');
    concurrently.kill('SIGINT');
    process.exit(0);
  });
});

console.log('ℹ️ Press Ctrl+C to stop all servers'); 