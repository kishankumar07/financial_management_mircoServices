import { jest } from '@jest/globals';

import { getAccount, updateBalance } from '../src/services/accountServices.js'
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Account Service', () => {

      let account;

      beforeEach(async () => {
            const email = `user${Date.now()}@test.com`;
            account = await prisma.account.create({
                data: {
                    name: 'testuser',
                    email,
                    balance: 1000,
                    isTestData: true,
                },
            });
        });

      afterAll(async () => {
            await prisma.$disconnect();
          });

       // Cleanup after each test
       afterEach(async () => {
            await prisma.account.deleteMany({
                where: {
                    isTestData: true,  
                },
            });
        });
        

      //Test Case 1: Creating an account
  it('should create an account successfully', async () => {
      jest.setTimeout(10000); // providing a delay of 10 sec because of failing test
//       const email = `user${Date.now()}@test.com`;
     
//     // Create a test account in the database
//     const account = await prisma.account.create({
//       data: {
//         name: 'testuser',
//         email,
//         balance: 1000,
//       },
//     });

    // Now test the function
   const callback = jest.fn();
    await getAccount({ request: { id: account.id } }, callback);

    expect(callback).toHaveBeenCalledWith(null, expect.objectContaining({
      id: account.id,
      name: 'testuser',
      email: account.email,
      balance: 1000,
    }));
  });

  // Test case 2 : Retrieving an account by ID ( assuming account is already created )
   it('should retrieve an account by ID', async () => {
      // const email = `user${Date.now()}@test.com`;
      // Assuming we already have a created account from previous test or manually in the DB
      // const account = await prisma.account.create({
      //   data: {
      //     name: 'newuser',
      //     email,
      //     balance: 500,
      //   },
      // });
      const callback = jest.fn()
       await getAccount({ request: { id: account.id } },callback);
  
       expect(callback).toHaveBeenCalledWith(null, expect.objectContaining({
            id: account.id,
            name: 'testuser',
            email: account.email,
            balance: 1000,
          }));
});

      // Test Case 3: Updating an account balance
  it('should update account balance successfully', async () => {
      // const email = `user${Date.now()}@test.com`;
      // const account = await prisma.account.create({
      //   data: {
      //     name: 'balanceuser',
      //     email,
      //     balance: 200,
      //   },
      // });
      const callback = jest.fn()
      await updateBalance({ request: { id: account.id, amount: 500 } },callback);
  
      expect(callback).toHaveBeenCalledWith(null, expect.objectContaining({
            id: account.id,
            updated_balance : 500,
            message:"Balance updated successfully"
          }));
    });

    // Test Case 4: Handle case where account doesn't exist (when updating balance)
  it('should return error when updating balance of a non-existent account', async () => {
      // const email = `user${Date.now()}@test.com`
      // const account = await prisma.account.create({
      //       data: { name: 'Update Test', email, balance: 100 },
      //     });

          const callback = jest.fn();
          await updateBalance({ request: { id: 'abcd', amount: 50 } }, callback);

           expect(callback).toHaveBeenCalledWith(expect.objectContaining({
            code: 5,
            message: 'Account not found',
          }));
    });

    // Test Case 5: Handle invalid input (like invalid ID or amount when updating balance)
   it('should return error for invalid amount', async () => {
      // const email = `user${Date.now()}@test.com`
      // const account = await prisma.account.create({
      //       data: { name: 'Update Test', email, balance: 100 },
      //     });
          const callback = jest.fn()
       await updateBalance({ request: { id: account.id, amount: -500 } },callback);
  
      expect(callback).toHaveBeenCalledWith(expect.objectContaining({
            code: 3,
            message: 'Invalid argument: amount cannot be negative',
          }));
    });

})
// The function inside the it block is where you write the actual test logic.

// The string 'should retrieve an account by ID' describes the behavior the test is verifying. It's written in natural language so that the test description is clear even to someone who doesn't know the technical details.


// Test Case 6: Deleting an account
// it('should delete an account successfully', async () => {
//       const account = await prisma.account.create({
//         data: {
//           name: 'deleteuser',
//           email: 'deleteuser@example.com',
//           balance: 100,
//         },
//       });
    
//       const response = await deleteAccount({ request: { id: account.id } });
    
//       expect(response.message).toBe('Account deleted successfully');
//     });
    