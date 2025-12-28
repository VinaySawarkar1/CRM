// Script to fix user permissions for Reckonix admin user
const { MongoClient } = require('mongodb');

async function fixUserPermissions() {
  const uri = 'mongodb+srv://vinay:FBKAbt5g5DhxFK3@cluster0.5hfxub2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('business_ai');
    const usersCollection = db.collection('users');

    // Find the Reckonix admin user
    console.log('🔍 Searching for Reckonix admin user...');
    const adminUser = await usersCollection.findOne({ username: 'admin' });

    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }

    console.log(`✅ Found admin user: ${adminUser.name} (${adminUser.username})`);
    console.log(`   Current role: ${adminUser.role}`);
    console.log(`   Current permissions: ${adminUser.permissions ? adminUser.permissions.join(', ') : 'none'}`);

    // Define comprehensive permissions for a company admin
    const adminPermissions = [
      // Customer permissions
      'customers:view',
      'customers:create', 
      'customers:update',
      'customers:delete',
      
      // Supplier permissions
      'suppliers:view',
      'suppliers:create',
      'suppliers:update', 
      'suppliers:delete',
      
      // Lead permissions
      'leads:view',
      'leads:create',
      'leads:update',
      'leads:delete',
      
      // Inventory permissions
      'inventory:view',
      'inventory:create',
      'inventory:update',
      'inventory:delete',
      
      // Quotation permissions
      'quotations:view',
      'quotations:create',
      'quotations:update',
      'quotations:delete',
      
      // Order permissions
      'orders:view',
      'orders:create',
      'orders:update',
      'orders:delete',
      
      // Invoice permissions
      'invoices:view',
      'invoices:create',
      'invoices:update',
      'invoices:delete',
      
      // Payment permissions
      'payments:view',
      'payments:create',
      'payments:update',
      'payments:delete',
      
      // Task permissions
      'tasks:view',
      'tasks:create',
      'tasks:update',
      'tasks:delete',
      
      // Sales targets permissions
      'sales-targets:view',
      'sales-targets:create',
      'sales-targets:update',
      'sales-targets:delete',
      
      // Purchase order permissions
      'purchase-orders:view',
      'purchase-orders:create',
      'purchase-orders:update',
      'purchase-orders:delete',
      
      // Dashboard permissions
      'dashboard:view',
      
      // Company settings permissions
      'company-settings:view',
      'company-settings:update'
    ];

    // Update user permissions
    const updateResult = await usersCollection.updateOne(
      { username: 'admin' },
      { 
        $set: { 
          permissions: adminPermissions,
          updatedAt: new Date()
        } 
      }
    );

    if (updateResult.modifiedCount > 0) {
      console.log('✅ Successfully updated admin user permissions');
      
      // Verify the update
      const updatedUser = await usersCollection.findOne({ username: 'admin' });
      console.log(`   Updated permissions count: ${updatedUser.permissions.length}`);
      console.log(`   Sample permissions: ${updatedUser.permissions.slice(0, 10).join(', ')}...`);
      
      // Also ensure the user is active
      if (!updatedUser.isActive) {
        console.log('🔄 Activating user...');
        await usersCollection.updateOne(
          { username: 'admin' },
          { 
            $set: { 
              isActive: true,
              updatedAt: new Date()
            } 
          }
        );
        console.log('✅ User activated');
      }
      
    } else {
      console.log('❌ Failed to update user permissions');
    }

    console.log('✅ Permission fix completed successfully');
    console.log('');
    console.log('🎯 What was fixed:');
    console.log('   - Assigned comprehensive permissions to Reckonix admin user');
    console.log('   - User can now access all business features');
    console.log('   - 403 errors should be resolved');
    console.log('   - User permissions now include:');
    console.log('     • Full access to customers, leads, quotations');
    console.log('     • Full access to orders, invoices, payments');
    console.log('     • Full access to inventory, tasks, sales targets');
    console.log('     • Full access to purchase orders');
    console.log('     • Dashboard and company settings access');

  } catch (error) {
    console.error('❌ Error fixing user permissions:', error);
  } finally {
    await client.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
fixUserPermissions();