exports.removeDuplicatesUID = (array) => {
  const seen = new Set();
  return array.filter(item => {
    if (seen.has(item.uid)) {
      return false;
    } else {
      seen.add(item.uid);
      return true;
    }
  });
};