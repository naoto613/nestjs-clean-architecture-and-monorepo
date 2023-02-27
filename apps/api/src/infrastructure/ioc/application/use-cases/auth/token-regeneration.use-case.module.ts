import { TokenRegenerationUseCase } from '@/application/use-cases/auth/token-regeneration.use-case'
import { UsersRepositoryModule } from '@/infrastructure/ioc/domain/repositories/users.repository.module'
import { GetTokenServiceModule } from '@/infrastructure/ioc/domain/services/users/get-token.service.module'
import { Module } from '@nestjs/common'

@Module({
  imports: [GetTokenServiceModule, UsersRepositoryModule],
  providers: [TokenRegenerationUseCase],
  exports: [TokenRegenerationUseCase],
})
export class TokenRegenerationUseCaseModule {}
