import { getDb } from '../lib/mongodb.js';
import { hash } from 'bcryptjs';

async function seedAdmin() {
  const db = await getDb();
  const email = 'admin@nhuthangmovie.com';

  const existing = await db.collection('users').findOne({ email });
  if (existing) {
    console.log('Admin account already exists:', email);
    await db.collection('users').updateOne({ email }, { $set: { role: 'admin' } });
    console.log('Ensured role is admin.');
  } else {
    const hashedPassword = await hash('admin123', 12);
    await db.collection('users').insertOne({
      name: 'Admin',
      email,
      password: hashedPassword,
      role: 'admin',
      favorites: [],
      history: [],
      createdAt: new Date(),
    });
    console.log('Admin account created!');
  }

  console.log('Email: admin@nhuthangmovie.com');
  console.log('Password: admin123');
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
