import { Test, TestingModule } from '@nestjs/testing';
import { CustomerService } from './customer.service';
import { customerRepositoryMock } from '../../test/mocks/customer.mock';
import { iCustomerRepository } from './repository/prisma.customer.repository';

describe('CustomerService', () => {
  let service: CustomerService;
  let repositoryMock: customerRepositoryMock;

  beforeAll(async () => {
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
    repositoryMock = module.get<customerRepositoryMock>(customerRepositoryMock);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('findOne', () => {
    it('should be return a customer', async () => {
      const customers = await service.findOne('65305150000159');
      expect(customers).toBeTruthy();
      expect(customers.documentNumber).toBe('65305150000159');
    });
  });

  describe('create', () => {
    it('should be a error Customer already exists', async () => {
      expect(
        service.create(repositoryMock.getCustomerMock()),
      ).rejects.toBeInstanceOf(Error);
    });
    it('should be return a customer', async () => {
      const res = await service.create(repositoryMock.getNewCustomerMock());
      expect(res).toBeTruthy();
      expect(res.eligible).toBe(true);
    });
    it('should be a error "Customer already exists"', async () => {
      const customer = repositoryMock.getCustomerMock();
      customer.documentNumber = '0000000000';
      const res = await service.create(customer);
      expect(res.message).toBe('cpf or cnpj invalid');
    });
    it('should be customer not eligible tariffModality', async () => {
      const customer = repositoryMock.getNewCustomerMock();
      customer.tariffModality = 'AZUL';
      const res = await service.create(customer);
      expect(res.eligible).toBe(false);
      expect(res.reasonsofineligibility[1]).toBe(
        'Modalidade tarifária não aceita',
      );
    });
    it('should be customer not eligible consumptionclass', async () => {
      const customer = repositoryMock.getNewCustomerMock();
      customer.tariffModality = 'BRANCA';
      customer.consumptionclass = 'PODER PUBLICO';
      const res = await service.create(customer);
      expect(res.eligible).toBe(false);
      expect(res.reasonsofineligibility[0]).toBe(
        'Classe de consumo não aceita',
      );
    });
    it('should be customer not eligible', async () => {
      const customer = repositoryMock.getNewCustomerMock();
      customer.tariffModality = 'BRANCA';
      customer.consumptionclass = 'RESIDENCIAL';
      customer.connectiontype = 'MONOFASICO';
      customer.historyOfConsumption = [1000, 100, 100, 10, 100];
      const res = await service.create(customer);
      expect(res.eligible).toBe(false);
      expect(res.reasonsofineligibility[2]).toBe(
        'Consumo muito baixo para tipo de conexão',
      );
    });
  });
});
