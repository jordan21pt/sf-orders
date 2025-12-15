import prisma from '../config/prisma.js'

type CreateOrderItemInput = {
  product_id: number
  quantity: number
  unit_price: number
  total_price: number
}

type CreateOrderInput = {
  customer_id: number
  status_id: number
  shipment_id: number
  payment_info_id: number
  order_total: number
  brand_id: number
  items: CreateOrderItemInput[]
}

export const orderRepository = {
  listWithItems: (page: number, pageSize: number) => {
    const skip = (page - 1) * pageSize

    return prisma.order.findMany({
      skip,
      take: pageSize,
      orderBy: { created_at: 'desc' },
      include: { items: true },
    })
  },

  list: (page: number, pageSize: number) => {
    const skip = (page - 1) * pageSize

    return prisma.order.findMany({
      skip,
      take: pageSize,
      orderBy: { created_at: 'desc' },
    })
  },

  findByStatus: (page: number, pageSize: number, status_id: number) => {
    const skip = (page - 1) * pageSize

    return prisma.order.findMany({
      where: { status_id: status_id },
      skip,
      take: pageSize,
      orderBy: { created_at: 'desc' },
    })
  },

  findById: (id: number) => {
    return prisma.order.findUnique({
      where: { order_id: id },
      include: { items: true },
    })
  },

  create: (data: CreateOrderInput) => {
    const { items, ...orderData } = data

    return prisma.order.create({
      data: {
        ...orderData,
        items: {
          create: items,
        },
      },
      include: { items: true },
    })
  },

  updateStatus: (id: number, status_id: number) => {
    return prisma.order.update({
      where: { order_id: id },
      data: { status_id },
    })
  },
}
