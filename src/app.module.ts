import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ScenariosModule } from './scenarios/scenarios.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), UsersModule, ScenariosModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
