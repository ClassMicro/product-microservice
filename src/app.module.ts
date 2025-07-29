import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { envs } from './config';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: envs.dbHost,
      port: envs.dbPort,
      database: envs.dbName,
      username: envs.dbUser,
      password: envs.dbPass,
      autoLoadEntities: true,
      synchronize: true, // Solo para desarrollo
    }),
    ProductsModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
