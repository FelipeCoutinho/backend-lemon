import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { ApiCreatedResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Customer } from './repository/customer.entity';

@ApiTags('customer')
@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  @ApiCreatedResponse({
    description: 'The record has been successfully created.',
    type: Customer,
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createCustomerDto: any) {
    return this.customerService.create(createCustomerDto);
  }
  @ApiQuery({ name: 'filters', required: false })
  @Get()
  findAll(@Param('filters') filters: string, @Query() query?: any) {
    const pagination = query;
    return this.customerService.findAll(filters, pagination);
  }
  @Get('search/:search')
  search(@Param('search') search: string, @Query() query?: any) {
    const filters = query;
    // if (search.length < 3) {
    //   return {
    //     message: 'Search must be at least 3 characters long',
    //   };
    // }
    return this.customerService.search(search, filters);
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customerService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCustomerDto: any) {
    return this.customerService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  async virtualExclusion(@Param('id') id: string) {
    return this.customerService.virtualExclusion(id);
  }
}
