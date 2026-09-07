const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/keys');

const usersFilePath = path.join(__dirname, '../data/users.json');

const getUsers = () => {
  try {
    if (!fs.existsSync(usersFilePath)) return [];
    const data = fs.readFileSync(usersFilePath, 'utf8');
    return JSON.parse(data || '[]');
  } catch (e) {
    return [];
  }
};

const saveUsers = (users) => {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const users = getUsers();

    if (users.find(u => u.email === email)) {
      return res.status(400).json({ status: 'fail', message: 'User with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password: hashedPassword,
      role: role || 'freelancer',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    return res.status(201).json({
      status: 'success',
      message: 'User registered successfully.',
      data: { userId: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
    });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const users = getUsers();
    const user = users.find(u => u.email === email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ status: 'fail', message: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, config.jwtSecret, { expiresIn: '2h' });

    return res.status(200).json({
      status: 'success',
      message: 'Login successful.',
      token: token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) { next(err); }
};

exports.getProfile = async (req, res, next) => {
  try {
    const users = getUsers();
    const user = users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ status: 'fail', message: 'User profile not found.' });

    return res.status(200).json({
      status: 'success',
      data: { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt }
    });
  } catch (err) { next(err); }
};
