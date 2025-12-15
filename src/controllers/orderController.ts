import { Request, Response } from 'express'
import { orderService } from '../services/orderServices.js'

// List all orders -- GET http://localhost:7551/orders?page=2&pageSize=5
export async function listOrders(req: Request, res: Response) {
  try {
    const page = req.query.page ? Number(req.query.page) : 1
    const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 10
    const orders = await orderService.listOrders(page, pageSize)
    res.status(200).json(orders)
  } catch (error) {
    res.status(500).json({
      message: `An error occurred while listing orders, with the following error: ${error}`,
    })
  }
}

// List all orders with items -- GET http://localhost:7551/orders/with-items?page=2&pageSize=5
export async function listOrdersWithItems(req: Request, res: Response) {
  try {
    const page = req.query.page ? Number(req.query.page) : 1
    const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 10
    const orders = await orderService.listOrdersWithItems(page, pageSize)
    res.status(200).json(orders)
  } catch (error) {
    res.status(500).json({
      message: `An error occurred while listing orders with items, with the following error: ${error}`,
    })
  }
}

// Filter orders
export async function filterOrders(req: Request, res: Response) {
  try {
    const statusId = Number(req.query.statusId)
    if (!statusId) {
      return res.status(400).json({ message: 'Missing required fields!' })
    }
    const page = Number(req.query.page) || 1
    const pageSize = Number(req.query.pageSize) || 10
    const orders = await orderService.filterOrders(statusId, page, pageSize)
    res.status(200).json(orders)
  } catch (error) {
    res.status(500).json({
      message: `An error occurred while filtering orders, with the following error: ${error}`,
    })
  }
}

// Get order by ID
export async function getOrderById(req: Request, res: Response) {
  try {
    const id = Number(req.params.id)
    if (!id) return res.status(400).json({ message: 'Missing required fields!' })
    const order = await orderService.getOrderById(id)
    if (!order) return res.status(404).json({ message: 'Order not found!' })
    res.status(200).json(order)
  } catch (error) {
    res.status(500).json({
      message: `An error occurred while retrieving the order, with the following error: ${error}`,
    })
  }
}

// Create a new order
export async function createOrder(req: Request, res: Response) {
  try {
    const { customer_id, brand_id, items } = req.body
    if (!customer_id || !brand_id || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Missing required fields' })
    }
    const order = await orderService.createOrder(customer_id, brand_id, items)
    return res.status(201).json(order)
  } catch (error: any) {
    const status = error.statusCode ?? 500
    const message =
      error.message ??
      `An error occurred while creating the order, with the following error: ${error}`
    res.status(status).json({ message })
  }
}

// Cancel an order
export async function cancelOrder(req: Request, res: Response) {
  try {
    const order_id = Number(req.params.id)
    if (!order_id) {
      return res.status(400).json({ message: 'Invalid order ID' })
    }

    const updatedOrder = await orderService.cancelOrder(order_id)
    res.status(200).json({ message: 'Order cancelled successfully', order: updatedOrder })
  } catch (error: any) {
    const status = error.statusCode ?? 500
    const message =
      error.message ??
      `An error occurred while cancelling the order, with the following error: ${error}`
    res.status(status).json({ message })
  }
}
