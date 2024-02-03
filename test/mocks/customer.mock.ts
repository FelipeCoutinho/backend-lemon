import { CreateCustomerDto } from 'src/customer/dto/create-customer.dto';
import { iCustomerRepository } from '../../src/customer/repository/prisma.customer.repository';
import { CONSUMPTIONCLASSES } from '../../src/customer/dto/ConsumptionClasses.enum';
export class customerRepositoryMock implements iCustomerRepository {
  getCustomerMock() {
    const customerMock: CreateCustomerDto = {
      name: 'compassoUol',
      documentNumber: '65305150000159',
      connectiontype: 'Monofasico',
      consumptionclass: 'Residencial',
      historyOfConsumption: [
        3878, 9760, 5976, 2797, 2481, 5731, 7538, 4392, 7859, 4160, 6941, 4597,
      ],
      tariffModality: 'azul',
    };

    return customerMock;
  }
  getNewCustomerMock() {
    const newCustomerMock: CreateCustomerDto = {
      name: 'compassoUol',
      documentNumber: '07.835.395/0001-91',
      connectiontype: 'MONOFASICO',
      consumptionclass: CONSUMPTIONCLASSES.RESIDENCIAL,
      historyOfConsumption: [
        3878, 9760, 5976, 2797, 2481, 5731, 7538, 4392, 7859, 4160, 6941, 4597,
      ],
      tariffModality: 'BRANCA',
    };
    return newCustomerMock;
  }
  async findOne(customerId: string) {
    const data = [this.getCustomerMock()].find(
      (customerMock) => customerMock.documentNumber === customerId,
    );
    return data;
  }
  async findAll() {
    return [this.getCustomerMock()];
  }
  async create(customerMock: any) {
    return customerMock;
  }
  async update(customerId: string, updatecustomerMockDto: any): Promise<any> {
    return this.getCustomerMock();
  }
  async findUnique(filter: any): Promise<any> {
    const data = [this.getCustomerMock()].find(
      (customerMock) => customerMock.documentNumber === filter.documentNumber,
    );
    return data;
  }
  async search(filters?: any, pagination?: any): Promise<any> {
    return [this.getCustomerMock()];
  }
  async paginationSearch(filters: any, pagination: any): Promise<any> {
    return [this.getCustomerMock()];
  }
  async pagination(filters: any, pagination: any): Promise<any> {
    return [this.getCustomerMock()];
  }
  async virtualExclusion(customerId: string): Promise<any> {
    return this.getCustomerMock();
  }
}
