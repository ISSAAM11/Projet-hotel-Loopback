import { request } from 'node:http'
import { describe } from 'node:test'
import supertest from 'supertest'
import users from '../../controllers/user.controller'

describe("post /users", ()=> {

    describe("given a username and password", ()=> {
        
        test(" 200 response", async () => {
            const response = await request(users).post("/users/loginHotel").send({
                username:"benhassineissam@gmail.com",
                password: "stringst"
            })
            expect(response.statusCode).toBe(401)
        })

    })

})