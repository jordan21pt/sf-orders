import { assertExchange, connectRabbit, createChannel, subscribe } from '@rjrcosta/messaging-rabbit'
import { CATALOG_STOCK_REJECTED_V1, StockConfirmedV1 } from '@rjrcosta/contracts'
import { orderRepository } from '../../repository/ordersRepository.js'

const mqUrl = process.env.SF_MQ_URL
const exchange = process.env.SF_MQ_EXCHANGE || 'sf.events'
const prefetch = Number(process.env.SF_MQ_PREFETCH || 10)

const confirmedQueue =
  process.env.SF_ORDERS_STOCK_CONFIRMED_QUEUE || 'sf-orders.stock.confirmed'
const rejectedQueue =
  process.env.SF_ORDERS_STOCK_REJECTED_QUEUE || 'sf-orders.stock.rejected'

const maxRetries = Number(process.env.SF_MQ_MAX_RETRIES || 5)
const retryDelayMs = Number(process.env.SF_MQ_RETRY_DELAY_MS || 5000)

const STATUS_CONFIRMED = 2
const STATUS_CANCELLED = 5

const resolveOrderId = (event: any, rawMsg: any) => {
  const headers = rawMsg?.properties?.headers ?? {}
  return event?.payload?.orderId ?? headers['x-entity-id']
}

export async function startStockResponseConsumer(): Promise<void> {
  if (!mqUrl) {
    throw new Error('SF_MQ_URL is required to start stock response consumer')
  }

  const connection = await connectRabbit(mqUrl)
  const channel = await createChannel(connection, prefetch)
  await assertExchange(channel, exchange, 'topic')

  await subscribe<{ orderId?: string }>({
    channel,
    exchange,
    queue: confirmedQueue,
    routingKey: StockConfirmedV1.type,
    maxRetries,
    retryDelayMs,
    onMessage: async (event, rawMsg) => {
      const orderId = resolveOrderId(event, rawMsg)
      console.log('stock confirmed',orderId)
      if (!orderId) {
        throw new Error('Missing orderId on stock.confirmed event')
      }
      
      await orderRepository.updateStatus(Number(orderId), STATUS_CONFIRMED)
    },
  })

  await subscribe<{ orderId?: string }>({
    channel,
    exchange,
    queue: rejectedQueue,
    routingKey: CATALOG_STOCK_REJECTED_V1,
    maxRetries,
    retryDelayMs,
    onMessage: async (event, rawMsg) => {
      const orderId = resolveOrderId(event, rawMsg)
      console.log('cancelado', orderId)
      if (!orderId) {
        throw new Error('Missing orderId on stock.rejected event')
      }
      await orderRepository.updateStatus(Number(orderId), STATUS_CANCELLED)
    },
  })
}
