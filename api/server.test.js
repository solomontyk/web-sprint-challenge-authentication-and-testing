const request = require('supertest');
const db = require('../data/dbConfig');
const server = require('./server');
const Jokes = require('./jokes/jokes-data');

const user1 = { username: 'admin1', password: 'password' };


beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
});
beforeEach(async () => {
  await db.seed.run();
});
afterAll(async () => {
  await db.destroy();
});

test('sanity', () => {
  expect(true).toBe(true);
});

describe('User endpoint testing', () => {
  beforeEach(async () => {
    await request(server).post('/api/auth/register').send(user1);
  });
  test('Able to create a new user', async () => {
    let users;
    users = await db('users');
    expect(users).toHaveLength(4);
  });

  test('Able to login', async () => {
    const res = await request(server)
      .post('/api/auth/login')
      .send({ username: 'admin1', password: 'password' });
    expect(res.body.message).toMatch(/admin1 is back/i);
  });
  test('Not able to login with invalid creds', async () => {
    const res = await request(server)
      .post('/api/auth/login')
      .send({ username: 'admin1', password: 'thisIsNotThePassword' });
    expect(res.body.message).toMatch(/invalid credentials/i);
  });
});

describe('Joke endpoint testing', () => {
  test('Jokes are restricted behind login', async () => {
    const res = await request(server).get('/api/jokes');
    expect(res.body.message).toMatch(/token required/i);
  });
  test('Jokes are accessible after login', async () => {
    await request(server).post('/api/auth/register').send(user1);
    const res = await request(server)
      .post('/api/auth/login')
      .send({ username: 'admin1', password: 'password' });
    const token = res.body.token;
    const jokes = await request(server)
      .get('/api/jokes')
      .set({ Authorization: token });
    expect(jokes.body[0].joke).toEqual(Jokes[0].joke);
  });
});
