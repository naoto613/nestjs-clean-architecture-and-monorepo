import request from 'supertest'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { resetTable } from '@/utils/test-helper/reset-table'
import { initializeIntegrationTest } from '@/utils/test-helper/initialize-integration-test'
import { Test, TestingModule } from '@nestjs/testing'
import { AppModule } from '@/infrastructure/ioc/app.module'
import { callMemoFactory } from '@/infrastructure/prisma/factories/memos/call-memo-factory'
import { MemoFactoryArgsType } from '@/infrastructure/prisma/factories/memos/memo-factory-args.type'
import { prismaInstance } from '@/infrastructure/prisma/prisma-instance'
import { UserFactoryArgsType } from '@/infrastructure/prisma/factories/users/user-factory-args.type'
import { callUserFactory } from '@/infrastructure/prisma/factories/users/call-user-factory'

describe('Memos', () => {
  let app: INestApplication

  beforeEach(async () => {
    await resetTable()
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = module.createNestApplication()
    app = await initializeIntegrationTest(app)
  })

  afterEach(async () => {
    await app.close()
  })

  describe('memos', () => {
    const getQuery = {
      query: `
        query {
          memos (
            searchConditions: {
              content: "テスト"
            }
            offset: 1
            limit: 2
          )
          {
            count
            data {
              content
              user {
                name
              }
            }
          }
        }
      `,
    }

    describe('returned successfully', () => {
      it('should get memos', async () => {
        const memoData: MemoFactoryArgsType[] = [
          {
            content: 'テスト1です',
            user: { email: 'test1@example.com', name: 'テスト 太郎' },
          },
          {
            content: '買い物',
            user: { email: 'test1@example.com' },
          },
          {
            content: 'テスト2です',
            user: { email: 'test1@example.com' },
          },
          {
            content: 'テスト3です',
            user: { email: 'test1@example.com' },
          },
        ]

        for (const memo of memoData) {
          await callMemoFactory(memo)
        }

        return request(app.getHttpServer())
          .post('/graphql')
          .send(getQuery)
          .expect(HttpStatus.OK)
          .expect((res) => {
            expect(res.body.data.memos).toStrictEqual({
              count: 3,
              data: [
                {
                  content: 'テスト2です',
                  user: { name: 'テスト 太郎' },
                },
                {
                  content: 'テスト3です',
                  user: { name: 'テスト 太郎' },
                },
              ],
            })
          })
      })
    })
  })

  describe('createMemo', () => {
    const createMutation = {
      query: `
        mutation {
          createMemo(
            data: {
              content: "テストです"
            }
          ) {
            __typename
          }
        }
      `,
    }

    describe('returned successfully', () => {
      it('should create a new memo', async () => {
        const userData: UserFactoryArgsType = {
          email: 'dummytaro@example.com',
        }

        await callUserFactory(userData)

        return request(app.getHttpServer())
          .post('/graphql')
          .send(createMutation)
          .expect(HttpStatus.OK)
          .expect(async (res) => {
            expect(res.body.data.createMemo).toStrictEqual({
              __typename: 'MemosOutput',
            })

            // メモが登録されていることを確認
            const savedMemo = await prismaInstance.memo.findMany()

            expect(savedMemo).toStrictEqual([
              {
                id: expect.anything(),
                content: 'テストです',
                email: 'dummytaro@example.com',
                createdAt: expect.anything(),
                updatedAt: expect.anything(),
              },
            ])
          })
      })
    })
  })

  describe('deleteMemos', () => {
    const memoData: MemoFactoryArgsType[] = [
      {
        content: '買い物',
        user: { email: 'test1@example.com' },
      },
      {
        content: 'テストです',
        user: { email: 'test1@example.com' },
      },
    ]

    beforeEach(async () => {
      for (const memo of memoData) {
        await callMemoFactory(memo)
      }
    })

    const deleteMutation = {
      query: `
        mutation {
          deleteMemos {
            __typename
          }
        }
      `,
    }

    describe('returned successfully', () => {
      it('should update a memo', () => {
        return request(app.getHttpServer())
          .post('/graphql')
          .send(deleteMutation)
          .expect(HttpStatus.OK)
          .expect(async (res) => {
            expect(res.body.data.deleteMemos).toStrictEqual({
              __typename: 'MemosOutput',
            })

            // メモが削除されていることを確認
            const savedMemos = await prismaInstance.memo.findMany()

            expect(savedMemos).toStrictEqual([])
          })
      })
    })
  })
})
