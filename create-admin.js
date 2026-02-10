const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
    try {
        // Hash password
        const hashedPassword = await bcrypt.hash('admin123', 10);

        // Check if admin already exists
        const existingAdmin = await prisma.user.findUnique({
            where: { email: 'admin@robux.store' }
        });

        if (existingAdmin) {
            console.log('❌ Admin user already exists!');
            console.log('Email:', existingAdmin.email);
            console.log('Role:', existingAdmin.role);
            return;
        }

        // Create admin user
        const admin = await prisma.user.create({
            data: {
                email: 'admin@robux.store',
                password: hashedPassword,
                name: 'Administrator',
                role: 'admin'
            }
        });

        console.log('✅ Admin user created successfully!');
        console.log('Email:', admin.email);
        console.log('Password: admin123');
        console.log('Role:', admin.role);
        console.log('ID:', admin.id);
        console.log('\n🔐 You can now login with:');
        console.log('   Email: admin@robux.store');
        console.log('   Password: admin123');

    } catch (error) {
        console.error('❌ Error creating admin user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createAdmin();
