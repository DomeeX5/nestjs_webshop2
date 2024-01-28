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
    return { errors: [] }
  }
  
  @Post('/login')
  @Render('login')
  async loginForm(@Body() existingUser: UserLogin, @Res() res: Response){
    const errors: string[] = [];
    const [ success ] = await conn.execute('SELECT email, username, password from users WHERE username = ?, password = ?' [existingUser.username, existingUser.password]) 
    if( !success ) {
      errors.push('A felhasználónév vagy a jelszó helytelen!')
    } else {
      if(errors.length > 0) {
        return { 
          errors,
        }
      }
      res.redirect('/')
    }
  }

  @Get('/register')
  @Render('register')
  async register() {
    return { errors: [] }
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
    } else { errors.push('') }
    if(!regexUsername.test(newUser.username)){
      errors.push('A felhasználó név maximum 10 karakter lehet!')
    } else { errors.push('') }
    if(newUser.password.length < 8 || !regexPassword.test(newUser.password)){
      errors.push('A jelszó minimum 8 karakter kell legyen, és kell tartalmazzon nagybetűt, és számot!')
    } else { errors.push('') }
    if(newUser.password !== newUser.password_again){
      errors.push('A két jelszó nem egyezik!')
    } else { errors.push('') }
    
    if(errors.length > 4) {
      return {
        errors,
      };
    } else {
      const [ adatok ] = await conn.execute(
        'INSERT INTO users (email, username, password) VALUES (?,?,?)',
        [newUser.email, newUser.username, newUser.password]
        );
    }
    res.redirect('/');
  }
}
