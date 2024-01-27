import { Body, Controller, Get, Post, Render, Res } from '@nestjs/common';
import { AppService } from './app.service';
import * as mysql from 'mysql2'; 
import { UserLogin, UserRegister } from './Interfaces';
import { Response } from 'express';

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

  @Post('/loginSuccess')
  @Render('login')
  async loginForm(@Body() existingUser: UserLogin, @Res() res: Response){
    const errors: string[] = [];
    const [ success ] = await conn.execute('SELECT * from users WHERE username = ?, password = ?' [existingUser.username, existingUser.password]) 
    res.redirect('/')
  }

  @Get('/register')
  @Render('register')
  async register() {

  }

  @Post('/register')
  @Render('register')
  async registerForm(@Body() newUser: UserRegister, @Res() res: Response){
    const errors: string[] = [];
    const regexEmail = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    const regexUsername = /^\w{1,10}$/;
    const regexPassword = /[a-zA-Z0-9]/;
    if(!regexEmail.test(newUser.email)){
      errors.push('Az email-cím helytelen!')
    }
    if(!regexUsername.test(newUser.username)){
      errors.push('A felhasználó név maximum 10 karakter lehet!')
    }
    if(newUser.password.length < 8 || !regexPassword.test(newUser.password)){
      errors.push('A jelszó minimum 8 karakter kell legyen, és kell tartalmazzon nagybetűt, és számot!')
    }
    if(newUser.password_again !== newUser.password){
      errors.push('A két jelszó nem egyezik!')
    } else {
      const [ adatok ] = await conn.execute('INSERT INTO users (email, username, password) VALUES (?,?,?)', [newUser.email, newUser.username, newUser.password]) 
      res.redirect('/login');
      return { registerSuccess: adatok }
    }
  }
}
