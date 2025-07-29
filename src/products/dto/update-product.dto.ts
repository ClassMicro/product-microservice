import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import {  IsString, IsUUID } from 'class-validator';

export class UpdateProductDto extends PartialType(CreateProductDto) {

   @IsString()
   @IsUUID(4, { message: 'El ID debe ser un UUID v4 válido' })
   id : string;

}
