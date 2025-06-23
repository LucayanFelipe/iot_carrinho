<template>
  <div class="row">
    <img src="../assets/compras.png" />

    <div class="coluna">
      <h1>Bem-vindo(a) ao Astra</h1>
      <p>O primeiro carrinho de compras inteligente.</p>

      <div class="info-bloco">
        <img src="../assets/relogio.png" />
        <div>
          <h2>Otimize seu tempo</h2>
          <p>Problema com filas gigantes? Nunca mais!</p>
        </div>
      </div>

      <div class="info-bloco">
        <img src="../assets/cesta.png" />
        <div>
          <h2>Maior controle dos gastos</h2>
          <p>Astra te ajuda a manter o controle no orçamento.</p>
        </div>
      </div>

      <RouterLink to="/carrinho" class="botao">Iniciar Compras</RouterLink>
    </div>
  </div>
</template>


<style scoped>
.row {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  font-family: 'Montserrat', sans-serif;
  gap: 5rem;
}

.row img:first-child {
  max-width: 500px;
  height: auto;
}

.coluna {
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.coluna h1 {
  font-size: 2.5rem;
  color: #00c853;
  font-weight: 700;
  margin: 0;
  white-space: nowrap;
}

.coluna > p {
  font-size: 1.2rem;
  color: #888;
  margin: 0;
}

.info-bloco {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.info-bloco img {
  width: 70px;
  height: 70px;
}

.info-bloco h2 {
  color: #8e24aa;
  font-size: 1.5rem;
  margin: 0;
  font-weight: 700;
  white-space: nowrap;
}

.info-bloco p {
  margin: 0.5rem 0 0 0;
  color: #888;
}

.botao {
  background: linear-gradient(to right, #8e2de2, #4a00e0);
  color: white;
  border: none;
  padding: 1.5rem 10rem;
  border-radius: 30px;
  font-size: 1.1rem;
  cursor: pointer;
  align-self: flex-start;
  transition: background 0.3s ease;
  font-family: 'Montserrat', sans-serif;
  white-space: nowrap;
}

.botao:hover {
  background: linear-gradient(to right, #7b1fa2, #3f00b0);
}

</style>

