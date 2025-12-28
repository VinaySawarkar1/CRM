// Script to update Vinay Sawarkar user role to superuser
const { MongoClient } = require('mongodb');

async function updateVinayToSuperuser() {
  const uri = 'mongodb+srv://vinay:FBKAbt5g5DhxFK3@cluster0.5hfxub2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('business_ai');
    const usersCollection = db.collection('users');

    // First, let's find all users to see what's available
    console.log('Looking for Vinay Sawarkar...');
    const allUsers = await usersCollection.find({}).toArray();
    console.log('Available users:', allUsers.map(user => ({ id: user.id, username: user.username, name: user.name, role: user.role })));

    // Try to find Vinay Sawarkar by different possible username patterns
    let vinayUser = null;
    const searchTerms = ['vinay sawarkar', 'vinay', 'sawarkar', 'Vinay', 'VINAY', 'VinaySawarkar'];
    
    for (const term of searchTerms) {
      vinayUser = await usersCollection.findOne({
        $or: [
          { username: term },
          { name: term },
          { email: term }
        ]
      });
      
      if (vinayUser) {
        console.log(`Found user with term "${term}":`, { id: vinayUser.id, username: vinayUser.username, name: vinayUser.name, role: vinayUser.role });
        break;
      }
    }

    // If not found by exact match, try case-insensitive search
    if (!vinayUser) {
      console.log('Trying case-insensitive search...');
      vinayUser = await usersCollection.findOne({
        $or: [
          { username: { $regex: /vinay.*sawarkar/i } },
          { name: { $regex: /vinay.*sawarkar/i } },
          { email: { $regex: /vinay.*sawarkar/i } }
        ]
      });
      
      if (vinayUser) {
        console.log(`Found user with regex search:`, { id: vinayUser.id, username: vinayUser.username, name: vinayUser.name, role: vinayUser.role });
      }
    }

    if (vinayUser) {
      // Update the user to superuser role
      const result = await usersCollection.updateOne(
        { _id: vinayUser._id },
        { $set: { role: 'superuser' } }
      );

      if (result.modifiedCount > 0) {
        console.log('✅ Vinay Sawarkar role updated to superuser');
      } else {
        console.log('⚠️ User found but role already superuser or update failed');
      }

      // Verify the update
      const updatedUser = await usersCollection.findOne({ _id: vinayUser._id });
      console.log('Updated user:', { id: updatedUser.id, username: updatedUser.username, name: updatedUser.name, role: updatedUser.role });
    } else {
      console.log('❌ Vinay Sawarkar user not found in the database');
      console.log('Please check the username/name in the database');
    }

  } catch (error) {
    console.error('Error updating Vinay Sawarkar role:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

updateVinayToSuperuser();