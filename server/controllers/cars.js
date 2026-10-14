import { pool } from '../config/database.js'

const optionFields = {
    exterior_option_id: 'exterior',
    interior_option_id: 'interior',
    wheels_option_id: 'wheels',
    roof_option_id: 'roof'
}

const carSelect = `
    SELECT
        c.id, c.name, c.make, c.model, c.base_price,
        c.exterior_option_id, c.interior_option_id, c.wheels_option_id, c.roof_option_id,
        json_build_object('id', ex.id, 'name', ex.name, 'price', ex.price) AS exterior,
        json_build_object('id', i.id, 'name', i.name, 'price', i.price) AS interior,
        json_build_object('id', w.id, 'name', w.name, 'price', w.price) AS wheels,
        json_build_object('id', r.id, 'name', r.name, 'price', r.price) AS roof,
        c.base_price + ex.price + i.price + w.price + r.price AS total_price
    FROM cars c
    JOIN options ex ON ex.id = c.exterior_option_id
    JOIN options i ON i.id = c.interior_option_id
    JOIN options w ON w.id = c.wheels_option_id
    JOIN options r ON r.id = c.roof_option_id
`

// pg returns NUMERIC columns as strings, so convert them to numbers
const formatCar = (row) => ({
    ...row,
    base_price: Number(row.base_price),
    total_price: Number(row.total_price)
})

const fetchCar = async (id) => {
    const result = await pool.query(`${carSelect} WHERE c.id = $1`, [id])
    return result.rows[0] ? formatCar(result.rows[0]) : undefined
}

// Make sure each option id belongs to the right category (e.g. a wheel can't be used as a roof)
const validateOptions = async (body) => {
    for (const [field, category] of Object.entries(optionFields)) {
        const optionId = body[field]
        if (optionId === undefined || optionId === null) continue

        const result = await pool.query(
            'SELECT 1 FROM options WHERE id = $1 AND category = $2',
            [optionId, category]
        )
        if (result.rowCount === 0) return `${field} must be a valid ${category} option`
    }
    return null
}

const getCars = async (req, res) => {
    try {
        const results = await pool.query(`${carSelect} ORDER BY c.id ASC`)
        res.status(200).json(results.rows.map(formatCar))
    } catch (error) {
        res.status(409).json( { error: error.message } )
    }
}

const getCarById = async (req, res) => {
    try {
        const car = await fetchCar(parseInt(req.params.id))
        if (!car) return res.status(404).json( { error: 'Car not found' } )
        res.status(200).json(car)
    } catch (error) {
        res.status(409).json( { error: error.message } )
    }
}

const createCar = async (req, res) => {
    try {
        const invalid = await validateOptions(req.body)
        if (invalid) return res.status(400).json( { error: invalid } )

        const {
            name, make, model, base_price,
            exterior_option_id, interior_option_id, wheels_option_id, roof_option_id
        } = req.body

        const results = await pool.query(`
            INSERT INTO cars (
                name, make, model, base_price,
                exterior_option_id, interior_option_id, wheels_option_id, roof_option_id
            )
            VALUES($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id`,
            [name, make, model, base_price, exterior_option_id, interior_option_id, wheels_option_id, roof_option_id]
        )
        res.status(201).json(await fetchCar(results.rows[0].id))
    } catch (error) {
        res.status(409).json( { error: error.message } )
    }
}

// Partial update: send only the fields you want to change.
// Customizing a car is just a PATCH with new option ids, e.g. { "wheels_option_id": 6 }
const updateCar = async (req, res) => {
    try {
        const id = parseInt(req.params.id)

        const invalid = await validateOptions(req.body)
        if (invalid) return res.status(400).json( { error: invalid } )

        const {
            name, make, model, base_price,
            exterior_option_id, interior_option_id, wheels_option_id, roof_option_id
        } = req.body

        const results = await pool.query(`
            UPDATE cars SET
                name = COALESCE($1, name),
                make = COALESCE($2, make),
                model = COALESCE($3, model),
                base_price = COALESCE($4, base_price),
                exterior_option_id = COALESCE($5, exterior_option_id),
                interior_option_id = COALESCE($6, interior_option_id),
                wheels_option_id = COALESCE($7, wheels_option_id),
                roof_option_id = COALESCE($8, roof_option_id)
            WHERE id = $9
            RETURNING id`,
            [name, make, model, base_price, exterior_option_id, interior_option_id, wheels_option_id, roof_option_id, id]
        )
        if (results.rowCount === 0) return res.status(404).json( { error: 'Car not found' } )
        res.status(200).json(await fetchCar(id))
    } catch (error) {
        res.status(409).json( { error: error.message } )
    }
}

const deleteCar = async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        const results = await pool.query('DELETE FROM cars WHERE id = $1 RETURNING *', [id])
        if (results.rowCount === 0) return res.status(404).json( { error: 'Car not found' } )
        res.status(200).json(results.rows[0])
    } catch (error) {
        res.status(409).json( { error: error.message } )
    }
}

export default {
    getCars,
    getCarById,
    createCar,
    updateCar,
    deleteCar
}