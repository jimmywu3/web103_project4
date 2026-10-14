import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import CarsAPI from '../services/CarsAPI'
import CarForm from '../components/CarForm'

const CreateCar = ({ title }) => {
    const navigate = useNavigate()

    useEffect(() => {
        document.title = title
    }, [title])

    const handleCreate = async (car) => {
        const created = await CarsAPI.createCar({ ...car, image_url: '' })
        navigate(`/customcars/${created.id}`)
    }

    return (
        <main className="create-car">
            <h2>Customize a Car</h2>
            <CarForm onSubmit={handleCreate} submitLabel="Create Car" />
        </main>
    )
}

export default CreateCar

// import React, { useEffect } from 'react'

// const CreateCar = ({ title }) => {
//     useEffect(() => {
//         document.title = title
//     }, [title])

//     return (
//         <main className="create-car">
//             <h2>Customize a Car</h2>
//             <p>Create form coming soon.</p>
//         </main>
//     )
// }

// export default CreateCar