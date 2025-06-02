const connect = require("../db/connect");

module.exports = class compraController {
  static registrarCompraSimple(req, res) {
    const { id_usuario, id_ingresso, quantidade } = req.body;

    console.log("body:", id_usuario, id_ingresso, quantidade);

    if (!id_usuario || !id_ingresso || !quantidade) {
      return res
        .status(400)
        .json({ error: "dados obrigatorios não inseridos!" });
    } //fim if
    //chamada da procedure com os parametros
    connect.query(
      "CALL registrar_compra(?,?,?);",
      [id_usuario, id_ingresso, quantidade],
      (err, result) => {
        if (err) {
          console.log("Erro ao registrar compra: ", err.message);
          return res.status(500).json({ error: err.message });
        }
        return res.status(201).json({
          message: "Compra registrada com sucesso via proceduro!",
          dados: { id_usuario, id_ingresso, quantidade },
        });
      }
    );
  } //fim registrarCompraSimple
  static registrarCompra(req, res) {
    const { id_usuario, ingressos } = req.body;

    console.log("Body", id_usuario, ingressos);

    connect.query(
      "INSERT into compra(data_compra, fk_id_usuario) values (now(), ?)",
      [id_usuario],
      (err, result) => {
        if (err) {
          console.log("erro ao inserir compra:", err);
          return res
            .status(500)
            .json({ error: "erro ao criar a compra no sistema!!" });

          const id_compra = result.insertId;
          console.log("compra criada com o ID:", id_compra);

          //inicializa o index dos ingressos
          let index = 0;

          //função recursiva pra processo sequencial de ingressos
          function processarIngresso() {
            if (index >= ingressos.length) {
              return res.status(201).json({
                message: "Compra realizada com seucesso!!",
                id_compra,
                ingressos,
              });
            }
            const ingresso = ingressos[index];
            //chamada da procedure para registro de compras
            connect.query(
              "CALL registrar_new_compra (?, ?, ?);",
              [ingresso.id_ingresso, id_compra, ingresso.quantidade],
              (err) => {
                if (err) {
                  return res.status(500).json({
                    error: `Erro ao registrar o ingresso ${index + 1}`,
                    detalhes: err.message,
                  });
                }
                index++;
                processarIngresso();
              }
            );
          }
          processarIngresso();
        }
      }
    );
  }
}; //fim codigo
