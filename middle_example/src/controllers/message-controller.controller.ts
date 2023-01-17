import {authenticate} from '@loopback/authentication';
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
} from '@loopback/rest';
import { threadId } from 'worker_threads';
import {Message} from '../models';
import {MessageRepository, UserRepository} from '../repositories';
@authenticate({strategy: 'jwt'})

export class MessageControllerController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @repository(MessageRepository)
    public messageRepository : MessageRepository,
  ) {}

  @post('/messages')
  @response(200, {
    description: 'Message model instance',
    content: {'application/json': {schema: getModelSchemaRef(Message)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Message, {
            title: 'NewMessage',
            
          }),
        },
      },
    })
    message: Message,
  ): Promise<Message> {
    return this.messageRepository.create(message);
  }

  @get('/messages/count')
  @response(200, {
    description: 'Message model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Message) where?: Where<Message>,
  ): Promise<Count> {
    return this.messageRepository.count(where);
  }

  @get('/messages/{idSource}')
  @response(200, {
    description: 'Array of Message model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Message, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.path.string('idSource') idSource: string,
    @param.filter(Message) filter?: Filter<Message>,
  ): Promise<Message[]> {
    let list_message: Message[]
    const user = await this.userRepository.findById(idSource);
    if(user.role == 0 ){
      list_message = await this.messageRepository.find(filter)
    }else {
      list_message = await this.messageRepository.find({ where:{idSource: {eq: idSource}}  })
    }
    return list_message
  }





  @get('/message/{id}')
  @response(200, {
    description: 'Message model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Message, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Message, {exclude: 'where'}) filter?: FilterExcludingWhere<Message>
  ): Promise<Message> {
    return this.messageRepository.findById(id, filter);
  }


  @put('/messages/{id}')
  @response(204, {
    description: 'Message PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() message: Message,
  ): Promise<void> {
    await this.messageRepository.replaceById(id, message);
  }

  @put('/messagesOpen/{id}/{etat}')
  @response(204, {
    description: 'Message PUT success',
  })
  async messagesOpen(
    @param.path.string('id') id: string,
    @param.path.string('etat') etat: string,
  ): Promise<void> {
    let message = await this.messageRepository.findById(id)
    if (etat == "true"){
      message.etat = true
    }else if( etat == "false"){
      message.etat = false
    }
    await this.messageRepository.replaceById(id, message);
  }

    @put('/messagesOpenUser/{id}/{etat}')
  @response(204, {
    description: 'Message PUT success',
  })
  async messagesOpenUser(
    @param.path.string('id') id: string,
    @param.path.string('etat') etat: string,
  ): Promise<void> {
    let message = await this.messageRepository.findById(id)
    if (etat == "true"){
      message.unreadbyuser = true
    }else if( etat == "false"){
      message.unreadbyuser = false
    }
    await this.messageRepository.replaceById(id, message);
  }
  
  @del('/messages/{id}')
  @response(204, {
    description: 'Message DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.messageRepository.deleteById(id);
  }
  
  @patch('/messages')
  @response(200, {
    description: 'Message PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Message, {partial: true}),
        },
      },
    })
    message: Message,
    @param.where(Message) where?: Where<Message>,
  ): Promise<Count> {
    return this.messageRepository.updateAll(message, where);
  }

  @patch('/messages/{id}')
  @response(204, {
    description: 'Message PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Message, {partial: true}),
        },
      },
    })
    message: Message,
  ): Promise<void> {
    await this.messageRepository.updateById(id, message);
  }

}
