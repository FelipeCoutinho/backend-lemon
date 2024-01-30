import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CustomerRepository } from './repository/customer.repository';
import { cnpj, cpf } from 'cpf-cnpj-validator';
import {
  CONNECTIONTYPES,
  CONSUMPTIONCLASSES,
  TARIFFMODALITY,
} from './dto/ConsumptionClasses.enum';
import { tResponse } from './schema/output';

@Injectable()
export class CustomerService {
  constructor(private customerRepository: CustomerRepository) {}

  async create(createCustomerDto: CreateCustomerDto) {
    const isCnpj = cnpj.isValid(createCustomerDto.documentNumber);
    const isCpf = cpf.isValid(createCustomerDto.documentNumber);

    if (!isCnpj && !isCpf) {
      return {
        message: 'cpf or cnpj invalid',
      };
    }

    try {
      const filters = {
        documentNumber: createCustomerDto.documentNumber,
      };

      const customerResult = await this.customerRepository.findUnique(filters);

      if (customerResult) {
        throw new Error('Customer already exists');
      }
      const result: any = await this.eligibilityValidator(createCustomerDto);

      if (!result.eligible) {
        return {
          eligible: result.eligible,
          reasonsofineligibility: [...result.reasonsofineligibility],
        };
      }

      const newCustomer = {
        name: createCustomerDto.name,
        documentNumber: createCustomerDto.documentNumber,
        connectiontype: createCustomerDto.connectiontype,
        consumptionclass: createCustomerDto.consumptionclass,
        tariffModality: createCustomerDto.tariffModality,
        historyOfConsumption: createCustomerDto.historyOfConsumption,
        eligible: result.eligible,
        economyAnnualCO2: result.economyAnnualCO2,
      };

      const customerCreated = await this.customerRepository.create(newCustomer);

      return {
        eligible: true,
        economyAnnualCO2: customerCreated.economyAnnualCO2,
        message: 'create customer sucessfuly',
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async search(keyUser: string, queryFilters?: any) {
    try {
      const filters = [
        { name: { contains: keyUser, mode: 'insensitive' } },
        { documentNumber: { contains: keyUser } },
      ];

      const result: any = await this.customerRepository.search(
        filters,
        queryFilters,
      );

      const response = result.customers.map((customer) => {
        return {
          customerId: customer.customerId,
          name: customer.name,
          economyAnnualCO2: customer.economyAnnualCO2,
          elegivel: customer.eligible,
        };
      });

      return response;
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
      const customer = await this.customerRepository.virtualExclusion(id);
      if (customer) {
        return {
          status: HttpStatus.OK,
          message: 'Customer disabled successfully',
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
      const customerConsumptionClass: tResponse =
        await this.customerConsumptionClass(createCustomerDto);

      const tariffModality: tResponse =
        await this.tariffModality(createCustomerDto);

      const minimumCustomerConsumption: any =
        await this.minimumCustomerConsumption(createCustomerDto);

      if (
        !customerConsumptionClass.eligible ||
        !tariffModality.eligible ||
        !minimumCustomerConsumption.eligible
      ) {
        const response = {
          eligible: false,
          reasonsofineligibility: [
            customerConsumptionClass.message,
            tariffModality.message,
            minimumCustomerConsumption.message,
          ],
        };

        return response;
      }

      const response = {
        economyAnnualCO2: minimumCustomerConsumption.economyAnnualCO2,
        eligible: minimumCustomerConsumption.eligible,
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

  async customerConsumptionClass(
    createCustomerDto: CreateCustomerDto,
  ): Promise<any> {
    if (
      createCustomerDto.consumptionclass === CONSUMPTIONCLASSES.PODERPUBLICO ||
      createCustomerDto.consumptionclass === CONSUMPTIONCLASSES.RURAL
    ) {
      return {
        message: 'Classe de consumo não aceita',
        eligible: false,
      };
    }
    return {
      eligible: true,
    };
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
    return {
      eligible: true,
    };
  }

  async minimumCustomerConsumption(createCustomerDto: CreateCustomerDto) {
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
        break;
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
      economyAnnualCO2: Number(economyAnnualCO2.toFixed(2)),
    };
  }
}
