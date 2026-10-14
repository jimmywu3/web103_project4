const CARS_URL = '/cars'
const OPTIONS_URL = '/options'

const request = async (url, options = {}) => {
    const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        ...options
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.error || `Request failed with status ${response.status}`)
    }

    return data
}

const getAllCars = () => request(CARS_URL)

const getCar = (id) => request(`${CARS_URL}/${id}`)

const createCar = (car) =>
    request(CARS_URL, {
        method: 'POST',
        body: JSON.stringify(car)
    })

const updateCar = (id, updates) =>
    request(`${CARS_URL}/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates)
    })

const deleteCar = (id) =>
    request(`${CARS_URL}/${id}`, {
        method: 'DELETE'
    })


const getOptions = (category) =>
    request(category ? `${OPTIONS_URL}?category=${encodeURIComponent(category)}` : OPTIONS_URL)

export default {
    getAllCars,
    getCar,
    createCar,
    updateCar,
    deleteCar,
    getOptions
}