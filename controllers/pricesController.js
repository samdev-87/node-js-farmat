const db = require('../services/db');
const helper = require('../helper');
const config = require('../config');
const mysql = require('mysql2/promise');
const { default: axios } = require('axios');

async function getMultiple(page = 1) {
    const offset = helper.getOffset(page, config.listPerPage);
    const rows = await db.query(`SELECT * FROM prices_farmat LIMIT ${offset}, ${config.listPerPage}`);
    
    const data = helper.emptyOrRows(rows);
    const meta = { page };
    
    return {
        data,
        meta,
    };
}

async function create() {
    // try {
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
        let row, item, message = 'Error in creating prices';;
        
        try {
            await connection.beginTransaction();
    
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
            // connection.release();
          }

        // const result = await db.query(
        //     `INSERT INTO prices_farmat (code, name, vendor, vendor_country, barcode, min_order, cnt_in_box, 
        //     cnt_stock, multiplicity, exp_date, price, action, no_discount, marked) 
        //     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, values[0]);
            
        // let message = 'Error in creating prices';

        // if (result.affectedRows) {
        //     message = 'Prices created successfully';
        // }
    // } catch (error) {
    //     console.error('Error creating prices:', error);
    //     throw new Error('Failed to create prices');
    // }
    
    return { message };
}

module.exports = {
    getMultiple,
    create
};