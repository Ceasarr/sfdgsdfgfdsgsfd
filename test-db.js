const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

async function testDatabaseConnection() {
    try {
        console.log('Testing database connection...');

        // Test connection
        await prisma.$connect();
        console.log('✓ Database connected successfully');

        // Test creating a user
        console.log('\nAttempting to create a test user...');
        const user = await prisma.user.create({
            data: {
                email: 'test' + Date.now() + '@example.com',
                password: 'hashedpassword123',
                name: 'Test User',
                role: 'user',
            },
        });

        console.log('✓ User created successfully:', user);

        // Clean up - delete the test user
        await prisma.user.delete({
            where: { id: user.id },
        });
        console.log('✓ Test user deleted');

    } catch (error) {
        console.error('✗ Error:', error);
        console.error('\nError details:');
        console.error('- Name:', error.name);
        console.error('- Message:', error.message);
        if (error.code) console.error('- Code:', error.code);
        if (error.meta) console.error('- Meta:', error.meta);
    } finally {
        await prisma.$disconnect();
        console.log('\n✓ Database disconnected');
    }
}

testDatabaseConnection();
