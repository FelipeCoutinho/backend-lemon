import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty } from 'class-validator';
export class CreateCustomerDto {
  @IsNotEmpty()
  @IsNotEmpty()
  name: string;
  @IsEmail()
  email: string;
  documentNumber: string;
  @ApiProperty({
    enum: ['residencial', 'industrial', 'comercial', 'rural', 'poderPublico'],
  })
  @IsNotEmpty()
  @Transform(({ value }) => value.toUpperCase())
  connectiontype: string;
  @IsNotEmpty()
  @Transform(({ value }) => value.toUpperCase())
  consumptionclass: string;
  @IsNotEmpty()
  historyOfConsumption: [number];
  @IsNotEmpty()
  @Transform(({ value }) => value.toUpperCase())
  tariffModality: string;
}
