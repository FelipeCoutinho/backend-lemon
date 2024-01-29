import { Test, TestingModule } from '@nestjs/testing';
import { CustomerRepository } from './customer.repository';

describe('CustomerRepository', () => {
  let service: CustomerRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomerRepository],
    }).compile();

    service = module.get<CustomerRepository>(CustomerRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
