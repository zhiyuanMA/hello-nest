import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as pactum from 'pactum';
import { AuthDto } from '../src/auth/dto';
import { EditUserDto } from '../src/user/dto';
import { CreateBookmarkDto } from '../src/bookmark/dto';
import { Role } from '@prisma/client/index';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const admin_email = 'admin@admin.cc';
  const admin_pw = '123abc';
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    await app.init();
    await app.listen(3000);

    prisma = app.get(PrismaService);

    pactum.request.setBaseUrl('http://localhost:3000');

    // await prisma.bookmark.deleteMany();
    // await prisma.user.deleteMany();
    await prisma.user.create({
      data: {
        email: admin_email,
        hash: '$argon2id$v=19$m=65536,t=3,p=4$Rp3tr4xDlSaW0OLobi7lPw$+4BaicfTKDOhTT8ZEPSl3MC4YzYw74j1rmlY6TyIaL8',
        roles: [Role.ADMIN],
      },
    });
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'test@test.cc',
      password: '123abc',
    };

    describe('Signup', () => {
      it('Should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ password: dto.password })
          .expectStatus(400);
      });
      it('Should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ email: dto.email })
          .expectStatus(400);
      });
      it('Should sign up', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
      });

      it('Should throw if credentials same', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(403);
      });
    });

    describe('Signin', () => {
      it('Should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ password: dto.password })
          .expectStatus(400);
      });

      it('Should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ email: dto.email })
          .expectStatus(400);
      });

      it('Should sign in', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores('token', 'access_token');
      });
    });
  });

  describe('User', () => {
    describe('GET /users/me', () => {
      it('Should throw if no token', () => {
        return pactum.spec().get('/users/me').expectStatus(401);
      });

      it('Should return current user', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: 'Bearer $S{token}',
          })
          .expectStatus(200);
      });
    });

    describe('PATCH /users', () => {
      it('Should update user', () => {
        const dto: EditUserDto = {
          firstName: 'test',
          lastName: 't',
        };

        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: 'Bearer $S{token}',
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.firstName)
          .expectBodyContains(dto.lastName);
      });
    });
  });

  describe('Bookmark', () => {
    const dto: CreateBookmarkDto = {
      title: 'test title',
      desc: 'test desc',
      link: 'test link',
    };
    describe('POST /bookmarks', () => {
      it('Should throw if title empty', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{token}',
          })
          .withBody({
            link: dto.link,
          })
          .expectStatus(400);
      });

      it('Should throw if link empty', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{token}',
          })
          .withBody({
            title: dto.title,
          })
          .expectStatus(400);
      });

      it('Should create bookmark', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{token}',
          })
          .withBody(dto)
          .expectStatus(201)
          .expectBodyContains(dto.link);
      });
    });

    describe('GET /bookmarks', () => {
      it('Should throw if no token', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withQueryParams({
            page: 0,
            count: 10,
          })
          .expectStatus(401);
      });

      it('Should get bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{token}',
          })
          .withQueryParams({
            page: 0,
            count: 10,
          })
          .expectStatus(200);
      });
    });

    describe('GET /bookmarks/:ids', () => {
      it('Should get bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks/1,2,3')
          .withHeaders({
            Authorization: 'Bearer $S{token}',
          })
          .expectStatus(200);
      });
    });

    describe('PATCH /bookmarks/:id', () => {
      it('Should update bookmarks', () => {
        return pactum
          .spec()
          .patch('/bookmarks/1')
          .withHeaders({
            Authorization: 'Bearer $S{token}',
          })
          .withBody({
            title: dto.title + ' update',
            desc: dto.desc + ' update',
            link: dto.link + ' update',
          })
          .expectStatus(200)
          .expectBodyContains(dto.title + ' update');
      });
    });

    describe('DELETE - ADMIN /bookmarks/:id', () => {
      it('Should sign in as Admin', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ email: admin_email, password: admin_pw } as AuthDto)
          .expectStatus(200)
          .stores('admin_token', 'access_token');
      });

      it('Should throw if role not match', () => {
        return pactum
          .spec()
          .delete('/bookmarks/1')
          .withHeaders({
            Authorization: 'Bearer $S{token}',
          })
          .expectStatus(403);
      });

      it('Should delete bookmark', () => {
        return pactum
          .spec()
          .delete('/bookmarks/1')
          .withHeaders({
            Authorization: 'Bearer $S{admin_token}',
          })
          .expectStatus(204);
      });
    });

    describe('POST - ADMIN /bookmarks/bulk', () => {
      const dtos = [
        {
          title: 'test title 1',
          desc: 'test desc 1',
          link: 'test link 1',
        },
        {
          title: 'test title 2',
          desc: 'test desc 2',
          link: 'test link 2',
        },
      ];
      it('Should throw if role not match', () => {
        return pactum
          .spec()
          .post('/bookmarks/bulk/2')
          .withHeaders({
            Authorization: 'Bearer $S{token}',
          })
          .expectStatus(403);
      });

      it('Should create bookmarks', () => {
        return pactum
          .spec()
          .post('/bookmarks/bulk/2')
          .withHeaders({
            Authorization: 'Bearer $S{admin_token}',
          })
          .withBody(dtos)
          .expectStatus(201);
      });
    });
  });
});
