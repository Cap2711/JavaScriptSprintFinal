const dal = require('./p.db');

async function getFullText(keyword) {
    const sql = `SELECT cat_breed, cat_name, stay, owner, gender FROM cats \
        WHERE cat_breed iLIKE '%'||$1||'%' \
              OR cat_name iLIKE '%'||$1||'%' \
              OR owner iLIKE '%'||$1||'%' \
              OR gender iLIKE '%'||$1||'%' \
              OR stay::text iLIKE '%'||$1||'%'`;

    try {
        console.log('Executing SQL:', sql, 'with keyword:', keyword); // Log the SQL query and keyword
        const results = await dal.query(sql, [keyword]);
        console.log('SQL Results:', results.rows); // Log the results
        return results.rows;
    } catch (error) {
        console.error('Error executing SQL query:', error);
        throw error;
    }
}

module.exports = {
    getFullText,
};
