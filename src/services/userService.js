import bcrypt from 'bcryptjs'

const saltRounds = 10;

class UserService {
    async loginUser(userDb, username, password) {
        console.log('Attempting to fetch user from DB:', username);
        const user = await userDb.get(username);
        console.log('User found in DB:', user);
        if (!user) {
            throw new Error('Invalid username or password');
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Invalid username or password');
        }
        return { username: user.username, name: user.name, status: user.status };
    }

    async registerUser(userDb, username, password) {
        console.log('Attempting to register new user:', username);
        const existingUser = await userDb.get(username);
        if (existingUser) {
            throw new Error('Username already exists');
        }
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUser = {
            username,
            password: hashedPassword,
            name: username,
            status: 'online'
        };
        await userDb.put(username, newUser);
        console.log('New user registered:', newUser);
        return { username: newUser.username, name: newUser.name, status: newUser.status };
    }

    async updateUserProfile(userDb, username, updatedProfile) {
        console.log('Updating profile for username:', username);
        console.log('Updated profile data:', updatedProfile);

        const user = await userDb.get(username);
        console.log('User found in DB:', user);

        if (!user) {
            throw new Error('User not found');
        }

        const updatedUser = {
            ...user,
            ...updatedProfile,
            username: user.username // Prevent username change
        };

        // Remove undefined fields
        Object.keys(updatedUser).forEach(key =>
            updatedUser[key] === undefined && delete updatedUser[key]
        );

        console.log('Updated user object:', updatedUser);

        await userDb.put(username, updatedUser);
        return { name: updatedUser.name, status: updatedUser.status };
    }

    async changeUserPassword(userDb, username, oldPassword, newPassword) {
        const user = await userDb.get(username);
        if (!user) {
            throw new Error('User not found');
        }
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            throw new Error('Incorrect old password');
        }
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
        const updatedUser = {
            ...user,
            password: hashedNewPassword
        };
        await userDb.put(username, updatedUser);
    }
}

export default new UserService();