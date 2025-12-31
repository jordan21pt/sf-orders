import { orderRepository } from '../repository/ordersRepository.js'
import { customersMockData } from '../mock/mockCustomers.js'
import { productsMockData } from '../mock/mockProducts.js'
import { statusMockData } from '../mock/mockStatus.js'
import { shipmentMockData } from '../mock/mockShippment.js'
import { paymentMockData } from '../mock/mockPayment.js'
import { OrderItem } from '@prisma/client'
// import { buildEvent, connectRabbit, createChannel, publish, assertExchange } from 'sf-messaging-rabbit'
import { randomUUID } from 'crypto'

// const mqUrl = process.env.SF_MQ_URL
// const eventsExchange = process.env.SF_MQ_EXCHANGE || 'sf.events'
// const ordersCreatedKey = process.env.SF_MQ_ORDERS_CREATED_KEY || 'orders.created.v1'

// let channelPromise: Promise<import('amqplib').Channel> | null = null

// const getChannel = async () => {
//   if (channelPromise) return channelPromise
//   if (!mqUrl) {
//     throw new Error('SF_MQ_URL is required')
//   }
//   channelPromise = connectRabbit(mqUrl).then(async (connection) => {
//     const channel = await createChannel(connection)
//     await assertExchange(channel, eventsExchange, 'topic')
//     return channel
//   })
//   return channelPromise
// }

// const publishOrderCreated = async (order: any) => {
//   const traceId = randomUUID()
//   try {
//     const channel = await getChannel()
//     const event = buildEvent({
//       type: ordersCreatedKey,
//       source: 'sf-orders',
//       payload: {
//         order_id: order.order_id,
//         customer_id: order.customer_id,
//         brand_id: order.brand_id,
//         status_id: order.status_id,
//         shipment_id: order.shipment_id,
//         payment_info_id: order.payment_info_id,
//         order_total: order.order_total,
//         items: order.items ?? order.Items ?? [],
//       },
//     })
//     await publish(channel, eventsExchange, ordersCreatedKey, event, {
//       headers: {
//         'x-entity-id': order.order_id,
//         'x-trace-id': traceId,
//       },
//     })
//   } catch (err) {
//     console.error('[orders] failed to publish orders.created', err)
//   }
// }

export const orderService = {
  listOrders: async (page?: number, pageSize?: number) => {
    const safePage = page && page > 0 ? page : 1
    const safePageSize = pageSize && pageSize > 0 ? pageSize : 10
    const orders = await orderRepository.list(safePage, safePageSize)
    return orders
  },

  listOrdersWithItems: async (page?: number, pageSize?: number) => {
    const safePage = page && page > 0 ? page : 1
    const safePageSize = pageSize && pageSize > 0 ? pageSize : 10
    const orders = await orderRepository.listWithItems(safePage, safePageSize)
    return orders
  },

  filterOrders: async (statusId: number, page?: number, pageSize?: number) => {
    const safePage = page && page > 0 ? page : 1
    const safePageSize = pageSize && pageSize > 0 ? pageSize : 10
    const orders = await orderRepository.findByStatus(safePage, safePageSize, statusId)
    return orders
  },

  getOrderById: async (id: number) => {
    const orders = await orderRepository.findById(id)
    return orders
  },

  createOrder: async (customer_id: number, brand_id: number, items: OrderItem[]) => {
    let orderTotal = 0
    const customer = customersMockData.find((c) => c.customerId === customer_id)
    if (!customer) {
      const error: any = new Error('Invalid customer_id!')
      error.statusCode = 400
      throw error
    }

    const enrichedItems = items.map((item: { product_id: number; quantity: number }) => {
      const product = productsMockData.find((p) => p.productId === item.product_id)!

      if (!product) {
        const error: any = new Error(`Invalid product_id: ${item.product_id}`)
        error.statusCode = 400
        throw error
      }

      const unit_price = product.price
      const total_price = unit_price * item.quantity
      orderTotal += total_price
      return {
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price,
        total_price,
      }
    })

    const order = await orderRepository.create({
      customer_id,
      brand_id,
      order_total: orderTotal,
      status_id: statusMockData[0].status_id, // Default to PENDING
      shipment_id: shipmentMockData[0].shipment_status_id, // Default to PENDING
      payment_info_id: paymentMockData[0].payment_status_id, // Default to AWAITING
      items: enrichedItems,
    })

    // // Fire-and-forget ingestion to analytics
    // publishOrderCreated(order)

    return order
  },

  cancelOrder: async (id: number) => {
    const order = await orderRepository.findById(id)
    if (!order) {
      const error: any = new Error('Order not found')
      error.statusCode = 404
      throw error
    }

    if (order.status_id === 5) {
      // Assuming status_id 5 means 'Cancelled'
      const error: any = new Error('Order is already cancelled')
      error.statusCode = 400
      throw error
    }

    if (order.status_id !== 1 && order.status_id !== 2) {
      const error: any = new Error('Only orders with status Pending or Confirmed can be cancelled')
      error.statusCode = 400
      throw error
    }

    const updatedOrder = await orderRepository.updateStatus(id, 5)
    return updatedOrder
  },
}
