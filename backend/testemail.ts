// testEmail.ts
import dotenv from 'dotenv';
dotenv.config();

import { sendResetEmail } from './emailer'; // adjust path if needed

async function test() {
  try {
    await sendResetEmail(
      'meghafukte96@gamil.com', // change this to your test email
      'Test User',
    );
    console.log('✅ Test email sent successfully.');
  } catch (err) {
    console.error('❌ Test email failed:', err);
  }
}

test();
