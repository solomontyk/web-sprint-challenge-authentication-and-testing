// Write your tests here
const app = require("./server")
const supertest = require("supertest")
const request = supertest(app)
const db = require("../data/dbConfig")

const User = require("./users/users-model")

const user1 = { username: 'tom', password: '1234' }

beforeAll(async () => {
  await db.migrate.rollback()
  await db.migrate.latest()
})

beforeEach(async () => {
  await db("users").truncate()
})

afterAll(async () => {
  await db.destroy()
})

describe("users model function", () => {

  describe("create user", () => {
    it("adds user to the db", async () => {
      let users
      await User.add(user1)
      users = await db("users")
      expect(users).toHaveLength(1)
    })
  })

  describe("[POST] register endpoint", () => {
    it("tries to register with missing information", async () => {
      const addedUser = await request
        .post('/api/auth/register')
        .send({
          "username": "",
          "password": "foobar",
        })
        expect(addedUser.body.message).toBe("username and password required")
    })
    it("tries to register with a preexisting username", async () => {
      let addedUser = await request 
        .post('/api/auth/register')
        .send({
          "username": "Captain Marvel",
          "password": "foobar",
        })
        addedUser = await request 
          .post('/api/auth/register')
          .send({
            "username": "Captain Marvel",
            "password": "foobar",
          })
          expect(addedUser.body.message).toBe("username taken")
    })
  })

  describe("[POST] login endpoint", () => {
    it("tries to login with missing information", async () => {
      const addedUser = await request
        .post('/api/auth/login')
        .send({
          "username": "",
          "password": "foobar",
        })
        expect(addedUser.body.message).toBe("username and password required")
    })
    it("tries to login with bad information", async () => {
      const addedUser = await request
        .post('/api/auth/login')
        .send({
          "username": "adsfadsfadsf",
          "password": "foobar",
        })
        expect(addedUser.body.message).toBe("invalid credentials")
    })
    it("...", async () => {
      await request.post('/api/auth/register')
        .send({
          "username": "Captain Marvel",
          "password": "foobar",
        })
        const loggedUser = await request  
          .post('/api/auth/login')
          .send({
            "username": "Captain Marvel",
            "password": "foobar",
          })
          expect(loggedUser.body.token).toBeTruthy()
    })
  })

  describe("[GET] jokes endpoint", () => {
    it("tries to access jokes without logging in", async () => {
      const jokes = await request.get('/api/jokes')
      expect(jokes.body.message).toBe("token required")
    })
    it("tries to access jokes after registering and logging in", async () => {
      await request.post('/api/auth/register')
        .send({
          "username": "Captain Marvel",
          "password": "foobar",
        })
        const loggedUser = await request
          .post('/api/auth/login')
          .send({
            "username": "Captain Marvel",
            "password": "foobar",
          })
          const token = loggedUser.body.token
          const jokes = await request.get('/api/jokes')
            .set('Authorization', token)
            expect(jokes.body.length).toBe(3)
    })
  })
})