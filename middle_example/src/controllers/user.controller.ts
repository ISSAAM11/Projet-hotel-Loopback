import {AuthenticationBindings, authenticate} from '@loopback/authentication';
import {Getter, inject} from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
  HttpErrors,
} from '@loopback/rest';
import {
  PasswordHasherBindings,
  MyAuthBindings,
  PasswordHasher,
  CredentialsRequestBody,
  JWTService,
  Credential,
  MyUserProfile,
  Role,
  UserProfileSchema,
  NewCredentialsRequestBody,
  NewCredential,
} from '../authorization';
/*import {MyAuthBindings, PasswordHasherBindings} from '../authorization/keys';
import {Role} from '../authorization/role';
import {PasswordHasher} from '../authorization/services/hash.password.bcryptjs';
import {JWTService} from '../authorization/services/JWT.services';
import {
  MyUserProfile,
  Credential,
  CredentialsRequestBody,
} from '../authorization/types';*/
import {User} from '../models/user.model';
import {UserRepository} from '../repositories/user.repository';

//import { CredentialsRequestBody } from './user.controller';

export class UserController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public passwordHasher: PasswordHasher,
    @inject(MyAuthBindings.TOKEN_SERVICE)
    public jwtService: JWTService,
    @inject.getter(AuthenticationBindings.CURRENT_USER)
    public getCurrentUser: Getter<MyUserProfile>,
  ) {}
  
  @authenticate({strategy: 'jwt', options: {option1: Role.Admin}})
  @post('/users', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {'application/json': {schema: getModelSchemaRef(User)}},
      },
    },
  })
  async create(
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
    if (await this.userRepository.findOne({where: {email: user.email}})) {
      throw new HttpErrors.BadRequest(`This email already exists`);
    } else {
      user.password = await this.passwordHasher.hashPassword(
        user.password || '',
      );
      const newUser = await this.userRepository.create(user);
      delete newUser.password;
      return newUser;
    }
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
    token: string;
    username: string;
    email: string;
    role: Role;
    id: string;
  }> {
    const user = await this.jwtService.verifyCredential(credential);
    const token = await this.jwtService.generateToken({
      role: user.role,
      id: user.id,
    } as MyUserProfile);
    return {
      token,
      username: user.username!!,
      email: user.email!!,
      role: user.role!!,
      id: user.id,
    };
  }

  @authenticate({strategy: 'jwt', options: {option1: Role.Admin}})
  @get('/users/count')
  @response(200, {
    description: 'User model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(User) where?: Where<User>): Promise<Count> {
    return this.userRepository.count(where);
  }

  @authenticate({strategy: 'jwt', options: {option1: Role.Admin}})
  @get('/users')
  @response(200, {
    description: 'Array of User model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(User, {includeRelations: true}),
        },
      },
    },
  })
  async find(@param.filter(User) filter?: Filter<User>): Promise<User[]> {
    return this.userRepository.find(filter);
  }

  @authenticate({strategy: 'jwt', options: {option1: Role.Admin}})
  @patch('/users')
  @response(200, {
    description: 'User PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {partial: true}),
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
        schema: getModelSchemaRef(User, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(User, {exclude: 'where'}) filter?: FilterExcludingWhere<User>,
  ): Promise<User> {
    return this.userRepository.findById(id, filter);
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
          schema: getModelSchemaRef(User, {partial: true}),
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
    await this.userRepository.replaceById(id, user);
  }

  @authenticate({strategy: 'jwt', options: {option1: Role.Admin}})
  @del('/users/{id}')
  @response(204, {
    description: 'User DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.userRepository.deleteById(id);
  }
}
