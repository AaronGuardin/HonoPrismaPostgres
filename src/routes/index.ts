import { Hono } from "hono";
import users from "../modules/users/users.routes.ts";

const routes = new Hono();

routes.route("/users", users);

export default routes;
