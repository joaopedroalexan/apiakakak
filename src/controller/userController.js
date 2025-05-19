const connect = require("../db/connect");
const jwt = require("jsonwebtoken");
const validateUser = require('../services/validateUser');
const validateCpf = require('../services/validateCpf');
module.exports = class userController {
  static async createUser(req, res) {
    const { cpf, email, password, name, data_nascimento } = req.body;

    const validationError = validateUser(req.body);
    if (validationError) {
      return res.status(400).json(validationError);
    }

    try {
      const cpfError = await validateCpf(cpf);
      if (cpfError) {
        return res.status(400).json(cpfError);
      }

      const query = `INSERT INTO usuario (cpf, password, email, name, data_nascimento) VALUES (?, ?, ?, ?, ?)`;
      connect.query(
        query,
        [cpf, password, email, name, data_nascimento],
        (err) => {
          if (err) {
            console.log(err);
            if (err.code === "ER_DUP_ENTRY") {
              console.log(err);
              if (err.message.includes(`email`)) {
                return res.status(400).json({ error: "Email já cadastrado" });
              } 
            }else {
              return res
                .status(500)
                .json({ error: "Erro interno do servidor", err });
            }
          }
          return res
            .status(201)
            .json({ message: "Usuário criado com sucesso" });
        }
      );
    } catch (error) {
      return res.status(500).json({ error });
    }
  }

  static async loginUser(req, res) {
    const {email, password} = req.body;

    if(!email||!password){
      return res.status(400).json({error:'O E-mail e a Senha são obrigatórios para o login!'})
    }

    const query = `SELECT * FROM usuario WHERE email = ?`
    try{
      connect.query(query, [email], (err, results) =>{
        if(err){
          console.log(err);
          return res.status(500).json({error:"Erro Interno do Servidor"})
        }
        if(results.length===0){
          return res.status(404).json({error:'Usuário não encontrado'})
        }
        const user = results[0];

        if(user.password !== password){
          return res.status(403).json({error:"Senha Incorreta"})
        }

        const token = jwt.sign({id:user.id_usuario},process.env.SECRET,{expiresIn:"1h"});

        // Remove um atributo de um object
        delete user.password;

        return res.status(201).json({message:"Login bem sucedido!", user, token});

      })
    }catch(error){
      console.log(error);
      return res.status(500).json({error:'Erro interno do Servidor'})
    }
  }


  static async getAllUsers(req, res) {
    const query = `SELECT * FROM usuario`;

    try {
      connect.query(query, function (err, results) {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Erro Interno do Servidor" });
        }
        return res.status(200).json({
          message: "Mostrando usuários: ",
          users: results,
        });
      });
    } catch (error) {
      console.error("Erro ao executar a consulta:", error);
      return res.status(500).json({ error: "Um erro foi encontrado." });
    }
  }

  static async updateUser(req, res) {
    //Desestrutura e recupera os dados enviados via corpo da requisição
    const { cpf, email, password, name, id, data_nascimento } = req.body;
    const validationError = validateUser(req.body);
    if(validationError){
      return res.status(400).json(validationError);
    }
    const cpfValidation = await validateCpf(cpf, id);
    if(cpfValidation) {
      return res.status(400).json(cpfValidation);
    }
    const query = `UPDATE usuario SET name=?, email=?, password=?, cpf=?, data_nascimento=? WHERE id_usuario = ?`;
    const values = [name, email, password, cpf, data_nascimento, id];
    try {
      connect.query(query, values, function (err, results) {
        if (err) {
          if (err.code === "ER_DUP_ENTRY") {
            return res
              .status(400)
              .json({ error: "E-mail já cadastrado por outro usuário." });
          } else {
            console.error(err);
            return res.status(500).json({ error: "Erro Interno do Servidor" });
          }
        }
        if (results.affectedRows === 0) {
          return res.status(404).json({ error: "Usuário não encontrado." });
        }
        return res
          .status(200)
          .json({ message: "Usuário atualizado com sucesso." });
      });
    } catch (error) {
      console.error("Erro ao executar a consulta:", error);
      return res.status(500).json({ error: "Erro Interno de Servidor" });
    }
  }

  static async deleteUser(req, res) {
    const userId = req.params.id;

    const query = `DELETE FROM usuario WHERE id_usuario = ?`;
    const values = [userId];
    try {
      connect.query(query, values, function (err, results) {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Erro Interno do Servidor" });
        }
        if (results.affectedRows === 0) {
          return res.status(404).json({ error: "Usuário não encontrado." });
        }
        return res
          .status(200)
          .json({ message: "Usuário excluído com sucesso." });
      });
    } catch (error) {
      console.error("Erro ao executar a consulta:", error);
      return res.status(500).json({ error: "Erro Interno de Servidor" });
    }
  }
};
