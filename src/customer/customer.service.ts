import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CustomerRepository } from './repository/customer.repository';
import { cnpj } from 'cpf-cnpj-validator';
import {
  CONNECTIONTYPES,
  CONSUMPTIONCLASSES,
  TARIFFMODALITY,
} from './dto/ConsumptionClasses.enum';
import { EligibleOutputSchema } from './schema/output';

@Injectable()
export class CustomerService {
  constructor(private customerRepository: CustomerRepository) {}

  async create(createCustomerDto: CreateCustomerDto) {
    const r = cnpj.isValid(createCustomerDto.documentNumber);
    console.log(r);

    try {
      const filters = {
        documentNumber: createCustomerDto.documentNumber,
      };
      const customerResult = await this.customerRepository.findUnique(filters);

      if (customerResult) {
        throw new Error('Customer already exists');
      }
      const data: EligibleOutputSchema =
        await this.eligibilityValidator(createCustomerDto);

      Object.assign(createCustomerDto.eligible, data.eligible);
      createCustomerDto.description = data.economyAnnualCO2;

      const customerCreated = await this.customerRepository.create(data);

      return customerCreated;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
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
        { documentNumber: { contains: keyUser } },
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

  async eligibilityValidator(createCustomerDto: any) {
    try {
      const customerConsumptionClass =
        await this.customerConsumptionClass(createCustomerDto);
      const tariffModality = await this.tariffModality(createCustomerDto);
      const minimumCustomerConsumption: any =
        await this.minimumCustomerConsumption(createCustomerDto);

      if (!minimumCustomerConsumption.eligible) {
        return {
          customerConsumptionClass,
          tariffModality,
          minimumCustomerConsumption,
        };
      }

      const response: EligibleOutputSchema = {
        additionalProperties: true,
        type: Object,
        required: [''],
        properties: { elegivel: true, economiaAnualDeCO2: 100 },
      };

      return response;
    } catch (error) {
      throw new HttpException(
        error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
      );
    }
  }

  async customerConsumptionClass(createCustomerDto: CreateCustomerDto) {
    if (
      createCustomerDto.consumptionclass === CONSUMPTIONCLASSES.PODERPUBLICO ||
      createCustomerDto.consumptionclass === CONSUMPTIONCLASSES.RURAL
    ) {
      return {
        message: 'Classe de consumo não aceita',
        eligible: false,
      };
    }
  }

  async tariffModality(createCustomerDto: CreateCustomerDto) {
    if (
      createCustomerDto.tariffModality === TARIFFMODALITY.AZUL ||
      createCustomerDto.tariffModality === TARIFFMODALITY.VERDE
    ) {
      return {
        message: 'Modalidade tarifária não aceita',
        eligible: false,
      };
    }
  }

  async minimumCustomerConsumption(createCustomerDto: CreateCustomerDto) {
    const message = '';
    const response = {
      message: 'Consumo muito baixo para tipo de conexão',
      eligible: false,
    };

    const averageConsumption =
      createCustomerDto.historyOfConsumption.reduce(
        (consumer, currentConsumer) => (consumer += currentConsumer),
        0,
      ) / createCustomerDto.historyOfConsumption.length;

    switch (createCustomerDto.connectiontype) {
      case CONNECTIONTYPES.MONOFASICO:
        if (averageConsumption < 400) {
          return response;
        }
        break;
      case CONNECTIONTYPES.BIFASICO:
        if (averageConsumption < 500) {
          return response;
        }
      case CONNECTIONTYPES.TRIFASICO:
        if (averageConsumption < 750) {
          return response;
        }
        break;
    }

    const co2Kg = 0.084;
    const economyAnnualCO2 =
      createCustomerDto.historyOfConsumption.reduce(
        (consumer, currentConsumer) => (consumer += currentConsumer),
        0,
      ) * co2Kg;

    return {
      eligible: true,
      economyAnnualCO2: Math.ceil(economyAnnualCO2),
      message,
    };
  }
}
