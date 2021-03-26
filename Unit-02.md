# Unit 2

## Let's create a one denormalized table.

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

### Calculate sum, min, max and avg annual salaries by deps
```sql
SELECT dep, SUM(salary*12) FROM staff GROUP BY dep;
SELECT dep, MIN(salary*12), MAX(salary*12), AVG(salary*12) FROM staff GROUP BY dep;
```

### Get deps where summary salary less than 250
```sql
SELECT dep, SUM(salary) FROM staff GROUP BY dep HAVING SUM(salary)<250

```

## Blow your mind

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
  fmt.Println(m, r)
}
```

### Let's imagine that we have millions on records?

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
