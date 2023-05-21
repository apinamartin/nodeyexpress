const express = require('express')
const http = require('http')
const mongoose = require('mongoose')
const app = express()

require('./database')

const PORT = 3000

app.use(express.json())

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true },
    email: String,
    website: { type: String, default: 'unknown'}
})

const User = mongoose.model('User', userSchema)

/* SIN API */
app.post('/users', async (req, res) => {
    try {
        const user = new User(req.body)
        await user.save()
        res.status(201).send(user)
    } catch (error) {
        res.status(400).send({error: error.message})
    }
})

app.get('/users', async (req, res) => {
    try {
        const users = await User.find()
        res.send(users)
    } catch(error) {
        res.status(500).send({error: error.message})
    }
})

app.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id)
        if (!user) {
            return res.status(400).send({error: 'User no encontrado'})
        }
        res.send(user)
    } catch(error) {
        res.status(500).send({error: error.message})
    }
})

app.put('/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body)
        if (!user) {
            return res.status(400).send({error: 'Tarea no encontrada'})
        }
        res.send(user)
    } catch(error) {
        res.status(500).send({error: error.message})
    }
})

/* CON API */
app.get('/users/ph', (req, res) => {
    const options = {
        hostname: 'jsonplaceholder.typicode.com',
        path: '/users',
        method: 'GET',
    }

    const request = http.request(options, (response) => {
        let data = ''

        response.on('data', (chunk) => {
            data += chunk
        })

        response.on('end', () => {
            const users = JSON.parse(data);
            const filteredUsers = users.map((user) => {
                const { id, name, username, email, website } = user;
                return { id, name, username, email, website };
            });
            res.json(filteredUsers);
        })
    })

    request.on('error', (error) => {
        console.error(error)
        res.status(500).json({ error: 'Error al obtener los usuarios de JSONPlaceholder' })
    })

    request.end()
})

app.post('/users/ph', (req, res) => {

    const options = {
        hostname: 'jsonplaceholder.typicode.com',
        path: '/users',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    }

    const request = http.request(options, (response) => {
        let data = ''

        response.on('data', (chunk) => {
            data += chunk;
        })

        response.on('end', () => {
            const user = JSON.parse(data)
            res.status(201).json(user)
        })
    })

    request.on('error', (error) => {
        console.error(error)
        res.status(500).json({ error: 'Error al crear el usuario en JSONPlaceholder' })
    })

    const userData = JSON.stringify(req.body)
        request.write(userData)
        request.end()
    })

app.put('/users/ph/:id', (req, res) => {

    const options = {
        hostname: 'jsonplaceholder.typicode.com',
        path: `/users/${req.params.id}`,
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
    }

    const request = http.request(options, (response) => {
        let data = ''

        response.on('data', (chunk) => {
            data += chunk
        })

        response.on('end', () => {
            const user = JSON.parse(data)
            res.json(user)
        })
    })

    request.on('error', (error) => {
        console.error(error)
        res.status(500).json({ error: 'Error al actualizar el usuario en JSONPlaceholder' })
    })

    const userData = JSON.stringify(req.body)
    request.write(userData)
    request.end()
})

app.delete('/users/ph/:id', (req, res) => {

    const options = {
        hostname: 'jsonplaceholder.typicode.com',
        path: `/users/${req.params.id}`,
        method: 'DELETE',
    }

    const request = http.request(options, (response) => {
        response.on('end', () => {
            res.sendStatus(204)
        })
    })

    request.on('error', (error) => {
        console.error(error);
        res.status(500).json({ error: 'Error al borrar el usuario en JSONPlaceholder' })
    })

    request.end()
})

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
})

