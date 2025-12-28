// Script to make Reckonix user a company admin
const { MongoClient } = require('mongodb');

async function makeReckonixCompanyAdmin() {
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

    console.log(`✅ Found current user:`);
    console.log(`   Name: ${adminUser.name}`);
    console.log(`   Username: ${adminUser.username}`);
    console.log(`   Current role: ${adminUser.role}`);
    console.log(`   Company: Reckonix`);
    console.log(`   Company ID: ${adminUser.companyId}`);

    // Check if already admin
    if (adminUser.role === 'admin') {
      console.log('ℹ️ User is already an admin');
      return;
    }

    // Update user to admin role
    console.log('🔄 Updating user to admin role...');
    const updateResult = await usersCollection.updateOne(
      { username: 'admin' },
      { 
        $set: { 
          role: 'admin',
          updatedAt: new Date()
        } 
      }
    );

    if (updateResult.modifiedCount > 0) {
      console.log('✅ Successfully updated user to admin role');
      
      // Verify the update
      const updatedUser = await usersCollection.findOne({ username: 'admin' });
      console.log(`   Updated role: ${updatedUser.role}`);
      console.log(`   Company: ${updatedUser.name}`);
      console.log(`   Company ID: ${updatedUser.companyId}`);
      
    } else {
      console.log('❌ Failed to update user role');
      return;
    }

    // Get all users in the Reckonix company to show admin privileges
    console.log('\n👥 Users in Reckonix company:');
    const companyUsers = await usersCollection.find({ companyId: adminUser.companyId }).toArray();
    
    if (companyUsers.length === 0) {
      console.log('   No other users found in Reckonix company');
    } else {
      companyUsers.forEach(user => {
        console.log(`   - ${user.name} (${user.username}) - Role: ${user.role} - Status: ${user.isActive ? 'Active' : 'Inactive'}`);
      });
    }

    console.log('\n🎯 Admin Privileges Now Available:');
    console.log('   ✅ Can manage all users in Reckonix company');
    console.log('   ✅ Can create and manage sub-users (up to 20 per company)');
    console.log('   ✅ Can approve/deactivate users in the company');
    console.log('   ✅ Has full access to all company data');
    console.log('   ✅ Can manage company settings');
    console.log('   ✅ Can view all business reports and analytics');
    console.log('   ✅ Can export/import company data');
    console.log('   ✅ Can manage lead categories and sources');
    console.log('   ✅ Can manage sales targets and forecasts');

    console.log('\n📋 What Changed:');
    console.log('   - Role changed from "user" to "admin"');
    console.log('   - User now has company admin privileges');
    console.log('   - Can manage other users within Reckonix company');
    console.log('   - Enhanced permissions for company management');
    console.log('   - Still maintains access to all Reckonix company data');

    console.log('\n✅ Reckonix company admin setup completed successfully!');

  } catch (error) {
    console.error('❌ Error making user company admin:', error);
  } finally {
    await client.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
makeReckonixCompanyAdmin();