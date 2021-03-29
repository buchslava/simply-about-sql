# Unit 3

## Let's create a data structure

```sql
CREATE TABLE customer (
  id int NOT NULL AUTO_INCREMENT,
  name varchar(255) NOT NULL,
  surname varchar(255) NOT NULL,
  birth_date date NOT NULL,
  registration_date datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  comment text DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY key_person (name, surname, birth_date),
  CONSTRAINT constraint_date_diff CHECK (registration_date>birth_date)
);

-- INSERT INTO customer (name, surname, birth_date) VALUES('Bill', 'Gates', '2100-10-28');
INSERT INTO customer (id, name, surname, birth_date) VALUES(1, 'Bill', 'Gates', '1955-10-28');
INSERT INTO customer (id, name, surname, birth_date) VALUES(2, 'Jeff', 'Bezos', '1964-01-12');
```

### Simple selects

```sql
SELECT * FROM customer;
SELECT * FROM customer WHERE id=2;
SELECT name, birth_date FROM customer WHERE name='Jeff';
SELECT * FROM customer WHERE name LIKE '%s';
SELECT * FROM customer WHERE name LIKE 's%';
```

### Continue...

```sql
CREATE TABLE service (
  id int NOT NULL AUTO_INCREMENT,
  name varchar(255) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY key_service (name)
);

INSERT INTO service (name) VALUES('Lawyer Support');
INSERT INTO service (name) VALUES('Pet Groomer');
INSERT INTO service (name) VALUES('Car Washing');
INSERT INTO service (name) VALUES('Food Delivery');
INSERT INTO service (name) VALUES('Entertainment');
INSERT INTO service (name) VALUES('Travel Agency Support');

CREATE TABLE orders (
  id int NOT NULL AUTO_INCREMENT,
  registration_date datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  customer_id int NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT order_customer FOREIGN KEY (customer_id) REFERENCES customer (id) ON DELETE CASCADE
);

CREATE TABLE details (
  id int NOT NULL AUTO_INCREMENT,
  order_id int NOT NULL,
  service_id int NOT NULL,
  cost int NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT details_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
  CONSTRAINT details_service FOREIGN KEY (service_id) REFERENCES service (id) ON DELETE CASCADE
);

INSERT INTO orders (id, customer_id) 
  VALUES (1, (SELECT id FROM customer WHERE name='Bill' LIMIT 1));

INSERT INTO details (order_id, service_id, cost) 
  SELECT 1, (SELECT id FROM service WHERE name='Lawyer Support' LIMIT 1), 100;
INSERT INTO details (order_id, service_id, cost) 
  SELECT 1, (SELECT id FROM service WHERE name='Car Washing' LIMIT 1), 5;
INSERT INTO details (order_id, service_id, cost) 
  SELECT 1, (SELECT id FROM service WHERE name='Food Delivery' LIMIT 1), 3;

INSERT INTO orders (id, customer_id) 
  VALUES (2, (SELECT id FROM customer WHERE name='Bill' LIMIT 1));

INSERT INTO details (order_id, service_id, cost) 
  SELECT 2, (SELECT id FROM service WHERE name='Food Delivery' LIMIT 1), 4;

INSERT INTO orders (id, customer_id) 
  VALUES (3, (SELECT id FROM customer WHERE name='Jeff' LIMIT 1));

INSERT INTO details (order_id, service_id, cost) 
  SELECT 3, (SELECT id FROM service WHERE name='Food Delivery' LIMIT 1), 11;
INSERT INTO details (order_id, service_id, cost) 
  SELECT 3, (SELECT id FROM service WHERE name='Car Washing' LIMIT 1), 7;
```

## Advanced queries

### Orders by customers
```sql
SELECT customer.name, orders.id FROM orders, customer WHERE orders.customer_id=customer.id;
SELECT customer.name, orders.id FROM orders INNER JOIN customer ON orders.customer_id=customer.id;
```

|name  | id |
|------|---:|
|Bill  | 1  |
|Bill  | 2  |
|Jeff  | 3  |
|

### Services by customers

```sql
SELECT service.name, customer.name FROM customer, service, orders, details WHERE
  customer.id=orders.customer_id AND
  details.order_id=orders.id AND
  details.service_id=service.id;
```

