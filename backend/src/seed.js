import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { User } from './models/User.js';
import { PlatformPlan } from './models/PlatformPlan.js';
import { ROLES } from './utils/constants.js';

dotenv.config();

const seed = async () => {
  await connectDB();

  const email = process.env.SUPER_ADMIN_EMAIL || 'admin@gymweb.com';
  const password = process.env.SUPER_ADMIN_PASSWORD || 'Admin@123';

  const existing = await User.findOne({ email });
  if (!existing) {
    await User.create({
      name: 'Super Admin',
      email,
      password,
      role: ROLES.SUPER_ADMIN,
    });
    console.log(`Super Admin created: ${email}`);
  } else {
    console.log('Super Admin already exists');
  }

  const planCount = await PlatformPlan.countDocuments();
  if (planCount === 0) {
    await PlatformPlan.insertMany([
      { name: 'Basic', price: 999, durationMonths: 1, maxMembers: 100, maxTrainers: 2, features: ['Member Management', 'Fee Collection'] },
      { name: 'Pro', price: 2499, durationMonths: 1, maxMembers: 500, maxTrainers: 10, features: ['All Basic', 'Expenses', 'Analytics'] },
      { name: 'Enterprise', price: 4999, durationMonths: 1, maxMembers: null, maxTrainers: null, features: ['Unlimited', 'Priority Support'] },
    ]);
    console.log('Platform plans seeded');
  }

  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
