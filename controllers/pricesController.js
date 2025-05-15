const db = require('../services/db');
const helper = require('../helper');
const config = require('../config');
const mysql = require('mysql2/promise');
const { default: axios } = require('axios');

async function getMultiple(items) {
  const connection = await mysql.createConnection(config.db);
  const sql = 'SELECT code, barcode, MIN(price) as price, no_discount as discount, MAX(exp_date) as shelf_life FROM prices_farmat WHERE CODE IN (?) GROUP BY code, barcode, no_discount';
  const [rows] = await connection.query(sql, [items]);
    
  return rows;
}

async function create() {
    const response = await axios.get('http://it.atamirass.kz:9980/mark/hs/OnlineOrder/getprice', {
        headers: { 'Authorization': 'Basic ' + Buffer.from('Астер:123456').toString('base64') },
    });

    if (response.status !== 200) {
        throw new Error(`API returned status ${response.status}`);
      }

    prices = response.data;
    
    if (!Array.isArray(prices.ITEMS)) {
        throw new Error('Invalid data format received from API');
    }

    const items = prices.ITEMS.map(item => {
        const [day, month, year] = item.EXP_DATE.split('.');
        const mysqlDate = `${year}-${month}-${day}`;
        return [
            item.CODE,
            item.NAME,
            item.VENDOR,
            item.VENDOR_COUNTRY,
            item.BAR_CODE,
            item.MIN_ORDER,
            item.CNT_IN_BOX,
            item.CNT_STOCK,
            item.MULTIPLICITY,
            mysqlDate,
            item.PRICE,
            item.ACTION === 'No' ? 0 : 1,
            item.NO_DISCOUNT,
            item.marked
        ];
    });
    
    const connection = await mysql.createConnection(config.db);
    let row, item, message = 'Error in creating prices';
    
    try {
        await connection.beginTransaction();

        await connection.query(`DELETE FROM prices_farmat`); // Clear the table before inserting new data
        await connection.query(`ALTER TABLE prices_farmat AUTO_INCREMENT = 1`); // Reset the auto-increment value

        for (item of items) {
          row = await connection.execute(
            `INSERT INTO prices_farmat (code, name, vendor, vendor_country, barcode, min_order, cnt_in_box, 
            cnt_stock, multiplicity, exp_date, price, action, no_discount, marked) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
            item
          );
          
        }
  
        await connection.commit();
        message = `${items.length} items created successfully`
      } catch (error) {
        await connection.rollback();
        console.log(item);
        message = error.toString();
      } finally {
        connection.end();
        // connection.release();
      }
    
    return { message };
}

module.exports = {
    getMultiple,
    create
};