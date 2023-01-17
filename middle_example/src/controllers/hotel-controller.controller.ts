import {authenticate} from '@loopback/authentication';
import { inject } from '@loopback/core';

import {
  AnyObject,
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
import {Hotel, NodeMailer, PurchaseOrder, ResetPasswordInit, TwilioMessage} from '../models';
import {HotelRepository, PurchaseOrderRepository} from '../repositories';
import {User} from '../models/user.model';
import {UserRepository} from '../repositories/user.repository';
import { PasswordHasherBindings, PasswordHasher} from '../authorization';
import { EmailService, Twilio } from '../services';
@authenticate({strategy: 'jwt'})

export class HotelControllerController {
  constructor(
    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public passwordHasher: PasswordHasher,
    @inject('services.EmailService')
    public emailService: EmailService,
    @repository(UserRepository)
    public userRepository: UserRepository,
    @repository(HotelRepository)
    public hotelRepository: HotelRepository,
    @repository(PurchaseOrderRepository)
    public purchaseOrderRepository : PurchaseOrderRepository,
    @inject('services.Twilio')
    public twilioProvider: Twilio
  ) { }

  @post('/hotels/{id}')
  @response(200, {
    description: 'Hotel model instance',
    content: {'application/json': {schema: getModelSchemaRef(Hotel)}},
  })
  async create(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Hotel, {
            title: 'NewHotel',
          }),
        },
      },
    })
    hotel: Hotel,
  ): Promise<Hotel> {    
    if (await this.userRepository.findOne({ where: { email: hotel.account } }) || await this.hotelRepository.findOne({ where: { account: hotel.account } }) ) {
      throw new HttpErrors.BadRequest(`This email already exists`);
    }else{  

    if (await this.hotelRepository.findOne({ where: { phone: hotel.phone } })  && hotel.phone != ""  ) {
      throw new HttpErrors.BadRequest(`This phone number already exists`);
    }else{ 

        let password = (Math.floor(Math.random() * (99999999 - 10000001 ) ) + 10000000).toString()
        let newUser:User = {
        username: hotel.name, password: password, email: hotel.account, enable: false, role: 2, telephone: hotel.phone,
        tokenRefreshedAt: 0,
        hotelNumber : 0,
        myDistributorlist: [],
        myHotelslist: [],
        myProductlist: [],
        myPurchaseOrderlist: [],
        getId: function () {
          throw new Error('Function not implemented.');
        },
        getIdObject: function (): Object {
          throw new Error('Function not implemented.');
        },
        toJSON: function (): Object {
          throw new Error('Function not implemented.');
        },
        toObject: function (options?: AnyObject | undefined): Object {
          throw new Error('Function not implemented.');
        }
      } 
      
      newUser.email != ""  ? this.sendEmail( newUser) : console.log("error no email to send a mail")   
      newUser.telephone != "" ? this.sendSMSNewHotel(newUser) : console.log("error no phone number to send an SMS")

      password = await this.passwordHasher.hashPassword(  password || '',  );

      newUser.password = password


      let myInformation = await this.userRepository.findById(id)
      hotel.idCreateur = id 
      await this.hotelRepository.create(hotel).then( res => {
        const newid = res.id
        newid != undefined? myInformation.myHotelslist.push(newid) : null ;
        myInformation.hotelNumber != null? myInformation.hotelNumber += 1: null ;
        this.userRepository.updateById(id, myInformation);
        newUser.idHotel = res.id
        this.userRepository.create(newUser);
      })
      return hotel;
    }}
  }

  @get('/hotels/count')
  @response(200, {
    description: 'Hotel model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Hotel) where?: Where<Hotel>,
  ): Promise<Count> {
    return this.hotelRepository.count(where);
  }

  @get('/hotelsList/{id}')
  @response(200, {
    description: 'Array of Hotel model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Hotel, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.filter(Hotel) filter?: Filter<Hotel>,
  ): Promise<Hotel[]> {    
    
    let myInformation = await this.userRepository.findById(id);
    let myList: Hotel[] = []

    let hotels = await this.hotelRepository.find(filter)
    let users = await this.userRepository.find({ where:  {role: {neq: 2}}  },{ where:  {id: {neq: id}}  });

    let IdList: string[] = myInformation.myDistributorlist
    let IdList_: string[] = [] 

    let myHotelsId : string[] = myInformation.myHotelslist
    if (myInformation.role != 0){
      do{  
        IdList_ = []
        IdList.forEach ( idUser => {
          users.forEach ( thisUser => {
            if(idUser == thisUser.id){
              Array.prototype.push.apply(myHotelsId, thisUser.myHotelslist);
              Array.prototype.push.apply(IdList_, thisUser.myDistributorlist);
            }
          })
        })
        IdList = IdList_
      }while( IdList.length != 0 ) 
      console.log(myHotelsId);
      myHotelsId.forEach( idhotel => {
        hotels.forEach( hotel => {
          if(idhotel == hotel.id){
            myList.push(hotel)
          }
        })
      })

    }     
    else { myList = hotels }

    return myList;
  }


  @patch('/hotels')
  @response(200, {
    description: 'Hotel PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Hotel, {partial: true}),
        },
      },
    })
    hotel: Hotel,
    @param.where(Hotel) where?: Where<Hotel>,
  ): Promise<Count> {
    return this.hotelRepository.updateAll(hotel, where);
  }

  @get('/hotels/{id}')
  @response(200, {
    description: 'Hotel model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Hotel, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Hotel, {exclude: 'where'}) filter?: FilterExcludingWhere<Hotel>
  ): Promise<Hotel> {
    return this.hotelRepository.findById(id, filter);
  }

  @patch('/hotels/{id}')
  @response(204, {
    description: 'Hotel PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Hotel, {partial: true}),
        },
      },
    })
    hotel: Hotel,
  ): Promise<void> {
    await this.hotelRepository.updateById(id, hotel);
  }

  @put('/hotels/{id}')
  @response(204, {
    description: 'Hotel PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() hotel: Hotel,
  ): Promise<void> {
    await this.hotelRepository.replaceById(id, hotel);
  }

  @put('/hotels/History/{id}')
  @response(204, {
    description: 'Hotel PUT success',
  })
  async deleteToHistoryById(
    @param.path.string('id') id: string,
    @requestBody() hotel: Hotel,
  ): Promise<void> {
    await this.hotelRepository.replaceById(id, hotel);
  }


  @del('/hotels/{id}') //{idUser}
  @response(204, {
    description: 'Hotel DELETE success',
  })
  async deleteById(@param.path.string('id') id: string,): Promise<void> { // @param.path.string('idUser') idUser: string,
  /*  const user = await this.userRepository.findById(idUser)
    user.hotelNumber != null && user.hotelNumber > 0 ? user.hotelNumber -= 1 : null ;
    await this.userRepository.replaceById(idUser,user)*/
    const thisHotel = await this.hotelRepository.findById(id);
    let userCreateur = await this.userRepository.findById(thisHotel.idCreateur);
    userCreateur.hotelNumber? userCreateur.hotelNumber = userCreateur.hotelNumber - 1 : null;

    const user = await this.userRepository.findOne({ where: { idHotel: thisHotel.id } })
    
    const index = userCreateur.myHotelslist.findIndex(idhotel => {
      return idhotel == id
    })
    userCreateur.myHotelslist.splice(index, 1,)

    await this.userRepository.replaceById(userCreateur.id, userCreateur);
    user? await this.userRepository.deleteById(user.id) : null
    await this.hotelRepository.deleteById(id);
  }


  async sendEmail(user: User): Promise<string> {
  
    if (user.email) {
       await this.validateEmail(user.email)
    }else {return "no Email eo send";}
    

    const nodeMailer: NodeMailer = await this.emailService.emailHotel(user);

    if (nodeMailer.accepted.length) {
      return 'An email with password reset instructions has been sent to the provided email';
    }

    throw new HttpErrors.InternalServerError(
      'Error sending reset password email',
    );
  }

  async validateEmail(email: string): Promise<string> {
    const emailRegPattern = /\S+@\S+\.\S+/;
    if (!emailRegPattern.test(email)) {
      throw new HttpErrors.UnprocessableEntity('Invalid email address');
    }
    return email;
  }

  async sendSMSNewHotel(
    @requestBody() user: User
    ): Promise<string> {    
    const number = user.telephone
    let Body = `Bonjour ${user.username},
Votre hôtel a été créé avec succés. Connectez-vous avec le compte ${user.email} et le mot de passe ${user.password},
L'équipe TTHotel`

    this.twilioProvider.send(new TwilioMessage({
      type: 'sms', // supports 'sms' and 'call'
      to: "+"+number, 
      from: process.env.TWILIO_PHONE_NUMBER,
      body: Body,
    })).then((a) => {
      console.log('a', a);
    }).catch((e) => {
      console.error('e', e);
    });
    return "Votre message a été bien transmis vers le numéro: " + user.telephone;
  }





  @get('/hotelsDeviceAmount/{id}')
  @response(200, {
    description: 'Hotel model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Hotel, {includeRelations: true}),
      },
    },
  })
  async DeviceAmount(
    @param.path.string('id') id: string,
  ): Promise<Hotel> {
    let hotel = await this.hotelRepository.findById(id);
    
    let purchaseList: PurchaseOrder
    let d = hotel.purchaseOrder.forEach((element)=>{
      return this.purchaseOrderRepository.findById(element)
    })
/*
    purchaseList? purchaseList.ProductList : 
*/
    return hotel
  }

}