|name           | name|
|---------------|:----|
|Lawyer Support | Bill|
|Car Washing    | Bill|
|Food Delivery  | Bill|
|Food Delivery  | Bill|
|Food Delivery  | Jeff|
|Car Washing    | Jeff|
|

### Avoid duplications

```sql
SELECT DISTINCT service.name, customer.name FROM customer, service, orders, details WHERE
  customer.id=orders.customer_id AND
  details.order_id=orders.id AND
  details.service_id=service.id;
-- 2 version
SELECT service.name, customer.name FROM customer, service, orders, details WHERE
  customer.id=orders.customer_id AND
  details.order_id=orders.id AND
  details.service_id=service.id GROUP BY service.name, customer.name;
```

|name          | name|
|--------------|:----|
|Lawyer Support| Bill|
|Car Washing   | Bill|
|Food Delivery | Bill|
|Food Delivery | Jeff|
|Car Washing   | Jeff|
|

### Who and how many times ordered the services

```sql
SELECT service.name, customer.name, COUNT(*) FROM customer, service, orders, details WHERE
  customer.id=orders.customer_id AND
  details.order_id=orders.id AND
  details.service_id=service.id 
GROUP BY service.name, customer.name;
```

|name|name|COUNT(*)|
|---------------|:-----|--:|
|Lawyer Support | Bill | 1|
|Car Washing    | Bill | 1|
|Food Delivery  | Bill | 2|
|Food Delivery  | Jeff | 1|
|Car Washing    | Jeff | 1|
|

### How many times each serice was ordered

```sql
SELECT service.name, COUNT(*) FROM service, orders, details WHERE
  details.order_id=orders.id AND
  details.service_id=service.id GROUP BY service.name;
-- Worst version. Don't do it!
SELECT service_name, SUM(summa) FROM (
  SELECT service.name AS service_name, customer.name, COUNT(*) AS summa FROM customer, service, orders, details WHERE
  customer.id=orders.customer_id AND
  details.order_id=orders.id AND
  details.service_id=service.id GROUP BY service.name, customer.name
) AS inner_query GROUP BY service_name;
```

|name|COUNT(*)|
|---------------|--|
|Lawyer Support | 1|
|Car Washing    | 2|
|Food Delivery  | 3|
|

What if we need to show the whole services list... Even without any related order.

```sql
-- 1.
SELECT service.name, COUNT(*) FROM service 
  INNER JOIN details ON details.service_id=service.id
  INNER JOIN orders ON details.order_id=orders.id 
GROUP BY service.name;
-- 2.
SELECT service.name, COUNT(orders.id) FROM service 
  LEFT JOIN details ON details.service_id=service.id
  LEFT JOIN orders ON details.order_id=orders.id 
GROUP BY service.name ORDER BY service.name;
```
|name|COUNT(orders.id)|
|----------------------|-:|
|Car Washing           | 2|
|Entertainment         | 0|
|Food Delivery         | 3|
|Lawyer Support        | 1|
|Pet Groomer           | 0|
|Travel Agency Support | 0|
|

### Correlated subquery

```sql 
SELECT service.name, 
  (SELECT COUNT(orders.id) FROM orders, details 
    WHERE details.order_id=orders.id AND details.service_id=service.id)
FROM service ORDER BY service.name;
```

### Totals by the service

```sql
SELECT service.name, SUM(cost), MIN(cost), MAX(cost), AVG(cost) FROM service, orders, details 
  WHERE details.order_id=orders.id AND details.service_id=service.id 
    GROUP BY service.name;
```

|name|SUM(cost)|MIN(cost)|MAX(cost)|AVG(cost)|
|---------------|--:|--:|--:|--:|
|Lawyer Support | 100 | 100 | 100 | 100.0000|
|Car Washing | 12 | 5 | 7 | 6.0000|
|Food Delivery | 18 | 3 | 11 | 6.0000|
|

### Totals. GROUP BY is redundant for this case.

```sql
SELECT SUM(cost), MIN(cost), MAX(cost), AVG(cost) FROM service, orders, details 
  WHERE details.order_id=orders.id AND details.service_id=service.id;
```

|SUM(cost)|MIN(cost)|MAX(cost)|AVG(cost)|
|--:|--:|--:|--:|
|130 | 3 | 100 | 21.6667|
