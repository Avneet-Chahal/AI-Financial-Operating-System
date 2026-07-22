/**
 * Seed a demo account so the app can be explored immediately.
 *   email:    demo@aifos.local
 *   password: demo12345
 * Idempotent: re-running upserts the user and only seeds transactions if none exist.
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const RAW = [
  { amount: 25000, description: 'Monthly Apartment Rent', merchant: 'Landlord Transfer', date: '2026-07-01', isRecurring: true, category: 'HOUSING' },
  { amount: 1200, description: 'Swiggy Order', merchant: 'Swiggy', date: '2026-07-06', isRecurring: false, category: 'FOOD_DINING' },
  { amount: 4500, description: 'Dinner at Olive Bistro', merchant: 'Olive Bistro', date: '2026-07-08', isRecurring: false, category: 'FOOD_DINING' },
  { amount: 800, description: 'Uber Ride to Office', merchant: 'Uber', date: '2026-07-10', isRecurring: false, category: 'TRANSPORTATION' },
  { amount: 3500, description: 'BESCOM Electricity Bill', merchant: 'BESCOM', date: '2026-07-05', isRecurring: true, category: 'UTILITIES' },
  { amount: 5500, description: 'Monthly Groceries', merchant: 'BigBasket', date: '2026-07-12', isRecurring: false, category: 'FOOD_DINING' },
  { amount: 10000, description: 'Mutual Fund SIP — Axis Bluechip', merchant: 'Zerodha', date: '2026-07-15', isRecurring: true, category: 'INVESTMENTS' },
  { amount: 1500, description: 'Netflix Subscription', merchant: 'Netflix', date: '2026-07-15', isRecurring: true, category: 'ENTERTAINMENT' },
  { amount: 999, description: 'Airtel Postpaid Bill', merchant: 'Airtel', date: '2026-07-16', isRecurring: true, category: 'UTILITIES' },
  { amount: 950, description: 'Zomato Order', merchant: 'Zomato', date: '2026-07-18', isRecurring: false, category: 'FOOD_DINING' },
  { amount: 2200, description: 'Rapido Bike Rides', merchant: 'Rapido', date: '2026-07-19', isRecurring: false, category: 'TRANSPORTATION' },
  { amount: 1800, description: 'BookMyShow — Movie tickets', merchant: 'BookMyShow', date: '2026-07-20', isRecurring: false, category: 'ENTERTAINMENT' },
];

async function main() {
  const passwordHash = await bcrypt.hash('demo12345', 12);
  const user = await prisma.user.upsert({
    where: { email: 'demo@aifos.local' },
    update: {},
    create: {
      name: 'Priya Sharma',
      email: 'demo@aifos.local',
      passwordHash,
      monthlyIncome: 85000,
      currency: 'INR',
      riskTolerance: 'MEDIUM',
    },
  });

  const existing = await prisma.transaction.count({ where: { userId: user.id } });
  if (existing === 0) {
    await prisma.transaction.createMany({
      data: RAW.map((t) => ({
        userId: user.id,
        amount: t.amount,
        description: t.description,
        merchant: t.merchant,
        date: new Date(t.date),
        isRecurring: t.isRecurring,
        category: t.category,
        aiCategorized: true,
        source: 'MANUAL',
      })),
    });
    console.log(`Seeded ${RAW.length} transactions for ${user.email}`);
  } else {
    console.log(`User ${user.email} already has ${existing} transactions; skipping.`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
