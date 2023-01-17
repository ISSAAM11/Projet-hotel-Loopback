import { authenticate, AuthenticationBindings } from '@loopback/authentication';
import { Getter, inject } from '@loopback/core';
var _ = require('lodash');

import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where
} from '@loopback/repository';
import {
  del, get,
  getModelSchemaRef, HttpErrors, param, patch, post, put, requestBody,
  response
} from '@loopback/rest';
import { genSalt, hash } from 'bcryptjs';
import {
  Credential, JWTService, MyAuthBindings, MyUserProfile, PasswordHasher, PasswordHasherBindings, Role
} from '../authorization';
import { KeyAndPassword, NodeMailer, ResetPasswordInit, TwilioMessage } from '../models';

import { User } from '../models/user.model';
import { HotelRepository } from '../repositories';
import { UserRepository } from '../repositories/user.repository';
import { EmailService, Twilio } from '../services';

export class UserController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @repository(HotelRepository)
    public hotelRepository: HotelRepository,
    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public passwordHasher: PasswordHasher,
    @inject(MyAuthBindings.TOKEN_SERVICE)
    public jwtService: JWTService,
    @inject.getter(AuthenticationBindings.CURRENT_USER)
    public getCurrentUser: Getter<MyUserProfile>,
    @inject('services.EmailService')
    public emailService: EmailService,
    @inject('services.Twilio')
    public twilioProvider: Twilio
  ) { }
  // @authenticate({strategy: 'jwt', options: {option1: Role.Admin}})
  @post('/users/{id}', {
    responses: {
      '200': {
        description: 'User model instance',
        content: { 'application/json': { schema: getModelSchemaRef(User) } },
      },
    },
  })
  async create(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {
            title: 'NewUser',
            exclude: ['id'],
          }),
        },
      },
    })
    user: Omit<User, 'id'>,
  ): Promise<User> { 
   
    if (user.email) {
      await this.validateEmail(user.email); 
    }else {throw new HttpErrors.NotFound("Erreur, Email required");}

    if (await this.userRepository.findOne({ where: { email: user.email } })) {
      throw new HttpErrors.BadRequest(`This email already exists`);
    } else {
      let newPassword = (Math.floor(Math.random() * (99999999 - 10000001 ) ) + 10000000).toString()
      user.password = newPassword
      user.telephone ? this.sendSMSNewAccount(user) :null ;
      user.email ? this.sendEmail(user) : null;
      user.password = await this.passwordHasher.hashPassword(
        user.password || '',
      );
      const newUser = await this.userRepository.create(user);

      const myInformation = await this.userRepository.findById(id)
      if(newUser.id != null){
        myInformation.myDistributorlist.push(newUser.id)
        await this.userRepository.updateById(id,myInformation);
      }
      else 
        throw new HttpErrors.NotFound("Erreur, l'utilisateur n'a pas créé");     
      delete newUser.password;

      return newUser;
    }
  }
  
  async validateEmail(email: string): Promise<string> {
    const emailRegPattern = /\S+@\S+\.\S+/;
    if (!emailRegPattern.test(email)) {
      throw new HttpErrors.UnprocessableEntity('Invalid email address');
    }
    return email;
  }

  @post('/users/login', {
    responses: {
      '200': {
        description: 'Token',
        content: {
          'application/json': {},
        },
      },
    },
  })
  async login(
    @requestBody({
      description: 'The input of login function',
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['email', 'password'],
            properties: {
              email: {
                type: 'string',
                format: 'email',
              },
              password: {
                type: 'string',
                minLength: 8,
              },
            },
          },
        },
      },
    })
    credential: Credential,
  ): Promise<{
    id: string;
    token: string;
    username: string;
    email: string;
    enable: boolean;
    role: Role;
    idHotel: string
  }> {
    const user = await this.jwtService.verifyCredential(credential);
    const token = await this.jwtService.generateToken({
      role: user.role,
      id: user.id,
    } as MyUserProfile);
    const hotel = await this.hotelRepository.findById(user.idHotel);

    if (hotel.enable == false || hotel.history == true) {
      throw new HttpErrors.Unauthorized('votre compte a été désactiver'); 
    }

    return {
      token,
      ...hotel,
      id: user.id!!,
      username: user.username!!,
      email: user.email!!,
      role: user.role!!,
      enable: user.enable!!,
      idHotel: user.idHotel!!,
    };
    
  }
  

  @authenticate({ strategy: 'jwt', options: { option1: Role.Admin } })
  @get('/users/count')
  
  @response(200, {
    description: 'User model count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async count(@param.where(User) where?: Where<User>): Promise<Count> {
    return this.userRepository.count();
  }

  @authenticate({ strategy: 'jwt', options: { option1: Role.Admin } })
  @get('/usersList/{id}')
  @response(200, {
    description: 'Array of User model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(User, { includeRelations: true }),
        },
      },
    },
  })
  async find(    
    @param.path.string('id') id: string,
    @param.filter(User) filter?: Filter<User>
  ): Promise<User[]> {
    let myInformation = await this.userRepository.findById(id);

    let users = await this.userRepository.find({ where:  {role: {neq: 2}}  },{ where:  {id: {neq: id}}  });
    let myList: User[] = []
    let IdList: string[] = myInformation.myDistributorlist
    let IdList_: string[] = [] 

    if (myInformation.role != 0){
      do{  
        IdList_ = []
        IdList.forEach ( idUser =>{
          users.forEach( thisUser=>{
            if(idUser == thisUser.id){
              myList.push(thisUser)
              Array.prototype.push.apply(IdList_, thisUser.myDistributorlist);
            }
          })
        })
        IdList = IdList_
      }while( IdList.length != 0 )  
    }     
    else {
      myList = users
    }

/*
    if (myInformation.role != 0){
      users.forEach( user => {
        if(user.idCreatorList != null){
          user.idCreatorList.forEach(idCreator => {
            if (idCreator == id) {
              myList.push(user)
            }
          })
        } 
      })  
    }else myList = users
 */   
    return myList
  }

  @authenticate({ strategy: 'jwt', options: { option1: Role.Admin } })
  @patch('/users')
  @response(200, {
    description: 'User PATCH success count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, { partial: true }),
        },
      },
    })
    user: User,
    @param.where(User) where?: Where<User>,
  ): Promise<Count> {
    return this.userRepository.updateAll(user, where);
  }


  @get('/users/{id}')
  @response(200, {
    description: 'User model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(User, { includeRelations: true }),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(User, { exclude: 'where' }) filter?: FilterExcludingWhere<User>,
  ): Promise<User> {
    const newUser = await this.userRepository.findById(id, filter);
    delete newUser.password;
    return newUser
  }

  @patch('/users/{id}')
  @response(204, {
    description: 'User PATCH success',
  })
  async updateById(
    @param.path.number('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, { partial: true }),
        },
      },
    })
    user: User,
  ): Promise<void> {
    await this.userRepository.updateById(id, user);
  }

  @put('/users/{id}')
  @response(204, {
    description: 'User PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() user: User,
  ): Promise<void> {
    await this.userRepository.updateById(id,user);
  }

  @authenticate({ strategy: 'jwt', options: { option1: Role.Admin } })
  @del('/users/{id}')
  @response(204, {
    description: 'User DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.userRepository.deleteById(id);
  }

  @put('/usersAttribute/{id}')
  @response(204, {
    description: 'User PUT success',
  })
  async replaceByIdOneAttribute(
    @param.path.string('id') id: string,
    @requestBody({
      description: 'The input of login function',
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              hotelNumber: { type: 'number'},
              enable: { type: 'boolean'},
              username: {type: 'string'},
              contact: {type: 'string'},
              telephone: {type: 'string'},
              email: {  type: 'string', format: 'email'},
              imageURL: {  type: 'string'}
            },
          },
        },
      },
    })newUser = { username: "", contact:"", telephone: "", email: "", hotelNumber: 0,imageURL:"" , enable: false}
  ): Promise<void> {
    
    const user = await this.userRepository.findById(id);
    delete user.password;
    user.hotelNumber = newUser.hotelNumber
    user.enable = newUser.enable
    user.username = newUser.username
    user.contact = newUser.contact
    user.telephone = newUser.telephone
    user.email = newUser.email
    user.imageURL = newUser.imageURL

    await this.userRepository.updateById(id, user);
  }


  
  @post('/users/loginHotel', {
    responses: {
      '200': {
        description: 'Token',
        content: {
          'application/json': {},
        },
      },
    },
  })
  async loginHotel(
    @requestBody({
      description: 'The input of login function',
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['email', 'password'],
            properties: {
              email: {
                type: 'string',
                format: 'email',
              },
              password: {
                type: 'string',
                minLength: 8,
              },
            },
          },
        },
      },
    })
    credential: Credential,
  ): Promise<{
    id: string;
    token: string;
    username: string;
    email: string;
    enable: boolean;
    role: Role;
    lockSupplier: any
  }> {
    const user = await this.jwtService.verifyCredential(credential);
    const token = await this.jwtService.generateToken({
      role: user.role,
      id: user.id,
    } as MyUserProfile);

    return {
      token,
      id: user.id!!,
      username: user.username!!,
      email: user.email!!,
      role: user.role!!,
      enable: user.enable!!,
      lockSupplier: user.lockSupplier!!
    };
  }

  async sendEmail(thisUser: User): Promise<string> {
    const nodeMailer: NodeMailer = await this.emailService.emailNewUser(thisUser);

    if (nodeMailer.accepted.length) {
      return 'An email with password reset instructions has been sent to the provided email';
    }

    throw new HttpErrors.InternalServerError(
      'Error sending reset password email',
    );
  }



  @put('/reset-password/finish')
  async resetPasswordFinish(
    @requestBody() keyAndPassword: KeyAndPassword,
  ): Promise<string> {
    // Checks whether password and reset key meet minimum security requirements
    const {resetKey, password} = await this.validateKeyPassword(keyAndPassword);

    // Search for a user using reset key
    const foundUser = await this.userRepository.findOne({
      where: {resetKey: resetKey},
    });

    // No user account found
    if (!foundUser) {
      throw new HttpErrors.NotFound(
        'No associated account for the provided reset key',
      );
    }

    // Encrypt password to avoid storing it as plain text
    const passwordHash = await hash(password, await genSalt());

    try {
      // Remove reset key from database its no longer valid
      foundUser.resetKey = '';
      foundUser.password = passwordHash
      // Update the user removing the reset key
      await this.userRepository.updateById(foundUser.id, foundUser);
    } catch (e) {
      return e;
    }

    return 'Password reset request completed successfully';
  }

  @post('/reset-password/init')
  async resetPasswordInit(
    @requestBody() resetPasswordInit: ResetPasswordInit,
  ): Promise<string> {
    const lockSupplier = resetPasswordInit.lockSupplier;

    const foundUser = await this.userRepository.findOne({
      where: {lockSupplier},
    });
    if (!foundUser) {
      throw new HttpErrors.NotFound(
        'No account associated with the provided supplier lock code.',
      );
    }

    let key = (Math.floor(Math.random() * (99999999 - 10000001 ) ) + 10000000).toString()
    foundUser.resetKey = key;
 
    try {
      await this.userRepository.updateById(foundUser.id, foundUser);
    } catch (e) {
      return e;
    }
    const nodeMailer: NodeMailer = await this.emailService.sendResetPasswordMail(foundUser,);
    await this.sendSMSPassword(foundUser)
    console.log(foundUser.telephone)
    
//  Nodemailer has accepted the request. All good
    if (nodeMailer.accepted.length) {
      return 'An email with password reset instructions has been sent to the provided email';
    }

    throw new HttpErrors.InternalServerError(
      'Error sending reset password email',
    );
  }



  async validateKeyPassword(keyAndPassword: KeyAndPassword): Promise<KeyAndPassword> {
    if (!keyAndPassword.password || keyAndPassword.password.length < 8) {
      throw new HttpErrors.UnprocessableEntity(
        'Password must be minimum of 8 characters',
      );
    }

    if (keyAndPassword.password !== keyAndPassword.confirmPassword) {
      throw new HttpErrors.UnprocessableEntity(
        'Password and confirmation password do not match',
      );
    }

    if (
      keyAndPassword.resetKey.length === 0 ||
      keyAndPassword.resetKey.trim() === ''
    ) {
      throw new HttpErrors.UnprocessableEntity('Reset key is mandatory');
    }

    return keyAndPassword;
  }
 
  /////    SMS     /////

  async sendSMSPassword(
    @requestBody() user: User
    ): Promise<string> {    
    const number = user.telephone
    let Body = `Bonjour ${user.username},
Nous avons reçu une demande de réinitialisation du mot de passe de votre compte, 
Voici votre code de vérification: ${user.resetKey}
L'équipe TTHotel`
    this.twilioProvider.send(new TwilioMessage({
      type: 'sms', // supports 'sms' and 'call'
      to: "+" + number, 
      from: process.env.TWILIO_PHONE_NUMBER,
      body: Body,
    })).then((a) => {
      console.log('a', a);
    }).catch((e) => {
      console.error('e', e);
    });
    return "Votre message a été bien transmis vers le numéro: " + user.telephone;
  }
  async sendSMSNewAccount(
    @requestBody() user: User
    ): Promise<string> {    
    const number = user.telephone
    console.log(number)
    let Body = `Bonjour ${user.username},
votre compte a été créé avec succès. Connectez-vous avec le compte ${user.email} et le mot de passe ${user.password},
votre code fournisseur: ${user.lockSupplier}.     
L'équipe TTHotel`
    this.twilioProvider.send(new TwilioMessage({
      type: 'sms', // supports 'sms' and 'call'
      
      to: "+" + number, 
      from: process.env.TWILIO_PHONE_NUMBER,
      body: Body,
    })).then((a) => {
      console.log('a', a);
    }).catch((e) => {
      console.error('e', e);
    });
    return "Votre message a été bien transmis vers le numéro: " + user.telephone;
  }


  @put('/reset-new-password/{id}')
  @response(204, {
    description: 'password update success',
  })
  async resetPassword(
    @param.path.string('id') id: string,
    @requestBody() keyAndPassword: KeyAndPassword,
  ): Promise<string> {    
    const foundUser = await this.userRepository.findById(id);
    if (!foundUser) {
      throw new HttpErrors.NotFound('No associated account for the provided reset key', );
    }
    
    const passwordMatched = await this.passwordHasher.comparePassword(
      keyAndPassword.oldPassword,
      foundUser.password!!,
    );
    
    if (!passwordMatched){
      throw new HttpErrors.NotFound("le mot de passe incorrecte");
    }
    
    const {password} = await this.validateKeyPassword(keyAndPassword);

    const passwordHash = await this.passwordHasher.hashPassword(password || '' );
    try {
      foundUser.password = passwordHash
      await this.userRepository.replaceById(foundUser.id, foundUser);
    } catch (e) {
      return e;
    }

    return 'Password reset request completed successfully';
  }


  @post('/reset-password-ByEmail/init')
  async resetPasswordByEmail(
    @requestBody() email: string,
  ): Promise<string> {

    const foundUser = await this.userRepository.findOne({
      where: {email},
    });
    if (!foundUser) {
      throw new HttpErrors.NotFound(
        'No account associated with the provided supplier lock code.',
      );
    }

    let key = (Math.floor(Math.random() * (99999999 - 10000001 ) ) + 10000000).toString()
    foundUser.resetKey = key;
 
    try {
      await this.userRepository.updateById(foundUser.id, foundUser);
    } catch (e) {
      return e;
    }
    const nodeMailer: NodeMailer = await this.emailService.sendResetPasswordMail(foundUser,);
//    await this.sendSMSPassword(foundUser)
    
//  Nodemailer has accepted the request. All good
    if (nodeMailer.accepted.length) {
      return 'An email with password reset instructions has been sent to the provided email';
    }

    throw new HttpErrors.InternalServerError(
      'Error sending reset password email',
    );
  }
}
