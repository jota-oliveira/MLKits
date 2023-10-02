const outputs = [];

function onScoreUpdate(dropPosition, bounciness, size, bucketLabel) {
  outputs.push([dropPosition, bounciness, size, bucketLabel]);
}

function distance(pointA, pointB) {
  _.chain(pointA)
    .zip(pointB)
    .map(([a, b]) => (a - b) ** 2)
    .sum()
    .value() ** 0.5;
}

function countBy(array, iteratee) {
  return array.reduce((acc, val) => {
    const key = typeof iteratee === 'function' ? iteratee(val) : val[iteratee];
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function runAnalysis() {
  const testSetSize = 100;
  const k = 10; // number of neighbors we found in previous tests

  _.range(0, 3).forEach(feature => {
    /* The data here, is returning an extraction o dataset for specific feature, like bounciness
     * or drop position.
     * and the last column is the bucketLabel
    */
    const data = _.map(outputs, row => [row[feature], _.last(row)]);
    const [testSet, trainingSet] = splitDataset(minMax(data, 1), testSetSize);
    const accuracy = _.chain(testSet)
      .filter(testPoint => knn(trainingSet, _.initial(testPoint), k) === _.last(testPoint))
      .size()
      .divide(testSetSize)
      .value();

    console.log('Accuracy feature of', feature, ':', accuracy);
  });

}

function knn(data, point, k) {
  return _.chain(data)
    .map(row => {
      return [
        distance(_.initial(row), point),
        _.last(row)
      ]
    })
    .sortBy(row => row[0])
    .slice(0, k)
    .countBy(row => row[1])
    .toPairs()
    .sortBy(row => row[1])
    .last()
    .first()
    .parseInt()
    .value();
}

function splitDataset(data, testCount) {
  const shuffled = _.shuffle(data);
  const testSet = _.slice(shuffled, 0, testCount);
  const trainingSet = _.slice(shuffled, testCount);

  return [trainingSet, testSet];
}

/* Would be better to be called of normalize */
function minMax(data, featureCount) {
  const clonedData = _.cloneDeep(data);

  /* Iterating of the columns like [columnA, columnB] */
  for (let col = 0; col < featureCount; col++) {
    /* Column its an array of numbers at this point */
    const column = clonedData.map(row => row[col]);
    const min = _.min(column);
    const max = _.max(column);

    /* Iterating over the rows of the matrix */
    for (let row = 0; row < clonedData.length; row++) {
      /* Normalize the data */
      clonedData[row][col] = (clonedData[row][col] - min) / (max - min);
    }
  }

  return clonedData;
}
