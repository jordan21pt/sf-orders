import { orderRepository } from '../repository/ordersRepository.js'
import { customersMockData } from '../mock/mockCustomers.js'
import { productsMockData } from '../mock/mockProducts.js'
import { statusMockData } from '../mock/mockStatus.js'
import { shipmentMockData } from '../mock/mockShippment.js'
import { paymentMockData } from '../mock/mockPayment.js'
import { OrderItem } from '@prisma/client'
import { assertExchange, buildEvent, connectRabbit, createChannel, publish } from '@rjrcosta/messaging-rabbit'
import { OrderCancelledV1, OrderCreatedV1 } from '@rjrcosta/contracts'
import { randomUUID } from 'crypto'

const mqUrl = process.env.SF_MQ_URL
const eventsExchange = process.env.SF_MQ_EXCHANGE || 'sf.events'
const ordersCreatedKey = OrderCreatedV1.type
const ordersCancelledKey = OrderCancelledV1.type
const defaultCurrency = process.env.SF_CURRENCY || 'EUR'
const prefetch = Number(process.env.SF_MQ_PREFETCH || 10)

let channelPromise: Promise<import('amqplib').Channel> | null = null

const getChannel = async () => {
  if (channelPromise) return channelPromise
  if (!mqUrl) {
    throw new Error('SF_MQ_URL is required')
  }
  channelPromise = connectRabbit(mqUrl).then(async (connection) => {
    const channel = await createChannel(connection, prefetch)
    await assertExchange(channel, eventsExchange, 'topic')
    return channel
  })
  return channelPromise
}

const publishOrderCreated = async (order: any) => {
  const traceId = randomUUID()
  try {
    const channel = await getChannel()
    const event = buildEvent({
      type: ordersCreatedKey,
      source: 'sf-orders',
      payload: {
        orderId: String(order.order_id ?? order.id),
        customerId: String(order.customer_id),
        total: Number(order.order_total),
        currency: defaultCurrency,
      },
    })
    await publish(channel, eventsExchange, ordersCreatedKey, event, {
      headers: {
        'x-entity-id': String(order.order_id ?? order.id),
        'x-trace-id': traceId,
      },
    })
  } catch (err) {
    console.error('[orders] failed to publish orders.order.created.v1', err)
  }
}

const publishOrderCancelled = async (order: any, reason: string) => {
  const traceId = randomUUID()
  try {
    const channel = await getChannel()
    const event = buildEvent({
      type: ordersCancelledKey,
      source: 'sf-orders',
      payload: {
        orderId: String(order.order_id ?? order.id),
        reason,
      },
    })
    await publish(channel, eventsExchange, ordersCancelledKey, event, {
      headers: {
        'x-entity-id': String(order.order_id ?? order.id),
        'x-trace-id': traceId,
      },
    })
  } catch (err) {
    console.error('[orders] failed to publish orders.order.cancelled.v1', err)
  }
}


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

    // Fire-and-forget ingestion to analytics
    publishOrderCreated(order)

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
    publishOrderCancelled(updatedOrder, 'cancelled_by_user')
    return updatedOrder
  },
}
