# sf-orders

A microservice that will be responsible to manage the order parts of SupplyFlavors eco system

How to run this service

At the project root:
1: run 'npm i' to install dependecies
2: rename 'ex.env' to 'env' -> it is a bad pratice to share the env file, only doing it because it's an academic project
3: run 'docker compose up' or 'docker compose up -d'
4: run 'npm run dev' -> it will run the prisma migrate and the api

Also, at the root you can find an postman collection that you can import for testing the api.

# Run docker image locally:

docker build -t sf-orders .

docker run --rm \  
 -e SF_ORDERS_DB_DB=orders_db \
 -e SF_ORDERS_DB_PORT=5432 \
 -e SF_ORDERS_API_PORT=7551 \
 -e SF_ORDERS_DB_USER=orders_user \
 -e SF_ORDERS_DB_PASSWORD=orders_mei_g10_pass \
 -e SF_ORDERS_DATABASE_URL="mysql://orders_user:orders_mei_g10_pass@localhost:5432/orders_db" \
 -e SF_ORDERS_DB_SHADOW_PORT=5433 \
 -e SHADOW_DATABASE_URL="mysql://orders_user:orders_mei_g10_pass@localhost:5433/orders_db" \
 -p 7551:7551 \
 sf-orders

# RUN migrations:

npx prisma db seed

to populate using seed.ts
