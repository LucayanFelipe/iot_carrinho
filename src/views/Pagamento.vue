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
            </tr>
          </thead>

          <tbody>
            <tr v-for="(produto, index) in carrinho" :key="produto.id">
              <td>{{ produto.nome }}</td>
              <td>R$ {{ Number(produto.preco).toFixed(2) }}</td>
              <td>{{ produto.quantidade }}</td>
              <td>R$ {{ Number(produto.quantidade*produto.preco).toFixed(2) }}</td>
    
            </tr>
          </tbody>
        </table>
      </div>

      <div class="resumo">
        <div class="sacola" @click="mostrarSacola = !mostrarSacola">
          Sacola <span>{{ mostrarSacola ? '▲' : '▼' }}</span>
        </div>

        <div class="detalhes-sacola">
          <p>Quantidade de Itens: <strong>{{ totalItens }}</strong></p>
          <p>Quantidade de Produtos: <strong>{{ quantidadeProdutos }}</strong></p>
          <p>Valor total: <strong>R$ {{ Number(totalGeral).toFixed(2) }}</strong></p>
        </div>

        <div class="detalhes-sacola">
          <p>Adicione aqui seu cupom:</p>
          <input class="cupom" type="text" v-model="cupom" placeholder="Astra2025" />
        </div>

        <p class="metodo">Método de Pagamento</p>
                  
            <div class="pagamento-opcoes">
                <button
                :class="{ selecionado: botaoSelecionado === 'cartaocredito' }"
                @click="botaoSelecionado = 'cartaocredito'"
                >
                <img :src="getImagem('cartaocredito')" alt="Cartão Crédito" />
                <span>Cartão de Crédito</span>
                </button>

                <button
                :class="{ selecionado: botaoSelecionado === 'pix' }"
                @click="botaoSelecionado = 'pix'"
                >
                <img :src="getImagem('pix')" alt="Pix" />
                <span>PIX</span>
                </button>

                <button
                :class="{ selecionado: botaoSelecionado === 'cartaodebito' }"
                @click="botaoSelecionado = 'cartaodebito'"
                >
                <img :src="getImagem('cartaodebito')" alt="Cartão Débito" />
                <span>Cartão de Débito</span>
                </button>

                <button
                :class="{ selecionado: botaoSelecionado === 'dinheiro' }"
                @click="botaoSelecionado = 'dinheiro'"
                >
                <img :src="getImagem('dinheiro')" alt="Dinheiro" />
                <span>Dinheiro</span>
                </button>
            </div>

        <div style="margin-top: 2rem;">
          <router-link to="/" class="btn-pagamento">Confirmar Compra</router-link>
          <router-link to="/carrinho" class="btn-cancelar">Cancelar e Retornar</router-link>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'


import { useCarrinhoStore } from '@/stores/carrinho'

const carrinhoStore = useCarrinhoStore()
const { carrinho, adicionarProduto, alterarQtd, remover, totalItens, totalGeral, quantidadeProdutos } = carrinhoStore


const router = useRouter()
const mostrarSacola = ref(false)


onMounted(async () => {
  await carregarCarrinho()
  setInterval(verificarUID, 2000)
})


import carrinhosIcon from '@/assets/carrinhocinza.svg'
import carteiraIcon from '@/assets/carteirabranca.svg'

async function carregarCarrinho() {
  try {
    const res = await axios.get('http://localhost:3000/api/carrinho')
    const carrinhoCorrigido = res.data.map(p => ({
      ...p,
      preco_unitario: Number(p.preco_unitario),
      quantidade: Number(p.quantidade),
      subtotal: Number(p.quantidade) * Number(p.preco_unitario)
    }))
    carrinho.value = carrinhoCorrigido
  } catch (error) {
    console.error('Erro ao carregar carrinho:', error)
  }
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

const botaoSelecionado = ref(null)

const imagens = {
  cartaocredito: {
    ativo: new URL('../assets/CartaoCor.svg', import.meta.url).href,
    inativo: new URL('../assets/CartaoCinza.svg', import.meta.url).href,
  },
  pix: {
    ativo: new URL('../assets/PixCor.svg', import.meta.url).href,
    inativo: new URL('../assets/PixCinza.svg', import.meta.url).href,
  },
  cartaodebito: {
    ativo: new URL('../assets/CartaoCor.svg', import.meta.url).href,
    inativo: new URL('../assets/CartaoCinza.svg', import.meta.url).href,
  },
  dinheiro: {
    ativo: new URL('../assets/DinheiroCor.svg', import.meta.url).href,
    inativo: new URL('../assets/DinheiroCinza.svg', import.meta.url).href,
  },
}

function getImagem(botao) {
  return botaoSelecionado.value === botao
    ? imagens[botao].ativo
    : imagens[botao].inativo
}

const cupom = ref('')
</script>


<style scoped>
.container {
    margin-left:30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  font-family: 'Montserrat', sans-serif;
}

.etapas {

  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
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
  margin-top:640px;

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
  display: flex;
  gap: 2rem;
  max-width: 100%;
  width: 100%;
  align-items: flex-start;
}

.produtos {
  flex: 1;
  background-color: #f5f5f5;
  padding: 2rem;
  width: 100%;
  border-radius: 10px;
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

.produtos td, .produtos th {
  padding: 1.5rem;
  text-align: left;
  vertical-align: middle;
}

.resumo {
  position: sticky;
  top: 2rem;
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

.cupom {
  width: 100%;
  padding: 1rem;
  border-radius: 10px;
  border: none;
  background: #dcdcdc;
  margin-top: 0.5rem;
  text-align: center;
  font-size: 1rem;
}

.metodo {
  font-weight: bold;
  text-align: center;
  margin: 2rem 0 1rem;
}

.pagamento-opcoes {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
}

.opcao {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 2px solid #ccc;
  border-radius: 10px;
  padding: 0.75rem 1.25rem;
  background: white;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
}

.btn-pagamento {
  display: block;
  width: 100%;
  background-color: #05D950;
  color: white;
  font-weight: bold;
  font-size: 1.2rem;
  padding: 1rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  text-align: center;
  margin-bottom: 1rem;
}

.btn-cancelar {
  display: block;
  width: 100%;
  background-color: #d3d3d3;
  color: #333;
  text-decoration: none;
  font-weight: bold;
  font-size: 1rem;
  padding: 1rem;
  border-radius: 12px;
  text-align: center;
}

button {
  padding: 1rem 2rem;
  border: 2px solid #CFCBCB;
  background-color: #E1DFDF;
  color: #000000;
  border-radius: 12px;
  font-weight: bold;
  transition: all 0.2s ease;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  font-family: 'Montserrat', sans-serif;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

button.selecionado {
  background-color: #DCF7E5;
  border: 2px solid #05D950;
  color: #000000;
}

button img {
  width: 24px;
  height: 24px;
}

</style>

 
