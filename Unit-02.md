# Unit 2

## Let's create a denormalized table.

```sql
CREATE TABLE staff (
  id int,
  person varchar(100),
  dep varchar(100),
  salary int
);

INSERT INTO staff values(1, 'Jack', 'IT', 100);
INSERT INTO staff values(2, 'John', 'IT', 200);
INSERT INTO staff values(3, 'Mary', 'Service', 100);
INSERT INTO staff values(4, 'Ali', 'IT', 300);
INSERT INTO staff values(5, 'Bill', 'Service', 100);
```

## Queries

### Calculate sum of annual salaries.
```sql
SELECT SUM(salary*12) FROM staff;
```

|SUM(salary*12)|
|-|
|9600|

### Calculate sum, min, max and avg annual salaries by deps
```sql
SELECT dep, SUM(salary*12) FROM staff GROUP BY dep;
SELECT dep, MIN(salary*12), MAX(salary*12), AVG(salary*12) FROM staff GROUP BY dep;
```

|dep|MIN(salary*12)|MAX(salary*12)|AVG(salary*12)|
|--|--:|--:|--:|
|IT|1200|3600|2400.0000|
|Service|1200|1200|1200.0000|

### Get deps where summary salary less than 250
```sql
SELECT dep, SUM(salary) FROM staff GROUP BY dep HAVING SUM(salary)<250;
```


|dep|SUM(salary)|
|--|--:|
|Service|200|


## Indexes

<!-- /usr/local/mysql/bin/mysql -u root -p -->

Create copy of `staff`

```sql
CREATE TABLE staff_copy (
  id int,
  person varchar(100),
  dep varchar(100),
  salary int
);
```

Insert 2000000 records...

```
cd Unit-1/fill-data
npm i
npm start
```

Wait...

```
mysql> EXPLAIN ANALYZE SELECT COUNT(*) FROM staff_copy WHERE dep='IT';
+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| EXPLAIN                                                                                                                                                                                                                                                                                                    |
+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| -> Aggregate: count(0)  (actual time=1157.461..1157.461 rows=1 loops=1)
    -> Filter: (staff_copy.dep = 'IT')  (cost=204651.69 rows=199303) (actual time=0.088..1090.665 rows=999999 loops=1)
        -> Table scan on staff_copy  (cost=204651.69 rows=1993028) (actual time=0.080..804.243 rows=1999998 loops=1)
 |
+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (1.16 sec)
```


```sql
CREATE INDEX idx_staff_copy_dep ON staff_copy(dep);
```

```
mysql> EXPLAIN ANALYZE SELECT COUNT(*) FROM staff_copy WHERE dep='IT';
+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| EXPLAIN                                                                                                                                                                                                           |
+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| -> Aggregate: count(0)  (actual time=528.529..528.529 rows=1 loops=1)
    -> Index lookup on staff_copy using idx_staff_copy_dep (dep='IT')  (cost=147089.35 rows=996514) (actual time=0.032..457.287 rows=999999 loops=1)
 |
+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.53 sec)
```

Case with LIKE...

```sql
mysql> EXPLAIN ANALYZE SELECT COUNT(*) FROM staff_copy WHERE dep LIKE 'IT%';
+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| EXPLAIN                                                                                                                                                                                                                                                                                                                             |
+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| -> Aggregate: count(0)  (actual time=709.072..709.073 rows=1 loops=1)
    -> Filter: (staff_copy.dep like 'IT%')  (cost=246740.76 rows=996514) (actual time=0.030..635.500 rows=999999 loops=1)
        -> Index range scan on staff_copy using idx_staff_copy_dep  (cost=246740.76 rows=996514) (actual time=0.027..476.021 rows=999999 loops=1)
 |
+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.71 sec)
```


Theory: http://tokarchuk.ru/2012/08/indexes-classification/

## Blow your mind

`Input:`
```json
{
  "John": "name",
  "Bob": "name",
  "Carl": "middlename",
  "Gates": "surname",
  "Bezos": "surname"
}
```

`Output:`
```json
{
  "name": ["John", "Bob"],
  "surname": ["Gates", "Bezos"]
}
```

Let's `Go`:)

```go
package main

import (
	"fmt"
)

func main() {
  var m = map[string]string{"John":"name", "Bob":"name","Carl":"middlename","Gates":"surname","Bezos":"surname"}
  var r = make(map[string][]string)
  for key, value := range m {
    r[value] = append(r[value], key)
  }
  fmt.Println(r)
}
```

```
map[middlename:[Carl] name:[John Bob] surname:[Gates Bezos]]
```

### DB-based version

