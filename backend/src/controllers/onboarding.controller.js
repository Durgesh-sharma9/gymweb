import { User } from '../models/User.js';
import { Gym } from '../models/Gym.js';
import { Member } from '../models/Member.js';
import { User as Trainer } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';
import { ROLES, STATUS } from '../utils/constants.js';

export const getOnboardingStatus = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  if (!user.gymId) {
    throw new ApiError(400, 'No gym associated with user');
  }

  const gym = await Gym.findById(user.gymId);

  const steps = {
    logoUploaded: !!gym.logo,
    gymDetailsCompleted: !!(gym.address && gym.city && gym.state),
    plansCreated: await checkPlansCreated(user.gymId),
    trainerAdded: await checkTrainerAdded(user.gymId),
    memberAdded: await checkMemberAdded(user.gymId),
  };

  const completedSteps = Object.values(steps).filter(Boolean).length;
  const totalSteps = 5;
  const isComplete = completedSteps === totalSteps;

  res.json(new ApiResponse(200, { 
    steps, 
    completedSteps, 
    totalSteps, 
    isComplete,
    hasCompletedOnboarding: user.hasCompletedOnboarding 
  }, 'Onboarding status retrieved'));
});

export const completeOnboardingStep = catchAsync(async (req, res) => {
  const { step } = req.params;
  const stepData = req.body;

  const user = await User.findById(req.user._id);
  if (!user.gymId) {
    throw new ApiError(400, 'No gym associated with user');
  }

  const gym = await Gym.findById(user.gymId);

  switch (step) {
    case '1':
      if (stepData.logo) {
        gym.logo = stepData.logo;
        await gym.save();
      }
      break;
    case '2':
      if (stepData.address) gym.address = stepData.address;
      if (stepData.city) gym.city = stepData.city;
      if (stepData.state) gym.state = stepData.state;
      if (stepData.pincode) gym.pincode = stepData.pincode;
      await gym.save();
      break;
    case '3':
      if (stepData.plans && Array.isArray(stepData.plans)) {
        const { MembershipPlan } = await import('../models/MembershipPlan.js');
        await MembershipPlan.insertMany(
          stepData.plans.map(plan => ({ ...plan, gymId: user.gymId, status: STATUS.ACTIVE }))
        );
      }
      break;
    case '4':
      if (stepData.trainer) {
        const trainer = await Trainer.create({
          name: stepData.trainer.name,
          email: stepData.trainer.email,
          mobile: stepData.trainer.mobile,
          password: stepData.trainer.password || 'trainer123',
          role: ROLES.TRAINER,
          gymId: user.gymId,
          status: STATUS.ACTIVE,
          createdBy: user._id,
        });
      }
      break;
    case '5':
      if (stepData.member) {
        await Member.create({
          ...stepData.member,
          gymId: user.gymId,
          status: STATUS.ACTIVE,
          createdBy: user._id,
        });
      }
      user.hasCompletedOnboarding = true;
      await user.save();
      break;
    default:
      throw new ApiError(400, 'Invalid step');
  }

  res.json(new ApiResponse(200, null, `Step ${step} completed`));
});

export const skipOnboarding = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.hasCompletedOnboarding = true;
  await user.save();

  res.json(new ApiResponse(200, null, 'Onboarding skipped'));
});

async function checkPlansCreated(gymId) {
  const { MembershipPlan } = await import('../models/MembershipPlan.js');
  const count = await MembershipPlan.countDocuments({ gymId });
  return count > 0;
}

async function checkTrainerAdded(gymId) {
  const count = await Trainer.countDocuments({ gymId, role: ROLES.TRAINER });
  return count > 0;
}

async function checkMemberAdded(gymId) {
  const count = await Member.countDocuments({ gymId });
  return count > 0;
}
