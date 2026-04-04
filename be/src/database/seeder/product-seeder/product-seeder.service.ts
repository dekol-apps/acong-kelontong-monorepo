import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Brand, BrandDocument } from 'src/modules/brand/brand.schema';
import { Product, ProductDocument } from 'src/modules/product/product.schema';
import { toSku } from 'src/utils/helper';

@Injectable()
export class ProductSeederService {

  constructor(
    @InjectModel(Brand.name) private readonly brandModel: Model<BrandDocument>,
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
  ) { }

  async run() {
    const seedBP = [
      {
        brand: {
          brand_name: 'Indomie',
          brand_description: 'Mie Instan',
        },
        products: [
          {
            product_name: 'Indomie Goreng 85g',
            product_description: 'Indomie goreng kecil',
            unit_of_measure: 'PCS',
          },
          {
            product_name: 'Indomie Soto 75g',
            product_description: 'Indomie kuah soto kecil',
            unit_of_measure: 'PCS',
          }
        ]
      },
      {
        brand: {
          brand_name: 'Aqua',
          brand_description: 'Air minum',
        },
        products: [{
          product_name: 'Aqua 600ml',
          product_description: 'Aqua botol kecil',
          unit_of_measure: 'PCS',
        }]
      },
      {
        brand: {
          brand_name: 'Ultra Milk',
          brand_description: 'Susu'
        },
        products: [{
          product_name: 'Ultra Milk 200ml',
          product_description: 'Susu kotak ultra medium',
          unit_of_measure: 'PCS',
        }]
      }
    ];
    for (const item of seedBP) {
      let brandVal;
      const existingBrand = await this.brandModel.findOne({ brand_name: item.brand.brand_name });
      if (existingBrand) {
        brandVal = existingBrand
      } else {
        const newBrand = await this.brandModel.create(item.brand)
        brandVal = newBrand
      }
      console.info(`🚀 Seeded Brand: ${brandVal.brand_name}`);

      for (const product of item.products) {
        let productVal;
        const product_sku = toSku(`${product.product_name}_${brandVal.brand_name}_${product.unit_of_measure}`);
        const existingProduct = await this.productModel.findOne({ product_sku });
        if (existingProduct) {
          productVal = existingProduct
        } else {
          const newProduct = await this.productModel.create({
            ...product,
            product_sku,
            barcode: new Date().getTime().toString(),
            brand: brandVal._id
          })
          productVal = newProduct
        }
        console.info(`🚀 Seeded Product: ${productVal.product_name}`);
      }
    }
  }
}
