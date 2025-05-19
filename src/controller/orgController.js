const connect = require("../db/connect");
module.exports = class orgController {
  static async createOrg(req, res) {
    // Recebe valores do body da requisição
    const { nome, email, senha, telefone } = req.body;

    // Check se os campos foram preenchidos
    if (!nome || !email || !senha || !telefone) {
      return res
        .status(400)
        .json({ error: "Todos os campos devem ser preenchidos." });
    } // Check se o telefone não é feito de números ou não tem 11 digitos
    if (isNaN(telefone) || telefone.length !== 11) {
      return res.status(400).json({
        error:
          "Telefone inválido. Deve conter exatamente 11 dígitos numéricos.",
      });
    } // Check se o email não possui @
    else if (!email.includes("@")) {
      return res.status(400).json({ error: "Email inválido. Deve conter @." });
    }
    // Construção da query INSERT
    const query = `INSERT INTO organizador(nome, email, senha, telefone) VALUES ('${nome}','${email}', '${senha}', '${telefone}');`;

    // Executando a query INSERT
    try {
      connect.query(query, function (err) {
        if (err) {
          console.log(err);
          console.log(err.code);
          if (err.code === "ER_DUP_ENTRY") {
            return res
              .status(400)
              .json({ error: "O email já está vinculado a outro organizador." });
          } else {
            return res.status(500).json({ error: "Erro Interno Do Servidor" });
          }
        } else {
          return res
            .status(201)
            .json({ message: "Organizador criado com sucesso" });
        }
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  static async getAllOrg(req, res) {
    const query = `SELECT * FROM organizador`;

    try {
      connect.query(query, function (err, results) {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Erro Interno do Servidor" });
        }
        return res.status(200).json({
          message: "Mostrando organizadores: ",
          organizadores: results,
        });
      });
    } catch (error) {
      console.error("Erro ao executar a consulta:", error);
      return res.status(500).json({ error: "Um erro foi encontrado." });
    }
  }

  static async updateOrg(req, res) {
    //Desestrutura e recupera os dados enviados via corpo da requisição
    const { id, nome, email, senha, telefone } = req.body;

    //Validar se todos os campos foram preenchidos
    if (!id || !nome || !email || !senha || !telefone) {
      return res
        .status(400)
        .json({ error: "Todos os campos devem ser preenchidos." });
    }
    const query = `UPDATE organizador SET nome=?, email=?, senha=?, telefone=? WHERE id_organizador = ?`;
    const values = [nome, email, senha, telefone, id];
    try {
      connect.query(query, values, function (err, results) {
        if (err) {
          if (err.code === "ER_DUP_ENTRY") {
            return res
              .status(400)
              .json({ error: "E-mail já cadastrado por outro organizador." });
          } else {
            console.error(err);
            return res.status(500).json({ error: "Erro Interno do Servidor" });
          }
        }
        if (results.affectedRows === 0) {
          return res.status(404).json({ error: "Organizador não encontrado." });
        }
        return res
          .status(200)
          .json({ message: "Organizador atualizado com sucesso." });
      });
    } catch (error) {
      console.error("Erro ao executar a consulta:", error);
      return res.status(500).json({ error: "Erro Interno de Servidor" });
    }
  }

  static async deleteOrg(req, res) {
    const organizadorId = req.params.id;

    const query = `DELETE FROM organizador WHERE id_organizador = ?`;
    const values = [organizadorId];
    try {
      connect.query(query, values, function (err, results) {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Erro Interno do Servidor" });
        }
        if (results.affectedRows === 0) {
          return res.status(404).json({ error: "Organizador não encontrado." });
        }
        return res
          .status(200)
          .json({ message: "Organizador excluído com sucesso." });
      });
    } catch (error) {
      console.error("Erro ao executar a consulta:", error);
      return res.status(500).json({ error: "Erro Interno de Servidor" });
    }
  }
};
