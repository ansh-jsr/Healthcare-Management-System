const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { ethers } = require('ethers');

const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Utility function to validate Ethereum address
const isValidEthereumAddress = (address) => {
  try {
    return ethers.isAddress(address);
  } catch (error) {
    return false;
  }
};

// Verify wallet signature for enhanced security
const verifyWalletSignature = async (address, signature, message) => {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === address.toLowerCase();
  } catch (error) {
    console.error('Signature verification failed:', error);
    return false;
  }
};

exports.register = async (req, res) => {
  try {
    console.log('Register request received:', req.body);
    
    const { name, email, password, role, specialization, license, walletAddress } = req.body;
    
    // Enhanced validation
    if (!name || !email || !password || !role || !walletAddress) {
      return res.status(400).json({ 
        success: false, 
        message: 'Required fields are missing. Name, email, password, role, and wallet address are required.' 
      });
    }
    
    // Validate wallet address format
    if (!isValidEthereumAddress(walletAddress)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Ethereum wallet address format.'
      });
    }
    
    // Check if wallet address is already registered
    const existingWallet = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    if (existingWallet) {
      return res.status(400).json({
        success: false,
        message: 'This wallet address is already registered to another account.'
      });
    }
    
    // Check for existing user by email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already in use.' 
      });
    }
    
    // Create user with all provided fields
    const userData = { 
      name,
      email, 
      password,
      role: role || 'patient',
      walletAddress: walletAddress.toLowerCase() // Store wallet address in lowercase
    };
    
    // Add doctor-specific fields if role is doctor
    if (role === 'doctor') {
      if (specialization) userData.specialization = specialization;
      if (license) userData.license = license;
    }
    
    const user = new User(userData);
    await user.save();
    
    res.status(201).json({ 
      success: true, 
      message: 'User registered successfully',
      userId: user._id,
      walletConnected: true
    });
    
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration',
      error: err.message 
    });
  }
};

// Wallet-based authentication endpoint
exports.walletAuth = async (req, res) => {
  try {
    const { walletAddress, signature, message } = req.body;
    
    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: 'Wallet address is required'
      });
    }
    
    if (!isValidEthereumAddress(walletAddress)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid wallet address format'
      });
    }
    
    // Find user with this wallet address
    const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this wallet address. Please register first.'
      });
    }
    
    // Optional: Verify signature if provided (recommended for production)
    if (signature && message) {
      const isValidSignature = await verifyWalletSignature(walletAddress, signature, message);
      if (!isValidSignature) {
        return res.status(401).json({
          success: false,
          message: 'Invalid wallet signature'
        });
      }
    }
    
    // Generate JWT token
    const token = generateToken(user);
    
    let firstName = '', lastName = '';
    if (user.name) {
      const nameParts = user.name.split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
    }

    // Return user data
    const userData = {
      _id: user._id,
      email: user.email,
      firstName, 
      lastName,  
      role: user.role,
      memberSince: user.createdAt,
      walletAddress: user.walletAddress
    };
    
    // Add role-specific fields
    if (user.role === 'doctor') {
      userData.specialization = user.specialization;
      userData.license = user.license;
    }
    
    res.json({ 
      success: true, 
      token, 
      user: userData,
      authMethod: 'wallet'
    });
  } catch (err) {
    console.error('Wallet auth error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during wallet authentication',
      error: err.message 
    });
  }
};

exports.login = async (req, res) => {
  try {
    console.log('Login attempt for:', req.body.email);
    
    const { email, password ,walletAddress} = req.body;
    
    if (!email || !password || !walletAddress) {
      return res.status(400).json({
        success: false,
        message: 'Email , password and walletAddress are required'
      });
    }
    
    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    
    // Check if user exists
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(401).json({ 
        success: false, 
        message: 'Incorrect email or password. Please try again.' 
      });
    }
          if (user.walletAddress?.toLowerCase() !== walletAddress.toLowerCase()) {
          return res.status(401).json({
          success: false,
          message: 'Wallet address does not match. Please use the correct wallet.'
        });
      }

    console.log('User found, comparing passwords...');
    
    // Check password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      console.log('Password comparison failed for user:', email);
      return res.status(401).json({ 
        success: false, 
        message: 'Incorrect email or password. Please try again.' 
      });
    }
    
    console.log('Password comparison successful for user:', email);

    // Generate JWT token
    const token = generateToken(user);
    
    let firstName = '', lastName = '';
    if (user.name) {
      const nameParts = user.name.split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
    }

    // Return user data (excluding sensitive information)
    const userData = {
      _id: user._id,
      email: user.email,
      firstName, 
      lastName,  
      role: user.role,
      memberSince: user.createdAt,
      walletAddress: user.walletAddress 
    };
    
    // Add role-specific fields
    if (user.role === 'doctor') {
      userData.specialization = user.specialization;
      userData.license = user.license;
    }
    
    res.json({ 
      success: true, 
      token, 
      user: userData,
      authMethod: 'password'
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login',
      error: err.message 
    });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    console.log('Getting current user for:', req.user.id);
    
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Parse name into firstName and lastName
    let firstName = '', lastName = '';
    if (user.name) {
      const nameParts = user.name.split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
    }
    
    // Return user data (excluding sensitive information)
    const userData = {
      _id: user._id,
      firstName,
      lastName,
      email: user.email,
      role: user.role,
      memberSince: user.createdAt ? user.createdAt.toISOString() : null,
      walletAddress: user.walletAddress
    };
    
    // Add role-specific fields
    if (user.role === 'doctor') {
      userData.specialization = user.specialization;
      userData.license = user.license;
    }

    res.json({ 
      success: true, 
      user: userData
    });
  } catch (err) {
    console.error('Get current user error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching user data',
      error: err.message 
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { firstName, lastName, email, specialization, licenseNumber } = req.body;
    
    // Make sure the user is updating their own profile or is an admin
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false, 
        message: 'Not authorized to update this user' 
      });
    }

    // Convert firstName and lastName to name for database
    const name = `${firstName} ${lastName}`.trim();
    
    // Map frontend field names to backend field names
    const updateData = {
      name,
      email
    };
    
    // Add role-specific fields if present
    if (specialization) updateData.specialization = specialization;
    if (licenseNumber) updateData.license = licenseNumber;
    
    // Find user and update
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id, 
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false, 
        message: 'User not found' 
      });
    }

    let responseFirstName = '', responseLastName = '';
    if (updatedUser.name) {
      const nameParts = updatedUser.name.split(' ');
      responseFirstName = nameParts[0] || '';
      responseLastName = nameParts.slice(1).join(' ') || '';
    }
    
    // Convert back to frontend field structure
    const responseUser = {
      _id: updatedUser._id,
      firstName: responseFirstName,
      lastName: responseLastName,
      email: updatedUser.email,
      role: updatedUser.role,
      specialization: updatedUser.specialization,
      licenseNumber: updatedUser.license,
      createdAt: updatedUser.createdAt,
      walletAddress: updatedUser.walletAddress
    };
    
    return res.status(200).json({ 
      success: true,
      message: 'User updated successfully',
      user: responseUser
    });
  } catch (err) {
    console.error('Error updating user:', err);
    return res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: err.message 
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Check if current password matches
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Current password is incorrect' 
      });
    }

    // Set plain password — pre-save hook will hash it
    user.password = newPassword;
    await user.save();

    return res.status(200).json({ 
      success: true,
      message: 'Password updated successfully' 
    });
  } catch (err) {
    console.error('Error changing password:', err);
    return res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: err.message 
    });
  }
};