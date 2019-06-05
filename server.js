require('isomorphic-fetch');
const Koa = require('koa');
const next = require('next');
const { default: createShopifyAuth } = require('@shopify/koa-shopify-auth');
const dotenv = require('dotenv');
const { verifyRequest } = require('@shopify/koa-shopify-auth');
const session = require('koa-session');
const Router = require('koa-router');

dotenv.config();
const { default: graphQLProxy } = require('@shopify/koa-shopify-graphql-proxy');
const { ApiVersion } = require('@shopify/koa-shopify-graphql-proxy');

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// env variables
const { SHOPIFY_API_SECRET_KEY, SHOPIFY_API_KEY, API_VERSION, TUNNEL_URL } = process.env;

async function makeAdminRequest(ctx) {
  console.log('shop:', ctx.session.shop);
  return ctx.body = { shop: 'hello' };
}

app.prepare().then(() => {

  // Start Server/Router
  const server = new Koa();
  const router = new Router();

  // Authentication
  server.use(session(server));
  server.keys = [SHOPIFY_API_SECRET_KEY];

  router.get('/', makeAdminRequest);
  server.use(router.routes());

  server.use(
    createShopifyAuth({
      apiKey: SHOPIFY_API_KEY,
      secret: SHOPIFY_API_SECRET_KEY,
      scopes: [
        'read_products', 'write_products',
        'read_themes', 'write_themes',
        'read_script_tags', 'write_script_tags',
        'read_price_rules', 'write_price_rules',
        'read_checkouts', 'write_checkouts',
        'read_inventory', 'write_inventory',
        'read_orders', 'write_orders',
      ],
      afterAuth(ctx) {
        const { shop, accessToken } = ctx.session;
        ctx.cookies.set('shopOrigin', shop, { httpOnly: false });
        ctx.redirect('/');
      },
    }),
  );

  server.use(graphQLProxy({version: ApiVersion.April19}))
  server.use(verifyRequest());
  server.use(async (ctx) => {

    switch(ctx.url) {
      case '/get-scripts':
        const options = {
          credentials: 'include',
          headers: {
            'X-Shopify-Access-Token': ctx.session.accessToken,
            'Content-Type': 'application/json',
          },
        };
        const endpoint = `https://${ctx.session.shop}/admin/api/${API_VERSION}/script_tags.json`;
        const response = await fetch(endpoint, options);
        const text = await response.text();
        return ctx.body = text;
      default:
        // Views
        await handle(ctx.req, ctx.res);
        ctx.respond = false;
        ctx.res.statusCode = 200;
        return
    }
  });

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});