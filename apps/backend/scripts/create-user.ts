/**
 * Script to create a default admin user
 * 
 * Prerequisites:
 *   1. Run: npx @better-auth/cli generate
 *   2. Run: npx prisma db push
 *   3. Run: npx prisma generate
 * 
 * Usage:
 *   npm run seed:user
 *   OR
 *   ts-node scripts/create-user.ts [email] [password] [name]
 * 
 * Example:
 *   ts-node scripts/create-user.ts admin@example.com admin123 "Admin User"
 */

import logger from '../src/lib/logger';

interface ApiResponse {
  data?: unknown;
  error?: {
    message?: string;
    code?: string;
  };
}

async function createUser(email: string, password: string, name?: string) {
  try {
    // Use fetch to call the Better Auth sign-up endpoint
    // This ensures password is hashed correctly by Better Auth
    const baseURL = process.env.BETTER_AUTH_URL || 'http://localhost:8000';
    const url = `${baseURL}/api/auth/sign-up/email`;
    
    logger.info(`Calling ${url}...`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        name: name || email.split('@')[0],
      }),
    });

    const data = (await response.json()) as ApiResponse;

    if (!response.ok) {
      const errorMessage = data.error?.message || 'Failed to create user';
      if (errorMessage.includes('already exists') || errorMessage.includes('duplicate') || errorMessage.includes('unique')) {
        logger.info(`User with email ${email} already exists`);
        return { success: false, message: 'User already exists' };
      }
      throw new Error(errorMessage);
    }

    logger.info(`✅ User created successfully: ${email}`);
    return { success: true, user: data.data };
  } catch (error) {
    if (error instanceof Error) {
      // Check if it's a network error (backend not running)
      if (error.message.includes('fetch') || error.message.includes('ECONNREFUSED')) {
        throw new Error(
          'Cannot connect to backend server. Make sure the backend is running on ' +
          `${process.env.BETTER_AUTH_URL || 'http://localhost:8000'}`
        );
      }
    }
    logger.error('Error creating user:', error);
    throw error;
  }
}

async function main() {
  const email = process.argv[2] || 'admin@example.com';
  const password = process.argv[3] || 'admin123';
  const name = process.argv[4] || 'Admin User';

  try {
    logger.info('Creating default admin user...');
    const result = await createUser(email, password, name);
    
    if (result.success) {
      logger.info('');
      logger.info('✅ Default user created successfully!');
      logger.info(`   Email: ${email}`);
      logger.info(`   Password: ${password}`);
      logger.info('');
      logger.info('⚠️  IMPORTANT: Change the default password in production!');
    } else {
      logger.warn(result.message);
      logger.info('');
      logger.info('You can use this account to login:');
      logger.info(`   Email: ${email}`);
      logger.info(`   Password: ${password}`);
    }
  } catch (error) {
    logger.error('');
    logger.error('❌ Failed to create user');
    if (error instanceof Error) {
      logger.error(error.message);
    } else {
      logger.error(String(error));
    }
    logger.error('');
    logger.error('Make sure:');
    logger.error('  1. Backend server is running (for HTTP sign-up)');
    logger.error('  2. Better Auth schema is generated: npx @better-auth/cli generate');
    logger.error('  3. Database schema is pushed: npx prisma db push');
    logger.error('  4. Prisma client is generated: npx prisma generate');
    process.exit(1);
  }
}

main();
