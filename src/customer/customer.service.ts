import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { cnpj, cpf } from 'cpf-cnpj-validator';
import {
  CONNECTIONTYPES,
  CONSUMPTIONCLASSES,
  TARIFFMODALITY,
} from './dto/ConsumptionClasses.enum';
import { tResponse } from './schema/output';
import { iCustomerRepository } from './repository/prisma.customer.repository';

@Injectable()
export class CustomerService {
  constructor(private customerRepository: iCustomerRepository) {}

  async create(createCustomerDto: CreateCustomerDto) {
    try {
      const isCnpj = cnpj.isValid(createCustomerDto.documentNumber);
      const isCpf = cpf.isValid(createCustomerDto.documentNumber);
      this.isValidField(createCustomerDto);
      if (!isCnpj && !isCpf) {
        return {
          message: 'cpf or cnpj invalid',
        };
      }

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

  async search(keyUser: string, queryFilters?: any): Promise<any> {
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

  async update(customerId: string, updateCustomerDto: any): Promise<any> {
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

  async virtualExclusion(id: string): Promise<any> {
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

  async eligibilityValidator(createCustomerDto: any): Promise<any> {
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
      createCustomerDto.consumptionclass.replace(/\s/g, '') ===
        CONSUMPTIONCLASSES.COMERCIAL ||
      createCustomerDto.consumptionclass.replace(/\s/g, '') ===
        CONSUMPTIONCLASSES.RESIDENCIAL ||
      createCustomerDto.consumptionclass.replace(/\s/g, '') ===
        CONSUMPTIONCLASSES.INDUSTRIAL
    ) {
      return {
        eligible: true,
      };
    }
    return {
      message: 'Classe de consumo não aceita',
      eligible: false,
    };
  }

  async tariffModality(createCustomerDto: CreateCustomerDto): Promise<any> {
    if (
      createCustomerDto.tariffModality === TARIFFMODALITY.CONVENCIONAL ||
      createCustomerDto.tariffModality === TARIFFMODALITY.BRANCA
    ) {
      return {
        eligible: true,
      };
    }
    return {
      message: 'Modalidade tarifária não aceita',
      eligible: false,
    };
  }

  async minimumCustomerConsumption(
    createCustomerDto: CreateCustomerDto,
  ): Promise<any> {
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
      default:
        response;
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

  isValidField(createCustomerDto: any) {
    [createCustomerDto].map((field) => {
      const data = [];
      for (const key in CONSUMPTIONCLASSES) {
        data.push({ consumptionclass: key });
      }
      for (const key in TARIFFMODALITY) {
        data.push({ tariffModality: key });
      }
      for (const key in CONNECTIONTYPES) {
        data.push({ connectiontype: key });
      }

      const consumptionclass = data.find((item) => {
        return item.consumptionclass === field.consumptionclass.toUpperCase();
      });

      const tariffModality = data.find((item) => {
        return item.tariffModality === field.tariffModality.toUpperCase();
      });

      const connectiontype = data.find((item) => {
        return item.connectiontype === field.connectiontype.toUpperCase();
      });

      if (!consumptionclass) throw new Error('Consumptionclass not valid');
      if (!tariffModality) throw new Error('TariffModality not valid');
      if (!connectiontype) throw new Error('Connectiontypes not valid');
    });
  }
}
