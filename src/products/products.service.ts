import { BadRequestException, HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common';
import { RpcException } from '@nestjs/microservices';
import { Product } from './entities/product.entity';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { validate as isValidUUID } from 'uuid';

@Injectable()
export class ProductsService  {
  constructor(
    @InjectRepository(Product) private readonly productRepository : Repository<Product>
  ){}

private readonly logger = new Logger('ProductsService');
 

  create(createProductDto: CreateProductDto) {

     return this.productRepository.create({
      ...createProductDto
     });
  }

 async  findAll( paginationdto : PaginationDto) {
    const totalpaginas = await this.productRepository.count();
    const lastpage =  Math.ceil(totalpaginas / paginationdto.limit);
    const {page , limit } = paginationdto;
    return {
      data: await this.productRepository.find({
        take: limit,
        skip: (page - 1) * limit,
        where :{ avaliable: true}
      }),
      meta: {
        total: totalpaginas,
        page: page,
        lastpage : lastpage,
      }
    }
}

   async findOne(id: string) {
    const product = await this.productRepository.findOne({
      where :{
        id: id,
        avaliable: true
      }

    })
    if (!product) {
      throw new RpcException({
        message : `producto buscado con el #${id} no encontrado`,
        status : HttpStatus.BAD_REQUEST
      });
    }
    return product;
  }

   async update(id: string, updateProductDto: UpdateProductDto) {
    if (Object.keys(updateProductDto).length === 0) {
      throw new BadRequestException('no hay nada que actualizar');
    }
    const product = await this.productRepository.findOne({
      where: { id: id  , avaliable: true}
    });
    if (!product) {
      throw new BadRequestException(`Product with id ${id} not found`);
    }
    const {id: _, ...data} = updateProductDto;
    await this.productRepository.update(
      { id: id },
      data
    );

    return product;
  }

   async remove(id: string) {

    await this.findOne(id); // Ensure the product exists before attempting to delete it
    const product = await this.productRepository.findOne({
      where: { id: id , avaliable: true}
    });
    if (!product) {
      throw new BadRequestException(`Product with id ${id} not found`);
    }
    const deleteproduct = await this.productRepository.update(
      { id: id },
      { avaliable: false }
    )
    return {
      message: `producto con el ${id} ha sido eliminado exitosamente`,
      product: deleteproduct
    };
  }

   async validateProduct(ids : string[])
  {
   // Limpiar y eliminar duplicados de UUIDs
   const cleanedIds = ids.map(id => id.trim().replace(/[«»]/g, '')); // Quitar caracteres especiales
   const uniqueIds = Array.from(new Set(cleanedIds)); // Eliminar duplicados
   
   // Validar que todos los IDs sean UUIDs válidos
   const invalidIds = uniqueIds.filter(id => !isValidUUID(id));
   
   if (invalidIds.length > 0) {
     throw new RpcException({
       message: `UUIDs inválidos encontrados: ${invalidIds.join(', ')}. Formato esperado: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`,
       status: HttpStatus.BAD_REQUEST
     });
   }
   
   // Filtrar solo los IDs válidos
   const validIds = uniqueIds.filter(id => isValidUUID(id));
   
   if (validIds.length === 0) {
     throw new RpcException({
       message: 'No se proporcionaron IDs válidos',
       status: HttpStatus.BAD_REQUEST
     });
   }
   
    const products = await this.productRepository.find({
      where: {
        id: In(validIds)
      }
    });
    if (products.length !== validIds.length) {
      throw new RpcException({
        message: `no hay productos con los IDs proporcionados`,
        status: HttpStatus.NOT_FOUND
      });
    }
    
    return products;
  }

}