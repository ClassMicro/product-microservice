import { BadRequestException, HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {

private readonly logger = new Logger('ProductsService');
  onModuleInit() {
    this.$connect()
      .then(() => this.logger.log('connectado a la base de datos'))
      .catch((error) => this.logger.error('Error connecting to the database:', error));
  }
  create(createProductDto: CreateProductDto) {

     return this.product.create({
      data : createProductDto
     });
  }

 async  findAll( paginationdto : PaginationDto) {
    const totalpaginas = await this.product.count();
    const lastpage =  Math.ceil(totalpaginas / paginationdto.limit);
    const {page , limit } = paginationdto;
    return {
      data: await this.product.findMany({
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

   async findOne(id: number) {
    const product = await this.product.findUnique({
      where  : {id : id , avaliable: true}
    })
    if (!product) {
      throw new RpcException({
        message : `producto buscado con el #${id} no encontrado`,
        status : HttpStatus.BAD_REQUEST
      });
    }
    return product;
  }

   async update(id: number, updateProductDto: UpdateProductDto) {
    if (Object.keys(updateProductDto).length === 0) {
      throw new BadRequestException('no hay nada que actualizar');
    }
    const product = await this.product.findUnique({
      where: { id: id  , avaliable: true}
    });
    if (!product) {
      throw new BadRequestException(`Product with id ${id} not found`);
    }
    const {id: _, ...data} = updateProductDto;
    await this.product.update({
      where: { id: id },
      data: data
    });

    return product;
  }

   async remove(id: number) {

    await this.findOne(id); // Ensure the product exists before attempting to delete it
    const product = await this.product.findUnique({
      where: { id: id , avaliable: true}
    });
    if (!product) {
      throw new BadRequestException(`Product with id ${id} not found`);
    }
    const deleteproduct = await this.product.update({
      where: { id: id },
      data: { avaliable: false }
    })
    return {
      message: `producto con el ${id} ha sido eliminado exitosamente`,
      product: deleteproduct
    };
  }

   async validateProduct(id : number[])
  {
   // quitamos todos los datos duplicados de id que viene en nuestro arrays
   id = Array.from( new Set(id));
    const products = await this.product.findMany({
      where: {
        id: {
          in: id,
        },
        avaliable: true
      }
    });
    if (products.length !== id.length) {
      throw new RpcException({
        message: `no hay productos con los IDs proporcionados`,
        status: HttpStatus.NOT_FOUND
      });
    }
    // Verificamos si hay productos que no existen en la base de datos
    const notFoundIds = id.filter(productId => !products.some(product => product.id === productId));
    if (notFoundIds.length > 0) {
      throw new RpcException({
        message: `producto con el id ${notFoundIds} no encontrado`,
        status: HttpStatus.NOT_FOUND
      });
    }
    return products;
  }


}
