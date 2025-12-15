import { PrismaClient } from '@prisma/client'

const isProd = process.env.NODE_ENV === 'production'

const dbHost = isProd ? process.env.SF_ORDERS_DB_HOST || 'sf-orders-db' : 'localhost'
const dbPort = isProd
  ? process.env.SF_ORDERS_DB_PORT || '3306'
  : process.env.SF_ORDERS_DB_PORT || '5432'
const dbUser = process.env.SF_ORDERS_DB_USER || 'orders_user'
const dbPass = encodeURIComponent(process.env.SF_ORDERS_DB_PASSWORD || 'orders_mei_g10_pass')
const dbName = process.env.SF_ORDERS_DB_DB || 'orders_db'

const shadowHost = isProd
  ? process.env.SF_ORDERS_DB_SHADOW_HOST || 'sf-orders-db-shadow'
  : 'localhost'
const shadowPort = isProd
  ? process.env.SF_ORDERS_DB_PORT || '3306'
  : process.env.SF_ORDERS_DB_SHADOW_PORT || process.env.SF_ORDERS_DB_PORT || '5433'
const shadowDb = process.env.SF_ORDERS_DB_DB || 'orders_db'

process.env.SF_ORDERS_DATABASE_URL =
  process.env.SF_ORDERS_DATABASE_URL ||
  `mysql://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}`

process.env.SHADOW_DATABASE_URL =
  process.env.SHADOW_DATABASE_URL ||
  `mysql://${dbUser}:${dbPass}@${shadowHost}:${shadowPort}/${shadowDb}`

export const prisma = new PrismaClient()

export default prisma
