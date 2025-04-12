// api/routes/usuarios.js
const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db');

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

module.exports = router;
