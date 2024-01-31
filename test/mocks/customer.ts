import { CreateCustomerDto } from 'src/customer/dto/create-customer.dto';
import { iCustomerRepository } from '../../src/customer/repository/prisma.customer.repository';

export const customerMock: CreateCustomerDto = {
  name: 'compassoUol',
  documentNumber: '65305150000159',
  connectiontype: 'Monofasico',
  consumptionclass: 'Residencial',
  historyOfConsumption: [
    3878, 9760, 5976, 2797, 2481, 5731, 7538, 4392, 7859, 4160, 6941, 4597,
  ],
  tariffModality: 'azul',
};

export const newCustomerMock: CreateCustomerDto = {
  name: 'compassoUol',
  documentNumber: '35718965000107',
  connectiontype: 'Monofasico',
  consumptionclass: 'Residencial',
  historyOfConsumption: [
    3878, 9760, 5976, 2797, 2481, 5731, 7538, 4392, 7859, 4160, 6941, 4597,
  ],
  tariffModality: 'azul',
};

export const prismaMock = {
  customerMock: {
    create: jest.fn().mockResolvedValue([customerMock]),
  },
};
export class customerRepositoryMock implements iCustomerRepository {
  async findOne(customerId: string) {
    const data = [customerMock].find(
      (customerMock) => customerMock.documentNumber === customerId,
    );
    return data;
  }
  async findAll() {
    return [customerMock];
  }
  async create(customerMock: any) {
    return customerMock;
  }
  async update(customerId: string, updatecustomerMockDto: any): Promise<any> {
    return customerMock;
  }
  async findUnique(filter: any): Promise<any> {
    const data = [customerMock].find(
      (customerMock) => customerMock.documentNumber === filter.documentNumber,
    );
    return data;
  }
  async search(filters?: any, pagination?: any): Promise<any> {
    return [customerMock];
  }
  async paginationSearch(filters: any, pagination: any): Promise<any> {
    return [customerMock];
  }
  async pagination(filters: any, pagination: any): Promise<any> {
    return [customerMock];
  }
  async virtualExclusion(customerId: string): Promise<any> {
    return customerMock;
  }
}
