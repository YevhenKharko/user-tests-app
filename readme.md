## Description:
User testing application. User should be able to sign in into application (sign up isn't required).
Users can only see and pass tests that have been assigned to them.
Once user completed the test, his mark should be stored and user should see the test as completed without ability to retake it.
Only user-side functional is required (viewing available and completed tests, passing the test).

## Backend API:
POST /sign-up                    -- auth, place user to users table
POST /sign-in                    -- auth
GET /users/:id                   -- get user info: username, when created_at, etc
GET /users/:id/tests             -- get user tests list
POST /users/:id/tests            -- start new test, returns test object { id, description: "2 + 2" }
GET /users/:id/tests/:test_id    -- get test by id, returns the same as previos EP
POST /users/:id/tests/:test_id   -- pass answer in a payload. may return 200 if test passed, or 400 if not

Not required, but good to read:
Auth help: https://blog.logrocket.com/implement-oauth-2-0-node-js/

## Frontend pages:
Sign-in/Sign-up                         -- redirects to next
User details page with "new" button     -- use GET /users/:id, GET /users/:id/tests, POST /users/:id/tests
Test page with form and submit button   -- use GET and POST /users/:id/tests/:test_id, redirects to next
Test On Submit - show details from response of POST /users/:id/tests/:test_id

## Database tables
users { id, name, username, password_hash }
tests { id, user_id, description, answer, status }

relation:
user ----* test


## Plan
1. setup DB
2. users EPs
3. tests EPs
4. sign-in/sign-up EPs
-- unit testing
5. Auth page
6. User defails
7. Test functionality

## Notes
#### gen test
const signs = ['+', '-', '*', '/']
generateTest(complexity) {
    const nums = gen X random integers depends on complexity + 1
    const test = using nums and signs placed randomly ex: 4 + 2 * 7
    const answer = eval(test)
    return { description: test, answer }
}

#### repos
user-math-test-ui       // FE
user-math-test-api      // BE
