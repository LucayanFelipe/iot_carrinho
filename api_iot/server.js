const express = require("express");
const path = require("path");
const pool = require("./db");
const cors = require("cors");

const app = express();


// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Rota: listar todos os produtos
app.get('/api/produtos', async (req, res) => {
  try {
    const [produtos] = await pool.query('SELECT id, nome, preco, descricao, rfid_codigo FROM produto');
    res.json(produtos);
  } catch (err) {
    console.error('Erro ao buscar produtos:', err);
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

app.post('/api/carrinho/adicionar', async (req, res) => {
  const { produto_id, quantidade } = req.body;
  const carrinho_id = 1; // ou outro ID válido

  try {
    // Consulta o preço atual do produto
    const [[produto]] = await pool.execute('SELECT preco FROM produto WHERE id = ?', [produto_id]);
    const preco_unitario = produto.preco;

    // Insere no carrinho_produto
    await pool.execute(`
      INSERT INTO carrinho_produto (carrinho_id, produto_id, quantidade, preco_unitario)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE quantidade = quantidade + ?, preco_unitario = VALUES(preco_unitario)
    `, [carrinho_id, produto_id, quantidade, preco_unitario, quantidade]);

    res.json({ sucesso: true });
  } catch (error) {
    console.error('Erro ao adicionar produto ao carrinho:', error);
    res.status(500).json({ erro: 'Erro ao adicionar produto ao carrinho' });
  }
});


app.post('/api/carrinho/finalizar', async (req, res) => {
  const { produtos } = req.body;

  if (!Array.isArray(produtos) || produtos.length === 0) {
    return res.status(400).json({ erro: 'Carrinho vazio' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [resultCarrinho] = await conn.execute('INSERT INTO carrinho (preco_total) VALUES (0)');
    const carrinhoId = resultCarrinho.insertId;

    for (const item of produtos) {
      await conn.execute(`
        INSERT INTO carrinho_produto (carrinho_id, produto_id, quantidade, preco_unitario)
        VALUES (?, ?, ?, ?)`,
        [carrinhoId, item.produto_id, item.quantidade, item.preco_unitario]);
    }

    // A trigger atualiza o preco_total automaticamente
    await conn.commit();
    res.json({ sucesso: true, carrinhoId });

  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ erro: 'Erro ao finalizar compra' });
  } finally {
    conn.release();
  }
});



// Rota: listar carrinho mais recente com produtos
app.get("/carrinho", async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [carrinhos] = await conn.query("SELECT id, preco_total FROM carrinho ORDER BY id DESC LIMIT 1");

    if (carrinhos.length === 0) {
      res.status(200).json({ produtos: [], preco_total: 0 });
      return;
    }

    const carrinho = carrinhos[0];
    const [itens] = await conn.query(`
      SELECT p.nome, cp.quantidade, cp.preco_unitario, cp.subtotal
      FROM carrinho_produto cp
      JOIN produto p ON cp.produto_id = p.id
      WHERE cp.carrinho_id = ?
    `, [carrinho.id]);

    conn.release();
    res.status(200).json({ produtos: itens, preco_total: carrinho.preco_total });
  } catch (err) {
    console.error("Erro ao buscar carrinho:", err);
    res.status(500).send("Erro interno ao buscar carrinho");
  }
});




// Rota: adicionar produto via UID RFID
app.post("/rfid", async (req, res) => {
  const uid = req.body.uid;
  ultimoUID = uid;

  try {
    const conn = await pool.getConnection();

    const [produtos] = await conn.query(
      "SELECT id, preco FROM produto WHERE rfid_codigo = ?",
      [uid]
    );

    if (produtos.length === 0) {
      res.status(404).send("Produto não encontrado para o RFID");
      return;
    }

    const produto = produtos[0];

    const [carrinhos] = await conn.query("SELECT id FROM carrinho ORDER BY id DESC LIMIT 1");
    let carrinhoId;
    if (carrinhos.length === 0) {
      const [novoCarrinho] = await conn.query("INSERT INTO carrinho (preco_total) VALUES (0)");
      carrinhoId = novoCarrinho.insertId;
    } else {
      carrinhoId = carrinhos[0].id;
    }

    const [existe] = await conn.query(
      "SELECT id FROM carrinho_produto WHERE carrinho_id = ? AND produto_id = ?",
      [carrinhoId, produto.id]
    );

    if (existe.length > 0) {
      await conn.query(
        "UPDATE carrinho_produto SET quantidade = quantidade + 1 WHERE id = ?",
        [existe[0].id]
      );
    } else {
      await conn.query(
        "INSERT INTO carrinho_produto (carrinho_id, produto_id, quantidade, preco_unitario) VALUES (?, ?, ?, ?)",
        [carrinhoId, produto.id, 1, produto.preco]
      );
    }

    conn.release();
    res.status(200).send("Produto adicionado ao carrinho com sucesso.");
  } catch (err) {
    console.error("Erro ao processar RFID:", err);
    res.status(500).send("Erro interno do servidor.");
  }
});


let ultimoUID = null;

app.get('/uid', (req, res) => {
  if (ultimoUID) {
    res.json({ uid: ultimoUID })
    ultimoUID = null // limpa para evitar múltiplas leituras do mesmo
  } else {
    res.json({ uid: null })
  }
})

// A função que atualiza o ultimoUID deve continuar normal
function novaLeituraRFID(uid) {
  ultimoUID = uid
}




app.get('/api/carrinho', async (req, res) => {
  console.log("Buscando carrinho..."); // para ver se a rota está sendo executada

  try {
    const [dados] = await pool.execute(`
      SELECT 
        cp.id,
        p.nome,
        cp.preco_unitario,
        cp.quantidade,
        cp.subtotal
      FROM carrinho_produto cp
      JOIN produto p ON p.id = cp.produto_id
      WHERE cp.carrinho_id = 1
    `);

    res.json(dados);
  } catch (error) {
    console.error('Erro ao buscar carrinho:', error);
    res.status(500).json({ error: 'Erro ao buscar carrinho' });
  }
});



// Adicione isso no server.js:
app.post('/remover', async (req, res) => {
  const { produto_id } = req.body;

  try {
    const conn = await pool.getConnection();
    const [carrinhos] = await conn.query("SELECT id FROM carrinho ORDER BY id DESC LIMIT 1");
    if (carrinhos.length === 0) return res.status(400).send("Nenhum carrinho encontrado");
    
    const carrinhoId = carrinhos[0].id;

    // Remove um da quantidade ou apaga se for 1
    const [prod] = await conn.query(
      "SELECT quantidade FROM carrinho_produto WHERE carrinho_id = ? AND produto_id = ?",
      [carrinhoId, produto_id]
    );

    if (prod.length === 0) return res.status(404).send("Produto não está no carrinho");

    if (prod[0].quantidade > 1) {
      await conn.query(
        "UPDATE carrinho_produto SET quantidade = quantidade - 1 WHERE carrinho_id = ? AND produto_id = ?",
        [carrinhoId, produto_id]
      );
    } else {
      await conn.query(
        "DELETE FROM carrinho_produto WHERE carrinho_id = ? AND produto_id = ?",
        [carrinhoId, produto_id]
      );
    }

    conn.release();
    res.status(200).send("Produto removido com sucesso");
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro interno");
  }
});


// Inicia servidor
app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});
