import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CustomerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCustomerDto: any) {
    try {
      const data = await this.prisma.customer.create({
        data: createCustomerDto,
      });
      return data;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async findAll(filters?: any, pagination?: any) {
    filters = !filters ? { active: true } : filters;

    const { skipPage, linesPerPage, quantityOfPages, quantityRecords } =
      await this.pagination(filters, pagination);

    const data = await this.prisma.customer.findMany({
      skip: skipPage,
      take: linesPerPage,
      where: {
        ...filters,
      },
      orderBy: {
        name: 'asc',
      },
    });
    const result = {
      paginas: quantityOfPages,
      quantityRecords,
      data,
    };
    return result;
  }

  async search(filters?: any, pagination?: any) {
    const { skipPage, linesPerPage, quantityOfPages, quantityRecords } =
      await this.paginationSearch(filters, pagination);

    const customers = await this.prisma.customer.findMany({
      skip: skipPage,
      take: linesPerPage,
      where: {
        OR: [...filters],
      },
      orderBy: {
        name: 'asc',
      },
    });
    const result = {
      paginas: quantityOfPages,
      quantityRecords,
      customers,
    };
    return result;
  }

  async findOne(customerId: string) {
    const data = await this.prisma.customer.findUnique({
      where: {
        customerId,
        deletedAt: null,
      },
    });

    return data;
  }

  async findUnique(filter: any) {
    const data = await this.prisma.customer.findUnique({
      where: {
        ...filter,
        deletedAt: null,
      },
    });

    return data;
  }
  async update(customerId: string, updateCustomerDto: any) {
    const data = await this.prisma.customer.update({
      where: {
        customerId,
      },
      data: updateCustomerDto,
    });

    return data;
  }

  async virtualExclusion(customerId: string) {
    const data = await this.prisma.customer.update({
      where: {
        customerId,
      },
      data: {
        active: false,
        deletedAt: new Date(),
      },
    });

    return data;
  }

  async pagination(filters, pagination) {
    const { page, take } = pagination;
    const curretPage = !page ? 0 : Number(page);
    const linesPerPage = !take ? 10 : Number(take);

    const quantityRecords = await this.prisma.customer.count({
      where: {
        ...filters,
      },
    });

    const quantityOfPages = Math.ceil(quantityRecords / linesPerPage);
    const skipPage = linesPerPage * curretPage;

    return { quantityOfPages, skipPage, linesPerPage, quantityRecords };
  }

  async paginationSearch(filters, pagination) {
    const { page, take } = pagination;
    const curretPage = !page ? 0 : Number(page);
    const linesPerPage = !take ? 10 : Number(take);

    const quantityRecords = await this.prisma.customer.count({
      where: {
        OR: [...filters],
        AND: { deletedAt: null },
      },
    });

    const quantityOfPages = Math.ceil(quantityRecords / linesPerPage);
    const skipPage = linesPerPage * curretPage;

    return { quantityOfPages, skipPage, linesPerPage, quantityRecords };
  }
}
