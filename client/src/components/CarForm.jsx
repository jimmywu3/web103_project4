import React, { useState, useEffect } from 'react'
import CarsAPI from '../services/CarsAPI'
import '../css/CarForm.css'

const categories = [
    { label: 'Exterior', field: 'exterior_option_id', category: 'exterior' },
    { label: 'Interior', field: 'interior_option_id', category: 'interior' },
    { label: 'Wheels', field: 'wheels_option_id', category: 'wheels' },
    { label: 'Roof', field: 'roof_option_id', category: 'roof' }
]

const emptyCar = {
    name: '',
    make: '',
    model: '',
    base_price: '',
    exterior_option_id: '',
    interior_option_id: '',
    wheels_option_id: '',
    roof_option_id: ''
}

const formatPrice = (amount) => `$${Number(amount).toLocaleString()}`

const CarForm = ({ initialValues = emptyCar, onSubmit, submitLabel = 'Save' }) => {
    const [form, setForm] = useState(initialValues)
    const [options, setOptions] = useState([])
    const [error, setError] = useState(null)
    const [saving, setSaving] = useState(false)
    const [loadingOptions, setLoadingOptions] = useState(true)

    useEffect(() => {
        const loadOptions = async () => {
            try {
                const data = await CarsAPI.getOptions()
                setOptions(data)

                // default any empty selection to the first option in its category
                setForm((prev) => {
                    const next = { ...prev }
                    categories.forEach(({ field, category }) => {
                        if (!next[field]) {
                            next[field] = data.find((o) => o.category === category)?.id ?? ''
                        }
                    })
                    return next
                })
            } catch (err) {
                setError(err.message)
            } finally {
                setLoadingOptions(false)
            }
        }
        loadOptions()
    }, [])

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    // live total: base price + the price of each selected option
    const optionsTotal = categories.reduce((sum, { field }) => {
        const selected = options.find((o) => o.id === Number(form[field]))
        return sum + (selected ? selected.price : 0)
    }, 0)
    const total = Number(form.base_price || 0) + optionsTotal

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        setSaving(true)

        try {
            await onSubmit({
                name: form.name,
                make: form.make,
                model: form.model,
                base_price: Number(form.base_price),
                exterior_option_id: Number(form.exterior_option_id),
                interior_option_id: Number(form.interior_option_id),
                wheels_option_id: Number(form.wheels_option_id),
                roof_option_id: Number(form.roof_option_id)
            })
        } catch (err) {
            setError(err.message)
            setSaving(false)
        }
    }
    if (loadingOptions) return <p>Loading options...</p>
    return (
        <form className="car-form" onSubmit={handleSubmit}>
            <label>
                Name
                <input name="name" value={form.name} onChange={handleChange} required />
            </label>

            <label>
                Make
                <input name="make" value={form.make} onChange={handleChange} required />
            </label>

            <label>
                Model
                <input name="model" value={form.model} onChange={handleChange} required />
            </label>

            <label>
                Base price ($)
                <input
                    name="base_price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.base_price}
                    onChange={handleChange}
                    required
                />
            </label>

            {categories.map(({ label, field, category }) => (
                <label key={field}>
                    {label}
                    <select name={field} value={form[field]} onChange={handleChange} required>
                        {options
                            .filter((o) => o.category === category)
                            .map((o) => (
                                <option key={o.id} value={o.id}>
                                    {o.name} ({o.price === 0 ? 'Included' : `+${formatPrice(o.price)}`})
                                </option>
                            ))}
                    </select>
                </label>
            ))}

            <p className="form-total">Total: {formatPrice(total)}</p>

            {error && <p className="error">{error}</p>}

            <button type="submit" disabled={saving}>
                {saving ? 'Saving...' : submitLabel}
            </button>
        </form>
    )
}

export default CarForm