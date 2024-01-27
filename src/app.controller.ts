import { Body, Controller, Get, Post, Render } from '@nestjs/common';
import { AppService } from './app.service';
import * as mysql from 'mysql2'; 

const conn = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'webshop',
}).promise();

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('index')
  async index() {
    const [ adatok ] = await conn.execute('SELECT * FROM products');
    console.log(adatok);
    return { products: adatok }
  }

  @Get("/login")
  @Render('login')
  async login() {
  }

  @Post('/login')
  async loginForm(){
    const [ adatok ] = await conn.execute('SELECT * from users WHERE users.username = ?, users.password = ?' [login, password]) 
  }

  @Get('/register')
  @Render('register')
  async register() {

  }
}
