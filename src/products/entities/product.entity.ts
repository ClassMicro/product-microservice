import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Product {

    @PrimaryGeneratedColumn('uuid')
    id : string;

    @Column({ type: 'varchar', length: 255 })
    name : string

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price : number;

    @Column({ type: 'boolean', default: true })
    avaliable : boolean;

    @Column({ type: 'text', nullable: true })
    description: string;

}
