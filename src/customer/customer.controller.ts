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

  @Get('search/:search')
  search(@Param('search') search: string, @Query() query?: any) {
    const filters = query;
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
