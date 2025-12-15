import { Router } from 'express'
import {
  listOrders,
  listOrdersWithItems,
  getOrderById,
  createOrder,
  filterOrders,
  cancelOrder,
} from '../controllers/orderController.js'

const router = Router()

/**
 * @openapi
 * /orders:
 *   get:
 *     summary: List all orders, without items, with pagination.
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number (default 1).
 *       - in: query
 *         name: pageSize
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of orders per page (default 10).
 *     responses:
 *       200:
 *         description: List of orders without items.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ListOfOrdersSimplified'
 *       500:
 *         description: Internal server error.
 */
router.get('/', listOrders)

/**
 * @openapi
 * /orders/with-items:
 *   get:
 *     summary: List all orders, with items, with pagination.
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number (default 1).
 *       - in: query
 *         name: pageSize
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of orders per page (default 10).
 *     responses:
 *       200:
 *         description: List of orders with items, with pagination.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ListOfOrdersSimplified'
 *       500:
 *         description: Internal server error.
 */
router.get('/with-items', listOrdersWithItems)

/**
 * @openapi
 * /orders/filter:
 *   get:
 *     summary: List all orders with specific category.
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: query
 *         name: statusId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Status ID to filter orders.
 *     responses:
 *       200:
 *         description: List of orders without items.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ListOfOrdersSimplified'
 *       500:
 *         description: Internal server error.
 */
router.get('/filter', filterOrders)

/**
 * @openapi
 * /orders/:id:
 *   get:
 *     summary: Get an order by ID.
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number (default 1).
 *       - in: query
 *         name: pageSize
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of orders per page (default 10).
 *     responses:
 *       200:
 *         description: List of orders without items.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/OrderSummary'
 *       500:
 *         description: Internal server error.
 */
router.get('/:id', getOrderById)

/**
 * @openapi
 * /orders:
 *   post:
 *     summary: Create a new order.
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number (default 1).
 *       - in: query
 *         name: pageSize
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of orders per page (default 10).
 *     responses:
 *       200:
 *         description: List of orders without items.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/OrderSummary'
 *       500:
 *         description: Internal server error.
 */
router.post('/', createOrder)

/**
 * @openapi
 * /orders/:id/cancel:
 *   post:
 *     summary: Cancel an order by ID.
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number (default 1).
 *       - in: query
 *         name: pageSize
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of orders per page (default 10).
 *     responses:
 *       200:
 *         description: List of orders without items.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/OrderSummary'
 *       500:
 *         description: Internal server error.
 */
router.post('/:id/cancel', cancelOrder)

export default router
