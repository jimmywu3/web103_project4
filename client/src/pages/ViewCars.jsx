import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import CarsAPI from '../services/CarsAPI'
import { getLogo } from '../utils/logo.js'
import '../css/ViewCars.css'

const ViewCars = ({ title }) => {
    const [cars, setCars] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        document.title = title
    }, [title])

    useEffect(() => {
        const loadCars = async () => {
            try {
                setCars(await CarsAPI.getAllCars())
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        loadCars()
    }, [])

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this car?')) return

        try {
            await CarsAPI.deleteCar(id)
            // remove it from the list without refetching
            setCars((prev) => prev.filter((car) => car.id !== id))
        } catch (err) {
            setError(err.message)
        }
    }

    if (loading) return <p>Loading cars...</p>

    return (
        <main className="view-cars">

            {error && <p className="error">{error}</p>}

            {cars.length === 0 && !error ? (
                <p>
                    No cars yet. <Link to="/">Customize one!</Link>
                </p>
            ) : (
                <div className="car-grid">
                    {cars.map((car) => (
                        <article className="car-card" key={car.id}>
                            <img
                                className="car-logo"
                                src={getLogo(car.make)}
                                alt={`${car.make} logo`}
                            />
                            <h3>{car.name}</h3>
                            <p>{car.make} {car.model}</p>
                            <p>{car.exterior.name} / {car.interior.name}</p>
                            <p className="car-price">${car.total_price.toLocaleString()}</p>

                            <div className="car-actions">
                                <Link to={`/customcars/${car.id}`}>Details</Link>
                                <Link to={`/edit/${car.id}`}>Edit</Link>
                                <button onClick={() => handleDelete(car.id)}>Delete</button>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </main>
    )
}

export default ViewCars