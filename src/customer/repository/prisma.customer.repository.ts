import { CreateCustomerDto } from '../dto/create-customer.dto';

export abstract class iCustomerRepository {
  abstract create(createCustomerDto: CreateCustomerDto): Promise<any>;
  abstract search(filters?: any, pagination?: any): Promise<any>;
  abstract findOne(customerId: string): Promise<any>;
  abstract findUnique(filter: any): Promise<any>;
  abstract update(customerId: string, updateCustomerDto: any): Promise<any>;
  abstract virtualExclusion(customerId: string): Promise<any>;
  abstract pagination(filters, pagination): Promise<any>;
  abstract paginationSearch(filters, pagination): Promise<any>;
}
