import { Controller, ParseIntPipe, ParseUUIDPipe } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto, UuidValidationPipe } from 'src/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // @Post()
  @MessagePattern({cmd : 'createProduct'})
  create(@Payload() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @MessagePattern({cmd : 'findAllProducts'})
  findAll( @Payload() paginadto : PaginationDto) {
    return this.productsService.findAll(paginadto)
  }

  @MessagePattern({cmd : 'findOneProduct'})
  findOne(@Payload('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id);
  }

  @MessagePattern({cmd : 'updateProduct'})
  update(@Payload() updateProductDto: UpdateProductDto) {
    return this.productsService.update( updateProductDto.id, updateProductDto);
  }

  @MessagePattern({cmd : 'removeProduct'})
  remove(@Payload('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
  
  @MessagePattern({cmd : 'validateproduct'})
  validateProduct(@Payload() ids : string[]) {
    return this.productsService.validateProduct(ids);
  }
}
