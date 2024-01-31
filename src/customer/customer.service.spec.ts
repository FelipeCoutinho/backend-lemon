import { Test, TestingModule } from '@nestjs/testing';
import { CustomerService } from './customer.service';
import {
  customerMock,
  customerRepositoryMock,
  newCustomerMock,
} from '../../test/mocks/customer';
import { iCustomerRepository } from './repository/prisma.customer.repository';

describe('CustomerService', () => {
  let service: CustomerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerService,
        customerRepositoryMock,
        {
          provide: iCustomerRepository,
          useValue: new customerRepositoryMock(),
        },
      ],
    }).compile();

    service = module.get<CustomerService>(CustomerService);
  });

  describe('findOne', () => {
    it('should be return a customer', async () => {
      const customers = await service.findOne('65305150000159');
      expect(customers).toBeTruthy();
      expect(customers.documentNumber).toBe('65305150000159');
    });
  });

  describe('create', () => {
    it('should be return a customer', async () => {
      const res = await service.create(newCustomerMock);
      expect(res).toBeTruthy();
      expect(res.eligible).toBe(true);
    });
  });
});
