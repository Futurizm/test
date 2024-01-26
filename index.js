const express = require('express')
const { createConnection } = require('mysql2/promise')
const path = require('path')
const session = require('express-session')
const flash = require('express-flash')
const crypto = require('crypto')
const {workspace1, workspace2} = require('./dashboard')

const app = express();
const PORT = process.env.PORT || 5000;


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session({ secret: 'my-secret-key', resave: false, saveUninitialized: true }));
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'module',
};

const connectToDatabase = async () => {
  try {
    return await createConnection(dbConfig);
  } catch (error) {
    console.error('Ошибка подключения к базе данных:', error.message);
    throw error;
  }
};

const allowedUsers = {
  'demo1': 'skills2023d1',
  'demo2': 'skills2023d2'
}

const generateToken = () => {
  return crypto.randomBytes(32).toString('hex')
}


app.get('/workspace-demo1', workspace1)

app.get('/workspace-demo2', workspace2)

app.post('/workspace-demo1', workspace1)


app.get('/login', (req, res) => {
  res.render('login');
})

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    req.flash('error', 'Недостаточно данных')
    return res.redirect('/login')
  }

  try {
    const connection = await connectToDatabase();

    // Ищем пользователя в базе данных
    const [rows] = await connection.execute('SELECT * FROM users WHERE username = ?', [username]);

    if (rows.length === 0) {
      req.flash('error', 'Пользователь не найден');
      return res.redirect('/login');
    }

    if (username === 'demo1') {
      return res.redirect('/workspace-demo1')
    } else if (username === 'demo2') {
      return res.redirect('/workspace-demo2')
    }

    console.log({ success: true, message: 'Вход выполнен успешно' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
})


app.get("/users", async (req, res) => {
  const connection = await connectToDatabase()
  try {
    const [rows, fields] = await connection.execute('SELECT * FROM users');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

const start = () => {
  try {
    app.listen(PORT, () => console.log(`Started on port ${PORT}`))
  } catch (error) {
    console.log(error)
  }
}


start()