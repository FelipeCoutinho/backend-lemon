import { Test, TestingModule } from '@nestjs/testing';
import { CustomerService } from './customer.service';
import { customer } from 'test/mocks/customer';
import { CustomerRepository } from './repository/customer.repository';
import { PrismaService } from 'src/prisma/prisma.service';

describe('CustomerService', () => {
  let service: CustomerService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerService,
        {
          provide: CustomerRepository,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<CustomerService>(CustomerService);
  });

  it('should return a customer', async () => {
    const customers = await service.findOne(customer.customerId);
    expect(customers).toHaveLength(2);
  });
});
