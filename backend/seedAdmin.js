// backend/seedUsers.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

const usersToSeed = [{
        firstName: 'Super',
        lastName: 'Admin',
        email: 'admin@meseret.com',
        password: 'admin123',
        role: 'admin',
        phone: '+251911111111',
        address: { country: 'Ethiopia', city: 'Addis Ababa', kebele: '01' },
        profileImage: '/default-avatar.png'
    },
    {
        firstName: 'Abebe',
        lastName: 'Manager',
        email: 'manager@meseret.com',
        password: 'manager123',
        role: 'manager',
        phone: '+251922222222',
        address: { country: 'Ethiopia', city: 'Addis Ababa', kebele: '02' }
    },
    {
        firstName: 'Kebede',
        lastName: 'Receptionist',
        email: 'reception@meseret.com',
        password: 'recep123',
        role: 'receptionist',
        phone: '+251933333333',
        address: { country: 'Ethiopia', city: 'Addis Ababa', kebele: '03' }
    },
    {
        firstName: 'Mulu',
        lastName: 'Cashier',
        email: 'cashier@meseret.com',
        password: 'cash123',
        role: 'cashier',
        phone: '+251944444444',
        address: { country: 'Ethiopia', city: 'Addis Ababa', kebele: '04' }
    },
    {
        firstName: 'Tiru',
        lastName: 'Customer',
        email: 'customer@meseret.com',
        password: 'cust123',
        role: 'customer',
        phone: '+251955555555',
        address: { country: 'Ethiopia', city: 'Addis Ababa', kebele: '05' }
    }
];

const seed = async() => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        let created = 0;
        for (const userData of usersToSeed) {
            const exists = await User.findOne({ email: userData.email });
            if (exists) {
                console.log(`User already exists: ${userData.email}`);
                continue;
            }

            const hashed = await bcrypt.hash(userData.password, 10);
            await User.create({
                ...userData,
                password: hashed
            });
            console.log(`Created: ${userData.email} (${userData.role})`);
            created++;
        }

        console.log('\nAll users seeded!');
        console.log('Login Credentials:');
        console.table(
            usersToSeed.map(u => ({
                Role: u.role,
                Email: u.email,
                Password: u.password
            }))
        );

        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
};

seed();