```sql
CREATE TABLE data (
  v varchar(255),
  k varchar(255)
);

INSERT INTO data VALUES('John', 'name');
INSERT INTO data VALUES('Bob', 'name');
INSERT INTO data VALUES('Carl', 'middlename');
INSERT INTO data VALUES('Gates', 'surname');
INSERT INTO data VALUES('Bezos', 'surname');

-- SELECT v, k FROM data;
SELECT k, GROUP_CONCAT(v SEPARATOR ', ') FROM data GROUP BY k
```

|k|GROUP_CONCAT(v SEPARATOR ', ')|
|--|--|
|middlename|Carl|
name|John, Bob|
surname|Gates, Bezos|

## Blow your mind - permutation

<!-- https://jsconsole.com/ -->

```javascript
const array1 = ['Bob', 'Tina', 'Jack'];
const array2 = ['Johanson', 'Smith', 'Gates'];
const result = []

for (let i = 0; i < array1.length; i++) {
  for (let j = 0; j < array2.length; j++) {
    let tempArray = [];
    tempArray.push(array1[i]);
    tempArray.push(array2[j]);
    result.push(tempArray);
  }
}

for (let i = 0; i < array2.length; i++) {
  for (let j = 0; j < array1.length; j++) {
    let tempArray = [];
    tempArray.push(array1[j]);
    tempArray.push(array2[i]);
    result.push(tempArray);
  }
}

console.log(JSON.stringify(result));
```

```
[
  [ 'Bob', 'Johanson' ],  [ 'Bob', 'Smith' ],
  [ 'Bob', 'Gates' ],     [ 'Tina', 'Johanson' ],
  [ 'Tina', 'Smith' ],    [ 'Tina', 'Gates' ],
  [ 'Jack', 'Johanson' ], [ 'Jack', 'Smith' ],
  [ 'Jack', 'Gates' ],    [ 'Bob', 'Johanson' ],
  [ 'Tina', 'Johanson' ], [ 'Jack', 'Johanson' ],
  [ 'Bob', 'Smith' ],     [ 'Tina', 'Smith' ],
  [ 'Jack', 'Smith' ],    [ 'Bob', 'Gates' ],
  [ 'Tina', 'Gates' ],    [ 'Jack', 'Gates' ]
] 18
```

"Think different..."

```sql
CREATE TABLE names (
  v varchar(255)
);

INSERT INTO names VALUES('Bob');
INSERT INTO names VALUES('Tina');
INSERT INTO names VALUES('Jack');

CREATE TABLE surnames (
  v varchar(255)
);

INSERT INTO surnames VALUES('Johanson');
INSERT INTO surnames VALUES('Smith');
INSERT INTO surnames VALUES('Gates');
```

```sql
SELECT names.v AS c1, surnames.v AS c2 FROM names CROSS JOIN surnames
UNION
SELECT surnames.v, names.v FROM names CROSS JOIN surnames;
```

```sql
SELECT COUNT(*) FROM (
  SELECT names.v AS c1, surnames.v AS c2 FROM names CROSS JOIN surnames
  UNION
  SELECT surnames.v, names.v FROM names CROSS JOIN surnames
) AS permutations;
```

### lead - lag

```sql
create table projects
(
	id            SERIAL,
	title         varchar(255),
	start_date    date,
	end_date      date,
	budget        int,

	primary key(id)
);

insert into projects
  (title, budget, start_date, end_date)
values
  ('Test Project 1', 1,  '2021-01-21', '2021-02-19'),
  ('Test Project 2', 2,  '2021-02-19', '2021-05-28'),
  ('Test Project 3', 7,  '2021-05-28', '2021-08-31'),
  ('Test Project 4', 30, '2021-08-31', '2021-11-29'),
  ('Test Project 5', 72, '2021-11-29', '2021-12-14'),
  ('Test Project 6', 73, '2021-12-14', '2022-01-13'),
  ('Test Project 7', 82, '2022-01-13', '2022-04-18');
```

Create a query that returns first *missing* natural number from the 'budget' column

Wrong solution
```sql
SELECT s.i FROM generate_series(1,1000) s(i) WHERE s.i NOT IN (SELECT budget FROM projects ORDER BY budget) LIMIT 1;
```

The best way

```sql
SELECT budget+1 FROM (
  SELECT id, title, budget, next_budget FROM (
    SELECT
      id,
      title,
      budget,
      lead(budget) over (order by id) AS next_budget
    FROM projects) AS rich_query WHERE next_budget-budget>1 LIMIT 1) AS result_query;
```

More info: https://learnsql.com/blog/lead-and-lag-functions-in-sql/
