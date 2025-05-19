const router = require("express").Router();
const verifyJWT = require("../services/verifyJWT");

const userController = require("../controller/userController");

router.post("/user/", userController.createUser);
router.post('/user/login', userController.loginUser);
router.get("/user/", verifyJWT, userController.getAllUsers);
router.put("/user/", userController.updateUser);
router.delete("/user/:id",userController.deleteUser);

const orgController = require("../controller/orgController");

router.post('/organizador', orgController.createOrg);
router.get('/organizador', orgController.getAllOrg);
router.put('/organizador', orgController.updateOrg);
router.delete('/organizador/:id', orgController.deleteOrg);

const eventoController = require("../controller/eventoController");

router.post("/evento/", eventoController.createEvento);
router.get("/evento/", verifyJWT, eventoController.getAllEventos);
router.put("/evento/", eventoController.updateEvento);
router.delete("/evento/:id",eventoController.deleteEvento);
router.get("/evento/data", verifyJWT, eventoController.getEventosPorData);
router.get("/evento/semana/:data", verifyJWT, eventoController.getEventosSemana);

const ingressoController = require("../controller/ingressoController");

router.post("/ingresso/", ingressoController.createIngresso);
router.get("/ingresso/", ingressoController.getAllIngresso);
router.get("/ingresso/:id", ingressoController.getByIdEvento);
router.put("/ingresso/", ingressoController.updateIngresso);
router.delete("/ingresso/:id",ingressoController.deleteIngresso);

module.exports = router;
