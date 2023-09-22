import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as pactum from 'pactum';
import { AuthDto } from 'src/auth/dto';
import { EditUserDto } from 'src/user/dto';
import { CreateBookmarkDto } from 'src/bookmark/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    // start a nestjs server, so that we can use pactum to make requests
    await app.listen(3333);
    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3333');
  });
  afterAll(() => {
    app.close();
  });
  describe('Auth', () => {
    describe('Signup', () => {
      it('should throw error when mail is empty', () => {
        const dto: AuthDto = { email: '', password: '1234' };
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(400);
      });
      it('should throw error when password is empty', () => {
        const dto: AuthDto = { email: 'aleku99@yahoo.com', password: '' };
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(400);
      });
      it('should throw error if no body provided', () => {
        return pactum.spec().post('/auth/signup').expectStatus(400);
      });
      it('should signup', () => {
        const dto: AuthDto = { email: 'aleku99@yahoo.com', password: '1234' };
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
      });
    });
    describe('Signin', () => {
      it('should throw error when mail is empty', () => {
        const dto: AuthDto = { email: '', password: '1234' };
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(400);
      });
      it('should throw error when password is empty', () => {
        const dto: AuthDto = { email: 'aleku99@yahoo.com', password: '' };
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(400);
      });
      it('should throw error if no body provided', () => {
        return pactum.spec().post('/auth/signin').expectStatus(400);
      });
      it('should sign in', () => {
        const dto: AuthDto = { email: 'aleku99@yahoo.com', password: '1234' };
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAt', 'access_token');
      });
    });
  });
  describe('User', () => {
    describe('Get me', () => {
      it('should get current user', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({ Authorization: `Bearer $S{userAt}` })
          .expectStatus(200);
      });
    });
    describe('Edit user', () => {
      it('should edit user', () => {
        const dto: EditUserDto = {
          firstName: 'Alex',
          lastName: 'Loghin',
        };
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({ Authorization: `Bearer $S{userAt}` })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.firstName)
          .expectBodyContains(dto.lastName);
      });
    });
  });
  describe('Bookmarks', () => {
    describe('Get empty bookmarks', () => {
      it('should return empty bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmark')
          .withHeaders({ Authorization: `Bearer $S{userAt}` })
          .expectStatus(200)
          .expectBody([]);
      });
    });
    describe('Create bookmark', () => {
      it('should create a bookmark', () => {
        const dto: CreateBookmarkDto = {
          title: 'bookmark1',
          link: 'link1',
          description: 'desc1',
        };
        return pactum
          .spec()
          .post('/bookmark')
          .withHeaders({ Authorization: `Bearer $S{userAt}` })
          .withBody(dto)
          .expectStatus(201)
          .stores('bookmarkId', 'id');
      });
    });
    describe('Get bookmarks', () => {
      it('should return bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmark')
          .withHeaders({ Authorization: `Bearer $S{userAt}` })
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });
    describe('Get bookmark by id ', () => {
      it('should get bookmark by id', () => {
        return pactum
          .spec()
          .get('/bookmark/{id}')
          .withHeaders({ Authorization: `Bearer $S{userAt}` })
          .withPathParams('id', `$S{bookmarkId}`)
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });
    describe('Edit bookmark', () => {
      it('should edit a bookmark', () => {
        const dto: CreateBookmarkDto = {
          title: 'bookmark2',
          link: 'link2',
          description: 'desc2',
        };
        return pactum
          .spec()
          .patch('/bookmark')
          .withHeaders({ Authorization: `Bearer $S{userAt}` })
          .withBody(dto)
          .expectStatus(201);
      });
    });
    describe('Delete bookmark ', () => {
      it('should delete a bookmark', () => {
        return pactum
          .spec()
          .delete('/bookmark/{id}')
          .withHeaders({ Authorization: `Bearer $S{userAt}` })
          .withPathParams('id', `$S{bookmarkId}`)
          .expectStatus(204);
      });
    });
  });
});
