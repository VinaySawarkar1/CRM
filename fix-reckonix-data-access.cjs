// Script to ensure Reckonix company data is accessible to admin user
const { MongoClient } = require('mongodb');

async function fixReckonixDataAccess() {
  const uri = 'mongodb+srv://vinay:FBKAbt5g5DhxFK3@cluster0.5hfxub2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('business_ai');
    const usersCollection = db.collection('users');
    const companiesCollection = db.collection('companies');

    // Find the Reckonix admin user
    console.log('🔍 Searching for Reckonix admin user...');
    const adminUser = await usersCollection.findOne({ username: 'admin' });
    
    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }

    console.log(`✅ Found admin user: ${adminUser.name} (${adminUser.username})`);
    console.log(`   Current role: ${adminUser.role}`);
    console.log(`   Current companyId: ${adminUser.companyId}`);

    // Find or create Reckonix company
    console.log('🔍 Searching for Reckonix company...');
    let reckonixCompany = await companiesCollection.findOne({ name: /reckonix/i });
    
    if (!reckonixCompany) {
      console.log('📝 Creating Reckonix company...');
      const companyData = {
        id: Date.now(), // Generate unique company ID
        name: 'Reckonix',
        email: 'admin@businessai.com',
        phone: '+91 8767431725',
        address: 'Business Address',
        status: 'active',
        maxUsers: 50,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await companiesCollection.insertOne(companyData);
      reckonixCompany = { ...companyData, _id: result.insertedId };
      console.log('✅ Created Reckonix company');
    } else {
      console.log(`✅ Found Reckonix company: ${reckonixCompany.name} (ID: ${reckonixCompany.id})`);
    }

    // Update admin user to be associated with Reckonix company
    if (adminUser.companyId !== reckonixCompany.id) {
      console.log('🔄 Updating admin user company association...');
      const updateResult = await usersCollection.updateOne(
        { username: 'admin' },
        { 
          $set: { 
            companyId: reckonixCompany.id,
            updatedAt: new Date()
          } 
        }
      );
      
      if (updateResult.modifiedCount > 0) {
        console.log('✅ Admin user now associated with Reckonix company');
      } else {
        console.log('❌ Failed to update admin user company association');
      }
    } else {
      console.log('ℹ️ Admin user is already associated with Reckonix company');
    }

    // Update all Reckonix-related data to be associated with the correct company
    const collectionsToUpdate = [
      'customers', 'leads', 'quotations', 'orders', 'invoices', 
      'inventory', 'tasks', 'manufacturingJobs', 'employeeActivities'
    ];

    console.log('🔄 Updating data associations with Reckonix company...');
    
    for (const collectionName of collectionsToUpdate) {
      const collection = db.collection(collectionName);
      
      // Check if collection exists and has data
      const count = await collection.countDocuments();
      if (count > 0) {
        // Update records that might be orphaned (null companyId or different companyId)
        const updateResult = await collection.updateMany(
          { 
            $or: [
              { companyId: { $exists: false } },
              { companyId: null },
              { companyId: { $ne: reckonixCompany.id } }
            ]
          },
          { 
            $set: { 
              companyId: reckonixCompany.id,
              updatedAt: new Date()
            } 
          }
        );
        
        if (updateResult.modifiedCount > 0) {
          console.log(`✅ Updated ${updateResult.modifiedCount} records in ${collectionName}`);
        }
      }
    }

    // Verify the final state
    console.log('🔍 Verifying final state...');
    const finalAdminUser = await usersCollection.findOne({ username: 'admin' });
    console.log(`✅ Final admin user state:`);
    console.log(`   Name: ${finalAdminUser.name}`);
    console.log(`   Role: ${finalAdminUser.role}`);
    console.log(`   CompanyId: ${finalAdminUser.companyId}`);
    console.log(`   Company: ${reckonixCompany.name}`);

    // Show data statistics
    console.log('📊 Data statistics for Reckonix company:');
    for (const collectionName of collectionsToUpdate) {
      const collection = db.collection(collectionName);
      const count = await collection.countDocuments({ companyId: reckonixCompany.id });
      if (count > 0) {
        console.log(`   ${collectionName}: ${count} records`);
      }
    }

    console.log('✅ Data access fix completed successfully');

  } catch (error) {
    console.error('❌ Error fixing Reckonix data access:', error);
  } finally {
    await client.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
fixReckonixDataAccess();