import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { User } from './models/User.js';
import { PlatformPlan } from './models/PlatformPlan.js';
import { Gym } from './models/Gym.js';
import { ROLES, STATUS, DEFAULT_TRAINER_PERMISSIONS } from './utils/constants.js';

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

  // Create test gym, gym owner, and trainer for testing
  const testGym = await Gym.findOne({ name: 'Test Gym' });
  let gymId;
  
  // Create gym owner first (required for gym)
  const gymOwner = await User.findOne({ email: 'owner@testgym.com' });
  let ownerId;
  if (!gymOwner) {
    const plan = await PlatformPlan.findOne({ name: 'Pro' });
    const owner = await User.create({
      name: 'Gym Owner',
      email: 'owner@testgym.com',
      password: 'Owner@123',
      role: ROLES.GYM_OWNER,
      hasCompletedOnboarding: true,
    });
    ownerId = owner._id;
    console.log('Gym Owner created: owner@testgym.com / Owner@123');
  } else {
    ownerId = gymOwner._id;
    console.log('Gym Owner already exists');
  }

  // Create gym with ownerId
  if (!testGym) {
    const plan = await PlatformPlan.findOne({ name: 'Pro' });
    const gym = await Gym.create({
      name: 'Test Gym',
      slug: 'test-gym',
      address: '123 Test Street',
      city: 'Test City',
      state: 'Test State',
      mobile: '9876543210',
      email: 'test@gymweb.com',
      ownerId,
      platformPlanId: plan?._id,
      trialStart: new Date(),
      trialEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isTrial: true,
    });
    gymId = gym._id;
    console.log('Test Gym created');
  } else {
    gymId = testGym._id;
    console.log('Test Gym already exists');
  }

  // Update gym owner with gymId
  await User.findByIdAndUpdate(ownerId, { gymId });

  // Create trainer
  const trainer = await User.findOne({ email: 'trainer@testgym.com' });
  if (!trainer) {
    await User.create({
      name: 'Test Trainer',
      email: 'trainer@testgym.com',
      password: 'Trainer@123',
      role: ROLES.TRAINER,
      gymId,
      permissions: DEFAULT_TRAINER_PERMISSIONS,
    });
    console.log('Trainer created: trainer@testgym.com / Trainer@123');
  } else {
    console.log('Trainer already exists');
  }

  console.log('\n=== TEST CREDENTIALS ===');
  console.log('Super Admin: admin@gymweb.com / Admin@123');
  console.log('Gym Owner: owner@testgym.com / Owner@123');
  console.log('Trainer: trainer@testgym.com / Trainer@123');
  console.log('=========================\n');

  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
