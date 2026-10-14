import "./dotenv.js"
import { pool } from "./database.js"
import carData from "../data/cars.js"
import optionData from "../data/options.js"

const createTables = async () => {
    try {
        const createTablesQuery = `
            DROP TABLE IF EXISTS cars;
            DROP TABLE IF EXISTS options;

            CREATE TABLE options (
                id SERIAL PRIMARY KEY,
                category VARCHAR(50) NOT NULL,
                name VARCHAR(100) NOT NULL,
                price NUMERIC(10, 2) NOT NULL DEFAULT 0,
                UNIQUE (category, name)
            );

            CREATE TABLE cars (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                make VARCHAR(100) NOT NULL,
                model VARCHAR(100) NOT NULL,
                base_price NUMERIC(10, 2) NOT NULL,
                exterior_option_id INTEGER NOT NULL REFERENCES options(id),
                interior_option_id INTEGER NOT NULL REFERENCES options(id),
                wheels_option_id INTEGER NOT NULL REFERENCES options(id),
                roof_option_id INTEGER NOT NULL REFERENCES options(id)
            );
        `
        await pool.query(createTablesQuery)
        console.log('🎉 tables created successfully')
    } catch (err) {
        console.error('⚠️ error creating tables', err)
    }
}

const seedOptions = async () => {
    for (const option of optionData) {
        try {
            await pool.query(
                'INSERT INTO options (category, name, price) VALUES ($1, $2, $3)',
                [option.category, option.name, option.price]
            )
            console.log(`✅ option ${option.category}: ${option.name} added successfully`)
        } catch (err) {
            console.error('⚠️ error inserting option', err)
        }
    }
}

const seedCars = async () => {
    for (const car of carData) {
        try {
            await pool.query(`
                INSERT INTO cars (
                    name, make, model, base_price,
                    exterior_option_id, interior_option_id, wheels_option_id, roof_option_id
                )
                VALUES (
                    $1, $2, $3, $4,
                    (SELECT id FROM options WHERE category = 'exterior' AND name = $5),
                    (SELECT id FROM options WHERE category = 'interior' AND name = $6),
                    (SELECT id FROM options WHERE category = 'wheels' AND name = $7),
                    (SELECT id FROM options WHERE category = 'roof' AND name = $8)
                )`,
                [
                    car.name, car.make, car.model, car.basePrice,
                    car.exterior, car.interior, car.wheels, car.roof
                ]
            )
            console.log(`✅ ${car.name} added successfully`)
        } catch (err) {
            console.error('⚠️ error inserting car', err)
        }
    }
}

const seedDatabase = async () => {
    await createTables()
    await seedOptions()
    await seedCars()
}

seedDatabase()