// Script to update admin user role to superuser for testing approvals
const { MongoClient } = require('mongodb');

async function updateAdminRole() {
  const uri = 'mongodb+srv://vinay:FBKAbt5g5DhxFK3@cluster0.5hfxub2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('business_ai');
    const usersCollection = db.collection('users');

    // Update the admin user to superuser role
    const result = await usersCollection.updateOne(
      { username: 'admin' },
      { $set: { role: 'superuser' } }
    );

    if (result.modifiedCount > 0) {
      console.log('✅ Admin user role updated to superuser');
    } else {
      console.log('❌ Admin user not found or already superuser');
    }

    // Verify the update
    const user = await usersCollection.findOne({ username: 'admin' });
    console.log('Current admin user:', { id: user.id, username: user.username, role: user.role });

  } catch (error) {
    console.error('Error updating admin role:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

updateAdminRole();