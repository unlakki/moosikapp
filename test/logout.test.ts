import request from 'supertest';
import bcrypt from 'bcryptjs';

import app from '../src/index';
import UserModel from '../src/mongodb/models/user.model';

beforeEach(async () => {
  await UserModel.deleteOne({ username: 'testuser4' });

  const password = await bcrypt.hash('supersecretpassword', 10);
  const user = new UserModel({
    username: 'testuser4',
    email: 'testuser4@domain.com',
    password,
  });
  await user.save();
});

describe('logout', () => {
  it('should return Status-Code 200 and correct body if user logged out', (done) => {
    request(app)
      .post('/api/v2/login')
      .set('Accept', 'application/json')
      .send({
        username: 'testuser4',
        password: 'supersecretpassword',
      })
      .end((req, res) => {
        request(app)
          .post('/api/v2/logout')
          .set('Accept', 'application/json')
          .auth(res.body.token, { type: 'bearer' })
          .expect(200)
          .expect('Content-Type', /application\/json/)
          .expect({ message: 'Successfully logged out.' }, done);
      });
  });

  it('should return Status-Code 405 and correct body if incorrect header `Accept` provided', (done) => {
    request(app)
      .post('/api/v2/logout')
      .auth('access token', { type: 'bearer' })
      .expect(405)
      .expect('Content-Type', /application\/json/)
      .expect({ message: 'Incorrect `Accept` header provided.' }, done);
  });

  it('should return Status-Code 403 and correct body if invalid token provided', (done) => {
    request(app)
      .post('/api/v2/logout')
      .set('Accept', 'application/json')
      .auth('invalid access token', { type: 'bearer' })
      .expect(403)
      .expect('Content-Type', /application\/json/)
      .expect({ message: 'Not authorized.' }, done);
  });

  it('should return Status-Code 410 and correct body if already logged out', (done) => {
    request(app)
      .post('/api/v2/login')
      .set('Accept', 'application/json')
      .send({
        username: 'testuser4',
        password: 'supersecretpassword',
      })
      .end((req, res) => {
        request(app)
          .post('/api/v2/logout')
          .set('Accept', 'application/json')
          .auth(res.body.token, { type: 'bearer' })
          .end(() => {
            request(app)
              .post('/api/v2/logout')
              .set('Accept', 'application/json')
              .auth(res.body.token, { type: 'bearer' })
              .expect(410)
              .expect('Content-Type', /application\/json/)
              .expect({ message: 'Already logged out.' }, done);
          });
      });
  });
});
