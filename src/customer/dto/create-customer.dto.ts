import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty } from 'class-validator';
export class CreateCustomerDto {
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  code_register: string;
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  name: string;
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  rg: string;
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  cnpj: string;
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  gender: string;
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  dateBirth: string;
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  phone: string;
  @IsEmail()
  @Transform(({ value }) => value.trim())
  email: string;
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  country: string;
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  zipcode: string;
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  street: string;
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  city: string;
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  number: string;
  @Transform(({ value }) => value.trim())
  complementation: string;
}
