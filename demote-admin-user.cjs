// Script to demote admin user from superuser to normal user and change name to Reckonix
const { MongoClient } = require('mongodb');

async function demoteAdminToNormalUser() {
  const uri = 'mongodb+srv://vinay:FBKAbt5g5DhxFK3@cluster0.5hfxub2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('business_ai');
    const usersCollection = db.collection('users');

    // Find the admin user
    console.log('🔍 Searching for admin user...');
    const adminUser = await usersCollection.findOne({ username: 'admin' });

    if (!adminUser) {
      console.log('❌ Admin user not found in the database');
      return;
    }

    console.log(`✅ Found admin user: ${adminUser.name} (${adminUser.username})`);
    console.log(`   Current role: ${adminUser.role}`);
    console.log(`   Current name: ${adminUser.name}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   User ID: ${adminUser.id}`);

    // Check current role and name
    if (adminUser.role === 'user' && adminUser.name === 'Reckonix') {
      console.log('ℹ️ Admin user is already a normal user with name "Reckonix"');
      return;
    }

    // Update role to 'user' and name to 'Reckonix'
    const result = await usersCollection.updateOne(
      { username: 'admin' },
      { 
        $set: { 
          role: 'user',
          name: 'Reckonix',
          updatedAt: new Date()
        } 
      }
    );

    if (result.modifiedCount > 0) {
      console.log('✅ Admin user successfully demoted to normal user');
      console.log('✅ Name changed to "Reckonix"');
      
      // Verify the update
      const updatedUser = await usersCollection.findOne({ username: 'admin' });
      console.log(`   Updated role: ${updatedUser.role}`);
      console.log(`   Updated name: ${updatedUser.name}`);
      console.log(`   Username: ${updatedUser.username}`);
      console.log(`   User ID: ${updatedUser.id}`);
      console.log(`   Email: ${updatedUser.email}`);
      console.log(`   Updated at: ${updatedUser.updatedAt}`);
    } else {
      console.log('❌ Failed to update admin user');
    }

  } catch (error) {
    console.error('❌ Error updating admin user:', error);
  } finally {
    await client.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
demoteAdminToNormalUser();