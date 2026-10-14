import { pool } from '../config/database.js'

const getOptions = async (req, res) => {
    try {
        const { category } = req.query
        const results = category
            ? await pool.query('SELECT * FROM options WHERE category = $1 ORDER BY id ASC', [category])
            : await pool.query('SELECT * FROM options ORDER BY category, id ASC')

        res.status(200).json(results.rows.map((row) => ({ ...row, price: Number(row.price) })))
    } catch (error) {
        res.status(409).json( { error: error.message } )
    }
}

export default {
    getOptions
}