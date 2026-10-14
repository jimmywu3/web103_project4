import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import CarsAPI from '../services/CarsAPI'
import { getLogo } from '../utils/logo.js'
import '../css/CarDetails.css'

const formatPrice = (amount) => `$${Number(amount).toLocaleString()}`

const CarDetails = ({ title }) => {
    const { id } = useParams()
    const navigate = useNavigate()

    const [car, setCar] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        document.title = title
    }, [title])

    useEffect(() => {
        const loadCar = async () => {
            try {
                setCar(await CarsAPI.getCar(id))
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        loadCar()
    }, [id])

    const handleDelete = async () => {
        if (!window.confirm('Delete this car?')) return

        try {
            await CarsAPI.deleteCar(id)
            navigate('/customcars')
        } catch (err) {
            setError(err.message)
        }
    }

    if (loading) return <p>Loading car...</p>

    if (error || !car) {
        return (
            <main className="car-details">
                <p className="error">{error || 'Car not found'}</p>
                <Link to="/customcars">← Back to all cars</Link>
            </main>
        )
    }

    // label + option pairs, so the breakdown is a simple loop
    const features = [
        { label: 'Exterior', option: car.exterior },
        { label: 'Interior', option: car.interior },
        { label: 'Wheels', option: car.wheels },
        { label: 'Roof', option: car.roof }
    ]

    return (
        <main className="car-details">
            <Link to="/customcars">← Back to all cars</Link>

            <header className="details-header">
                <img
                    className="details-logo"
                    src={getLogo(car.make)}
                    alt={`${car.make} logo`}
                />
                <div>
                    <h2>{car.name}</h2>
                    <p>{car.make} {car.model}</p>
                </div>
            </header>

            <table className="price-table">
                <tbody>
                    <tr>
                        <td>Base price</td>
                        <td></td>
                        <td className="amount">{formatPrice(car.base_price)}</td>
                    </tr>

                    {features.map(({ label, option }) => (
                        <tr key={label}>
                            <td>{label}</td>
                            <td>{option.name}</td>
                            <td className="amount">
                                {Number(option.price) === 0 ? 'Included' : `+${formatPrice(option.price)}`}
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td>Total</td>
                        <td></td>
                        <td className="amount">{formatPrice(car.total_price)}</td>
                    </tr>
                </tfoot>
            </table>

            <div className="details-actions">
                <Link to={`/edit/${car.id}`}>Edit</Link>
                <button onClick={handleDelete}>Delete</button>
            </div>
        </main>
    )
}

export default CarDetails