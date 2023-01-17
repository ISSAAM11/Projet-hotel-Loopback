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
import {Hotel, PurchaseOrder, User} from '../models';
import {HotelRepository, ProduitRepository, PurchaseOrderRepository, UserRepository} from '../repositories';

export class PurchaseOrderController {
  constructor(
    @repository(ProduitRepository)
    public produitRepository : ProduitRepository,    
    @repository(HotelRepository)
    public hotelRepository: HotelRepository,
    @repository(PurchaseOrderRepository)
    public purchaseOrderRepository : PurchaseOrderRepository,
    @repository(UserRepository)
    public userRepository: UserRepository,

  ) {}

  @get('/purchase-orders/count')
  @response(200, {
    description: 'PurchaseOrder model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(PurchaseOrder) where?: Where<PurchaseOrder>,
  ): Promise<Count> {
    return this.purchaseOrderRepository.count(where);
  }

  @get('/purchase-orders')
  @response(200, {
    description: 'Array of PurchaseOrder model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(PurchaseOrder, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(PurchaseOrder) filter?: Filter<PurchaseOrder>,
  ): Promise<PurchaseOrder[]> {
    return this.purchaseOrderRepository.find(filter);
  }

  @patch('/purchase-orders')
  @response(200, {
    description: 'PurchaseOrder PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(PurchaseOrder, {partial: true}),
        },
      },
    })
    purchaseOrder: PurchaseOrder,
    @param.where(PurchaseOrder) where?: Where<PurchaseOrder>,
  ): Promise<Count> {
    return this.purchaseOrderRepository.updateAll(purchaseOrder, where);
  }

  @get('/purchase-orders/{id}')
  @response(200, {
    description: 'PurchaseOrder model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(PurchaseOrder, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(PurchaseOrder, {exclude: 'where'}) filter?: FilterExcludingWhere<PurchaseOrder>
  ): Promise<PurchaseOrder> {
    return this.purchaseOrderRepository.findById(id, filter);
  }

  @patch('/purchase-orders/{id}')
  @response(204, {
    description: 'PurchaseOrder PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(PurchaseOrder, {partial: true}),
        },
      },
    })
    purchaseOrder: PurchaseOrder,
  ): Promise<void> {
    await this.purchaseOrderRepository.updateById(id, purchaseOrder);
  }

  @put('/purchase-orders/{id}')
  @response(204, {
    description: 'PurchaseOrder PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() purchaseOrder: PurchaseOrder,
  ): Promise<void> {
    await this.purchaseOrderRepository.replaceById(id, purchaseOrder);
  }

  @del('/purchase-orders/{id}')
  @response(204, {
    description: 'PurchaseOrder DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.purchaseOrderRepository.deleteById(id);
  }

  @post('/purchase-orders/{idUser}')
  @response(200, {
    description: 'PurchaseOrder model instance',
    content: {'application/json': {schema: getModelSchemaRef(PurchaseOrder)}},
  })
  async create(
    @param.path.string('idUser') idUser: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(PurchaseOrder, {
            title: 'NewPurchaseOrder',
            
          }),
        },
      },
    })
    
    purchaseOrder: PurchaseOrder,
  ): Promise<PurchaseOrder> {
    let user = await this.userRepository.findById(idUser)
    this.purchaseOrderRepository.create(purchaseOrder).then(
      res => {
        console.log(res)
        res.id? user?.myPurchaseOrderlist.push(res.id ): null
        this.userRepository.replaceById(idUser, user);

      }  
    )
    return purchaseOrder
  }



  @put('/attribut-purchase-orders/')
  @response(204, {
    description: 'PurchaseOrder PUT success',
  })
  async attributPurchaseOrders(
    @requestBody() purchaseOrder: PurchaseOrder,
  ): Promise<Hotel> {
    


      let hotel = await this.hotelRepository.findById(purchaseOrder?.hotel?.id);
    
    purchaseOrder?.ProductList.forEach( async (purchaseProduct)=> {

      let Product = await this.produitRepository.findById(purchaseProduct.id)
      {Product.amount && purchaseProduct.amount ? Product.amount -= purchaseProduct?.amount: null}
      await this.produitRepository.replaceById(purchaseProduct.id ,Product )

      
      /*
      if(purchaseProduct.type == "Serrure")
{hotel.lockAmmount!= null && purchaseProduct.amount ? hotel.lockAmmount +=(hotel.lockAmmount)*1 + (purchaseProduct?.amount)*1  : null}
      else if(purchaseProduct.type == "Dispositif réseau")
{hotel.gatewayAmmount!= null && purchaseProduct.amount ? hotel.gatewayAmmount += (hotel.gatewayAmmount)*1 + (purchaseProduct?.amount)*1  : null}
      else if(purchaseProduct.type == "Contrôleur d'ascenceur")
{hotel.liftAmmount!= null && purchaseProduct.amount ? hotel.liftAmmount += (hotel.liftAmmount)*1 + (purchaseProduct?.amount)*1 : null}
      else if(purchaseProduct.type == "Mode économique")
{hotel.energyAmmount!= null && purchaseProduct.amount ? hotel.energyAmmount = (hotel.energyAmmount)*1 + (purchaseProduct?.amount)*1  : null}
      
      console.log( purchaseProduct?.amount )
      console.log( hotel )
*/
    })

     /*
      hotel.purchaseOrder.push(purchaseOrder.id)

      {hotel?.energyAmmount? hotel.energyAmmount += ModeEconomicAmount: null}
      {hotel?.gatewayAmmount? hotel.gatewayAmmount += gatewayAmount: null}
      {hotel?.lockAmmount? hotel.lockAmmount += lockAmount: null}
      {hotel?.liftAmmount? hotel.liftAmmount += liftContollerAmount: null}

      console.log(hotel)
      await this.hotelRepository.replaceById(hotel.id, hotel);
    */
    
    hotel.purchaseOrder.push(purchaseOrder.id)
    await this.hotelRepository.replaceById(hotel.id ,hotel )

    return hotel
  } 




  @get('/my-purchase-orders-list/{id}')
  @response(200, {
    description: 'Array of PurchaseOrder model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(PurchaseOrder, {includeRelations: true}),
        },
      },
    },
  })
  async findMyList(
    @param.path.string('id') id: string,
  ): Promise<Object[]> {

    const thisUser = await this.userRepository.findById(id)
    const allPurchaseOrders = await this.purchaseOrderRepository.find();
    const OrdersListId = thisUser?.myPurchaseOrderlist
    let purchaseOrderList: Object[]  = []  

    if ( thisUser.role != 0 ){
      OrdersListId.forEach((OrderId)=> {
        allPurchaseOrders. forEach((PurchaseOrder)=> {
          if(PurchaseOrder.id == OrderId){
            purchaseOrderList.push(PurchaseOrder) 
            console.log("test")
          }
        })
      })
    }else{
      purchaseOrderList = allPurchaseOrders 

    }
    
    return purchaseOrderList
  }
}
