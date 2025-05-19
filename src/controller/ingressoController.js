const connect = require("../db/connect");
module.exports = class ingressoController {
  static async createIngresso(req, res) {
    // Recebe valores do body da requisição
    const {preco, tipo, fk_id_evento} = req.body;

    // Check se os campos foram preenchidos
    if (!preco || !tipo || !fk_id_evento) {
      return res
        .status(400)
        .json({ error: "Todos os campos devem ser preenchidos." });
    }
    // Construção da query INSERT
    const query = `INSERT INTO ingresso(preco, tipo, fk_id_evento) VALUES (?,?,?);`;
    const values = [preco, tipo, fk_id_evento];

    // Executando a query INSERT
    try {
      connect.query(query, values, function (err) {
        if (err) {
          console.log(err);
          console.log(err.code);
            return res.status(500).json({ error: "Erro Interno Do Servidor" });
        } else {
          return res
            .status(201)
            .json({ message: "Ingresso criado com sucesso" });
        }
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  static async getAllIngresso(req, res) {
    const query = `SELECT * FROM ingresso`;

    try {
      connect.query(query, function (err, results) {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Erro Interno do Servidor" });
        }
        return res.status(200).json({
          message: "Mostrando ingressos: ",
          ingressos: results,
        });
      });
    } catch (error) {
      console.error("Erro ao executar a consulta:", error);
      return res.status(500).json({ error: "Um erro foi encontrado." });
    }
  }

  static async getByIdEvento(req, res) {
    const eventoId = req.params.id;
  
    const query = `
      SELECT 
        ingresso.id_ingresso, 
        ingresso.preco, 
        ingresso.tipo, 
        ingresso.fk_id_evento, 
        evento.nome AS nome_evento
      FROM ingresso
      JOIN evento ON ingresso.fk_id_evento = evento.id_evento
      WHERE evento.id_evento = ?;
    `;
  
    try {
      connect.query(query, [eventoId], (err, results) => {
        if (err) {
          console.error("Erro ao buscar ingressos por evento:", err);
          return res.status(500).json({ error: "Erro ao buscar ingressos do evento" });
        }
  
        res.status(200).json({
          message: "Ingressos do evento obtidos com sucesso",
          ingressos: results,
        });
      });
    } catch (error) {
      console.error("Erro ao executar a consulta:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  static async updateIngresso(req, res) {
    //Desestrutura e recupera os dados enviados via corpo da requisição
    const {preco, tipo, fk_id_evento, id_ingresso} = req.body;

    //Validar se todos os campos foram preenchidos
    if (!preco || !tipo || !fk_id_evento || !id_ingresso) {
      return res
        .status(400)
        .json({ error: "Todos os campos devem ser preenchidos." });
    }
    const query = `UPDATE ingresso SET preco = ?, tipo = ?, fk_id_evento = ? WHERE id_ingresso = ?`;
    const values = [preco, tipo, fk_id_evento, id_ingresso];
    try {
      connect.query(query, values, function (err, results) {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Erro Interno do Servidor" });
        }
        if (results.affectedRows === 0) {
          return res.status(404).json({ error: "Ingresso não encontrado." });
        }
        return res
          .status(200)
          .json({ message: "Ingresso atualizado com sucesso." });
      });
    } catch (error) {
      console.error("Erro ao executar a consulta:", error);
      return res.status(500).json({ error: "Erro Interno de Servidor" });
    }
  }

  static async deleteIngresso(req, res) {
    const ingressoId = req.params.id;

    const query = `DELETE FROM ingresso WHERE id_ingresso = ?`;
    const values = [ingressoId];
    try {
      connect.query(query, values, function (err, results) {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Erro Interno do Servidor" });
        }
        if (results.affectedRows === 0) {
          return res.status(404).json({ error: "Ingresso não encontrado." });
        }
        return res
          .status(200)
          .json({ message: "Ingresso excluído com sucesso." });
      });
    } catch (error) {
      console.error("Erro ao executar a consulta:", error);
      return res.status(500).json({ error: "Erro Interno de Servidor" });
    }
  }
};
