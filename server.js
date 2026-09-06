import express from 'express';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';


dotenv.config();

const app = express();
app.use(express.json()); 
app.use(express.static('public')); 

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

app.post('/registro', async (req, res) => {
  try {
    const { nombre, correo, clave, categoria } = req.body;

    if (!nombre || !correo || !clave) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    const saltRounds = 10; 
    const claveHasheada = await bcrypt.hash(clave, saltRounds);

    const { data, error } = await supabase
      .from('streamers')
      .insert([
        { 
          nombre: nombre, 
          correo: correo, 
          clave: claveHasheada, 
          categoria: categoria  
        }
      ]);

    if (error) throw error;

    res.status(201).json({ mensaje: 'Streamer registrado con éxito' });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Hubo un problema al registrar el streamer' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});



app.post('/login', async (req, res) => {
  try {
    const { correo, clave } = req.body;

    if (!correo || !clave) {
      return res.status(400).json({ error: 'Debes enviar correo y clave' });
    }

    const { data: streamer, error } = await supabase
      .from('streamers')
      .select('*')
      .eq('correo', correo)
      .single();

    if (error || !streamer) {
      return res.status(401).json({ error: 'Credenciales inválidas' }); 
    }

    const claveValida = await bcrypt.compare(clave, streamer.clave);

    if (!claveValida) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const payload = {
      id: streamer.id,
      nombre: streamer.nombre,
      categoria: streamer.categoria 
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { 
      expiresIn: '2h' 
    });

    res.json({ 
      mensaje: 'Login exitoso', 
      token: token 
    });

  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({ error: 'Hubo un error al procesar el login' });
  }
});


const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 

  if (!token) {
    return res.status(403).json({ error: 'Acceso denegado: Se requiere un token' });
  }

  try {
    const payloadDecodificado = jwt.verify(token, process.env.JWT_SECRET);
    req.streamer = payloadDecodificado; 
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

app.get('/canal', verificarToken, (req, res) => {
  try {
    const { nombre, categoria } = req.streamer;
    
    // Armamos el texto dentro de la variable "nombre" para engañar al frontend
    // y que imprima todo junto.
    res.json({ 
      mensaje: '¡Bienvenido a tu panel de control',
      nombre: `${nombre} - Categoría: ${categoria || 'General'}` 
    });

  } catch (error) {
    console.error('Error en /canal:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});