import prisma from '../src/config/prisma.js'
import { productsMockData } from '../src/mock/mockProducts.js'

// Exemplo de payload (podes importar isto de um ficheiro JSON)
const pedido = {
  customer_id: 1,
  brand_id: 10,
  items: [
    { product_id: 1, quantity: 2 },
    { product_id: 5, quantity: 1 },
  ],
}

async function main() {
  const { customer_id, brand_id, items } = pedido

  let order_total = 0

  const itemsToCreate = items.map((item) => {
    const product = productsMockData.find((p) => p.productId === item.product_id)

    if (!product) {
      throw new Error(`Invalid product_id: ${item.product_id}`)
    }

    if (product.stock < item.quantity) {
      throw new Error(`Insufficient stock for product_id: ${item.product_id}`)
    }

    const unit_price = product.price
    const total_price = unit_price * item.quantity
    order_total += total_price

    return {
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price,
      total_price,
    }
  })

  const order = await prisma.order.create({
    data: {
      customer_id,
      brand_id,
      status_id: 1,
      shipment_id: 1,
      payment_info_id: 1,
      order_total,
      items: {
        create: itemsToCreate,
      },
    },
    include: {
      items: true,
    },
  })

  console.log(order)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
