import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import CarsAPI from '../services/CarsAPI'
import CarForm from '../components/CarForm'
import '../css/CarForm.css'

const EditCar = ({ title }) => {
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

    const handleUpdate = async (updates) => {
        await CarsAPI.updateCar(id, updates)
        navigate(`/customcars/${id}`)
    }

    if (loading) return <p>Loading car...</p>

    if (error || !car) {
        return (
            <main className="create-car">
                <p className="error">{error || 'Car not found'}</p>
                <Link to="/customcars">← Back to all cars</Link>
            </main>
        )
    }

    // the form only needs the editable fields; the API returns option ids as numbers
    const initialValues = {
        name: car.name,
        make: car.make,
        model: car.model,
        base_price: car.base_price,
        exterior_option_id: car.exterior_option_id,
        interior_option_id: car.interior_option_id,
        wheels_option_id: car.wheels_option_id,
        roof_option_id: car.roof_option_id
    }

    return (
        <main className="create-car">
            <Link to={`/customcars/${id}`}>← Back to details</Link>
            <h2>Edit {car.name}</h2>
            <CarForm
                initialValues={initialValues}
                onSubmit={handleUpdate}
                submitLabel="Save Changes"
            />
        </main>
    )
}

export default EditCar