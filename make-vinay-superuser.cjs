// Script to make Vinay Sawarkar a superuser
const { MongoClient } = require('mongodb');

async function makeVinaySuperuser() {
  const uri = 'mongodb+srv://vinay:FBKAbt5g5DhxFK3@cluster0.5hfxub2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('business_ai');
    const usersCollection = db.collection('users');

    // Try multiple search criteria to find Vinay Sawarkar
    const searchCriteria = [
      { name: /Vinay Sawarkar/i },
      { name: /vinay sawarkar/i },
      { name: /VINAY SAWARKAR/i },
      { email: /vinay/i },
      { username: /vinay/i }
    ];

    let userFound = null;
    let searchMethod = '';

    for (const criteria of searchCriteria) {
      console.log(`🔍 Searching with criteria:`, criteria);
      const user = await usersCollection.findOne(criteria);
      if (user) {
        userFound = user;
        searchMethod = Object.keys(criteria)[0];
        break;
      }
    }

    if (!userFound) {
      console.log('❌ Vinay Sawarkar not found in the database');
      console.log('📋 Available users:');
      const allUsers = await usersCollection.find().toArray();
      allUsers.forEach(user => {
        console.log(`   - ${user.name} (${user.username}) - Role: ${user.role}`);
      });
      return;
    }

    console.log(`✅ Found user: ${userFound.name} (${userFound.username})`);
    console.log(`   Current role: ${userFound.role}`);
    console.log(`   Email: ${userFound.email}`);
    console.log(`   Search method: ${searchMethod}`);

    // Check if already superuser
    if (userFound.role === 'superuser') {
      console.log('ℹ️ User is already a superuser');
      return;
    }

    // Update role to superuser
    const result = await usersCollection.updateOne(
      { id: userFound.id },
      { 
        $set: { 
          role: 'superuser',
          updatedAt: new Date()
        } 
      }
    );

    if (result.modifiedCount > 0) {
      console.log('✅ Vinay Sawarkar successfully upgraded to superuser role');
      
      // Verify the update
      const updatedUser = await usersCollection.findOne({ id: userFound.id });
      console.log(`   Updated role: ${updatedUser.role}`);
      console.log(`   User ID: ${updatedUser.id}`);
      console.log(`   Username: ${updatedUser.username}`);
      console.log(`   Name: ${updatedUser.name}`);
      console.log(`   Email: ${updatedUser.email}`);
      console.log(`   Updated at: ${updatedUser.updatedAt}`);
    } else {
      console.log('❌ Failed to update user role');
    }

  } catch (error) {
    console.error('❌ Error updating Vinay Sawarkar role:', error);
  } finally {
    await client.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
makeVinaySuperuser();