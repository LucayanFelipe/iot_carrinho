// stores/carrinho.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCarrinhoStore = defineStore('carrinho', () => {
  const carrinho = ref([])

  function adicionarProduto(produto) {
    const existente = carrinho.value.find(p => p.id === produto.id)
    if (existente) {
      existente.quantidade++
    } else {
      carrinho.value.push({ ...produto, quantidade: 1 })
    }
  }

  function alterarQtd(index, delta) {
    const item = carrinho.value[index]
    if (item.quantidade + delta >= 1) {
      item.quantidade += delta
    }
  }

  function remover(index) {
    carrinho.value.splice(index, 1)
  }

  const totalItens = computed(() => carrinho.value.reduce((acc, p) => acc + p.quantidade, 0))
  const totalGeral = computed(() => carrinho.value.reduce((acc, p) => acc + p.quantidade * p.preco, 0))
  const quantidadeProdutos = computed(() => carrinho.value.length)

  return {
    carrinho,
    adicionarProduto,
    alterarQtd,
    remover,
    totalItens,
    totalGeral,
    quantidadeProdutos
  }
})
