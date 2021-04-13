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

console.log(result);
