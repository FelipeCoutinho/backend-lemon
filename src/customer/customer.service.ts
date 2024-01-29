import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CustomerRepository } from './repository/customer.repository';

@Injectable()
export class CustomerService {
  constructor(private customerRepository: CustomerRepository) {}

  async create(createCustomerDto: CreateCustomerDto) {
    let userResult: any;

    try {
      // cnpj
      const customerResult = await this.customerRepository.findUnique({
        cnpj: createCustomerDto.cnpj,
      });

      if (customerResult) {
        throw new Error('Customer already exists');
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }

    try {
    } catch (error) {
      throw new HttpException(
        error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
      );
    }

    try {
      Object.assign(createCustomerDto, { userId: userResult.user.userId });
      const customer = await this.customerRepository.create(createCustomerDto);

      if (userResult) return customer;
    } catch (error) {
      throw new HttpException(
        error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
      );
    }
  }

  findAll(filters?: any, pagination?: any) {
    try {
      return this.customerRepository.findAll(filters, pagination);
    } catch (error) {
      throw new HttpException(
        error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
      );
    }
  }

  async search(keyUser: string, queryFilters?: any) {
    try {
      const filters = [
        { name: { contains: keyUser, mode: 'insensitive' } },
        { code_register: { contains: keyUser } },
        { email: { contains: keyUser, mode: 'insensitive' } },
        { rg: { contains: keyUser } },
        { cnpj: { contains: keyUser } },
        { phone: keyUser },
      ];

      const result = await this.customerRepository.search(
        filters,
        queryFilters,
      );
      return result;
    } catch (error) {
      throw new HttpException(
        error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
      );
    }
  }
  findOne(customerId: any) {
    try {
      return this.customerRepository.findOne(customerId);
    } catch (error) {
      throw new HttpException(
        error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
      );
    }
  }

  async update(customerId: string, updateCustomerDto: any) {
    try {
      const customer = await this.customerRepository.update(
        customerId,
        updateCustomerDto,
      );
      if (customer) {
        return {
          status: HttpStatus.OK,
          message: 'Customer updated successfully',
        };
      }
    } catch (error) {
      throw new HttpException(
        error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
      );
    }
  }

  async virtualExclusion(id: string) {
    try {
      const user = await this.customerRepository.virtualExclusion(id);
      if (user) {
        return {
          status: HttpStatus.OK,
          message: 'User disabled successfully',
        };
      }
    } catch (error) {
      throw new HttpException(
        error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
      );
    }
  }
}
