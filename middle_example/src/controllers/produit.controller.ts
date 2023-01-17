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
import {Produit} from '../models';
import {ProduitRepository, UserRepository} from '../repositories';

export class ProduitController {
  constructor(
    @repository(ProduitRepository)
    public produitRepository : ProduitRepository,    
    @repository(UserRepository)
    public userRepository: UserRepository,

  ) {}

  @post('/produits/{id}')
  @response(200, {
    description: 'Produit model instance',
    content: {'application/json': {schema: getModelSchemaRef(Produit)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Produit, {
            title: 'NewProduit',
          }),},},
    })
    produit: Produit,
    @param.path.string('id') id: string,
  ): Promise<Produit> {
    let user = await this.userRepository.findById(id)
    await this.produitRepository.create(produit).then( 
      res => {
        res.id? user.myProductlist.push(res.id) : null;
        this.userRepository.replaceById(id, user);
      }
    )
    
    return produit;
  }

  @get('/produits/count')
  @response(200, {
    description: 'Produit model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Produit) where?: Where<Produit>,
  ): Promise<Count> {
    return this.produitRepository.count(where);
  }

  @get('/produits')
  @response(200, {
    description: 'Array of Produit model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Produit, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Produit) filter?: Filter<Produit>,
  ): Promise<Produit[]> {
    return this.produitRepository.find(filter);
  }

  @patch('/produits')
  @response(200, {
    description: 'Produit PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Produit, {partial: true}),
        },
      },
    })
    produit: Produit,
    @param.where(Produit) where?: Where<Produit>,
  ): Promise<Count> {
    return this.produitRepository.updateAll(produit, where);
  }

  @get('/produits/{id}')
  @response(200, {
    description: 'Produit model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Produit, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Produit, {exclude: 'where'}) filter?: FilterExcludingWhere<Produit>
  ): Promise<Produit> {
    return this.produitRepository.findById(id, filter);
  }

  @patch('/produits/{id}')
  @response(204, {
    description: 'Produit PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Produit, {partial: true}),
        },
      },
    })
    produit: Produit,
  ): Promise<void> {
    await this.produitRepository.updateById(id, produit);
  }

  @put('/produits/{id}')
  @response(204, {
    description: 'Produit PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() produit: Produit,
  ): Promise<void> {
    await this.produitRepository.replaceById(id, produit);
  }

  @del('/produits/{id}/{idUser}')
  @response(204, {
    description: 'Produit DELETE success',
  })
  async deleteById(
    @param.path.string('id') id: string,
    @param.path.string('idUser') idUser: string,
  ): Promise<void> {
    const user = await this.userRepository.findById(idUser)
  
    const index = user.myProductlist.indexOf(id);
    user.myProductlist.splice(index, 1);

    this.userRepository.replaceById(idUser, user)
    await this.produitRepository.deleteById(id);
  }


  @get('/myProduitsList/{id}')
  @response(200, {
    description: 'Array of Produit model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Produit, {includeRelations: true}),
        },
      },
    },
  })
  async myProduitsList(
    @param.path.string('id') id: string,
    @param.filter(Produit) filter?: Filter<Produit>,
  ): Promise<Produit[]> {
    const thisUsere = await this.userRepository.findById(id)
    const allProduit = await this.produitRepository.find();
    const productListId = thisUsere?.myProductlist
    let products: Produit[] = []

    productListId.forEach((ProductId)=> {
      allProduit.forEach((Product)=> {
        if(Product.id == ProductId){
          products.push(Product)
          console.log(Product)
        }
      })
    })
    return products;
  }


  @get('/produitsByIdList')
  @response(200, {
    description: 'Produit model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Produit, {includeRelations: true}),
      },
    },
  })
  async findByIdList(
    @requestBody() IdList: string[],
  ): Promise<Produit[]> {
    let ProductList : Produit[] = []
console.log(IdList)

    return ProductList
  }

}
