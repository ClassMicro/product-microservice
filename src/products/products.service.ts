import { BadRequestException, HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common';
import { RpcException } from '@nestjs/microservices';
import { Product } from './entities/product.entity';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

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
   // Quitamos todos los datos duplicados de UUIDs que vienen en nuestro array
   // Array.from(new Set()) elimina duplicados automáticamente para strings/UUIDs
   ids = Array.from( new Set(ids));
    const products = await this.productRepository.find({
      where: {
        id: In(ids)
      }
    });
    if (products.length !== ids.length) {
      throw new RpcException({
        message: `no hay productos con los IDs proporcionados`,
        status: HttpStatus.NOT_FOUND
      });
    }
    
    return products;
  }

}