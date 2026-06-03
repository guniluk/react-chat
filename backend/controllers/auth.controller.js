import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import generateTokenAndSetCookie from '../lib/generateToken.js';

export const signup = async (req, res) => {
  try {
    const { fullName, username, password, confirmPassword, gender } = req.body;

    if (!fullName || !username || !password || !confirmPassword || !gender) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ error: 'username already exists' });
    }

    // HASH PASSWORD HERE
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Profile Picture Generation using public avatar API
    const boyProfilePic = `https://api.dicebear.com/9.x/avataaars/svg?seed=boy_${username}`;
    const girlProfilePic = `https://api.dicebear.com/9.x/avataaars/svg?seed=girl_${username}`;

    const newUser = new User({
      fullName,
      username,
      password: hashedPassword,
      gender,
      profilePic: gender === 'male' ? boyProfilePic : girlProfilePic,
    });

    if (newUser) {
      // Generate JWT token and set cookie
      const token = generateTokenAndSetCookie(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        username: newUser.username,
        profilePic: newUser.profilePic,
        gender: newUser.gender,
        token: token,
      });
    } else {
      res.status(400).json({ error: 'Invalid user data' });
    }
  } catch (error) {
    console.log('Error in signup controller:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const user = await User.findOne({ username });
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || '',
    );

    if (!user || !isPasswordCorrect) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    const token = generateTokenAndSetCookie(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      profilePic: user.profilePic,
      gender: user.gender,
      token: token,
    });
  } catch (error) {
    console.log('Error in login controller:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie('jwt', '', { maxAge: 0 });
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.log('Error in logout controller:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
