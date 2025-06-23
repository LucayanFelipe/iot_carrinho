<template>
  <div class="container">
    <div class="etapas">
      <div class="passo" @click="irParaPagina('carrinho')">
        <img :src="carrinhosIcon" alt="Carrinho" />
        <span>Passo 1:<br />Carrinho</span>
      </div>
      <div class="passo inativo" @click="irParaPagina('pagamento')">
        <img :src="carteiraIcon" alt="Pagamento" />
        <span>Passo 2:<br />Pagamento</span>
      </div>
    </div>

    <div class="conteudo">
      <div class="produtos">
        <h2>Carrinho de compras</h2>
        <table>
          <thead>
            <tr>
              <th>Produto</th>
              <th>Preço</th>
              <th>Quantidade</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>
          
          <tbody>
            <tr v-for="(produto, index) in carrinho" :key="produto.id">
              <td><span>{{ produto.nome }}</span></td>
              <td>R$ {{ Number(produto.preco).toFixed(2) }}</td>
              <td>
                <button @click="alterarQtd(index, -1)">-</button>
                {{ produto.quantidade }}
                <button @click="alterarQtd(index, 1)">+</button>
              </td>
              <td>R$ {{ Number(produto.preco * produto.quantidade).toFixed(2) }}</td>
              <td>
                <button @click="remover(index)" aria-label="Remover produto">✕</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="resumo">
        <div class="sacola" @click="mostrarSacola = !mostrarSacola">
          Sacola <span>{{ mostrarSacola ? '▲' : '▼' }}</span>
        </div>
        <div v-if="mostrarSacola" class="detalhes-sacola">
          <p>Quantidade de Itens: <strong>{{ totalItens }}</strong></p>
          <p>Quantidade de Produtos: <strong>{{ quantidadeProdutos }}</strong></p>
          <p>Valor total: <strong>R$ {{ totalGeral.toFixed(2) }}</strong></p>
        </div>
        <router-link to="/carrinho/pagamento" class="btn-pagamento">
          <span>Ir para pagamento</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import carrinhosIcon from '@/assets/carrinhos.svg'
import carteiraIcon from '@/assets/carteira.svg'



import { useCarrinhoStore } from '@/stores/carrinho'

const carrinhoStore = useCarrinhoStore()
const { carrinho, adicionarProduto, alterarQtd, remover, totalItens, totalGeral, quantidadeProdutos } = carrinhoStore


const router = useRouter()
const mostrarSacola = ref(false)

const produtos = ref([])

const ultimoUIDProcessado = ref('')
const timestampUltimoProcessado = ref(0)

onMounted(async () => {
  await carregarProdutos()
  setInterval(verificarUID, 2000) // verifica UID a cada 2 segundos
})

async function carregarProdutos() {
  try {
    const res = await fetch('http://localhost:3000/api/produtos')
    const data = await res.json()
    produtos.value = data
    console.log('Produtos carregados:', produtos.value)
  } catch (err) {
    console.error('Erro ao carregar produtos:', err)
  }
}

function adicionarCarrinho(produto) {
  const existente = carrinho.value.find(p => p.id === produto.id)
  const produtoComPrecoNumerico = {
    ...produto,
    preco: Number(produto.preco),
    quantidade: 1
  }

  if (existente) {
    existente.quantidade++
  } else {
    carrinho.value.push(produtoComPrecoNumerico)
  }
  console.log('Carrinho atualizado:', carrinho.value)
}


async function verificarUID() {
  try {
    const res = await fetch('http://localhost:3000/uid')
    const data = await res.json()
    const uid = data.uid

    const resProdutos = await fetch('http://localhost:3000/api/produtos')
    const produtos = await resProdutos.json()

    const produtoEncontrado = produtos.find(p => p.rfid_codigo === uid)
    if (produtoEncontrado) {
      adicionarProduto(produtoEncontrado)
    }
  } catch (err) {
    console.error('Erro ao verificar UID:', err)
  }
}





function irParaPagina(destino) {
  if (destino === 'carrinho') router.push('/carrinho')
  if (destino === 'pagamento') router.push('/carrinho/pagamento')
}


</script>




<style scoped>
/* mantém seu CSS original */
.container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  font-family: 'Montserrat', sans-serif;
  box-sizing: border-box;
}

.etapas {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  width: 100%;
  max-width: 1200px;
  justify-content: center;
}

.passo {
  text-align: center;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 10px;
}

.passo img {
  width: 60px;
  height: 60px;
  border-radius: 20%;
  background-color: #9747ff;
  padding: 10px;
  object-fit: contain;
}

.passo.inativo {
  opacity: 0.5;
}

.conteudo {
  max-width: 1200px;
  width: 100%;
  display: flex;
  gap: 2rem;
  justify-content: center;
}

.produtos {
  flex: 1;
  background-color: #f5f5f5;
  padding: 2rem;
  border-radius: 10px;
  max-width: 800px;
}

.produtos table {
  width: 100%;
  border-collapse: collapse;
}

.produtos img {
  width: 50px;
  height: auto;
  margin-right: 10px;
  vertical-align: middle;
}

.produtos td,
.produtos th {
  padding: 1.5rem;
  text-align: left;
  vertical-align: middle;
}

.produtos td button {
  margin: 0 5px;
}

.resumo {
  width: 350px;
  background-color: #f5f5f5;
  padding: 2rem;
  border-radius: 10px;
  height: fit-content;
}

.sacola {
  background-color: #ddd;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  font-size: 1.1rem;
}

.detalhes-sacola {
  margin-bottom: 2rem;
}

.btn-pagamento {
  display: inline-block;
  text-decoration: none;
  background-color: #05d950;
  color: white;
  font-weight: bold;
  font-size: 1.2rem;
  padding: 1.2rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  text-align: center;
  width: 100%;
  white-space: nowrap;
}

button {
  background-color: #05d950;
  border: none;
  padding: 0.5rem;
  border-radius: 0.2rem;
  width: 25px;
  color: #f5f5f5;
  cursor: pointer;
}

@media (max-width: 1200px) {
  .conteudo {
    flex-direction: column;
    align-items: center;
  }
  
  .produtos,
  .resumo {
    width: 100%;
    max-width: 100%;
  }
}
</style>
