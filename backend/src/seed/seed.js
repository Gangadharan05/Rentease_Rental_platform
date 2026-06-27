require('dotenv').config();
const { sequelize, connectDB } = require('../config/db');
const { User, Product, ServiceArea } = require('../models');

const products = [
  {
    name: 'Queen Size Wooden Bed',
    category: 'furniture',
    subCategory: 'bed',
    description: 'Sturdy sheesham wood queen bed with under-storage, perfect for studio and 1BHK apartments.',
    imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600',
    baseMonthlyRent: 1499,
    securityDeposit: 3000,
    tenureOptions: [3, 6, 12],
    totalUnits: 8,
    availableUnits: 8,
  },
  {
    name: '3-Seater Fabric Sofa',
    category: 'furniture',
    subCategory: 'sofa',
    description: 'Comfortable 3-seater sofa in charcoal grey fabric, ideal for living rooms.',
    imageUrl: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600',
    baseMonthlyRent: 1299,
    securityDeposit: 2500,
    tenureOptions: [3, 6, 12],
    totalUnits: 6,
    availableUnits: 6,
  },
  {
    name: '4-Seater Dining Table',
    category: 'furniture',
    subCategory: 'table',
    description: 'Engineered wood dining table with 4 cushioned chairs.',
    imageUrl: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600',
    baseMonthlyRent: 999,
    securityDeposit: 2000,
    tenureOptions: [3, 6, 12],
    totalUnits: 10,
    availableUnits: 10,
  },
  {
    name: 'Double Door Refrigerator 265L',
    category: 'appliance',
    subCategory: 'fridge',
    description: 'Frost-free double door refrigerator, energy efficient, 265L capacity.',
    imageUrl: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600',
    baseMonthlyRent: 1199,
    securityDeposit: 4000,
    tenureOptions: [6, 12],
    totalUnits: 12,
    availableUnits: 12,
  },
  {
    name: 'Front Load Washing Machine 6kg',
    category: 'appliance',
    subCategory: 'washing_machine',
    description: 'Fully automatic front load washing machine with 6kg capacity, low water usage.',
    imageUrl: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600',
    baseMonthlyRent: 999,
    securityDeposit: 3500,
    tenureOptions: [6, 12],
    totalUnits: 10,
    availableUnits: 10,
  },
  {
    name: '43-inch Smart LED TV',
    category: 'appliance',
    subCategory: 'tv',
    description: 'Full HD Android smart TV, 43-inch, with built-in streaming apps.',
    imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600',
    baseMonthlyRent: 899,
    securityDeposit: 3000,
    tenureOptions: [3, 6, 12],
    totalUnits: 15,
    availableUnits: 15,
  },
];

const serviceAreas = ['Chennai', 'Bengaluru', 'Hyderabad', 'Coimbatore', 'Madurai'];

const seed = async () => {
  await connectDB();
  await sequelize.sync({ alter: true });

  const adminEmail = 'admin@rentease.com';
  const existingAdmin = await User.findOne({ where: { email: adminEmail } });
  if (!existingAdmin) {
    await User.create({
      name: 'RentEase Admin',
      email: adminEmail,
      password: 'Admin@123',
      role: 'admin',
      city: 'Chennai',
    });
    console.log(`Admin user created -> email: ${adminEmail} / password: Admin@123`);
  } else {
    console.log('Admin user already exists, skipping.');
  }

  const demoEmail = 'customer@rentease.com';
  const existingCustomer = await User.findOne({ where: { email: demoEmail } });
  if (!existingCustomer) {
    await User.create({
      name: 'Demo Customer',
      email: demoEmail,
      password: 'Customer@123',
      role: 'customer',
      city: 'Chennai',
      address: '12 Anna Salai',
    });
    console.log(`Demo customer created -> email: ${demoEmail} / password: Customer@123`);
  }

  const productCount = await Product.count();
  if (productCount === 0) {
    await Product.bulkCreate(products);
    console.log(`Seeded ${products.length} products.`);
  } else {
    console.log('Products already exist, skipping product seed.');
  }

  for (const city of serviceAreas) {
    await ServiceArea.findOrCreate({ where: { city }, defaults: { isActive: true } });
  }
  console.log(`Seeded service areas: ${serviceAreas.join(', ')}`);

  console.log('Seeding complete.');
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
