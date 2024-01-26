    const { createConnection } = require('mysql2/promise')
    const flash = require('express-flash')
    const express = require('express')

    const app = express()

    const dbConfig = {
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'module',
    };

    const getConnection = async () => {
        return await createConnection(dbConfig);
    }

    app.delete('/delete-item/:id', async (req, res) => {
        const itemId = req.params.id;
    
        try {
            const connection = await getConnection();
            // Пример выполнения запроса DELETE
            await connection.execute('DELETE FROM workspace WHERE id = ?', [itemId]);
            res.redirect('back')
        } catch (error) {
            console.error('Ошибка выполнения запроса:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    const workspace1 = async (req, res) => {
        try {
            const connection = await getConnection();
            
            if (req.method === 'POST') {
                const { title, description } = req.body;
        
                // Пример выполнения запроса INSERT
                await connection.execute('INSERT INTO workspace (title, description) VALUES (?, ?)', [title, description]);
    
                // После вставки данных, получим обновленные данные из базы
                const [rows, fields] = await connection.execute('SELECT * FROM workspace');
                
                // Рендерим вид с обновленными данными
                res.render('workspace-demo1', { data: rows });
            } else {
                // Если это GET-запрос, просто отображаем текущие данные
                const [rows, fields] = await connection.execute('SELECT * FROM workspace');
                res.render('workspace-demo1', { data: rows });
            }
        } catch (error) {
            req.flash('error', 'Одно и то же название заголовка недопустимо!');
            return res.redirect('/workspace-demo1');
        }
    }

    const workspace2 = async (req, res) => {
        try {
            const connection = await getConnection();
            // Пример выполнения запроса SELECT
            const [rows, fields] = await connection.execute('SELECT * FROM workspace');
            res.render('workspace-demo2', { data: rows });
        } catch (error) {
            console.error('Ошибка выполнения запроса:', error);
            res.status(500).send('Internal Server Error');
        }
    }


    module.exports = {workspace1, workspace2}