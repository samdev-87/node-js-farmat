function getOffset(currentPage = 1, listPerPage) {
  return (currentPage - 1) * listPerPage;  
}

function emptyOrRows(rows) {
    if (!rows) {
        return [];
    }
    if (Array.isArray(rows) && rows.length === 0) {
        return [];
    }
    return rows;
}

module.exports = {
    getOffset,
    emptyOrRows
};