import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { validate as isValidUUID } from 'uuid';

@Injectable()
export class UuidValidationPipe implements PipeTransform {
  transform(value: string) {
    if (!value) {
      throw new BadRequestException('ID es requerido');
    }

    // Limpiar caracteres especiales que pueden venir del frontend
    const cleanedValue = value.trim().replace(/[«»]/g, '');
    
    if (!isValidUUID(cleanedValue)) {
      throw new BadRequestException(`"${value}" no es un UUID válido.`);
    }
    
    return cleanedValue;
  }
}
