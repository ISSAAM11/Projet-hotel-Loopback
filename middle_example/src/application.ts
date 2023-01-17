import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {MySequence} from './sequence';
import multer from 'multer';     
import{FILE_UPLOAD_SERVICE,STORAGE_DIRECTORY} from './keys'; 

import {AuthenticationComponent, registerAuthenticationStrategy} from '@loopback/authentication';
import {
  JWTAuthenticationComponent,
  UserServiceBindings,
} from '@loopback/authentication-jwt';
import {DbHotelDataSource} from './datasources';
import { JWTService } from './authorization/services/JWT.services';
import { MyAuthBindings, PasswordHasherBindings } from './authorization/keys';
import { BcryptHasher } from './authorization/services/hash.password.bcryptjs';

import { UserRoleProvider } from './providers/user-role.provider';
import { JWTStrategy } from './authorization/strategy/JWT.strategy';
export {ApplicationConfig};

export class Middle extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    this.component(AuthenticationComponent);
    // Mount jwt component
    this.component(JWTAuthenticationComponent);
    // Bind datasource
    this.dataSource(DbHotelDataSource, UserServiceBindings.DATASOURCE_NAME);
    this.configureFileUpload(options.fileStorageDirectory); 

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);
    this.component(AuthenticationComponent);
    // Bind JWT & permission authentication strategy related elements
    registerAuthenticationStrategy(this, JWTStrategy);
    this.bind(MyAuthBindings.TOKEN_SERVICE).toClass(JWTService);
    this.bind(MyAuthBindings.USER_ROLE).toProvider(UserRoleProvider);
    this.bind(PasswordHasherBindings.ROUNDS).to(10);
    this.bind(PasswordHasherBindings.PASSWORD_HASHER).toClass(BcryptHasher);
    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };

    
  }
    protected configureFileUpload(destination?: string) {
   // Upload files to `dist/.sandbox` by default
   destination = destination ?? path.join(__dirname, '../.sandbox');
   this.bind(STORAGE_DIRECTORY).to(destination);
   const multerOptions: multer.Options = {
     storage: multer.diskStorage({
       destination,
       // Use the original file name as is
       filename: (req, file, cb) => {
         cb(null, file.originalname);
       },
     }),
   };
   // Configure the file upload service with multer options
   this.configure(FILE_UPLOAD_SERVICE).to(multerOptions);
  }
}
