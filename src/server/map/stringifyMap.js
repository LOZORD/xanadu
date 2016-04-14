export default (map) => {
  const dim = map.getHeight();
  let str = '';

  for (let rowInd = 0; rowInd < dim; rowInd++) {
    str += (map.getRow(rowInd).join('') + '\n');
  }

  return str;
};
