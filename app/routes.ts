import {
  type RouteConfig,
  route,
  index,
  prefix,
} from "@react-router/dev/routes";

export const routes: RouteConfig = [
  // Index route
  index("routes/index.tsx"),

  // Claim routes
  ...prefix("/claim", [
    route("/create", "routes/claim.create/index.tsx"),
    route("/data", "routes/claim.data/index.tsx"),
  ]),

  // Contract routes
  ...prefix("/contract", [
    route("/data", "routes/contract.data/index.tsx"),
    route("/detail/new", "routes/contract.detail.new/index.tsx"),
    route("/detail/:id", "routes/contract.detail.$id/index.tsx"),
  ]),

  // Data route
  route("/data", "routes/data/index.tsx"),

  // Order routes
  ...prefix("/order", [
    route("/create", "routes/order.create/index.tsx"),
    route("/data", "routes/order.data/index.tsx"),
  ]),

  // Quote routes
  ...prefix("/quote", [
    route("/create", "routes/quote.create/index.tsx"),
    route("/data", "routes/quote.data/index.tsx"),
  ]),
];

export default routes;
