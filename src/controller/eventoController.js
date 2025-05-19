const connect = require("../db/connect");
module.exports = class eventoController {
  static async createEvento(req, res) {
    const { nome, descricao, data_hora, local, fk_id_organizador } = req.body;

    if (!nome || !descricao || !data_hora || !local || !fk_id_organizador) {
      return res
        .status(400)
        .json({ error: "Todos os campos devem ser preenchidos" });
    } else {
      // Construção da query INSERT
      const query = `INSERT INTO evento(nome, descricao, data_hora, local, fk_id_organizador) VALUES (?, ?, ?, ?, ?);`;
      const values = [nome, descricao, data_hora, local, fk_id_organizador];
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
              .json({ message: "Evento criado com sucesso" });
          }
        });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erro interno do servidor" });
      }
    }
  }

  static async getAllEventos(req, res) {
    const query = `SELECT * FROM evento`;

    try {
      connect.query(query, function (err, results) {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Erro Interno do Servidor" });
        }

        // Transformando a data no Horário de Greenwich(GMT), para Horário de Brasília (GMT-3)
        if (results[0]) {
          const dateAgora = new Date(results[0].data_hora);
          console.log(
            "Data:",
            dateAgora.toLocaleDateString(),
            "Horário:",
            dateAgora.toLocaleTimeString(),
            "Ambos:",
            dateAgora.toLocaleString()
          );
          return res.status(200).json({
            message: "Mostrando eventos: ",
            eventos: results,
          });
        } else {
          return res.status(200).json({
            message: "Mostrando eventos: ",
            eventos: results,
          });
        }
      });
    } catch (error) {
      console.error("Erro ao executar a consulta:", error);
      return res.status(500).json({ error: "Um erro foi encontrado." });
    }
  }

  static async updateEvento(req, res) {
    //Desestrutura e recupera os dados enviados via corpo da requisição
    const { nome, descricao, data_hora, local, id_evento } = req.body;
    //Validar se todos os campos foram preenchidos
    if ((!nome, !descricao, !data_hora, !local, !id_evento)) {
      return res
        .status(400)
        .json({ error: "Todos os campos devem ser preenchidos" });
    }
    const query = `UPDATE evento SET nome=?, descricao=?, data_hora=?, local=? WHERE id_evento = ?`;
    const values = [nome, descricao, data_hora, local, id_evento];
    try {
      connect.query(query, values, function (err, results) {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Erro Interno do Servidor" });
        }
        if (results.affectedRows === 0) {
          return res.status(404).json({ error: "Evento não encontrado." });
        }
        return res
          .status(200)
          .json({ message: "Evento atualizado com sucesso." });
      });
    } catch (error) {
      console.error("Erro ao executar a consulta:", error);
      return res.status(500).json({ error: "Erro Interno de Servidor" });
    }
  }

  static async deleteEvento(req, res) {
    const eventoId = req.params.id;

    const query = `DELETE FROM evento WHERE id_evento = ?`;
    try {
      connect.query(query, eventoId, function (err, results) {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Erro Interno do Servidor" });
        }
        if (results.affectedRows === 0) {
          return res.status(404).json({ error: "Evento não encontrado." });
        }
        return res
          .status(200)
          .json({ message: "Evento excluído com sucesso." });
      });
    } catch (error) {
      console.error("Erro ao executar a consulta:", error);
      return res.status(500).json({ error: "Erro Interno de Servidor" });
    }
  }

  static async getEventosPorData(req, res) {
    const query = `SELECT * FROM evento`; // ORDER BY data_hora

    try {
      connect.query(query, (err, results) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Erro Interno do Servidor" });
        }
        const now = new Date();
        const eventosPassados = results.filter(
          (evento) => new Date(evento.data_hora) < now
        );
        const eventosFuturos = results.filter(
          (evento) => new Date(evento.data_hora) >= now
        );
        // Evento 1
        const dataEvento = new Date(results[0].data_hora);
        console.log(dataEvento)
        const dia = dataEvento.getDate();
        const mes = dataEvento.getMonth()+1;
        const ano = dataEvento.getFullYear();
        console.log(
          "Nome do Evento: ",
          results[0].nome,
          ", Data:",
          dia+
          "/"+
          mes+
          "/"+
          ano
        );

        const diferencaMs = eventosFuturos[0].data_hora.getTime() - now.getTime();
        console.log(diferencaMs);
        const dias = Math.floor(diferencaMs /1000/60/60/24);
        const horas = Math.floor(diferencaMs%(1000*60*60*24)/(1000*60*60) )
        console.log("Faltam",dias,"dias e", horas,"horas para o Evento",eventosFuturos[0].nome);
        
        //comparando datas
        const dataFiltro = new Date('2024-12-15').toISOString();
        const eventosDia = results.filter(evento => new Date(evento.data_hora.toISOString().split('T')[0] === dataFiltro[0]));
        console.log(eventosDia);
        console.log("dataFiltro:",dataFiltro);

        const dataSplit = dataFiltro.split('T');

        console.log("dataSplit:",dataSplit)


        return res.status(200).json({ message: "ok" });
      });
    } catch (error) {
      console.error("No Catch: ", error);
      return res.status(500).json({ error: "Erro Interno do Servidor" });
    }
  }

  static async getEventosSemana(req, res) {
    let diaInicio = req.params.data;
    diaInicio = new Date(diaInicio).toISOString().split('T')[0];

    const query = `SELECT * FROM evento WHERE TIMESTAMPDIFF(DAY, ?, data_hora) BETWEEN 0 AND 6 ORDER BY data_hora ASC`

    try{
      connect.query(query, diaInicio, (err, results)=>{
        if(err){
          console.error(err)
          return res.status(500).json({error:"Erro Interno de Servidor"})
        }
        return res.status(200).json({message:"Busca concluida:", eventos:results})
      })
    }catch(error){
      console.error(error);
      return res.status(500).json({error:"Erro Interno de Servidor"});
    }




  }
};
