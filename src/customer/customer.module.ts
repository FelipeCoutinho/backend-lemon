import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { CustomerRepository } from './repository/customer.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { iCustomerRepository } from './repository/prisma.customer.repository';

@Module({
  controllers: [CustomerController],
  providers: [
    CustomerService,
    {
      provide: iCustomerRepository,
      useClass: CustomerRepository,
    },
    PrismaService,
  ],
})
export class CustomerModule {}
