import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty } from 'class-validator';
export class CreateCustomerDto {
  @IsNotEmpty()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  name: string;
  @IsEmail()
  @Transform(({ value }) => value.trim())
  email: string;
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  documentNumber: string;
  @ApiProperty({
    enum: ['residencial', 'industrial', 'comercial', 'rural', 'poderPublico'],
  })
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  connectiontype: string;
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  consumptionclass: string;
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  tariffModality: string;
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  historyOfConsumption: [number];
  eligible: boolean;
  description: string;
}
