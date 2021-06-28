import {HttpErrors} from '@loopback/rest';
import {promisify} from 'util';
import {TokenService} from '@loopback/authentication';
import {TokenServiceConstants} from '../keys';
import {MyUserProfile, Credential} from '../types';
import {repository} from '@loopback/repository';
import {UserRepository} from '../../repositories';
import {PasswordHasher} from './hash.password.bcryptjs';
import {PasswordHasherBindings} from '../keys';
import {inject} from '@loopback/context';
import {User} from '../../models';

const jwt = require('jsonwebtoken');
const signAsync = promisify(jwt.sign);
const verifyAsync = promisify(jwt.verify);

export class JWTService implements TokenService {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public passwordHasher: PasswordHasher,
  ) {}

  async verifyToken(token: string): Promise<MyUserProfile> {
    if (!token) {
      throw new HttpErrors.Unauthorized(
        `Error verifying token : 'token' is null`,
      );
    }
    const decryptedToken = await verifyAsync(
      token,
      TokenServiceConstants.TOKEN_SECRET_VALUE,
    );
    const user = await this.userRepository.findById(decryptedToken.id);
    /* if (user.tokenRefreshedAt && user.tokenRefreshedAt >= decryptedToken.iat) {
      throw new HttpErrors.Unauthorized(`The token has expired`);
    }*/
    let userProfile = {
      id: user.id,
      name: user.username,
      email: user.email,
      role: user.role,
    } as MyUserProfile;
    return userProfile;
  }

  async generateToken(userProfile: MyUserProfile): Promise<string> {
    const token = await signAsync(
      userProfile,
      TokenServiceConstants.TOKEN_SECRET_VALUE,
      {
        expiresIn: TokenServiceConstants.TOKEN_EXPIRES_IN_VALUE,
      },
    );

    return token;
  }

  async verifyCredential(credential: Credential): Promise<User> {
    const foundUser = await this.userRepository.findOne({
      where: {email: credential.email},
    });

    if (!foundUser) {
      throw new HttpErrors['NotFound'](
        `User with email ${credential.email} not found.`,
      );
    }

    const passwordMatched = await this.passwordHasher.comparePassword(
      credential.password,
      foundUser.password!!,
    );

    if (!passwordMatched) {
      throw new HttpErrors.Unauthorized('The credentials are not correct');
    }

    return foundUser;
  }

  async getToken(credential: Credential): Promise<string> {
    const foundUser = await this.verifyCredential(credential);
    if (credential.refreshToken) {
      //Log out all other devices
      /*await this.userRepository.updateById(foundUser.id, {
        tokenRefreshedAt: Math.round(new Date().getTime() / 1000),
      });*/
    }
    const currentUser: MyUserProfile = {
      role: foundUser.role,
      id: foundUser.id,
    } as MyUserProfile;
    const token = await this.generateToken(currentUser);
    return token;
  }
}
