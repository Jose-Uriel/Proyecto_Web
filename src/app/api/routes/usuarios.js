// api/routes/usuarios.js
const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const plainPassword = 'admin1234';
bcrypt.hash(plainPassword, saltRounds, function(err, hash) {
  console.log('Hashed password:', hash);
  // Use this hash in your database update
});


// Obtener todos los usuarios
router.get('/', async (req, res) => 
{
  try 
  {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Users');
    res.json(result.recordset);
  } 
  catch (err) 
  {
    res.status(500).send(err.message);
  }
});

// Obtener un usuario por ID
router.get('/:id', async (req, res) => 
{
  try 
  {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT * FROM Users WHERE UserID = @id');
    res.json(result.recordset[0]);
  } 
  catch (err) 
  {
    res.status(500).send(err.message);
  }
});

// Crear un nuevo usuario
router.post('/', async (req, res) => 
{
  const { Username, PasswordHash, Email, Role } = req.body;
  try 
  {
    const pool = await poolPromise;
    await pool.request()
      .input('Username', sql.NVarChar, Username)
      .input('PasswordHash', sql.NVarChar, PasswordHash)
      .input('Email', sql.NVarChar, Email)
      .input('Role', sql.NVarChar, Role)
      .query(`INSERT INTO Users (Username, PasswordHash, Email, Role)
              VALUES (@Username, @PasswordHash, @Email, @Role)`);
    res.status(201).send('Usuario creado');
  } 
  catch (err) 
  {
    res.status(500).send(err.message);
  }
});

// Actualizar un usuario
router.put('/:id', async (req, res) => 
{
  const { Username, PasswordHash, Email, Role } = req.body;
  try 
  {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, req.params.id)
      .input('Username', sql.NVarChar, Username)
      .input('PasswordHash', sql.NVarChar, PasswordHash)
      .input('Email', sql.NVarChar, Email)
      .input('Role', sql.NVarChar, Role)
      .query(`UPDATE Users 
              SET Username = @Username, PasswordHash = @PasswordHash,
                  Email = @Email, Role = @Role
              WHERE UserID = @id`);
    res.send('Usuario actualizado');
  } 
  catch (err) 
  {
    res.status(500).send(err.message);
  }
});

// Eliminar un usuario
router.delete('/:id', async (req, res) => 
{
  try 
  {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('DELETE FROM Users WHERE UserID = @id');
    res.send('Usuario eliminado');
  } 
  catch (err) 
  {
    res.status(500).send(err.message);
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('username', sql.NVarChar, username)
      .query('SELECT * FROM Users WHERE Username = @username');
    
    const user = result.recordset[0];
    
    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }
    
    // Compare password with stored hash
    const match = await bcrypt.compare(password, user.PasswordHash);
    
    if (!match) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }
    
    // Remove password from response
    const { PasswordHash, ...userWithoutPassword } = user;
    
    res.json(userWithoutPassword);
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Registration endpoint
router.post('/register', async (req, res) => {
  const { username, password, email, Role } = req.body;
  
  try {
    const pool = await poolPromise;
    
    // Check if username already exists
    const checkUser = await pool.request()
      .input('username', sql.NVarChar, username)
      .query('SELECT COUNT(*) as count FROM Users WHERE Username = @username');
    
    if (checkUser.recordset[0].count > 0) {
      return res.status(400).json({ message: 'El nombre de usuario ya está en uso' });
    }
    
    // Check if email already exists
    const checkEmail = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT COUNT(*) as count FROM Users WHERE Email = @email');
    
    if (checkEmail.recordset[0].count > 0) {
      return res.status(400).json({ message: 'El correo electrónico ya está registrado' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Insert new user - ensure Role is 'user' unless specified otherwise
    await pool.request()
      .input('Username', sql.NVarChar, username)
      .input('PasswordHash', sql.NVarChar, hashedPassword)
      .input('Email', sql.NVarChar, email)
      .input('Role', sql.NVarChar, Role || 'user') // Default to 'user' if not provided
      .query(`INSERT INTO Users (Username, PasswordHash, Email, Role)
              VALUES (@Username, @PasswordHash, @Email, @Role)`);
    
    res.status(201).json({ message: 'Usuario registrado exitosamente' });
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Verify account for password recovery
router.post('/verify-account', async (req, res) => {
  const { username, email } = req.body;
  
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('username', sql.NVarChar, username)
      .input('email', sql.NVarChar, email)
      .query('SELECT COUNT(*) as count FROM Users WHERE Username = @username AND Email = @email');
    
    if (result.recordset[0].count === 0) {
      return res.status(404).json({ message: 'No se encontró ninguna cuenta con ese usuario y email.' });
    }
    
    // Account verified
    res.status(200).json({ message: 'Cuenta verificada correctamente' });
  } catch (err) {
    console.error('Error during account verification:', err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  const { username, newPassword } = req.body;
  
  try {
    const pool = await poolPromise;
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update user's password
    const result = await pool.request()
      .input('username', sql.NVarChar, username)
      .input('passwordHash', sql.NVarChar, hashedPassword)
      .query('UPDATE Users SET PasswordHash = @passwordHash WHERE Username = @username');
    
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'No se encontró el usuario.' });
    }
    
    res.status(200).json({ message: 'Contraseña actualizada correctamente' });
  } catch (err) {
    console.error('Error resetting password:', err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

module.exports = router;
