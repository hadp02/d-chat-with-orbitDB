// userService.js
import bcrypt from 'bcryptjs'

export const registerUser = async (userDb, username, password) => {
    const existingUser = await userDb.get(username)
    if (existingUser) {
        throw new Error('Username already exists')
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    await userDb.put(username, { password: hashedPassword })
}

export const loginUser = async (userDb, username, password) => {
    const user = await userDb.get(username)
    if (!user) {
        throw new Error('Invalid username or password')
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
        throw new Error('Invalid username or password')
    }
    return username
}