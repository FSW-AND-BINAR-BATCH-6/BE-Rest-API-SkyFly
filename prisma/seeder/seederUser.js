const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const accountAuthData = [
    "user",
    "Alice",
    "Anastasia",
    "Ren",
    "Len",
    "Togenashi",
    "Maya",
    "Ferdinan",
    "Zenith"
  ];

  await Promise.all(
    accountAuthData.map(name => 
      prisma.user.create({
        data: {
          name: name,
          email: `${name.toLowerCase()}@test.com`,
          password: "123456",
          passport: "test",
          role: "CUSTOMER",
          tickets: {
            create:{
                code:"test",
                bookingDate: "2024-01-07",
                price: 40000000,
                status: "PENDING",
                tokenMidtrans: "test"
            }
          },    
          Auth: {
            create: {
              email: `${name.toLowerCase()}@test.com`,
              password: "123456",
            }
          },
          sessions: {
            create:{
                expiresAt: "2024-01-07"
            }
          },
        }
      })
    )
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
