import { Hono } from "hono";
import users from "../modules/users/users.routes.ts";
import categories from "../modules/categories/categories.routes.ts";
import products from "../modules/products/products.routes.ts";

const routes = new Hono();

routes.route("/users", users);
routes.route("/categories", categories);
routes.route("/products", products);

export default routes;
